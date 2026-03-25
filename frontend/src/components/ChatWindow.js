import { useEffect, useRef, useState } from "react";
import api from "../api/api";

export default function ChatWindow({ messages, selectedChannel, onMessageUpdated, onMessageDeleted }) {
  const bottomRef = useRef(null);
  const currentUserId = Number(localStorage.getItem("userId"));
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleEdit = async (msg) => {
    setEditingId(msg.id);
    setEditContent(msg.content);
  };

  const saveEdit = async (msg) => {
    try {
      const res = await api.put(`/messages/${msg.id}`, {
        content: editContent,
        channel_id: msg.channel_id,
        user_id: currentUserId,
      });

      onMessageUpdated(res.data);
      setEditingId(null);
      setEditContent("");
    } catch (err) {
      console.error("Edit failed:", err);
      alert(err.response?.data?.detail || "Failed to edit message");
    }
  };

  const handleDelete = async (msg) => {
    try {
      await api.delete(`/messages/${msg.id}`);
      onMessageDeleted(msg.id);
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err.response?.data?.detail || "Failed to delete message");
    }
  };

  return (
    <div
      style={{
        flex: 1,
        padding: "0",
        height: "100%",
        overflowY: "auto",
        backgroundColor: "#f8f8f8",
      }}
    >
      <div
        style={{
          padding: "18px 24px",
          borderBottom: "1px solid #ddd",
          backgroundColor: "white",
          position: "sticky",
          top: 0,
          zIndex: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: "22px" }}>
            {selectedChannel ? `# ${selectedChannel.name}` : "Select a channel"}
          </h2>
        </div>

        <div style={{ fontSize: "14px", color: "#666" }}>
          {localStorage.getItem("username") || "User"}
        </div>
      </div>

      <div style={{ padding: "20px 24px" }}>
        {messages.map((msg) => {
          const isOwner = msg.user_id === currentUserId;

          return (
            <div
              key={msg.id}
              style={{
                display: "flex",
                gap: "12px",
                marginBottom: "18px",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  minWidth: "38px",
                  borderRadius: "8px",
                  backgroundColor: "#611f69",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "700",
                  fontSize: "14px",
                }}
              >
                {(msg.user?.username || "U").charAt(0).toUpperCase()}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontWeight: "700" }}>
                    {msg.user?.username || `User ${msg.user_id}`}
                  </span>
                  <span style={{ color: "#666", fontSize: "12px" }}>
                    {formatTime(msg.created_at)}
                  </span>

                  {isOwner && editingId !== msg.id && (
                    <>
                      <button onClick={() => handleEdit(msg)}>Edit</button>
                      <button onClick={() => handleDelete(msg)}>Delete</button>
                    </>
                  )}
                </div>

                {editingId === msg.id ? (
                  <div>
                    <input
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
                    />
                    <button onClick={() => saveEdit(msg)}>Save</button>
                    <button onClick={() => setEditingId(null)} style={{ marginLeft: "8px" }}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div style={{ color: "#1d1c1d", lineHeight: "1.5" }}>
                    {msg.content}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}