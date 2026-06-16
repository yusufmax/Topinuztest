require('dotenv').config();

module.exports = {
    // Telegram Configuration
    telegramToken: process.env.TELEGRAM_BOT_TOKEN || '',
    telegramChatId: process.env.TELEGRAM_CHAT_ID || '',

    // API Configuration
    apiBaseUrl: process.env.PLATFORM_API_URL || 'http://localhost:3000',
    adminUsername: process.env.ADMIN_USERNAME || 'dragon_admin',
    adminPassword: process.env.ADMIN_PASSWORD || 'F!re&Ic3_2077$NoBrute!',

    // Mock/Simulated Scraping Fallback (true by default to ensure 100% reliability during demo/dev)
    mockMode: process.env.AGENT_MOCK_MODE !== 'false'
};
