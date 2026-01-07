import { BaseEvent, ConnectionStatus } from "@/types/events";

export interface IWebSocketContextType {
  events: BaseEvent[];
  connectionStatus: ConnectionStatus;
  isConnected: boolean;
  reconnectAttempts: number;
  connect: () => void;
  disconnect: () => void;
  clearEvents: () => void;
}

export interface IWebsocketState {
  isConnected: boolean;
  messages: string[];
  ws: WebSocket | null;
}
