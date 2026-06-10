import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { ArrowLeft, LogOut, User, Mail, Phone } from "lucide-react";
import { logout as doLogout } from "../../store";
import type { RootState } from "../../store";

export default function ProfilePage() {
  const { user } = useSelector((s: RootState) => s.auth);
  const dispatch = useDispatch();

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
            Hồ sơ cá nhân
          </h1>
        </div>
      </header>
      <div className="container-max px-4 py-6 max-w-md mx-auto">
        <div className="card p-6 text-center mb-4">
          <div className="w-20 h-20 bg-brand/10 rounded-full flex items-center justify-center text-3xl font-display font-bold text-brand mx-auto mb-3">
            {user?.name?.charAt(0) || "U"}
          </div>
          <h2 className="font-display font-bold text-xl text-text">
            {user?.name}
          </h2>
          <p className="text-sm text-muted capitalize">
            {user?.role?.replace("_", " ")}
          </p>
        </div>
        <div className="card divide-y divide-border">
          <div className="p-4 flex items-center gap-3">
            <User size={18} className="text-muted" />
            <span className="text-text">{user?.name}</span>
          </div>
          <div className="p-4 flex items-center gap-3">
            <Mail size={18} className="text-muted" />
            <span className="text-text">{user?.email}</span>
          </div>
          {user?.phone && (
            <div className="p-4 flex items-center gap-3">
              <Phone size={18} className="text-muted" />
              <span className="text-text">{user.phone}</span>
            </div>
          )}
        </div>
        <button
          onClick={() => {
            dispatch(doLogout());
            window.location.href = "/login";
          }}
          className="w-full mt-6 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut size={18} /> Đăng xuất
        </button>
      </div>
    </div>
  );
}
