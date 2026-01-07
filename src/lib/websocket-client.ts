import {
  BaseEvent,
  WebSocketMessage,
  ConnectionStatus,
  ConnectionState,
  Feed,
  EventSchema,
} from "@/types/events";

interface WebSocketClientConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  reconnectBackoffMultiplier?: number;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private config: Required<WebSocketClientConfig>;
  private messageCallbacks: Array<(message: WebSocketMessage) => void> = [];
  private connectionCallbacks: Array<(status: ConnectionStatus) => void> = [];
  private connectionState: ConnectionState = {
    status: "disconnected",
    reconnectAttempts: 0,
  };
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(config: WebSocketClientConfig) {
    // initial connection state
    this.config = {
      url: config.url,
      reconnectInterval: config.reconnectInterval || 1000,
      maxReconnectAttempts: config.maxReconnectAttempts || 10,
      reconnectBackoffMultiplier: config.reconnectBackoffMultiplier || 1.5,
    };
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.CONNECTING || this.ws?.readyState === WebSocket.OPEN) {
      console.log("WebSocket already connecting or connected");
      return;
    }

    console.log("Attempting to connect to WebSocket:", this.config.url);
    this.updateConnectionState("connecting");

    try {
      this.ws = new WebSocket(this.config.url);
      console.log("WebSocket instance created");
      this.setupEventHandlers();
    } catch (error) {
      console.error("Error creating WebSocket:", error);
      this.handleConnectionError(error as Error);
    }
  }

  disconnect(): void {
    this.clearReconnectTimer();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.updateConnectionState("disconnected");
    this.connectionState.reconnectAttempts = 50; // reset reconnect attempts
  }

  reconnect(): void {
    this.disconnect();
    this.connect();
  }

  send(message: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      console.warn("WebSocket is not connected");
    }
  }

  onMessage(callback: (message: WebSocketMessage) => void): () => void {
    this.messageCallbacks.push(callback);
    return () => {
      const index = this.messageCallbacks.indexOf(callback);
      if (index > -1) {
        this.messageCallbacks.splice(index, 1);
      }
    };
  }

  onConnectionChange(callback: (status: ConnectionStatus) => void): () => void {
    this.connectionCallbacks.push(callback);
    return () => {
      const index = this.connectionCallbacks.indexOf(callback);
      if (index > -1) {
        this.connectionCallbacks.splice(index, 1);
      }
    };
  }

  getConnectionState(): ConnectionState {
    return { ...this.connectionState };
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log("WebSocket connection opened");
      this.updateConnectionState("connected");
      this.connectionState.reconnectAttempts = 0;
      console.log("WebSocket connected");
    };

    this.ws.onmessage = (event) => {
      try {
        console.log("Raw WebSocket message received:", event.data);
        const message = this.parseMessage(event.data);
        if (message) {
          console.log("Parsed message:", message);
          this.notifyMessageCallbacks(message);
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
        this.notifyMessageCallbacks({
          type: "error",
          error: "Failed to process message",
        });
      }
    };

    this.ws.onclose = () => {
      console.log("WebSocket connection closed");
      this.updateConnectionState("disconnected");
      console.log("WebSocket disconnected");
      this.scheduleReconnect();
    };

    this.ws.onerror = (event) => {
      console.error("WebSocket error event:", event);
      this.handleConnectionError(new Error("WebSocket error occurred"));
    };
  }

  private parseMessage(data: string): WebSocketMessage | null {
    try {
      const parsed = JSON.parse(data);

      // Validate message structure
      if (!parsed.type || !["event", "heartbeat", "error"].includes(parsed.type)) {
        throw new Error("Invalid message type");
      }

      // Validate event data if present
      if (parsed.type === "event" && parsed.data) {
        const validatedEvent = EventSchema.parse(parsed.data);
        // Convert the validated event to BaseEvent type
        const baseEvent: BaseEvent = {
          ...validatedEvent,
          feed: validatedEvent.feed as Feed,
        };
        return {
          type: "event",
          data: baseEvent,
        };
      }

      return parsed as WebSocketMessage;
    } catch (error) {
      console.error("Failed to parse WebSocket message:", error);
      return {
        type: "error",
        error: "Malformed message received",
      };
    }
  }

  private handleConnectionError(error: Error): void {
    console.error("WebSocket connection error:", error);
    this.updateConnectionState("error", error.message);
    this.scheduleReconnect();
  }

  private updateConnectionState(status: ConnectionStatus, lastError?: string): void {
    this.connectionState.status = status;
    if (lastError) {
      this.connectionState.lastError = lastError;
    }
    this.notifyConnectionCallbacks(status);
  }

  private scheduleReconnect(): void {
    this.clearReconnectTimer();

    if (this.connectionState.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached");
      this.updateConnectionState("error", "Max reconnection attempts reached");
      return;
    }

    const delay = this.calculateReconnectDelay();
    console.log(
      `Scheduling reconnect in ${delay}ms (attempt ${this.connectionState.reconnectAttempts + 1})`
    );

    this.reconnectTimer = setTimeout(() => {
      this.connectionState.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  private calculateReconnectDelay(): number {
    const baseDelay = this.config.reconnectInterval;
    const attempts = this.connectionState.reconnectAttempts;
    const multiplier = this.config.reconnectBackoffMultiplier;

    return Math.min(baseDelay * Math.pow(multiplier, attempts), 30000); // Max 30 seconds
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private notifyMessageCallbacks(message: WebSocketMessage): void {
    this.messageCallbacks.forEach((callback) => {
      try {
        callback(message);
      } catch (error) {
        console.error("Error in message callback:", error);
      }
    });
  }

  private notifyConnectionCallbacks(status: ConnectionStatus): void {
    this.connectionCallbacks.forEach((callback) => {
      try {
        callback(status);
      } catch (error) {
        console.error("Error in connection callback:", error);
      }
    });
  }
}
