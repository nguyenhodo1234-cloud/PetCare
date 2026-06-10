import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft, MapPin } from "lucide-react";
import api from "../../services/api";
import type { RootState } from "../../store";

interface Shop {
  id: number;
  name: string;
  logo?: string;
  address?: string;
  phone?: string;
  services: { id: number; name: string; price: number }[];
}

export default function ShopsPage() {
  const { token } = useSelector((s: RootState) => s.auth);
  const [shops, setShops] = useState<Shop[]>([]);
  useEffect(() => {
    if (token)
      api
        .get("/shops")
        .then((r) => setShops(r.data.data))
        .catch(() => {});
  }, [token]);

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
            🛍️ Cửa hàng thú cưng
          </h1>
        </div>
      </header>
      <div className="container-max px-4 py-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shops.map((s) => (
            <Link
              key={s.id}
              to={`/shops/${s.id}`}
              className="card p-5 hover:-translate-y-1 transition-transform"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-teal/10 rounded-xl flex items-center justify-center text-2xl">
                  {s.logo || "🏪"}
                </div>
                <div>
                  <h3 className="font-display font-bold text-text">{s.name}</h3>
                  <p className="text-xs text-muted flex items-center gap-1">
                    <MapPin size={12} />
                    {s.address || "Chưa có địa chỉ"}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {s.services?.slice(0, 3).map((sv) => (
                  <span
                    key={sv.id}
                    className="px-2 py-1 bg-warm rounded-lg text-xs text-muted"
                  >
                    {sv.name}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
