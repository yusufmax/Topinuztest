const crypto = require('crypto');
const config = require('./config');
const telegram = require('./telegram');
const discoveryAgent = require('./discoveryAgent');
const scraperAgent = require('./scraperAgent');
const uploaderAgent = require('./uploaderAgent');

// In-memory sessions to store scraped data between scrape and upload phases
const sessions = new Map();

// Parse allowed chat IDs from config
const allowedChatIds = (config.telegramChatId || '')
    .split(',')
    .map(id => parseInt(id.trim(), 10))
    .filter(id => !isNaN(id));

/**
 * Handle incoming Telegram messages
 */
async function handleMessage(message) {
    const chatId = message.chat.id;
    const text = message.text || '';
    
    // Authorization Check
    if (allowedChatIds.length > 0 && !allowedChatIds.includes(chatId)) {
        console.warn(`[Telegram Bot Security] Unauthorized access attempt from chatId ${chatId}`);
        await telegram.sendMessage(chatId, `❌ Нет доступа. Ваш Chat ID: <code>${chatId}</code>.`);
        return;
    }

    console.log(`[Telegram Bot] Message from ${chatId}: "${text}"`);

    if (text === '/start' || text === '/help') {
        const welcomeText = `🤖 <b>Бот автоматизации контента topin.uz</b>\n\n` +
            `Используйте этого бота для поиска магазинов, сбора их товаров и загрузки их напрямую на платформу.\n\n` +
            `<b>Команды:</b>\n` +
            `• /discover <code>[запрос]</code> - Поиск магазинов в Ташкенте (например, <code>/discover mebel</code>, <code>/discover light</code>)\n` +
            `• /scrape <code>[источник]</code> <code>[цель]</code> - Парсинг магазина (например, <code>/scrape telegram aiko_rattan</code> или <code>/scrape olx mebel-house</code>)\n` +
            `• /status - Проверить статус системы и конфигурации API`;
        
        await telegram.sendMessage(chatId, welcomeText);
        return;
    }

    if (text === '/status') {
        const statusText = `⚙️ <b>Статус агентов topin.uz</b>\n\n` +
            `• <b>API Base URL:</b> <code>${config.apiBaseUrl}</code>\n` +
            `• <b>Аккаунт администратора:</b> <code>${config.adminUsername}</code>\n` +
            `• <b>Режим симуляции (Mock Mode):</b> <code>${config.mockMode ? 'Включен (Имитация)' : 'Выключен (Парсинг в реальном времени)'}</code>\n` +
            `• <b>Telegram Токен:</b> <code>${config.telegramToken ? 'Настроен ✅' : 'Отсутствует ❌'}</code>\n\n` +
            `Готов к обработке команд.`;
        await telegram.sendMessage(chatId, statusText);
        return;
    }

    if (text.startsWith('/discover')) {
        const query = text.replace(/\/discover\s*/, '').trim();
        if (!query) {
            await telegram.sendMessage(chatId, `⚠️ Пожалуйста, введите поисковый запрос. Пример: <code>/discover mebel</code>`);
            return;
        }

        await telegram.sendMessage(chatId, `🔍 <b>Поиск магазинов по запросу "${query}" в Ташкенте...</b>`);
        
        try {
            const shops = await discoveryAgent.discoverShops(query);
            if (!shops || shops.length === 0) {
                await telegram.sendMessage(chatId, `❌ Магазины по запросу "${query}" в Ташкенте не найдены.`);
                return;
            }

            await telegram.sendMessage(chatId, `✨ <b>Найдено магазинов (${shops.length}) по запросу "${query}":</b>`);

            for (const shop of shops) {
                const shopInfo = `🏬 <b>${shop.name}</b>\n` +
                    `• Категория: <i>${shop.categoryName}</i>\n` +
                    `• Адрес: ${shop.location}\n` +
                    `• Телефон: <code>${shop.phone}</code>\n` +
                    `• Описание: ${shop.description}\n` +
                    `• Источник: ${shop.sourceType.toUpperCase()} (Цель: <code>${shop.scrapeTarget}</code>)`;

                // Generate callback query button to scrape this shop
                const keyboard = {
                    inline_keyboard: [[
                        {
                            text: `🕷️ Собрать товары (${shop.sourceType.toUpperCase()})`,
                            callback_data: `scrape:${shop.sourceType}:${shop.scrapeTarget}:${Buffer.from(shop.name).toString('base64').substring(0,10)}`
                        }
                    ]]
                };

                // Save shop metadata to memory so we don't lose it
                const key = `${shop.sourceType}:${shop.scrapeTarget}`;
                sessions.set(key, { shop });

                await telegram.sendMessage(chatId, shopInfo, { reply_markup: keyboard });
            }
        } catch (error) {
            console.error('Discovery error:', error);
            await telegram.sendMessage(chatId, `❌ Ошибка при поиске магазинов: ${error.message}`);
        }
        return;
    }

    if (text.startsWith('/scrape')) {
        const parts = text.split(/\s+/);
        if (parts.length < 3) {
            await telegram.sendMessage(chatId, `⚠️ Использование: <code>/scrape [telegram|olx|instagram] [цель]</code>\nПример: <code>/scrape telegram aiko_rattan</code>`);
            return;
        }

        const type = parts[1].toLowerCase();
        const target = parts[2];

        if (!['telegram', 'olx', 'instagram'].includes(type)) {
            await telegram.sendMessage(chatId, `❌ Неверный тип источника "${type}". Должен быть один из: telegram, olx, instagram.`);
            return;
        }

        await triggerScrape(chatId, type, target);
        return;
    }

    // Default response
    await telegram.sendMessage(chatId, `❓ Неизвестная команда. Введите /help, чтобы увидеть список всех доступных команд.`);
}

