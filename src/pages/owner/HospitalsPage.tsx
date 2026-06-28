import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Stethoscope,
  Building2,
  X,
  Mail,
  Users,
  Award,
  Clock,
  ChevronRight,
} from "lucide-react";
import api from "../../services/api";
import type { RootState } from "../../store";

interface Hospital {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  logo?: string;
  services?: { id: number; name: string }[];
  veterinarians?: { id: number; name: string; specialty?: string }[];
}

interface Partner {
  id: number;
  businessType: string;
  shopName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  status: string;
  createdAt: string;
}

export default function HospitalsPage() {
  const { user } = useSelector((s: RootState) => s.auth);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    api
      .get("/hospitals")
      .then((r) => {
        const d = r.data.data;
        setPartners(d.partners || []);
        setHospitals(d.hospitals || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Fetch detail when click
  const openDetail = async (item: any) => {
    if (item.type === "hospital") {
      try {
        const realId = String(item.id).replace("h-", "");
        const res = await api.get(`/hospitals/${realId}`);
        setSelected({ ...res.data.data, type: "hospital" });
      } catch {
        setSelected(item);
      }
    } else {
      // Partner clinic: tìm hospital liên quan để lấy danh sách bác sĩ
      try {
        const realId = String(item.id).replace("p-", "");
        const partner = partners.find((p) => p.id === +realId);
        if (partner?.email) {
          // Tìm hospital theo email hoặc tên
          const hospRes = await api.get("/hospitals");
          const allHospitals = hospRes.data.data.hospitals || [];
          const matchedHospital = allHospitals.find(
            (h: any) => h.email === partner.email || h.phone === partner.phone,
          );
          if (matchedHospital) {
            const detail = await api.get(`/hospitals/${matchedHospital.id}`);
            setSelected({ ...item, ...detail.data.data, type: "clinic" });
            return;
          }
        }
        setSelected(item);
      } catch {
        setSelected(item);
      }
    }
  };

  // Merge only hospital + clinic
  const items = [
    ...hospitals.map((h) => ({
      id: `h-${h.id}`,
      name: h.name,
      type: "hospital",
      typeLabel: "Bệnh viện thú y",
      address: h.address || "",
      phone: h.phone || "",
      email: h.email || "",
      description: h.description,
      services: h.services,
      veterinarians: h.veterinarians,
      createdAt: "",
    })),
    ...partners
      .filter(
        (p) =>
          !hospitals.some((h) => h.email === p.email || h.phone === p.phone),
      )
      .map((p) => ({
        id: `p-${p.id}`,
        name: p.shopName,
        type: "clinic",
        typeLabel: "Phòng khám thú y",
        address: p.address,
        phone: p.phone,
        email: p.email,
        description: `Chủ: ${p.ownerName}`,
        createdAt: p.createdAt,
      })),
  ];

  if (loading)
    return (
      <div className="min-h-screen bg-warm flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-brand border-t-transparent rounded-full" />
      </div>
    );

  return (
    <div className="min-h-screen bg-warm font-body">
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
              🏥 Phòng khám thú y
            </h1>
          </div>
        </div>
      </header>

      <div className="container-max px-4 py-6 max-w-3xl mx-auto">
        {items.length === 0 ? (
          <div className="text-center py-16 text-muted">
            <Building2 size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-sm">Chưa có phòng khám nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <button
                key={`${item.type}-${item.id}`}
                onClick={() => openDetail(item)}
                className="w-full text-left card p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-brand/10 rounded-2xl flex items-center justify-center text-brand shrink-0">
                    <Stethoscope size={26} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-text text-lg">
                      {item.name}
                    </h3>
                    <p className="text-xs text-muted mt-0.5">
                      {item.typeLabel}
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted mt-2">
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
                    </div>
                  </div>
                  <ChevronRight
                    size={18}
                    className="text-muted shrink-0 mt-4"
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-surface rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-text">
                {selected.name}
              </h3>
              <button
                onClick={() => setSelected(null)}
                className="p-1.5 rounded-xl hover:bg-warm"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <div className="w-16 h-16 bg-brand/10 rounded-2xl flex items-center justify-center text-3xl">
                  🏥
                </div>
                <div>
                  <p className="font-display font-bold text-text">
                    {selected.name}
                  </p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                    {selected.type === "hospital" ? "Bệnh viện" : "Đã duyệt"}
                  </span>
                </div>
              </div>

              {(selected.address || selected.phone || selected.email) && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted uppercase">
                    Liên hệ
                  </p>
                  {selected.address && (
                    <p className="text-sm flex items-center gap-2 text-text">
                      <MapPin size={14} />
                      {selected.address}
                    </p>
                  )}
                  {selected.phone && (
                    <p className="text-sm flex items-center gap-2 text-text">
                      <Phone size={14} />
                      {selected.phone}
                    </p>
                  )}
                  {selected.email && (
                    <p className="text-sm flex items-center gap-2 text-text">
                      <Mail size={14} />
                      {selected.email}
                    </p>
                  )}
                </div>
              )}

              {selected.description && (
                <div>
                  <p className="text-xs font-semibold text-muted uppercase mb-1">
                    Mô tả
                  </p>
                  <p className="text-sm text-text">{selected.description}</p>
                </div>
              )}

              {selected.veterinarians && selected.veterinarians.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted uppercase mb-2 flex items-center gap-1">
                    <Users size={12} /> Bác sĩ ({selected.veterinarians.length})
                  </p>
                  <div className="space-y-2">
                    {selected.veterinarians.map((v: any) => (
                      <div
                        key={v.id}
                        className="flex items-center gap-3 p-3 bg-warm rounded-xl"
                      >
                        <div className="w-10 h-10 bg-teal/10 rounded-full flex items-center justify-center text-sm">
                          👨‍⚕️
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text">
                            {v.name}
                          </p>
                          {v.specialty && (
                            <p className="text-xs text-muted">{v.specialty}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selected.services && selected.services.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted uppercase mb-2 flex items-center gap-1">
                    <Award size={12} /> Dịch vụ ({selected.services.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.services.map((s: any) => (
                      <span
                        key={s.id}
                        className="px-2.5 py-1 bg-warm rounded-lg text-xs text-muted"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
