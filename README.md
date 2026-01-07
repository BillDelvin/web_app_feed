# Real-Time Feed Dashboard

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development servers:

**Option 1: Run both servers together**

```bash
npm run dev:full
```

**Option 2: Run servers separately**

```bash
# Terminal 1: Start the mock WebSocket server
npm run mock-server

# Terminal 2: Start the Next.js development server
npm run dev
```

3. Open your browser and navigate to:

```
http://localhost:3000/feed
```

## Usage

### WebSocket Connection

The dashboard automatically connects to the WebSocket server at `ws://localhost:8080`. You can:

- **Connect/Disconnect**: Use the Connect/Disconnect button in the Feed Controls
- **Monitor Status**: Watch the connection status indicator in the header
- **View Events**: Events appear in real-time in the scrollable feed

### Filtering Events

1. **Feed Tabs**: Click on tabs to filter by event type:

   - **All**: Shows all events
   - **News**: News-related events
   - **Market**: Market activity events
   - **Price**: Price movement events

2. **Search**: Use the search input to find events by title or content
   - Search is debounced (300ms delay)
   - Case-insensitive matching
   - Searches both titles and body content

### Event Display

Each event card shows:

- **Feed Type**: Color-coded badge indicating the event category
- **Timestamp**: Relative time (e.g., "2m ago", "1h ago")
- **Event ID**: Last 8 characters of the unique ID
- **Title**: Event title with bold formatting
- **Body**: Optional detailed description

## WebSocket Protocol

### Message Format

Events are received in the following JSON format:

```json
{
  "type": "event",
  "data": {
    "id": "uuid-v4-string",
    "feed": "news" | "market" | "price",
    "ts": 1234567890,
    "title": "Event Title",
    "body": "Optional event description"
  }
}
```

## Development

### WebSocket URL

Modify the WebSocket URL in the feed page:

```typescript
// src/app/feed/page.tsx
<WebSocketProvider url="ws://your-websocket-server:port">
```

### Reconnection Settings

Adjust reconnection behavior in the WebSocket client:

```typescript
// src/contexts/websocket-context.tsx
const client = new WebSocketClient({
  url,
  reconnectInterval: 1000, // Base reconnection delay (ms)
  maxReconnectAttempts: 10, // Maximum reconnection attempts
  reconnectBackoffMultiplier: 1.5, // Exponential backoff multiplier
});
```

### Event Limits

Control event storage limits:

```typescript
// src/contexts/websocket-context.tsx
// Keep only last 1000 events to prevent memory issues
if (newEvents.length > 1000) {
  return newEvents.slice(0, 1000);
}
```

## Deployment

### Build

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Environment Variables

For production deployment, consider setting:

- `NEXT_PUBLIC_WEBSOCKET_URL`: WebSocket server URL
- `NODE_ENV`: Environment (production/development)

## Troubleshooting

### WebSocket Connection Issues

1. **Check if mock server is running**:

   ```bash
   npm run mock-server
   ```

2. **Verify WebSocket URL is accessible**:

   - Ensure port 8080 is not blocked
   - Check firewall settings
   - Verify the WebSocket server is running

3. **Check browser console** for connection errors

4. **Use the WebSocket Debug component** to test connections directly

### Build Issues

1. **TypeScript errors**: Run `npm run lint` to check for issues
2. **Missing dependencies**: Delete `node_modules` and reinstall
3. **Port conflicts**: Ensure ports 3000 and 8080 are available
