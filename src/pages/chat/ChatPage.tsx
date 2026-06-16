import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  Plus,
  Search,
  X,
  Image,
  Smile,
  Video,
} from "lucide-react";
import api from "../../services/api";
import type { RootState } from "../../store";
import { useSocket } from "../../hooks/useSocket";
import VideoCall, { IncomingCall } from "../../components/chat/VideoCall";

interface Msg {
  id?: number;
  message: string;
  senderId: number;
  messageType?: string;
  mediaUrl?: string;
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

const EMOJIS = [
  "😀",
  "😂",
  "❤️",
  "👍",
  "🎉",
  "😢",
  "😡",
  "🥰",
  "😍",
  "🤔",
  "🙏",
  "💪",
  "🔥",
  "✨",
  "🐶",
  "🐱",
  "🦊",
  "🐾",
  "🌿",
  "☀️",
  "🌈",
  "🎾",
  "🍖",
  "💊",
];

export default function ChatPage() {
  const { token, user } = useSelector((s: RootState) => s.auth);
  const [convs, setConvs] = useState<Conv[]>([]);
  const [activeConv, setActiveConv] = useState<Conv | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [uploading, setUploading] = useState(false);
  const lastSeenMsgIdsRef = useRef<Record<number, number>>({});
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({});

  // Video call state
  const socket = useSocket();
  const [videoCallMode, setVideoCallMode] = useState<"caller" | "callee">(
    "caller",
  );
  const [incomingSignal, setIncomingSignal] = useState<any>(null);
  const [videoCall, setVideoCall] = useState<{
    remoteUserId: number;
    remoteUserName: string;
  } | null>(null);
  const [incomingCall, setIncomingCall] = useState<{
    from: number;
    callerName: string;
    signal: any;
    conversationId: number;
  } | null>(null);

  // Lưu incoming signal vào ref để tránh re-render khi không cần
  const incomingSignalForCall = useRef<any>(null);

  const calcUnread = useCallback(
    (list: Conv[]) => {
      const counts: Record<number, number> = {};
      list.forEach((c) => {
        if (!c.messages || c.messages.length === 0) {
          counts[c.id] = 0;
          return;
        }
        const lastSeenId = lastSeenMsgIdsRef.current[c.id] ?? 0;
        const unread = c.messages.filter(
          (m) =>
            m.id !== undefined && m.id > lastSeenId && m.senderId !== user?.id,
        ).length;
        counts[c.id] = unread;
      });
      return counts;
    },
    [user?.id],
  );

  useEffect(() => {
    if (!token) return;
    api
      .get("/conversations")
      .then((r) => {
        const list: Conv[] = r.data.data || [];
        setConvs(list);
        setUnreadCounts(calcUnread(list));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, calcUnread]);

  useEffect(() => {
    if (!activeConv) return;
    const i = setInterval(async () => {
      try {
        const r = await api.get(`/conversations/${activeConv.id}/messages`);
        setMessages(r.data.data || []);
      } catch {}
    }, 2000);
    return () => clearInterval(i);
  }, [activeConv]);

  useEffect(() => {
    const i = setInterval(async () => {
      try {
        const r = await api.get("/conversations");
        const list: Conv[] = r.data.data || [];
        setConvs(list);
        setUnreadCounts(calcUnread(list));
      } catch {}
    }, 3000);
    return () => clearInterval(i);
  }, [calcUnread]);

  // Socket: join rooms + lắng nghe cuộc gọi đến
  useEffect(() => {
    if (!socket || !user) return;

    // Join tất cả conversation rooms
    convs.forEach((c) => {
      socket.emit("join_room", c.id);
    });

    // Lắng nghe cuộc gọi đến
    const handleIncomingCall = (data: {
      from: number;
      callerName: string;
      signal: any;
      conversationId: number;
    }) => {
      incomingSignalForCall.current = data.signal;
      setIncomingSignal(data.signal);
      setVideoCallMode("callee");
      setIncomingCall(data);
    };

    socket.on("incoming_call", handleIncomingCall);

    return () => {
      socket.off("incoming_call", handleIncomingCall);
    };
  }, [socket, convs, user]);

  const startVideoCall = () => {
    if (!activeConv || !user) return;
    const remoteUser =
      activeConv.user1.id === user.id ? activeConv.user2 : activeConv.user1;
    setVideoCallMode("caller");
    incomingSignalForCall.current = null;
    setVideoCall({
      remoteUserId: remoteUser.id,
      remoteUserName: remoteUser.name,
    });
  };

  const searchUsers = async (q: string) => {
    setSearchTerm(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const r = await api.get(`/search?q=${encodeURIComponent(q)}`);
      setSearchResults(
        (r.data.data || []).filter((u: User) => u.id !== user?.id),
      );
    } catch {}
  };

  const startConv = async (targetUser: User) => {
    try {
      const r = await api.post("/conversations", { userId: targetUser.id });
      setShowSearch(false);
      setSearchTerm("");
      setSearchResults([]);
      const res = await api.get("/conversations");
      const list = res.data.data || [];
      setConvs(list);
      const found = list.find((c: Conv) => c.id === r.data.data.id);
      setActiveConv(found || null);
      const msgs = await api.get(`/conversations/${r.data.data.id}/messages`);
      setMessages(msgs.data.data || []);
    } catch {}
  };

  const openConv = async (conv: Conv) => {
    setActiveConv(conv);
    // Đánh dấu tất cả tin nhắn là đã đọc
    const latestMsg = conv.messages?.[0];
    if (latestMsg?.id) {
      lastSeenMsgIdsRef.current = {
        ...lastSeenMsgIdsRef.current,
        [conv.id]: latestMsg.id,
      };
      setUnreadCounts((prev) => ({ ...prev, [conv.id]: 0 }));
    }
    try {
      const r = await api.get(`/conversations/${conv.id}/messages`);
      const msgs: Msg[] = r.data.data || [];
      setMessages(msgs);
      // Cập nhật lastSeen dựa trên tin nhắn mới nhất từ API
      if (msgs.length > 0) {
        const newestId = Math.max(
          ...msgs.filter((m) => m.id !== undefined).map((m) => m.id!),
        );
        lastSeenMsgIdsRef.current = {
          ...lastSeenMsgIdsRef.current,
          [conv.id]: newestId,
        };
        setUnreadCounts((prev) => ({ ...prev, [conv.id]: 0 }));
      }
      setTimeout(
        () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    } catch {}
  };

  const sendMsg = async () => {
    if (!text.trim() || !activeConv) return;
    const msg = text;
    setText("");
    try {
      await api.post(`/conversations/${activeConv.id}/messages`, {
        message: msg,
      });
      const r = await api.get(`/conversations/${activeConv.id}/messages`);
      setMessages(r.data.data || []);
      setTimeout(
        () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
        50,
      );
    } catch {
      setText(msg);
    }
  };

  const sendFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConv) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("media", file);
    try {
      await api.post(`/conversations/${activeConv.id}/messages`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const r = await api.get(`/conversations/${activeConv.id}/messages`);
      setMessages(r.data.data || []);
    } catch {}
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  if (loading)
    return (
      <div className="min-h-screen bg-warm flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-brand border-t-transparent rounded-full" />
      </div>
    );

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
                  name="search-user"
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
              <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
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
          {convs.length === 0 ? (
            <div className="p-8 text-center text-muted text-sm">
              Chưa có cuộc trò chuyện nào
            </div>
          ) : (
            convs.map((c) => {
              const o = c.user1.id === user?.id ? c.user2 : c.user1;
              const unread = unreadCounts[c.id] || 0;
              const lastMsg = c.messages?.[0];
              return (
                <button
                  key={c.id}
                  onClick={() => openConv(c)}
                  className="w-full p-4 flex items-center gap-3 hover:bg-warm border-b border-border text-left"
                >
                  <div className="relative">
                    <div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center text-brand font-bold text-sm">
                      {o.name.charAt(0)}
                    </div>
                    {unread > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${unread > 0 ? "text-red-600" : "text-text"}`}
                    >
                      {o.name}
                    </p>
                    <p
                      className={`text-xs truncate ${unread > 0 ? "text-red-500 font-semibold" : "text-muted"}`}
                    >
                      {lastMsg?.mediaUrl
                        ? lastMsg.messageType === "video"
                          ? "🎥 Video"
                          : "📷 Ảnh"
                        : lastMsg?.message
                          ? lastMsg.message
                          : "Bắt đầu trò chuyện"}
                    </p>
                  </div>
                </button>
              );
            })
          )}
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
                {(activeConv?.user1?.id === user?.id
                  ? activeConv?.user2?.name?.charAt(0)
                  : activeConv?.user1?.name?.charAt(0)) || "?"}
              </div>
              <p className="font-semibold text-text text-sm flex-1">
                {(activeConv?.user1?.id === user?.id
                  ? activeConv?.user2?.name
                  : activeConv?.user1?.name) || "..."}
              </p>
              <button
                onClick={startVideoCall}
                className="p-2 rounded-lg hover:bg-warm text-brand transition-colors"
                title="Gọi video"
              >
                <Video size={20} />
              </button>
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
                    {m.mediaUrl && (
                      <div className="mb-1 rounded-lg overflow-hidden">
                        {m.messageType === "video" ? (
                          <video
                            src={m.mediaUrl}
                            controls
                            className="max-w-full max-h-60 rounded"
                          />
                        ) : (
                          <img
                            src={m.mediaUrl}
                            alt=""
                            className="max-w-full max-h-60 rounded"
                          />
                        )}
                      </div>
                    )}
                    {m.message && <span>{m.message}</span>}
                    <div
                      className={`text-[10px] mt-0.5 flex items-center gap-1 ${m.senderId === user?.id ? "text-white/60" : "text-muted"}`}
                    >
                      {new Date(m.createdAt).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {m.senderId === user?.id && <span>✓</span>}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div className="p-3 border-t border-border bg-surface">
              {showEmoji && (
                <div className="flex flex-wrap gap-1 mb-2 p-2 bg-warm rounded-xl max-h-32 overflow-y-auto">
                  {EMOJIS.map((e) => (
                    <button
                      key={e}
                      onClick={() => {
                        setText((prev) => prev + e);
                        setShowEmoji(false);
                      }}
                      className="w-8 h-8 flex items-center justify-center hover:bg-surface rounded-lg text-lg"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
              {uploading && (
                <div className="text-xs text-brand mb-1">Đang tải lên...</div>
              )}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowEmoji(!showEmoji)}
                  className="p-2 rounded-full text-muted hover:text-brand hover:bg-warm"
                >
                  <Smile size={20} />
                </button>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="p-2 rounded-full text-muted hover:text-brand hover:bg-warm"
                >
                  <Image size={20} />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={sendFile}
                  className="hidden"
                />
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMsg()}
                  placeholder="Nhập tin nhắn..."
                  name="message"
                  className="flex-1 px-4 py-2 bg-warm border border-border rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-brand/30 text-text"
                />
                <button
                  onClick={sendMsg}
                  disabled={!text.trim()}
                  className="btn-brand !p-2 !rounded-full"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted text-sm gap-2">
            <Send size={40} className="text-muted/30" />
            <p>Chọn một cuộc trò chuyện</p>
          </div>
        )}
      </div>

      {/* Video Call */}
      {videoCall && activeConv && user && socket && (
        <VideoCall
          socket={socket}
          conversationId={activeConv.id}
          currentUserName={user.name}
          remoteUserId={videoCall.remoteUserId}
          remoteUserName={videoCall.remoteUserName}
          onEnd={() => setVideoCall(null)}
          mode={videoCallMode}
          incomingSignal={incomingSignal}
        />
      )}

      {/* Incoming Call */}
      {incomingCall && (
        <IncomingCall
          callerName={incomingCall.callerName}
          onAccept={() => {
            const inc = incomingCall;
            setIncomingCall(null);
            setVideoCall({
              remoteUserId: inc.from,
              remoteUserName: inc.callerName,
            });
          }}
          onReject={() => {
            socket?.emit("reject_call", {
              to: incomingCall.from,
            });
            setIncomingCall(null);
          }}
        />
      )}
    </div>
  );
}
