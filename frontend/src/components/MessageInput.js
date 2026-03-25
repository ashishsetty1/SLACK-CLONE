import { useState } from "react";

export default function MessageInput({ onSend, onTyping, disabled }) {
  const [content, setContent] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    onSend(content);
    setContent("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        padding: "16px 20px",
        borderTop: "1px solid #ddd",
        backgroundColor: "white",
      }}
    >
      <input
        type="text"
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          onTyping();
        }}
        placeholder="Message channel..."
        disabled={disabled}
        style={{
          flex: 1,
          padding: "14px 16px",
          borderRadius: "10px",
          border: "1px solid #ccc",
          outline: "none",
          fontSize: "15px",
        }}
      />
      <button
        type="submit"
        disabled={disabled}
        style={{
          marginLeft: "10px",
          padding: "0 18px",
          borderRadius: "10px",
          border: "none",
          backgroundColor: "#007a5a",
          color: "white",
          fontWeight: "600",
          cursor: "pointer",
        }}
      >
        Send
      </button>
    </form>
  );
}