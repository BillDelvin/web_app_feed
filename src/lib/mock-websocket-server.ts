import { WebSocketServer, WebSocket as WSWebSocket } from "ws";
import { BaseEvent, Feed } from "@/types/events";

export class MockWebSocketServer {
  private wss: WebSocketServer;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(port: number = 8080) {
    this.wss = new WebSocketServer({ port });
    this.setupServer();
  }

  private setupServer(): void {
    this.wss.on("connection", (ws) => {
      console.log("Client connected to mock WebSocket server");

      // Send initial events
      this.sendInitialEvents(ws);

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
  }

  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log("Mock WebSocket server started on port 8080");

    // Start sending random events every 2-5 seconds
    this.intervalId = setInterval(() => {
      this.broadcastRandomEvent();
    }, Math.random() * 3000 + 2000);
  }

  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.wss.clients.forEach((client) => {
      client.close();
    });

    this.wss.close(() => {
      console.log("Mock WebSocket server stopped");
    });
  }

  private sendInitialEvents(ws: WSWebSocket): void {
    // Send a few initial events
    const initialEvents = this.generateInitialEvents();
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
  }

  private broadcastRandomEvent(): void {
    if (this.wss.clients.size === 0) return;

    const event = this.generateRandomEvent();
    const message = JSON.stringify({
      type: "event",
      data: event,
    });

    this.wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(message);
      }
    });
  }

  private generateInitialEvents(): BaseEvent[] {
    const now = Date.now();
    return [
      {
        id: "initial-1",
        feed: Feed.NEWS,
        ts: now - 300000, // 5 minutes ago
        title: "Welcome to Real-Time Feed Dashboard",
        body: "This is a demo of the real-time feed system. Events will appear here as they arrive.",
      },
      {
        id: "initial-2",
        feed: Feed.MARKET,
        ts: now - 180000, // 3 minutes ago
        title: "Market Activity Started",
        body: "Market feed is now active and will show trading activities.",
      },
      {
        id: "initial-3",
        feed: Feed.PRICE,
        ts: now - 60000, // 1 minute ago
        title: "Price Feed Initialized",
        body: "Price movement tracking is now enabled.",
      },
    ];
  }

  private generateRandomEvent(): BaseEvent {
    const feeds = [Feed.NEWS, Feed.MARKET, Feed.PRICE];
    const feed = feeds[Math.floor(Math.random() * feeds.length)];

    const titles = {
      [Feed.NEWS]: [
        "Breaking: Major Technology Announcement",
        "Market Update: Economic Indicators Released",
        "Industry News: New Partnership Formed",
        "Breaking: Regulatory Changes Announced",
        "Technology: Innovation in AI Sector",
      ],
      [Feed.MARKET]: [
        "Trading Volume Surge Detected",
        "Market Volatility Increased",
        "New Trading Patterns Emerging",
        "Market Sentiment Shift Observed",
        "Institutional Activity Detected",
      ],
      [Feed.PRICE]: [
        "Price Movement: Significant Change",
        "Support Level Reached",
        "Resistance Level Tested",
        "Price Consolidation Pattern",
        "Breakout Pattern Detected",
      ],
      [Feed.ALL]: [
        "All Feeds: System Update",
        "All Feeds: Activity Detected",
        "All Feeds: New Events Incoming",
        "All Feeds: Status Changed",
        "All Feeds: Heartbeat",
      ],
    };

    const bodies = {
      [Feed.NEWS]: [
        "Latest developments in the technology sector show promising growth.",
        "Economic indicators suggest positive market momentum.",
        "Strategic partnership aims to expand market reach.",
        "Regulatory updates may impact market dynamics.",
        "AI innovation continues to drive sector growth.",
      ],
      [Feed.MARKET]: [
        "Unusual trading patterns detected in multiple sectors.",
        "Market volatility indicates increased investor activity.",
        "Emerging patterns suggest potential market shifts.",
        "Sentiment analysis shows changing investor confidence.",
        "Large institutional trades detected in key markets.",
      ],
      [Feed.PRICE]: [
        "Technical analysis indicates significant price movement.",
        "Key support level tested by market activity.",
        "Resistance level shows strong market reaction.",
        "Price consolidation observed in trading patterns.",
        "Technical breakout pattern confirmed by volume.",
      ],
      [Feed.ALL]: [
        "General update affecting all feeds.",
        "System detected activity across all feeds.",
        "New events are incoming across the system.",
        "Status change observed across feeds.",
        "Routine heartbeat event for all feeds.",
      ],
    };

    const titleList = titles[feed];
    const bodyList = bodies[feed];

    return {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      feed,
      ts: Date.now(),
      title: titleList[Math.floor(Math.random() * titleList.length)],
      body: Math.random() > 0.3 ? bodyList[Math.floor(Math.random() * bodyList.length)] : undefined,
    };
  }
}

// Create and export a singleton instance
export const mockWebSocketServer = new MockWebSocketServer();
