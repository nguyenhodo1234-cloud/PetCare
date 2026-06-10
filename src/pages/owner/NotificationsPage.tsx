import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ArrowLeft, Bell, Check } from "lucide-react";
import api from "../../services/api";
import type { RootState } from "../../store";

export default function NotificationsPage() {
  const { token } = useSelector((s: RootState) => s.auth);
  const [notifs, setNotifs] = useState<any[]>([]);
  useEffect(() => {
    if (token) api.get("/notifications").then((r) => setNotifs(r.data.data));
  }, [token]);
  const markRead = async (id: number) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifs((n) => n.map((x) => (x.id === id ? { ...x, isRead: true } : x)));
  };

  return (
    <div className="min-h-screen bg-warm font-body">
      <header className="bg-surface border-b border-border sticky top-0 z-40">
        <div className="container-max px-4 py-3 flex items-center gap-3">
          <Link
            to="/dashboard"
            className="p-2 rounded-lg hover:bg-warm text-muted"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-display font-bold text-lg text-text">
            🔔 Thông báo
          </h1>
        </div>
      </header>
      <div className="container-max px-4 py-6 max-w-2xl mx-auto">
        {notifs.length === 0 ? (
          <div className="text-center py-20">
            <Bell size={48} className="text-muted/30 mx-auto mb-4" />
            <p className="text-muted">Chưa có thông báo</p>
          </div>
        ) : (
          notifs.map((n) => (
            <div
              key={n.id}
              className={`card p-4 mb-2 flex items-start gap-3 ${!n.isRead ? "border-l-4 border-l-brand" : ""}`}
            >
              <div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center text-lg shrink-0">
                {(
                  {
                    APPOINTMENT: "📅",
                    MESSAGE: "💬",
                    SOCIAL: "❤️",
                    SYSTEM: "ℹ️",
                    PROMOTION: "🎉",
                  } as Record<string, string>
                )[n.type] || "🔔"}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text">{n.title}</p>
                {n.content && (
                  <p className="text-xs text-muted mt-0.5">{n.content}</p>
                )}
                <p className="text-xs text-muted mt-1">
                  {new Date(n.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
              {!n.isRead && (
                <button
                  onClick={() => markRead(n.id)}
                  className="p-1 text-brand hover:bg-brand/5 rounded"
                >
                  <Check size={16} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
