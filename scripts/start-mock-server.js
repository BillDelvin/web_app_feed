// eslint-disable-next-line @typescript-eslint/no-require-imports
const { mockWebSocketServer } = require("../dist/lib/mock-websocket-server");

console.log("Starting mock WebSocket server...");
mockWebSocketServer.start();

// Handle shutdown signal
process.on("SIGINT", () => {
  console.log("\nShutting down mock WebSocket server...");
  mockWebSocketServer.stop();
  process.exit(0);
});

// Handle termination signal
process.on("SIGTERM", () => {
  console.log("\nShutting down mock WebSocket server...");
  mockWebSocketServer.stop();
  process.exit(0);
});
