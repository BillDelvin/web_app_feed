// eslint-disable-next-line @typescript-eslint/no-require-imports
const { WebSocketServer } = require("ws");

// NOTE
//  This script starts a simple mock WebSocket server on port 8080.
//  It broadcasts random events to connected clients every 2-5 seconds.
//  The events are randomly generated from predefined lists of titles and bodies.

const PORT = 8080;

// Mock event data
const feeds = ["news", "market", "price"];
const titles = {
  news: [
    "Breaking: Major Technology Announcement",
    "Market Update: Economic Indicators Released",
    "Industry News: New Partnership Formed",
    "Breaking: Regulatory Changes Announced",
    "Technology: Innovation in AI Sector",
  ],
  market: [
    "Trading Volume Surge Detected",
    "Market Volatility Increased",
    "New Trading Patterns Emerging",
    "Market Sentiment Shift Observed",
    "Institutional Activity Detected",
  ],
  price: [
    "Price Movement: Significant Change",
    "Support Level Reached",
    "Resistance Level Tested",
    "Price Consolidation Pattern",
    "Breakout Pattern Detected",
  ],
};

const bodies = {
  news: [
    "Latest developments in the technology sector show promising growth.",
    "Economic indicators suggest positive market momentum.",
    "Strategic partnership aims to expand market reach.",
    "Regulatory updates may impact market dynamics.",
    "AI innovation continues to drive sector growth.",
  ],
  market: [
    "Unusual trading patterns detected in multiple sectors.",
    "Market volatility indicates increased investor activity.",
    "Emerging patterns suggest potential market shifts.",
    "Sentiment analysis shows changing investor confidence.",
    "Large institutional trades detected in key markets.",
  ],
  price: [
    "Technical analysis indicates significant price movement.",
    "Key support level tested by market activity.",
    "Resistance level shows strong market reaction.",
    "Price consolidation observed in trading patterns.",
    "Technical breakout pattern confirmed by volume.",
  ],
};

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function generateRandomEvent() {
  const feed = feeds[Math.floor(Math.random() * feeds.length)];
  const titleList = titles[feed];
  const bodyList = bodies[feed];

  return {
    id: generateUUID(),
    feed,
    ts: Date.now(),
    title: titleList[Math.floor(Math.random() * titleList.length)],
    body: Math.random() > 0.3 ? bodyList[Math.floor(Math.random() * bodyList.length)] : undefined,
  };
}

function generateInitialEvents() {
  const now = Date.now();
  return [
    {
      id: generateUUID(),
      feed: "news",
      ts: now - 300000,
      title: "Welcome to Real-Time Feed Dashboard",
      body: "This is a demo of the real-time feed system. Events will appear here as they arrive.",
    },
    {
      id: generateUUID(),
      feed: "market",
      ts: now - 180000,
      title: "Market Activity Started",
      body: "Market feed is now active and will show trading activities.",
    },
    {
      id: generateUUID(),
      feed: "price",
      ts: now - 60000,
      title: "Price Feed Initialized",
      body: "Price movement tracking is now enabled.",
    },
  ];
}

const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (ws) => {
  console.log("Client connected to mock WebSocket server");

  // Send initial events
  const initialEvents = generateInitialEvents();
  initialEvents.forEach((event, index) => {
    setTimeout(() => {
      if (ws.readyState === ws.OPEN) {
        ws.send(
          JSON.stringify({
            type: "event",
            data: event,
          })
        );
      }
    }, index * 500);
  });

  // Send heartbeat every 30 seconds
  const heartbeatInterval = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ type: "heartbeat" }));
    }
  }, 30000);

  ws.on("close", () => {
    clearInterval(heartbeatInterval);
    console.log("Client disconnected from mock WebSocket server");
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
    clearInterval(heartbeatInterval);
  });
});

// Sending random events every 2-5 seconds
const broadcastInterval = setInterval(() => {
  if (wss.clients.size === 0) return;

  const event = generateRandomEvent();
  const message = JSON.stringify({
    type: "event",
    data: event,
  });

  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  });
}, Math.random() * 3000 + 2000);

console.log("Mock WebSocket server started on port 8080");

// Handle shutdown signal
process.on("SIGINT", () => {
  console.log("\nShutting down mock WebSocket server...");
  clearInterval(broadcastInterval);
  wss.clients.forEach((client) => {
    client.close();
  });
  wss.close(() => {
    process.exit(0);
  });
});

// Handle terminate signal
process.on("SIGTERM", () => {
  console.log("\nShutting down mock WebSocket server...");
  clearInterval(broadcastInterval);
  wss.clients.forEach((client) => {
    client.close();
  });
  wss.close(() => {
    process.exit(0);
  });
});
