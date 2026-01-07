"use client";

import React from "react";

import { WebSocketClient } from "@/lib/websocket-client";
import { BaseEvent, ConnectionStatus } from "@/types/events";
import { IWebSocketContextType, IWebsocketContextState } from "@/types/websocket";

const WebSocketContext = React.createContext<IWebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
  const context = React.useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};

interface WebSocketProviderProps {
  children: React.ReactNode;
  url?: string;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
  url = "ws://localhost:8080",
}) => {
  console.log("WebSocketProvider rendering with URL:", url);

  const [state, setState] = React.useState<IWebsocketContextState>({
    events: [],
    connectionStatus: "disconnected",
    reconnectAttempts: 0,
  });

  const clientRef = React.useRef<WebSocketClient | null>(null);
  const eventIdsRef = React.useRef<Set<string>>(new Set());

  const onHandleSetConnectionStatus = React.useCallback((status: ConnectionStatus) => {
    setState((prev) => ({ ...prev, connectionStatus: status }));
  }, []);

  const onHandleReconnectAttempts = React.useCallback((attempt: number) => {
    setState((prev) => ({ ...prev, reconnectAttempts: attempt }));
  }, []);

  const addEvent = React.useCallback((event: BaseEvent) => {
    setState((prev) => {
      // Check for duplicates
      if (eventIdsRef.current.has(event.id)) {
        return { ...prev, events: prev.events };
      }

      // Add to deduplication set
      eventIdsRef.current.add(event.id);

      // Add new event and maintain chronological order
      const newEvents = [...prev.events, event].sort((a, b) => b.ts - a.ts);

      // Keep only last 1000 events to prevent memory issues
      if (newEvents.length > 1000) {
        const eventsToRemove = newEvents.slice(1000);
        eventsToRemove.forEach((event) => {
          eventIdsRef.current.delete(event.id);
        });
        return {
          ...prev,
          events: newEvents.slice(0, 1000),
        };
      }

      return {
        ...prev,
        events: newEvents,
      };
    });
  }, []);

  // Initialize WebSocket client
  React.useEffect(() => {
    console.log("Initializing WebSocket context with URL:", url);
    const client = new WebSocketClient({
      url,
      reconnectInterval: 1000,
      maxReconnectAttempts: 10,
      reconnectBackoffMultiplier: 1.5,
    });

    clientRef.current = client;
    console.log("WebSocket client created");

    // Set up connection status callback
    const unsubscribeConnection = client.onConnectionChange((status) => {
      console.log("Connection status changed to:", status);
      onHandleSetConnectionStatus(status);
      const state = client.getConnectionState();
      onHandleReconnectAttempts(state.reconnectAttempts);
      console.log("Connection state:", state);
    });

    // Set up message callback
    const unsubscribeMessage = client.onMessage((message) => {
      console.log("WebSocket message received in context:", message);
      if (message.type === "event" && message.data) {
        addEvent(message.data);
      }
    });

    // Connect automatically
    client.connect();

    return () => {
      unsubscribeConnection();
      unsubscribeMessage();
      client.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, addEvent]);

  const connect = React.useCallback(() => {
    clientRef.current?.connect();
  }, []);

  const disconnect = React.useCallback(() => {
    clientRef.current?.disconnect();
  }, []);

  const clearEvents = React.useCallback(() => {
    setState((prev) => ({ ...prev, events: [] }));
    eventIdsRef.current.clear();
  }, []);

  const isConnected = state.connectionStatus === "connected";

  const value: IWebSocketContextType = {
    events: state.events,
    connectionStatus: state.connectionStatus,
    isConnected,
    reconnectAttempts: state.reconnectAttempts,
    connect,
    disconnect,
    clearEvents,
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};
