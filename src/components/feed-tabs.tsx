"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Feed } from "@/types/events";

interface FeedTabsProps {
  selectedFeed: Feed;
  onFeedChange: (feed: Feed) => void;
}

export const FeedTabs: React.FC<FeedTabsProps> = ({ selectedFeed, onFeedChange }) => {
  const feeds = [
    { value: Feed.ALL, label: "All" },
    { value: Feed.NEWS, label: "News" },
    { value: Feed.MARKET, label: "Market" },
    { value: Feed.PRICE, label: "Price" },
  ];

  return (
    <Tabs value={selectedFeed} onValueChange={(value) => onFeedChange(value as Feed)}>
      <TabsList className="grid grid-cols-4 gap-2 bg-transparent p-0 h-auto">
        {feeds.map((feed) => (
          <TabsTrigger
            key={feed.value}
            value={feed.value}
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-3 py-2 text-sm font-medium transition-all"
          >
            {feed.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
