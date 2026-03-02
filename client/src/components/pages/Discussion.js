import React, { useState, useCallback, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { POST_MESSAGE } from "../../utils/mutations";
import { MESSAGES, QUERY_ME } from "../../utils/queries";
import { MESSAGES_SUBSCRIPTION } from "../../utils/subscriptions";
import {
  Box,
  Container,
  Typography,
  TextField,
  IconButton,
  Paper,
} from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { useAlert } from "react-alert";

const Discussion = () => {
  const [content, setContent] = useState("");
  const messagesEndRef = useRef(null);
  const [postMessage] = useMutation(POST_MESSAGE);
  const alert = useAlert();

  const { data: userDataResp } = useQuery(QUERY_ME);
  const userData = userDataResp?.me || {};
  const currentAuthor = `${userData.firstName || ""} ${userData.lastName || ""}`.trim() || userData.email || "You";

  const { data: messagesResp, loading, subscribeToMore } = useQuery(MESSAGES);
  const messages = messagesResp?.messages ?? [];

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: MESSAGES_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData?.data?.newMessage) return prev;
        const newMsg = subscriptionData.data.newMessage;
        if (prev.messages.some((m) => m._id === newMsg._id)) return prev;
        return {
          ...prev,
          messages: [...(prev.messages || []), newMsg],
        };
      },
    });
    return () => unsubscribe?.();
  }, [subscribeToMore]);

  const handlePost = useCallback(async () => {
    const trimmed = content.trim();
    if (!trimmed) {
      alert.show("Type a message before sending.");
      return;
    }
    try {
      await postMessage({
        variables: {
          content: trimmed,
          author: currentAuthor,
        },
      });
      setContent("");
    } catch (err) {
      console.error(err);
      alert.show("Failed to send message. Try again.");
    }
  }, [content, currentAuthor, postMessage, alert]);

  const onSubmit = (e) => {
    e.preventDefault();
    handlePost();
  };

  if (loading) {
    return (
      <Box sx={{ py: 4, textAlign: "center", color: "#e50914" }}>
        <Typography>Loading discussion...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ height: "calc(100vh - 120px)", display: "flex", flexDirection: "column", py: 2 }}>
      <Typography
        variant="h5"
        sx={{
          color: "#e50914",
          fontFamily: "Bangers, cursive",
          letterSpacing: "2px",
          textAlign: "center",
          mb: 2,
          textShadow: "2px 2px 4px white, 0 0 8px white",
        }}
      >
        Join the discussion
      </Typography>
      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", textAlign: "center", mb: 2 }}>
        Chat with other collectors. Be respectful and have fun!
      </Typography>

      <Paper
        elevation={0}
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          backgroundColor: "rgba(0,0,0,0.4)",
          border: "1px solid rgba(229,9,20,0.4)",
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          {messages.length === 0 ? (
            <Typography sx={{ color: "rgba(255,255,255,0.5)", textAlign: "center", py: 4 }}>
              No messages yet. Start the conversation!
            </Typography>
          ) : (
            messages.map((msg) => {
              const isOwn = (msg.author || "").trim() === currentAuthor.trim();
              return (
                <Box
                  key={msg._id || msg.content + msg.author}
                  sx={{
                    display: "flex",
                    justifyContent: isOwn ? "flex-end" : "flex-start",
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      maxWidth: "80%",
                      px: 2,
                      py: 1.25,
                      backgroundColor: isOwn ? "rgba(229,9,20,0.25)" : "rgba(255,255,255,0.08)",
                      border: `1px solid ${isOwn ? "#e50914" : "rgba(255,255,255,0.2)"}`,
                      borderRadius: 2,
                      borderBottomRightRadius: isOwn ? 0 : 12,
                      borderBottomLeftRadius: isOwn ? 12 : 0,
                    }}
                  >
                    <Typography sx={{ color: "#fff", wordBreak: "break-word" }}>
                      {msg.content}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)", display: "block", mt: 0.5 }}>
                      {msg.author || "Anonymous"}
                    </Typography>
                  </Paper>
                </Box>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </Box>

        <Box
          component="form"
          onSubmit={onSubmit}
          sx={{
            p: 1.5,
            borderTop: "1px solid rgba(229,9,20,0.3)",
            display: "flex",
            gap: 1,
            alignItems: "flex-end",
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Type a message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handlePost();
              }
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#fff",
                backgroundColor: "rgba(0,0,0,0.3)",
                "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
                "&:hover fieldset": { borderColor: "#e50914" },
                "&.Mui-focused fieldset": { borderColor: "#e50914" },
              },
              "& .MuiInputBase-input::placeholder": { color: "rgba(255,255,255,0.5)", opacity: 1 },
            }}
          />
          <IconButton
            type="submit"
            sx={{
              backgroundColor: "#e50914",
              color: "#fff",
              "&:hover": { backgroundColor: "rgba(229,9,20,0.8)" },
            }}
            aria-label="Send message"
          >
            <SendRoundedIcon />
          </IconButton>
        </Box>
      </Paper>
    </Container>
  );
};

export default Discussion;
