import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Store,
  Stethoscope,
  Scissors,
  Building2,
  Clock,
} from "lucide-react";
import api from "../../services/api";

interface Hospital {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  description?: string;
  logo?: string;
  services?: { id: number; name: string }[];
  veterinarians?: { id: number; name: string }[];
}

interface Partner {
  id: number;
  businessType: string;
  shopName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  businessLicense?: string;
  vetCertificate?: string;
  status: string;
  createdAt: string;
}

const TYPE_CONFIG: Record<
  string,
  { icon: typeof Store; label: string; color: string }
> = {
  clinic: {
    icon: Stethoscope,
    label: "Phòng khám thú y",
    color: "bg-blue-100 text-blue-700",
  },
  shop: {
    icon: Store,
    label: "Cửa hàng thú cưng",
    color: "bg-orange-100 text-orange-700",
  },
  spa: {
    icon: Scissors,
    label: "Spa thú cưng",
    color: "bg-pink-100 text-pink-700",
  },
};

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "hospital" | "clinic" | "shop" | "spa"
  >("all");

  useEffect(() => {
    api
      .get("/hospitals")
      .then((r) => {
        setHospitals(r.data.data.hospitals || []);
        setPartners(r.data.data.partners || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getTypeIcon = (type: string) => {
    const config = TYPE_CONFIG[type];
    if (!config) return null;
    const Icon = config.icon;
    return (
      <span
        className={`w-10 h-10 ${config.color} rounded-xl flex items-center justify-center shrink-0`}
      >
        <Icon size={20} />
      </span>
    );
  };

  // Merge all into one list for display
  const allItems = [
    ...hospitals.map((h) => ({
      id: `hospital-${h.id}`,
      name: h.name,
      address: h.address || "",
      phone: h.phone || "",
      type: "hospital" as const,
      typeLabel: "Bệnh viện",
      description: h.description,
      services: h.services,
      veterinarians: h.veterinarians,
      createdAt: "",
    })),
    ...partners.map((p) => ({
      id: `partner-${p.id}`,
      name: p.shopName,
      address: p.address,
      phone: p.phone,
      type: p.businessType as "clinic" | "shop" | "spa",
      typeLabel: TYPE_CONFIG[p.businessType]?.label || p.businessType,
      description: `Chủ: ${p.ownerName} | Email: ${p.email}`,
      services: undefined as { id: number; name: string }[] | undefined,
      veterinarians: undefined as { id: number; name: string }[] | undefined,
      createdAt: p.createdAt,
    })),
  ];

  const filtered =
    filter === "all"
      ? allItems
      : allItems.filter((item) => item.type === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-warm flex items-center justify-center font-body">
        <div className="animate-spin w-8 h-8 border-2 border-brand border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm font-body">
      {/* Header */}
      <header className="bg-surface border-b border-border sticky top-0 z-40">
        <div className="container-max px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="p-2 rounded-lg hover:bg-warm text-muted"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="font-display font-bold text-lg text-text">
              🏥 Phòng khám & Đối tác
            </h1>
          </div>
        </div>
      </header>

      <div className="container-max px-4 py-6">
        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 border-b border-border">
          {[
            { key: "all", label: "Tất cả" },
            { key: "hospital", label: "Bệnh viện" },
            { key: "clinic", label: "Phòng khám" },
            { key: "shop", label: "Cửa hàng" },
            { key: "spa", label: "Spa" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as typeof filter)}
              className={`px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-colors ${
                filter === f.key
                  ? "bg-brand text-white"
                  : "bg-surface border border-border text-muted hover:text-text hover:border-brand/30"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Bệnh viện", count: hospitals.length, icon: Building2 },
            {
              label: "Phòng khám",
              count: partners.filter((p) => p.businessType === "clinic").length,
              icon: Stethoscope,
            },
            {
              label: "Cửa hàng",
              count: partners.filter((p) => p.businessType === "shop").length,
              icon: Store,
            },
            {
              label: "Spa",
              count: partners.filter((p) => p.businessType === "spa").length,
              icon: Scissors,
            },
          ].map((s, i) => (
            <div key={i} className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center text-brand">
                <s.icon size={20} />
              </div>
              <div>
                <p className="text-xl font-display font-bold text-text">
                  {s.count}
                </p>
                <p className="text-xs text-muted">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted">
            <Building2 size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-sm">Chưa có đối tác nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="card p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  {item.type === "hospital" ? (
                    <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center text-brand shrink-0">
                      <Building2 size={24} />
                    </div>
                  ) : (
                    getTypeIcon(item.type)
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-display font-bold text-text">
                        {item.name}
                      </h3>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          item.type === "hospital"
                            ? "bg-brand/10 text-brand"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {item.type === "hospital" ? "Bệnh viện" : "Đã duyệt"}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        {item.typeLabel}
                      </span>
                    </div>

                    {item.description && (
                      <p className="text-sm text-muted mb-2 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-3 text-xs text-muted">
                      {item.address && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {item.address}
                        </span>
                      )}
                      {item.phone && (
                        <span className="flex items-center gap-1">
                          <Phone size={12} />
                          {item.phone}
                        </span>
                      )}
                      {item.createdAt && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          Đăng ký:{" "}
                          {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      )}
                    </div>

                    {/* Services */}
                    {item.services && item.services.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {item.services.map((s) => (
                          <span
                            key={s.id}
                            className="px-2 py-0.5 bg-warm rounded-lg text-[10px] text-muted"
                          >
                            {s.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Vets */}
                    {item.veterinarians && item.veterinarians.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="text-[10px] text-muted mr-1">
                          Bác sĩ:
                        </span>
                        {item.veterinarians.map((v) => (
                          <span
                            key={v.id}
                            className="px-2 py-0.5 bg-teal/5 rounded-lg text-[10px] text-teal font-medium"
                          >
                            {v.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
