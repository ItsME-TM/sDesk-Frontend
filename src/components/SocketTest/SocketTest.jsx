import { useEffect, useState } from "react";
import socket from "../../utils/socket";

function SocketTest() {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    // Connection events
    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    // Test response handler
    socket.on("test_response", (data) => {
      setMessages((prev) => [...prev, data.message]);
    });

    // Listen for incident creation events
    socket.on("incident_created", (data) => {
      setMessages((prev) => [
        ...prev,
        `🆕 Incident ${data.incident.incident_number} created!`,
      ]);
    });

    // Cleanup
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("test_response");
      socket.off("incident_created");
    };
  }, []);

  const sendTestMessage = () => {
    socket.emit("test_message", { text: "Hello from frontend!" });
  };

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", margin: "10px" }}>
      <h3>Socket Connection Test</h3>
      <p>Status: {connected ? "🟢 Connected" : "🔴 Disconnected"}</p>
      <p>Socket ID: {socket.id || "None"}</p>
      <button onClick={sendTestMessage}>Send Test Message</button>

      <div>
        <h4>Messages:</h4>
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
    </div>
  );
}

export default SocketTest;