/**
 * Handle inline button clicks
 */
async function handleCallbackQuery(callbackQuery) {
    const chatId = callbackQuery.message.chat.id;
    const messageId = callbackQuery.message.message_id;
    const data = callbackQuery.data;
    const queryId = callbackQuery.id;

    // Authorization Check
    if (allowedChatIds.length > 0 && !allowedChatIds.includes(chatId)) {
        console.warn(`[Telegram Bot Security] Unauthorized callback query attempt from chatId ${chatId}`);
        await telegram.answerCallbackQuery(callbackQuery.id, 'Доступ запрещен', true);
        return;
    }

    console.log(`[Telegram Bot] Callback query: "${data}"`);

    if (data.startsWith('scrape:')) {
        await telegram.answerCallbackQuery(queryId, 'Запуск Агента-Парсера...');
        const [, type, target] = data.split(':');
        
        // Retrieve cached shop metadata if exists
        const key = `${type}:${target}`;
        const cached = sessions.get(key);
        const metadata = cached ? cached.shop : {};

        await triggerScrape(chatId, type, target, metadata);
    } 
    else if (data.startsWith('upload:')) {
        await telegram.answerCallbackQuery(queryId, 'Запуск Агента-Загрузчика...');
        const sessionId = data.replace('upload:', '');
        const scrapedData = sessions.get(sessionId);

        if (!scrapedData) {
            await telegram.sendMessage(chatId, `❌ Сессия истекла или не найдена. Пожалуйста, выполните парсинг магазина заново.`);
            return;
        }

        await telegram.editMessageText(chatId, messageId, `⏳ <b>Загрузка "${scrapedData.shop.name}" и товаров на topin.uz...</b>`);

        try {
            const uploadResult = await uploaderAgent.uploadStoreAndProducts(scrapedData);
            
            const storeUrl = `${config.apiBaseUrl}/stores/${uploadResult.shop.slug}`;
            const successText = `🎉 <b>Загрузка успешно завершена!</b>\n\n` +
                `🏬 <b>Магазин:</b> <a href="${storeUrl}">${uploadResult.shop.name}</a>\n` +
                `📦 <b>Загружено товаров:</b> ${uploadResult.productsUploaded} / ${uploadResult.totalProducts}\n\n` +
                `🔑 <b>Данные для входа продавца (Вендора):</b>\n` +
                `• Имя пользователя: <code>${uploadResult.credentials.username}</code>\n` +
                `• Пароль: <code>${uploadResult.credentials.password}</code>\n\n` +
                `Вы можете войти в панель управления по адресу <a href="${config.apiBaseUrl}/dashboard">topin.uz/dashboard</a> для управления этим магазином.`;

            await telegram.sendMessage(chatId, successText);
            
            // Clean up session
            sessions.delete(sessionId);
        } catch (error) {
            console.error('Upload error:', error);
            await telegram.sendMessage(chatId, `❌ Загрузка не удалась: ${error.message}`);
        }
    } 
    else if (data.startsWith('discard:')) {
        await telegram.answerCallbackQuery(queryId, 'Сессия отменена.');
        const sessionId = data.replace('discard:', '');
        sessions.delete(sessionId);
        await telegram.editMessageText(chatId, messageId, `❌ <b>Собранные данные были удалены.</b>`);
    }
}

