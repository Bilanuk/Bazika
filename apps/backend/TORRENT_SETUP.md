# Torrent Download Setup

This document describes the setup and configuration for the torrent download system using BullMQ, Redis, and MinIO.

## Architecture

The torrent download system consists of:

1. **BullMQ Queue System** - Manages download jobs with Redis
2. **WebTorrent Client** - Downloads torrents and streams files
3. **MinIO Storage** - Stores downloaded files
4. **Processing Status Tracking** - Updates content item status

## Required Environment Variables

Add these variables to your `.env` file:

```bash
# Redis Configuration (for BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# MinIO Configuration
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=torrents

# Backend URL (for frontend API calls)
BACKEND_URL=http://localhost:4001
```

## Setup Instructions

### 1. Start Redis

```bash
# Using Docker
docker run -d --name redis -p 6379:6379 redis:alpine

# Or using Docker Compose (add to your docker-compose.yml)
services:
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
```

### 2. Start MinIO

```bash
# Using Docker
docker run -d \
  --name minio \
  -p 9000:9000 \
  -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address ":9001"

# Or using Docker Compose
services:
  minio:
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data

volumes:
  minio_data:
```

### 3. Access MinIO Console

- URL: http://localhost:9001
- Username: minioadmin
- Password: minioadmin

### 4. Access Bull Board Dashboard

- URL: http://localhost:4001/admin/queues
- Monitor queue status, jobs, and workers in real-time
- View job details, logs, and retry failed jobs

## Usage

### 1. Queue a Torrent Download

From the frontend dashboard:
1. Go to Content Items page
2. Find a content item with a torrent URL (magnet link or .torrent file)
3. Click the ellipsis menu (⋯)
4. Select "Download Torrent"

### 2. Monitor Download Progress

- Check the Processing Status column in the Content Items table
- Status will change from PENDING → QUEUED → PROCESSING → COMPLETED
- Failed downloads will show FAILED status

### 3. Access Downloaded Files

Files are stored in MinIO under the pattern: `{contentItemId}/{filename}`

You can access them via:
- MinIO Console: http://localhost:9001
- Direct API calls to get presigned URLs

## API Endpoints

### Queue Download
```
POST /api/content-items/{id}/download
```

### Get Queue Status
```
GET /api/queue/status
```

### Get Download Progress
```
GET /api/content-items/{id}/progress
```

### Get Queue Statistics
```
GET /api/queue/status
```

### Bull Board Dashboard
```
GET /admin/queues
```

## File Organization

Downloaded files are organized as:
```
torrents/
├── {contentItemId}/
│   ├── video.mkv
│   ├── subtitles.srt
│   └── other-files...
```

## Metadata

Each uploaded file includes metadata:
- `Content-Type`: Detected MIME type
- `torrent-info-hash`: BitTorrent info hash
- `content-item-id`: Associated content item ID
- `file-index`: File index within the torrent

## Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   - Ensure Redis is running on the configured host/port
   - Check firewall settings

2. **MinIO Connection Failed**
   - Verify MinIO is running and accessible
   - Check credentials and endpoint configuration

3. **Torrent Download Stuck**
   - Check if the torrent has seeders
   - Verify the torrent URL is valid
   - Check WebTorrent client logs

4. **Files Not Uploading to MinIO**
   - Verify MinIO credentials
   - Check bucket permissions
   - Ensure sufficient storage space

### Logs

Check application logs for detailed error messages:
```bash
# Backend logs
npm run dev

# Queue processor logs
# Look for TorrentDownloadProcessor and TorrentDownloadService logs
```

## Security Considerations

1. **Network Security**
   - Consider using VPN for torrent traffic
   - Implement rate limiting for download requests

2. **Storage Security**
   - Use strong MinIO credentials in production
   - Enable SSL/TLS for MinIO in production
   - Implement access controls for downloaded content

3. **Legal Compliance**
   - Ensure you have rights to download the content
   - Implement content filtering if necessary
   - Consider geographic restrictions

## Performance Tuning

1. **Concurrent Downloads**
   - Adjust BullMQ concurrency settings
   - Monitor system resources

2. **Storage Optimization**
   - Implement file compression
   - Set up lifecycle policies for old files

3. **Network Optimization**
   - Configure WebTorrent settings for your network
   - Implement bandwidth limiting if needed 