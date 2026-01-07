import { BaseEvent, Feed, SearchResult } from "@/types/events";

function filterByFeed(events: BaseEvent[], selectedFeed: Feed): BaseEvent[] {
  if (selectedFeed === Feed.ALL) {
    return events;
  }
  return events.filter((event) => event.feed === selectedFeed);
}

export function searchEvents(events: BaseEvent[], searchQuery: string): BaseEvent[] {
  if (!searchQuery.trim()) {
    return events;
  }

  const query = searchQuery.toLowerCase().trim();

  return events.filter((event) => {
    const titleMatch = event.title.toLowerCase().includes(query);
    const bodyMatch = event.body?.toLowerCase().includes(query) ?? false;
    return titleMatch || bodyMatch;
  });
}

export function applyFilters(
  events: BaseEvent[],
  selectedFeed: Feed,
  searchQuery: string
): SearchResult {
  let filteredEvents = events;

  // Apply feed filter first
  filteredEvents = filterByFeed(filteredEvents, selectedFeed);

  // Apply search filter
  filteredEvents = searchEvents(filteredEvents, searchQuery);

  return {
    events: filteredEvents,
    totalCount: events.length,
    filteredCount: filteredEvents.length,
  };
}

// Formating timestamp to more friendly user
export function formatTimestamp(ts: number): string {
  const now = Date.now();
  const diff = now - ts;

  // Less than 1 minute
  if (diff < 60000) {
    return "Just now";
  }

  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  }

  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }

  // More than 24 hours
  const date = new Date(ts);
  return date.toLocaleDateString("id-ID", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getFeedDisplayName(feed: Feed): string {
  const displayNames = {
    [Feed.ALL]: "All Feeds",
    [Feed.NEWS]: "News Feed",
    [Feed.MARKET]: "Market Activity",
    [Feed.PRICE]: "Price Movement",
  };
  return displayNames[feed];
}

export function getFeedColorClass(feed: Feed): string {
  const colorClasses = {
    [Feed.ALL]: "bg-gray-100 text-gray-800",
    [Feed.NEWS]: "bg-blue-100 text-blue-800",
    [Feed.MARKET]: "bg-green-100 text-green-800",
    [Feed.PRICE]: "bg-purple-100 text-purple-800",
  };
  return colorClasses[feed];
}
