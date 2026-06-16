const config = require('./config');

class TelegramBotClient {
    constructor() {
        this.token = config.telegramToken;
        this.baseUrl = `https://api.telegram.org/bot${this.token}`;
    }

    isEnabled() {
        return !!this.token;
    }

    async request(method, payload = {}) {
        if (!this.isEnabled()) {
            console.warn(`[Telegram Bot] Call to ${method} ignored. TELEGRAM_BOT_TOKEN is not set.`);
            return null;
        }

        try {
            const response = await fetch(`${this.baseUrl}/${method}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!data.ok) {
                console.error(`[Telegram Bot Error] API error on ${method}:`, data);
                return null;
            }
            return data.result;
        } catch (error) {
            console.error(`[Telegram Bot Network Error] Failed to call ${method}:`, error);
            return null;
        }
    }

    async sendMessage(chatId, text, options = {}) {
        return this.request('sendMessage', {
            chat_id: chatId,
            text: text,
            parse_mode: 'HTML',
            ...options
        });
    }

    async sendPhoto(chatId, photoUrl, caption, options = {}) {
        // Simple helper to send photo by URL, or fallback to text if url is invalid
        if (!photoUrl || photoUrl.startsWith('/')) {
            // Local path or empty, send as text message
            return this.sendMessage(chatId, `📷 <b>Image:</b>\n${caption}`, options);
        }
        
        return this.request('sendPhoto', {
            chat_id: chatId,
            photo: photoUrl,
            caption: caption,
            parse_mode: 'HTML',
            ...options
        });
    }

    async answerCallbackQuery(callbackQueryId, text = '', showAlert = false) {
        return this.request('answerCallbackQuery', {
            callback_query_id: callbackQueryId,
            text: text,
            show_alert: showAlert
        });
    }

    async editMessageText(chatId, messageId, text, options = {}) {
        return this.request('editMessageText', {
            chat_id: chatId,
            message_id: messageId,
            text: text,
            parse_mode: 'HTML',
            ...options
        });
    }

    async getUpdates(offset = 0, limit = 100, timeout = 30) {
        return this.request('getUpdates', {
            offset,
            limit,
            timeout
        });
    }
}

module.exports = new TelegramBotClient();
