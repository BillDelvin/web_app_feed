"use client";

import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff } from "lucide-react";

import { IWebsocketState } from "@/types/websocket";

const WebSocketLog: React.FC = () => {
  const [state, setState] = React.useState<IWebsocketState>({
    isConnected: false,
    messages: [],
    ws: null,
  });

  const onHandleConnection = ({
    connection,
    message,
  }: {
    connection?: boolean;
    message: string;
  }) => {
    setState((prev) => ({
      ...prev,
      isConnected: connection ?? prev.isConnected,
      messages: [...prev.messages, message],
    }));
  };

  const connect = () => {
    if (state.ws) {
      // preventing open multiple connections
      state.ws.close();
    }

    console.log("Attempting to connect to ws://localhost:8080");
    const websocket = new WebSocket("ws://localhost:8080");

    websocket.onopen = () => {
      console.log("WebSocket connected successfully");
      onHandleConnection({
        connection: true,
        message: "Connected to WebSocket server",
      });
    };

    websocket.onmessage = (event) => {
      console.log("Message received:", event.data);
      onHandleConnection({
        message: `Received: ${event.data}`,
      });
    };

    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
      onHandleConnection({
        message: `WebSocket error occurred`,
      });
    };

    websocket.onclose = () => {
      console.log("WebSocket disconnected");
      onHandleConnection({
        connection: false,
        message: `Disconnected from WebSocket server`,
      });
    };

    setState((prev) => ({ ...prev, ws: websocket }));
  };

  const disconnect = () => {
    if (state.ws) {
      state.ws.close();
      setState((prev) => ({ ...prev, ws: null }));
    }
  };

  React.useEffect(() => {
    connect();

    return () => {
      if (state.ws) {
        state.ws.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">WebSocket Log</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={state.isConnected ? disconnect : connect}
              className="flex items-center gap-2"
            >
              {state.isConnected ? (
                <>
                  <WifiOff className="h-4 w-4" /> Disconnect
                </>
              ) : (
                <>
                  <Wifi className="h-4 w-4" /> Connect
                </>
              )}
            </Button>
            <div
              className={`px-2 py-1 rounded text-sm ${
                state.isConnected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {state.isConnected ? "Connected" : "Disconnected"}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {state.messages.length === 0 ? (
            <p className="text-gray-500 text-sm">No messages yet...</p>
          ) : (
            state.messages.map((msg, index) => (
              <div key={index} className="text-sm font-mono bg-gray-50 p-2 rounded">
                {msg}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WebSocketLog;
