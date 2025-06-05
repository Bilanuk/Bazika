# Content Monitoring System

This system monitors RSS feeds (specifically Nyaa for anime content) and sends notifications via Telegram when new content is found.

## Features

- **RSS Feed Monitoring**: Automatically monitors RSS feeds for new content
- **Nyaa Integration**: Specifically designed to work with Nyaa.si RSS feeds
- **Anime Filtering**: Filters content to focus on anime-related items
- **Telegram Notifications**: Sends notifications via Telegram bot
- **Scheduled Monitoring**: Runs automatically every 10 minutes
- **Manual Monitoring**: Trigger monitoring manually via API
- **Content Deduplication**: Prevents duplicate notifications

## Setup

### 1. Environment Variables

Add these environment variables to your `.env` file:

```env
# Telegram Bot Configuration (Optional)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_telegram_chat_id_here
```

### 2. Database Migration

Run the Prisma migration to create the new tables:

```bash
cd apps/backend
pnpm migrate
```

### 3. Install Dependencies

The required dependencies should be automatically installed:

```bash
pnpm install
```

### 4. Seed Initial Sources

Run the content monitoring seed to add initial Nyaa sources:

```bash
cd apps/backend
npx ts-node src/seeds/content-monitoring.seed.ts
```

## API Endpoints

All endpoints require JWT authentication.

### Add Nyaa Source

```http
POST /content-monitoring/add-nyaa-source
Content-Type: application/json
Authorization: Bearer <your_jwt_token>

{
  "name": "Custom Nyaa Source",
  "rssUrl": "https://nyaa.si/?page=rss&c=1_2&q=your_search_query"
}
```

### Manual Monitor

```http
POST /content-monitoring/manual-monitor
Authorization: Bearer <your_jwt_token>
```

### Get Status

```http
GET /content-monitoring/status
Authorization: Bearer <your_jwt_token>
```

### Test Notifications

```http
POST /content-monitoring/test-notifications
Authorization: Bearer <your_jwt_token>
``` 