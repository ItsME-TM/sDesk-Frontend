import { io } from "socket.io-client";

let SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";
// Ensure production uses https
if (
  SOCKET_URL.startsWith("http://") &&
  window?.location?.protocol === "https:"
) {
  SOCKET_URL = SOCKET_URL.replace("http://", "https://");
}

const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"], // Allow fallback (Heroku can drop pure WS during cold start)
  withCredentials: true,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 500,
  reconnectionDelayMax: 5000,
});

export default socket;
