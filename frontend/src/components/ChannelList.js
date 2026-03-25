import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

export default function ChannelList({
  channels,
  selectedChannel,
  onSelectChannel,
  onChannelCreated,
  unreadCounts = {},
}) {
  const [newChannelName, setNewChannelName] = useState("");
  const navigate = useNavigate();

  const username = localStorage.getItem("username") || "User";
  const email = localStorage.getItem("email") || "";

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return;

    try {
      const res = await api.post("/channels/", {
        name: newChannelName.trim(),
        description: "",
      });

      setNewChannelName("");
      onChannelCreated(res.data);
      onSelectChannel(res.data);
    } catch (err) {
      console.error("Error creating channel:", err);
      alert(err.response?.data?.detail || "Failed to create channel");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    navigate("/");
  };

  return (
    <div
      style={{
        width: "280px",
        backgroundColor: "#3f0e40",
        color: "white",
        display: "flex",
        flexDirection: "column",
        padding: "18px 14px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ marginBottom: "16px" }}>
        <h2 style={{ margin: 0, fontSize: "22px" }}>Slack Clone</h2>
        <div style={{ fontSize: "13px", opacity: 0.8, marginTop: "4px" }}>
          Signed in as
        </div>
        <div style={{ fontWeight: "700", marginTop: "6px" }}>{username}</div>
        <div style={{ fontSize: "12px", opacity: 0.75, marginTop: "2px" }}>
          {email}
        </div>
      </div>

      <button
        onClick={handleLogout}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid rgba(255,255,255,0.2)",
          backgroundColor: "transparent",
          color: "white",
          cursor: "pointer",
          marginBottom: "18px",
          fontWeight: "600",
        }}
      >
        Log Out
      </button>

      <div
        style={{
          backgroundColor: "rgba(255,255,255,0.08)",
          borderRadius: "10px",
          padding: "10px",
          marginBottom: "18px",
        }}
      >
        <input
          type="text"
          placeholder="New channel name"
          value={newChannelName}
          onChange={(e) => setNewChannelName(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "8px",
            boxSizing: "border-box",
            borderRadius: "8px",
            border: "none",
            outline: "none",
          }}
        />
        <button
          onClick={handleCreateChannel}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontWeight: "600",
            backgroundColor: "#ffffff",
            color: "#3f0e40",
          }}
        >
          + Create Channel
        </button>
      </div>

      <div style={{ fontSize: "12px", opacity: 0.7, marginBottom: "8px" }}>
        BROWSE CHANNELS
      </div>

      <div style={{ overflowY: "auto", flex: 1 }}>
        {channels.map((channel) => (
          <div
            key={channel.id}
            onClick={() => onSelectChannel(channel)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 12px",
              cursor: "pointer",
              backgroundColor:
                selectedChannel?.id === channel.id ? "#1164a3" : "transparent",
              borderRadius: "8px",
              marginBottom: "6px",
              fontWeight: selectedChannel?.id === channel.id ? "600" : "400",
            }}
          >
            <span># {channel.name}</span>
            {unreadCounts[channel.id] > 0 && (
              <span
                style={{
                  background: "white",
                  color: "#3f0e40",
                  borderRadius: "999px",
                  padding: "2px 8px",
                  fontSize: "12px",
                  fontWeight: "700",
                }}
              >
                {unreadCounts[channel.id]}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}