/**
 * Trigger Scraper Agent and present results
 */
async function triggerScrape(chatId, type, target, metadata = {}) {
    await telegram.sendMessage(chatId, `🔄 <b>Агент-Парсер собирает товары из ${type} (${target})...</b>`);

    try {
        const scrapedData = await scraperAgent.scrapeStore(type, target, metadata);
        
        if (!scrapedData.products || scrapedData.products.length === 0) {
            await telegram.sendMessage(chatId, `❌ Парсер завершил работу, но не нашел товаров для ${target}.`);
            return;
        }

        // Generate session ID to map to this scraped data
        const sessionId = crypto.randomUUID();
        sessions.set(sessionId, scrapedData);

        let previewText = `✅ <b>Парсинг успешно завершен!</b>\n\n` +
            `🏬 <b>Магазин:</b> ${scrapedData.shop.name}\n` +
            `• Категория: <i>${scrapedData.shop.categoryName}</i>\n` +
            `• Описание: ${scrapedData.shop.description}\n` +
            `• Адрес: ${scrapedData.shop.location}\n` +
            `• Собрано товаров: <b>${scrapedData.products.length}</b>\n\n` +
            `📋 <b>Предпросмотр товаров:</b>\n`;

        scrapedData.products.forEach((p, idx) => {
            const formattedPrice = p.price > 0 ? `${p.price.toLocaleString()} UZS` : 'Цена по запросу';
            previewText += `${idx + 1}. <b>${p.name}</b> — <code>${formattedPrice}</code>\n`;
        });

        const keyboard = {
            inline_keyboard: [
                [
                    { text: '🚀 Подтвердить и загрузить', callback_data: `upload:${sessionId}` },
                    { text: '❌ Отклонить', callback_data: `discard:${sessionId}` }
                ]
            ]
        };

        // Send confirmation message
        await telegram.sendMessage(chatId, previewText, { reply_markup: keyboard });

        // Optionally send a photo of the first product
        if (scrapedData.products[0] && scrapedData.products[0].imageUrl) {
            await telegram.sendPhoto(
                chatId, 
                scrapedData.products[0].imageUrl, 
                `Первый товар: <b>${scrapedData.products[0].name}</b>`
            );
        }
    } catch (error) {
        console.error('Scraping error:', error);
        await telegram.sendMessage(chatId, `❌ Сбор данных не удался: ${error.message}`);
    }
}

/**
 * Polling Loop for Telegram Updates
 */
