# topin.uz Content Driven Workflow Agents

This directory contains three automated agents designed to streamline discovery, scraping, and catalog importing of home/interior design stores in Tashkent, Uzbekistan.

---

## Agent Architectures

1. **Discovery Agent (`discoveryAgent.js`):** 
   - Searches for furniture/decor stores in Tashkent.
   - Crawls search indexes (DuckDuckGo/OLX) to extract Instagram handles and Telegram channels matching the query.
   - Includes a high-fidelity curated list of existing Tashkent stores (AIKO Rattan, Decoria, Glow Lighting, etc.) for fallback and mock demos.
   
2. **Scraper Agent (`scraperAgent.js`):** 
   - Scrapes store profiles, products, prices, and images.
   - **Telegram Channel Scraper:** Connects to public channel previews (`t.me/s/{channel_username}`) and parses the HTML using `cheerio` to extract product photos, descriptions, and prices (using currency regex match). **No Telegram API keys required!**
   - **OLX Scraper:** Parses listings from `olx.uz` seller pages.
   - **Instagram / Mock Fallback:** Generates high-fidelity furniture catalog items with Unsplash image assets if blocked by network rate limits.

3. **Uploader Agent (`uploaderAgent.js`):**
   - Integrates with the `topin.uz` backend API.
   - Authenticates as `dragon_admin` (Super-Admin).
   - Automatically maps product categories.
   - Creates the shop profile (which triggers the server-side auto-generation of vendor credentials).
   - Iterates over the scraped products and uploads them under the new shop.

---

## Configuration (`backend/.env`)

Before running the agents, edit the configuration file at `backend/.env`:

```env
# Telegram Bot Token (Get from @BotFather)
TELEGRAM_BOT_TOKEN=your_bot_token_here

# Your Telegram Account Chat ID (Get from @userinfobot)
TELEGRAM_CHAT_ID=your_chat_id_here

# Agent Mode
# Set to 'false' to scrape live Telegram channels/OLX pages.
# Set to 'true' for local offline testing (fast simulated results).
AGENT_MOCK_MODE=true
```

### 1. How to create a Telegram Bot and get a Token
1. Open Telegram and search for [@BotFather](https://t.me/BotFather).
2. Send the command `/newbot`.
3. Follow the instructions to give your bot a name and a username.
4. @BotFather will send you a message containing your **HTTP API Token** (e.g., `123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ`). Copy this into `TELEGRAM_BOT_TOKEN`.
5. Click the link to start a chat with your new bot and click the **Start** button (essential so the bot can message you).

### 2. How to get your Telegram Chat ID
1. Search for [@userinfobot](https://t.me/userinfobot) on Telegram.
2. Click **Start** or send any message.
3. The bot will reply with your Profile Info, including your **Id** (e.g., `987654321`). Copy this number into `TELEGRAM_CHAT_ID`.

---

## How to Run the Agents

Make sure your backend server is running (`npm start` inside `backend`). Then open a new terminal inside the `backend` directory:

### Option A: Interactive CLI Mode (Best for testing without a bot)
Run the following command:
```bash
npm run agent:cli
```
This boots an interactive terminal prompt where you can select options:
1. Run the **Discovery Agent** to search.
2. Run the **Scraper Agent** on a specific Telegram channel.
3. Run the **Scraper & Uploader Pipeline** together to see products appear on `topin.uz` instantly.

### Option B: Telegram Bot Mode (Best for operations)
Run the following command:
```bash
npm run agent
```
Once started, open your Telegram bot and type:
- `/start` or `/help` - View commands.
- `/status` - Check connection to topin.uz API.
- `/discover mebel` - Find mebel shops in Tashkent. The bot will send you cards of found shops with a button: **[Scrape Products]**.
- Click **[Scrape Products]** to run the scraper. The bot will send you a preview of the scraped items and two buttons: **[Confirm & Upload to Site]** and **[Discard]**.
- Click **[Confirm & Upload to Site]** to run the Uploader Agent. The bot will create the store on the platform, import the products, and send you the **vendor login credentials**!
