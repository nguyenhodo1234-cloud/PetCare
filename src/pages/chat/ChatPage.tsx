import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ArrowLeft, Send, Plus, Search, X } from "lucide-react";
import { io, Socket } from "socket.io-client";
import api from "../../services/api";
import type { RootState } from "../../store";

interface Msg {
  id?: number;
  message: string;
  senderId: number;
  sender?: { id: number; name: string };
  createdAt: string;
}
interface Conv {
  id: number;
  user1: { id: number; name: string };
  user2: { id: number; name: string };
  messages: Msg[];
}
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function ChatPage() {
  const { token, user } = useSelector((s: RootState) => s.auth);
  const [convs, setConvs] = useState<Conv[]>([]);
  const [activeConv, setActiveConv] = useState<Conv | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // New conversation
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);

  useEffect(() => {
    if (token) api.get("/conversations").then((r) => setConvs(r.data.data));
  }, [token]);

  useEffect(() => {
    socketRef.current = io("http://localhost:5000");
    socketRef.current.on("new_message", (msg: Msg) => {
      setMessages((prev) => [...prev, msg]);
      api.get("/conversations").then((r) => setConvs(r.data.data));
    });
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const searchUsers = async (q: string) => {
    setSearchTerm(q);
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    const r = await api.get(`/search?q=${q}`);
    setSearchResults(
      (r.data.data || []).filter((u: User) => u.id !== user?.id),
    );
  };

  const startConv = async (targetUser: User) => {
    const r = await api.post("/conversations", { userId: targetUser.id });
    setShowSearch(false);
    setSearchTerm("");
    setSearchResults([]);
    api.get("/conversations").then((res) => setConvs(res.data.data));
    setActiveConv(r.data.data);
    socketRef.current?.emit("join_room", r.data.data.id);
    const msgs = await api.get(`/conversations/${r.data.data.id}/messages`);
    setMessages(msgs.data.data);
  };

  const openConv = async (conv: Conv) => {
    setActiveConv(conv);
    socketRef.current?.emit("join_room", conv.id);
    const r = await api.get(`/conversations/${conv.id}/messages`);
    setMessages(r.data.data);
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      100,
    );
  };

  const sendMsg = async () => {
    if (!text.trim() || !activeConv) return;
    socketRef.current?.emit("send_message", {
      conversationId: activeConv.id,
      message: text,
      senderId: user?.id,
      senderName: user?.name,
    });
    await api.post(`/conversations/${activeConv.id}/messages`, {
      message: text,
    });
    setText("");
  };

  return (
    <div className="min-h-screen bg-warm font-body flex">
      <div
        className={`${activeConv ? "hidden" : "flex"} sm:flex flex-col w-full sm:w-80 border-r border-border bg-surface`}
      >
        <header className="p-4 border-b border-border flex items-center justify-between">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-muted hover:text-text"
          >
            <ArrowLeft size={18} />{" "}
            <h1 className="font-display font-bold text-lg text-text">
              💬 Tin nhắn
            </h1>
          </Link>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 rounded-lg hover:bg-warm text-brand"
          >
            <Plus size={20} />
          </button>
        </header>

        {showSearch && (
          <div className="p-3 border-b border-border bg-warm/50">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Search
                  size={14}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  value={searchTerm}
                  onChange={(e) => searchUsers(e.target.value)}
                  placeholder="Tìm người dùng..."
                  className="w-full pl-8 pr-3 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand/30 text-text"
                />
              </div>
              <button
                onClick={() => {
                  setShowSearch(false);
                  setSearchTerm("");
                  setSearchResults([]);
                }}
                className="p-1 text-muted hover:text-text"
              >
                <X size={16} />
              </button>
            </div>
            {searchResults.length > 0 && (
              <div className="mt-2 space-y-1">
                {searchResults.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => startConv(u)}
                    className="w-full p-2 flex items-center gap-2 rounded-lg hover:bg-surface text-left text-sm"
                  >
                    <div className="w-8 h-8 bg-brand/10 rounded-full flex items-center justify-center text-brand font-bold text-xs">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-text">{u.name}</p>
                      <p className="text-xs text-muted">{u.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {convs.map((c) => {
            const o = c.user1.id === user?.id ? c.user2 : c.user1;
            return (
              <button
                key={c.id}
                onClick={() => openConv(c)}
                className="w-full p-4 flex items-center gap-3 hover:bg-warm border-b border-border text-left"
              >
                <div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center text-brand font-bold text-sm">
                  {o.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">
                    {o.name}
                  </p>
                  <p className="text-xs text-muted truncate">
                    {c.messages?.[0]?.message || "Bắt đầu trò chuyện"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div
        className={`${activeConv ? "flex" : "hidden"} sm:flex flex-col flex-1`}
      >
        {activeConv ? (
          <>
            <header className="p-4 border-b border-border bg-surface flex items-center gap-3">
              <button
                onClick={() => setActiveConv(null)}
                className="sm:hidden p-1 text-muted"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="w-9 h-9 bg-brand/10 rounded-full flex items-center justify-center text-brand font-bold text-sm">
                {(activeConv.user1.id === user?.id
                  ? activeConv.user2
                  : activeConv.user1
                ).name.charAt(0)}
              </div>
              <p className="font-semibold text-text text-sm">
                {
                  (activeConv.user1.id === user?.id
                    ? activeConv.user2
                    : activeConv.user1
                  ).name
                }
              </p>
            </header>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.senderId === user?.id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${m.senderId === user?.id ? "bg-brand text-white rounded-br-md" : "bg-surface border border-border rounded-bl-md"}`}
                  >
                    {m.message}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div className="p-4 border-t border-border bg-surface flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMsg()}
                placeholder="Nhập tin nhắn..."
                className="flex-1 px-4 py-2.5 bg-warm border border-border rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-brand/30 text-text"
              />
              <button
                onClick={sendMsg}
                disabled={!text.trim()}
                className="btn-brand !p-2.5 !rounded-full"
              >
                <Send size={18} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted text-sm gap-2">
            <Send size={40} className="text-muted/30" />
            <p>Chọn một cuộc trò chuyện</p>
            <p className="text-xs">hoặc bấm + để bắt đầu cuộc trò chuyện mới</p>
          </div>
        )}
      </div>
    </div>
  );
}
