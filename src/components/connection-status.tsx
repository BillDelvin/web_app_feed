"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, Loader2, AlertCircle } from "lucide-react";

import type { ConnectionStatus } from "../types/events";

interface ConnectionStatusProps {
  status: ConnectionStatus;
  reconnectAttempts?: number;
}
const getStatusConfig = ({ status, reconnectAttempts = 0 }: ConnectionStatusProps) => {
  switch (status) {
    case "connected":
      return {
        icon: Wifi,
        label: "Connected",
        variant: "default" as const,
        className: "bg-green-100 text-green-800 border-green-200",
      };
    case "connecting":
      return {
        icon: Loader2,
        label: "Connecting...",
        variant: "secondary" as const,
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      };
    case "disconnected":
      return {
        icon: WifiOff,
        label: reconnectAttempts > 0 ? `Reconnecting (${reconnectAttempts})` : "Disconnected",
        variant: "destructive" as const,
        className: "bg-red-100 text-red-800 border-red-200",
      };
    case "error":
      return {
        icon: AlertCircle,
        label: "Connection Error",
        variant: "destructive" as const,
        className: "bg-red-100 text-red-800 border-red-200",
      };
    default:
      return {
        icon: WifiOff,
        label: "Unknown",
        variant: "secondary" as const,
        className: "bg-gray-100 text-gray-800 border-gray-200",
      };
  }
};

export const ConnectionStatusIndicator: React.FC<ConnectionStatusProps> = ({
  status,
  reconnectAttempts,
}) => {
  const config = getStatusConfig({ status, reconnectAttempts });
  const Icon = config.icon;
  return (
    <Badge variant={config.variant} className={`flex items-center gap-2 ${config.className}`}>
      <Icon className={`h-3 w-3 ${status === "connecting" ? "animate-spin" : ""}`} />
      <span className="text-sm font-medium">{config.label}</span>
    </Badge>
  );
};
