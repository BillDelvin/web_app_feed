"use client";
import React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConnectionStatusIndicator } from "@/components/connection-status";
import { FeedTabs } from "@/components/feed-tabs";
import { SearchInput } from "@/components/search-input";
import { EventFeed } from "@/components/event-feed";
import { WebSocketDebug } from "@/components/websocket-debug";
import { Wifi, Trash2 } from "lucide-react";
import { WebSocketProvider, useWebSocket } from "@/contexts/websocket-context";

import { Feed } from "@/types/events";
import { IPageState } from "@/types/page";

function FeedDashboard() {
  // const [selectedFeed, setSelectedFeed] = React.useState<Feed>(Feed.ALL);
  // const [searchQuery, setSearchQuery] = React.useState("");
  const [state, setState] = React.useState<IPageState>({
    selectedFeed: Feed.ALL,
    searchQuery: "",
  });

  const {
    events,
    connectionStatus,
    isConnected,
    reconnectAttempts,
    connect,
    disconnect,
    clearEvents,
  } = useWebSocket();

  // Debug logging
  React.useEffect(() => {
    console.log("FeedDashboard mounted, WebSocket state:", {
      events: events.length,
      connectionStatus,
      isConnected,
      reconnectAttempts,
    });
  }, [events, connectionStatus, isConnected, reconnectAttempts]);

  const onHandleSelectFeed = (feed: Feed) => {
    setState({ ...state, selectedFeed: feed });
  };

  const onHandleSearchQuery = (query: string) => {
    setState({ ...state, searchQuery: query });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Real-Time Feed Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Monitor incoming events with filtering and search
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ConnectionStatusIndicator
                status={connectionStatus}
                reconnectAttempts={reconnectAttempts}
              />
            </div>
          </div>
        </div>

        {/* WebSocket Debug */}
        <WebSocketDebug />

        {/* Controls */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Feed Controls</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={isConnected ? disconnect : connect}
                  className="flex items-center gap-2"
                >
                  {isConnected ? (
                    <>
                      <Wifi className="h-4 w-4" /> Disconnect
                    </>
                  ) : (
                    <>
                      <Wifi className="h-4 w-4" /> Connect
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearEvents}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" /> Clear
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Feed Tabs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Feed Type
              </label>
              <FeedTabs selectedFeed={state.selectedFeed} onFeedChange={onHandleSelectFeed} />
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Events</label>
              <SearchInput
                onSearch={onHandleSearchQuery}
                placeholder="Search by title or content..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Event Feed */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Event Feed</CardTitle>
              <div className="text-sm text-gray-600">{events.length} events total</div>
            </div>
          </CardHeader>
          <CardContent>
            <EventFeed
              events={events}
              selectedFeed={state.selectedFeed}
              searchQuery={state.searchQuery}
              isLoading={!isConnected && events.length === 0}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function FeedPage() {
  console.log("FeedPage rendering with WebSocketProvider");
  return (
    <WebSocketProvider>
      <FeedDashboard />
    </WebSocketProvider>
  );
}
