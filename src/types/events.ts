import * as Zod from "zod";

// Feed enum
export enum Feed {
  ALL = "all",
  NEWS = "news",
  MARKET = "market",
  PRICE = "price",
}

// Base event type
export interface BaseEvent {
  id: string;
  feed: Feed;
  ts: number;
  title: string;
  body?: string;
}

// validation schema Event
export const EventSchema = Zod.z.object({
  id: Zod.z.string().uuid({ version: "v4" }),
  feed: Zod.z.enum(["all", "news", "market", "price"]),
  ts: Zod.z.number().int().positive(),
  title: Zod.z.string().min(1).max(200),
  body: Zod.z.string().max(1000).optional(),
});

export type EventType = Zod.z.infer<typeof EventSchema>;

// type message WebSocket
export interface WebSocketMessage {
  type: "event" | "heartbeat" | "error";
  data?: BaseEvent;
  error?: string;
}

// Connection status
export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

// Connection state
export interface ConnectionState {
  status: ConnectionStatus;
  reconnectAttempts: number;
  lastError?: string;
}

// Filter state
export interface FilterState {
  selectedFeed: Feed;
  searchQuery: string;
}

// Filter form schema
export const FilterFormSchema = Zod.z.object({
  selectedFeed: Zod.z.enum(["all", "news", "market", "price"]),
  searchQuery: Zod.z.string().max(100).optional(),
});

export type FilterFormType = Zod.z.infer<typeof FilterFormSchema>;

// Search result
export interface SearchResult {
  events: BaseEvent[];
  totalCount: number;
  filteredCount: number;
}
