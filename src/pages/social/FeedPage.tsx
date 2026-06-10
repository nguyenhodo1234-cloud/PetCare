import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Heart, MessageCircle, Send, Image, X } from "lucide-react";
import api from "../../services/api";
import type { RootState } from "../../store";

interface Media {
  id: number;
  mediaUrl: string;
  mediaType: string;
}
interface Comment {
  id: number;
  content: string;
  user: { id: number; name: string };
  createdAt: string;
}
interface Post {
  id: number;
  content: string;
  user: { id: number; name: string; avatar?: string };
  media: Media[];
  _count: { likes: number; comments: number };
  createdAt: string;
  liked?: boolean;
}

export default function FeedPage() {
  const { token } = useSelector((s: RootState) => s.auth);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [expandedPost, setExpandedPost] = useState<number | null>(null);
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [commentText, setCommentText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const loadPosts = async () => {
    if (!token) return;
    const r = await api.get("/posts");
    setPosts(r.data.data);
  };
  useEffect(() => {
    loadPosts();
  }, [token]);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length + files.length > 5) return;
    setFiles((prev) => [...prev, ...selected]);
    selected.forEach((f) => {
      const url = URL.createObjectURL(f);
      setPreviews((prev) => [...prev, url]);
    });
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeFile = (i: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[i]);
      return prev.filter((_, idx) => idx !== i);
    });
  };

  const createPost = async () => {
    if (!newPost.trim() && files.length === 0) return;
    const form = new FormData();
    form.append("content", newPost);
    files.forEach((f) => form.append("media", f));
    await api.post("/posts", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setNewPost("");
    setFiles([]);
    setPreviews([]);
    loadPosts();
  };

  const toggleLike = async (postId: number, liked: boolean) => {
    if (liked) await api.delete(`/posts/${postId}/like`);
    else await api.post(`/posts/${postId}/like`);
    loadPosts();
  };

  const loadComments = async (postId: number) => {
    const r = await api.get(`/posts/${postId}/comments`);
    setComments((prev) => ({ ...prev, [postId]: r.data.data }));
  };

  const toggleComments = (postId: number) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
      return;
    }
    setExpandedPost(postId);
    loadComments(postId);
    setCommentText("");
  };

  const addComment = async (postId: number) => {
    if (!commentText.trim()) return;
    await api.post(`/posts/${postId}/comments`, { content: commentText });
    setCommentText("");
    loadComments(postId);
    loadPosts();
  };

  return (
    <div className="min-h-screen bg-warm font-body">
      <header className="bg-surface border-b border-border sticky top-0 z-40">
        <div className="container-max px-4 py-3">
          <h1 className="font-display font-bold text-lg text-text">
            📱 Bảng tin
          </h1>
        </div>
      </header>
      <div className="container-max px-4 py-6 max-w-2xl mx-auto">
        <div className="card p-4 mb-6">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Chia sẻ điều gì về thú cưng của bạn..."
            className="w-full bg-transparent resize-none focus:outline-none text-text placeholder-muted text-sm"
            rows={3}
          />
          {previews.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-3">
              {previews.map((p, i) => (
                <div
                  key={i}
                  className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100"
                >
                  {files[i]?.type.startsWith("video") ? (
                    <video src={p} className="w-full h-full object-cover" />
                  ) : (
                    <img
                      src={p}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                  <button
                    onClick={() => removeFile(i)}
                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between mt-3">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1 text-muted hover:text-brand text-sm"
            >
              <Image size={18} /> Ảnh/Video
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFiles}
              className="hidden"
            />
            <button
              onClick={createPost}
              disabled={!newPost.trim() && files.length === 0}
              className="btn-brand text-sm !py-2 !px-5"
            >
              <Send size={14} /> Đăng
            </button>
          </div>
        </div>

        {posts.map((p) => (
          <div key={p.id} className="card p-5 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold text-sm">
                {p.user.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-text text-sm">{p.user.name}</p>
                <p className="text-xs text-muted">
                  {new Date(p.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
            {p.content && (
              <p className="text-text text-sm mb-3 whitespace-pre-wrap">
                {p.content}
              </p>
            )}
            {p.media?.length > 0 && (
              <div
                className={`grid gap-2 mb-3 ${p.media.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
              >
                {p.media.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-xl overflow-hidden bg-slate-100"
                  >
                    {m.mediaType === "video" ? (
                      <video
                        src={m.mediaUrl}
                        controls
                        className="w-full max-h-96 object-cover"
                      />
                    ) : (
                      <img
                        src={m.mediaUrl}
                        alt=""
                        className="w-full max-h-96 object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-6 text-muted text-sm border-t border-border pt-3">
              <button
                onClick={() => toggleLike(p.id, !!p.liked)}
                className={`flex items-center gap-1 transition-colors ${p.liked ? "text-red-500" : "hover:text-red-500"}`}
              >
                <Heart size={16} fill={p.liked ? "currentColor" : "none"} />{" "}
                {p._count.likes}
              </button>
              <button
                onClick={() => toggleComments(p.id)}
                className={`flex items-center gap-1 transition-colors ${expandedPost === p.id ? "text-brand" : "hover:text-brand"}`}
              >
                <MessageCircle size={16} /> {p._count.comments}
              </button>
            </div>
            {expandedPost === p.id && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex gap-2 mb-4">
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addComment(p.id)}
                    placeholder="Viết bình luận..."
                    className="flex-1 px-3 py-2 bg-warm border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand/30 text-text"
                  />
                  <button
                    onClick={() => addComment(p.id)}
                    disabled={!commentText.trim()}
                    className="btn-brand text-xs !py-2 !px-4"
                  >
                    <Send size={12} />
                  </button>
                </div>
                {comments[p.id]?.length === 0 ? (
                  <p className="text-xs text-muted text-center py-2">
                    Chưa có bình luận
                  </p>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {comments[p.id]?.map((c) => (
                      <div key={c.id} className="flex gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold text-xs shrink-0">
                          {c.user.name.charAt(0)}
                        </div>
                        <div className="bg-warm rounded-xl px-3 py-2 flex-1">
                          <p className="text-xs font-semibold text-text">
                            {c.user.name}
                          </p>
                          <p className="text-sm text-text">{c.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
