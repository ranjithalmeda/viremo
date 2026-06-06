"use client";

import { useEffect, useRef, useState } from "react";
import type { EntryRecord } from "@/src/lib/watchlist";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export function AIChatClient({
  initialEntries,
  initialMessages,
  userName,
  initialUsage,
}: {
  initialEntries: EntryRecord[];
  initialMessages: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: string;
  }>;
  userName: string;
  initialUsage: {
    count: number;
    limit: number;
    resetAt: string;
    remaining: number;
  } | null;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState(initialUsage);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages(
        initialMessages.map((message) => ({
          ...message,
          timestamp: new Date(message.timestamp),
        })),
      );
      return;
    }

    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `Hi ${userName}! 👋 I've reviewed your watchlist with ${initialEntries.length} titles. Ask me anything about recommendations, and I'll use your viewing history, ratings, and preferences to suggest titles you'll love. What are you in the mood for?`,
        timestamp: new Date(),
      },
    ]);
  }, [initialEntries.length, initialMessages, userName]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.usage) {
          setUsage(data.usage);
        }
        throw new Error(data.error || "Failed to get response");
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      if (data.usage) {
        setUsage(data.usage);
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: error instanceof Error ? error.message : "Sorry, I had trouble processing that.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto bg-white rounded-3xl border border-slate-200/70 p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                msg.role === "user"
                  ? "bg-violet-600 text-white rounded-br-none"
                  : "bg-slate-100 text-slate-900 rounded-bl-none"
              }`}
            >
              <p className="text-sm leading-6">{msg.content}</p>
              <p
                className={`text-xs mt-1 ${
                  msg.role === "user" ? "text-violet-200" : "text-slate-500"
                }`}
              >
                {msg.timestamp.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 text-slate-900 px-4 py-3 rounded-2xl rounded-bl-none">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {usage ? (
        <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3 text-sm font-semibold text-slate-600">
          {usage.count}/{usage.limit} requests used today
        </div>
      ) : null}
      <div className="bg-white rounded-3xl border border-slate-200/70 p-4 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask about recommendations, genres, or titles..."
          disabled={loading || Boolean(usage && usage.count >= usage.limit)}
          className="flex-1 px-4 py-2 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-600 disabled:bg-slate-100"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim() || Boolean(usage && usage.count >= usage.limit)}
          className="px-6 py-2 bg-violet-600 text-white rounded-full font-semibold hover:bg-violet-700 disabled:bg-slate-300 transition-colors"
        >
          {usage && usage.count >= usage.limit ? "Daily limit reached" : "Send"}
        </button>
      </div>
    </div>
  );
}