async function startTelegramPolling() {
    console.log('[Telegram Bot] Starting polling loop...');
    let offset = 0;
    
    // Validate token
    if (!config.telegramToken) {
        console.error('❌ TELEGRAM_BOT_TOKEN is not set in environment! Cannot start Telegram polling.');
        runInteractiveCLI();
        return;
    }

    console.log(`🤖 Telegram Bot Agent is online. Send a message to your bot to interact!`);
    
    while (true) {
        try {
            const updates = await telegram.getUpdates(offset);
            if (updates && updates.length > 0) {
                for (const update of updates) {
                    offset = update.update_id + 1;
                    if (update.message) {
                        await handleMessage(update.message);
                    } else if (update.callback_query) {
                        await handleCallbackQuery(update.callback_query);
                    }
                }
            }
        } catch (err) {
            console.error('[Telegram Bot Polling Error] Retrying in 5s...', err.message);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

/**
 * Interactive Command Line Interface (CLI)
 * Used as a fallback if Telegram is not configured, or if run via CLI
 */
async function runInteractiveCLI() {
    console.log('\n==================================================');
    console.log('🤖 topin.uz Agent Console (Interactive CLI Mode)');
    console.log('==================================================\n');
    console.log('Use this CLI to test the agents without a Telegram bot.');
    console.log('To run, select one of the commands below by typing its number:\n');
    console.log('1. [Discovery Agent] - Search for mebel stores in Tashkent');
    console.log('2. [Scraper Agent]   - Scrape a Telegram channel (e.g., KUKAHOME)');
    console.log('3. [Uploader Agent]  - Scrape and upload "AIKO Rattan" to topin.uz');
    console.log('4. Exit\n');

    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const askChoice = () => {
        readline.question('Enter command number (1-4): ', async (choice) => {
            if (choice === '1') {
                console.log('\n--- Running Discovery Agent ---');
                readline.question('Enter search query (default "mebel"): ', async (query) => {
                    const q = query.trim() || 'mebel';
                    const shops = await discoveryAgent.discoverShops(q);
                    console.log(`\nFound ${shops.length} stores:`);
                    shops.forEach((s, i) => {
                        console.log(`[${i+1}] ${s.name} (${s.categoryName}) - Location: ${s.location}`);
                        console.log(`    Target: ${s.scrapeTarget} (${s.sourceType})`);
                    });
                    console.log('\n');
                    askChoice();
                });
            } 
            else if (choice === '2') {
                console.log('\n--- Running Scraper Agent ---');
                readline.question('Enter Telegram Channel (default "KUKAHOME"): ', async (channel) => {
                    const ch = channel.trim() || 'KUKAHOME';
                    console.log(`Scraping t.me/s/${ch}...`);
                    const data = await scraperAgent.scrapeStore('telegram', ch, { categoryName: 'Furniture' });
                    console.log(`\nScraped Shop: ${data.shop.name}`);
                    console.log(`Description: ${data.shop.description}`);
                    console.log(`Products Scraped: ${data.products.length}`);
                    data.products.slice(0, 5).forEach((p, i) => {
                        console.log(`  ${i+1}. ${p.name} - ${p.price ? p.price.toLocaleString() + ' UZS' : 'Price on request'}`);
                    });
                    console.log('\n');
                    askChoice();
                });
            } 
            else if (choice === '3') {
                console.log('\n--- Running Scraper & Uploader Agents Pipeline ---');
                console.log('Scraping "AIKO Rattan Furniture" details...');
                const data = await scraperAgent.scrapeStore('telegram', 'aiko_rattan', { 
                    name: 'AIKO Rattan Furniture',
                    categoryName: 'Furniture',
                    location: 'Ташкент, ул. Паркент, 131',
                    phone: '+998 71 200 44 44'
                });
                
                console.log(`Found ${data.products.length} products. Uploading to database...`);
                try {
                    const uploadResult = await uploaderAgent.uploadStoreAndProducts(data);
                    console.log('\n=======================================');
                    console.log('✅ UPLOADER PIPELINE SUCCESSFUL!');
                    console.log(`Store created: ${uploadResult.shop.name}`);
                    console.log(`Products uploaded: ${uploadResult.productsUploaded}/${uploadResult.totalProducts}`);
                    console.log(`Vendor Dashboard credentials:`);
                    console.log(`  Username: ${uploadResult.credentials.username}`);
                    console.log(`  Password: ${uploadResult.credentials.password}`);
                    console.log('=======================================\n');
                } catch (e) {
                    console.error('Pipeline failed:', e.message);
                }
                askChoice();
            } 
            else if (choice === '4') {
                console.log('Goodbye!');
                readline.close();
                process.exit(0);
            } 
            else {
                console.log('Invalid option.');
                askChoice();
            }
        });
    };

    askChoice();
}

// Start bot polling if executed directly
if (require.main === module) {
    if (process.argv.includes('--cli')) {
        runInteractiveCLI();
    } else {
        if (config.telegramToken) {
            startTelegramPolling().catch(err => {
                console.error('[Fatal Error] Telegram agent bot crashed:', err);
            });
        } else {
            console.log('\n💡 Tip: Configure TELEGRAM_BOT_TOKEN in .env to control agents via Telegram Bot.');
            console.log('Running CLI interactive console fallback...\n');
            runInteractiveCLI();
        }
    }
}

module.exports = {
    triggerScrape,
    sessions
};
