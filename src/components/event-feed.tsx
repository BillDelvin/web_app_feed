"use client";

import React from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, Hash } from "lucide-react";

import { BaseEvent, IEventFeedProps, Feed, SearchResult } from "@/types/events";
import {
  applyFilters,
  formatTimestamp,
  getFeedColorClass,
  getFeedDisplayName,
} from "@/lib/event-filters";

const EventFeed: React.FC<IEventFeedProps> = ({
  events,
  selectedFeed,
  searchQuery,
  isLoading = false,
}) => {
  const filteredEvents = React.useMemo(() => {
    return applyFilters(events, selectedFeed, searchQuery);
  }, [events, selectedFeed, searchQuery]);

  return (
    <div className="space-y-1">
      {/* Feed summary */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="text-sm text-gray-600">
          Showing {filteredEvents.filteredCount} of {filteredEvents.totalCount} events
        </div>
      </div>

      {/* Events list */}
      <div className="space-y-1">
        {filteredEvents.events.length > 0
          ? filteredEvents.events.map(renderEventContent)
          : renderEmptyState({
              isLoading,
              searchQuery,
              selectedFeed,
              events,
              filteredEvents,
            })}
      </div>

      {/* Load more indicator */}
      {filteredEvents.events.length > 0 &&
        filteredEvents.events.length < filteredEvents.totalCount && (
          <div className="text-center py-4 text-sm text-gray-500">
            Showing {filteredEvents.events.length} events.{" "}
            {filteredEvents.totalCount - filteredEvents.events.length} more available.
          </div>
        )}
    </div>
  );
};

export default EventFeed;

const renderEventContent = (event: BaseEvent) => {
  const timeAgo = formatTimestamp(event.ts);
  const feedColorClass = getFeedColorClass(event.feed);

  return (
    <Card key={event.id} className="mb-3 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className={feedColorClass}>{getFeedDisplayName(event.feed)}</Badge>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Clock className="h-3 w-3" />
              <span>{timeAgo}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Hash className="h-3 w-3" />
            <span className="font-mono">{event.id.slice(-8)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
        {event.body && <p className="text-gray-600 text-sm leading-relaxed">{event.body}</p>}
      </CardContent>
    </Card>
  );
};

const renderEmptyState = ({
  isLoading,
  searchQuery,
  selectedFeed,
  events,
  filteredEvents,
}: {
  isLoading: boolean;
  searchQuery: string;
  selectedFeed: Feed;
  events: BaseEvent[];
  filteredEvents: SearchResult;
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <div className="animate-pulse space-y-4 w-full">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="opacity-50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-16 bg-gray-200 rounded"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-4 w-12 bg-gray-200 rounded"></div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-5 w-3/4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-full bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <AlertCircle className="h-12 w-12 mb-4 text-gray-300" />
        <h3 className="text-lg font-medium mb-2">No events available</h3>
        <p className="text-sm text-center max-w-md">
          Waiting for events from the WebSocket connection. Events will appear here as they arrive.
        </p>
      </div>
    );
  }

  if (filteredEvents.filteredCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <AlertCircle className="h-12 w-12 mb-4 text-gray-300" />
        <h3 className="text-lg font-medium mb-2">No matching events</h3>
        <p className="text-sm text-center max-w-md">
          {searchQuery
            ? `No events found matching "${searchQuery}" in ${getFeedDisplayName(
                selectedFeed
              ).toLowerCase()}.`
            : `No events found in ${getFeedDisplayName(selectedFeed).toLowerCase()}.`}
        </p>
      </div>
    );
  }

  return null;
};
