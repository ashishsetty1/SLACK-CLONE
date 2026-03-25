import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import ChannelList from "../components/ChannelList";
import ChatWindow from "../components/ChatWindow";
import MessageInput from "../components/MessageInput";

export default function ChatPage() {
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineCount, setOnlineCount] = useState(1);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [typingUser, setTypingUser] = useState("");
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    const fetchChannels = async () => {
      try {
        const res = await api.get("/channels/");
        setChannels(res.data);

        if (res.data.length > 0) {
          setSelectedChannel(res.data[0]);
        }
      } catch (err) {
        console.error("Error loading channels:", err);
      }
    };

    fetchChannels();
  }, [navigate]);

  useEffect(() => {
    if (!selectedChannel) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${selectedChannel.id}`);
        setMessages(res.data);
        setUnreadCounts((prev) => ({ ...prev, [selectedChannel.id]: 0 }));
      } catch (err) {
        console.error("Error loading messages:", err);
      }
    };

    fetchMessages();

    if (socketRef.current) {
      socketRef.current.close();
    }

    const token = localStorage.getItem("token");
    const apiBase =
      process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";
    const wsBase = apiBase
      .replace("https://", "wss://")
      .replace("http://", "ws://");

    const socket = new WebSocket(
      `${wsBase}/ws/${selectedChannel.id}?token=${token}`
    );
    socketRef.current = socket;

    socket.onmessage = (event) => {
      const incoming = JSON.parse(event.data);

      if (incoming.type === "presence") {
        setOnlineCount(incoming.count);
        return;
      }

      if (incoming.type === "typing") {
        const currentUsername = localStorage.getItem("username");

        if (incoming.user?.username !== currentUsername) {
          setTypingUser(`${incoming.user.username} is typing...`);

          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }

          typingTimeoutRef.current = setTimeout(() => {
            setTypingUser("");
          }, 1200);
        }
        return;
      }

      if (incoming.type === "message") {
        setMessages((prev) => [...prev, incoming]);
        return;
      }

      setMessages((prev) => [...prev, incoming]);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socket.close();
    };
  }, [selectedChannel]);

  const handleSend = (content) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: "message",
          content,
        })
      );
    }
  };

  const handleTyping = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: "typing",
        })
      );
    }
  };

  const handleMessageUpdated = (updatedMessage) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
    );
  };

  const handleMessageDeleted = (messageId) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <ChannelList
        channels={channels}
        selectedChannel={selectedChannel}
        onSelectChannel={setSelectedChannel}
        onChannelCreated={(newChannel) =>
          setChannels((prev) => [...prev, newChannel])
        }
        unreadCounts={unreadCounts}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#f8f8f8",
        }}
      >
        <div
          style={{
            padding: "8px 16px",
            background: "white",
            borderBottom: "1px solid #ddd",
          }}
        >
          Online users: {onlineCount}
        </div>

        <ChatWindow
          messages={messages}
          selectedChannel={selectedChannel}
          onMessageUpdated={handleMessageUpdated}
          onMessageDeleted={handleMessageDeleted}
        />

        {typingUser && (
          <div
            style={{
              padding: "8px 20px",
              fontSize: "13px",
              color: "#666",
              backgroundColor: "#f8f8f8",
            }}
          >
            {typingUser}
          </div>
        )}

        <MessageInput
          onSend={handleSend}
          onTyping={handleTyping}
          disabled={!selectedChannel}
        />
      </div>
    </div>
  );
}