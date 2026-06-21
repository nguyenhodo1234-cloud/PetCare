import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Plus,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import api from "../../services/api";
import type { RootState } from "../../store";

interface Appt {
  id: number;
  dateTime: string;
  status: string;
  notes?: string;
  pet: { id: number; name: string };
  service: { id: number; name: string };
  vet?: { id: number; name: string } | null;
}

interface Pet {
  id: number;
  name: string;
  species: string;
}

interface Service {
  id: number;
  name: string;
  providerType: string;
  price: number;
}

interface Vet {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Hospital {
  id: number | string;
  name: string;
  type: string;
}

const STATUS_BADGE: Record<string, string> = {
  PENDING: "badge-pending",
  CONFIRMED: "badge-confirmed",
  IN_PROGRESS: "bg-purple-100 text-purple-700",
  COMPLETED: "badge-completed",
  CANCELLED: "badge-cancelled",
};
const STATUS_LABEL: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  IN_PROGRESS: "Đang khám",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

export default function AppointmentsPage() {
  const { token, user } = useSelector((s: RootState) => s.auth);
  const [apps, setApps] = useState<Appt[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking form
  const [showForm, setShowForm] = useState(false);
  const [pets, setPets] = useState<Pet[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [vets, setVets] = useState<Vet[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [form, setForm] = useState({
    petId: "",
    serviceId: "",
    vetId: "",
    hospitalId: "",
    date: "",
    time: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchApps = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const r = await api.get("/appointments");
      setApps(r.data.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchApps();
  }, [token]);

  const openForm = async () => {
    setShowForm(true);
    setFormError("");
    try {
      const [petsRes, servicesRes] = await Promise.all([
        api.get("/pets"),
        api.get("/services"),
      ]);
      setPets(petsRes.data.data || []);
      setServices(servicesRes.data.data || []);
      // Lấy danh sách VET từ API tìm kiếm (không cần quyền admin)
      try {
        const vetsRes = await api.get("/search?q=");
        setVets(
          (vetsRes.data.data || []).filter(
            (u: Vet) => u.role === "VET" && u.id !== user?.id,
          ),
        );
      } catch {
        setVets([]);
      }
      // Lấy danh sách phòng khám (hospitals + approved partners)
      try {
        const hospRes = await api.get("/hospitals");
        const h = hospRes.data.data.hospitals || [];
        const p = (hospRes.data.data.partners || []).filter(
          (x: any) => x.businessType === "clinic",
        );
        setHospitals([
          ...h.map((x: any) => ({
            id: `hospital-${x.id}`,
            name: x.name,
            type: "hospital",
          })),
          ...p.map((x: any) => ({
            id: `partner-${x.id}`,
            name: x.shopName,
            type: "clinic",
          })),
        ]);
      } catch {
        setHospitals([]);
      }
    } catch {}
  };

  const submitBooking = async () => {
    if (
      !form.petId ||
      !form.serviceId ||
      !form.vetId ||
      !form.date ||
      !form.time
    ) {
      setFormError("Vui lòng điền đầy đủ thông tin");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      await api.post("/appointments", {
        petId: +form.petId,
        serviceId: +form.serviceId,
        vetId: +form.vetId,
        hospitalId: form.hospitalId
          ? +form.hospitalId.replace(/\D/g, "")
          : undefined,
        dateTime: new Date(`${form.date}T${form.time}:00`).toISOString(),
        notes: form.notes,
      });
      setShowForm(false);
      setForm({
        petId: "",
        serviceId: "",
        vetId: "",
        hospitalId: "",
        date: "",
        time: "",
        notes: "",
      });
      fetchApps();
      // Hiển thị thông báo thành công
      const vetName = vets.find((v) => v.id === +form.vetId)?.name || "bác sĩ";
      const hospitalName =
        hospitals.find((h) => h.id === form.hospitalId)?.name || "phòng khám";
      setSuccessMsg(
        `✅ Đặt lịch thành công! ${new Date(form.date).toLocaleDateString("vi-VN")} lúc ${form.time} tại ${hospitalName} với BS. ${vetName}`,
      );
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (err: any) {
      setFormError(err?.response?.data?.error || "Lỗi đặt lịch");
    }
    setSubmitting(false);
  };

  const cancelAppt = async (id: number) => {
    if (!confirm("Bạn có chắc muốn hủy lịch hẹn này?")) return;
    await api.patch(`/appointments/${id}/status`, { status: "CANCELLED" });
    setApps((p) =>
      p.map((a) => (a.id === id ? { ...a, status: "CANCELLED" } : a)),
    );
  };

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
              📅 Lịch hẹn
            </h1>
          </div>
          <button onClick={openForm} className="btn-brand !py-2 !px-4 text-sm">
            <Plus size={16} /> Đặt lịch khám
          </button>
        </div>
      </header>

      <div className="container-max px-4 py-6 max-w-2xl mx-auto">
        {/* Booking Form Modal */}
        {showForm && (
          <div
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={() => setShowForm(false)}
          >
            <div
              className="bg-surface rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-border flex items-center justify-between">
                <h2 className="font-display font-bold text-lg text-text">
                  🩺 Đặt lịch khám
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-1.5 rounded-lg hover:bg-warm text-muted"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-5 space-y-4">
                {/* Pet */}
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">
                    Thú cưng <span className="text-error">*</span>
                  </label>
                  <select
                    value={form.petId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, petId: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-warm border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                  >
                    <option value="">Chọn thú cưng</option>
                    {pets.length === 0 ? (
                      <option value="" disabled>
                        Bạn chưa có thú cưng — vào "Thú cưng của tôi" để thêm
                      </option>
                    ) : (
                      pets.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.species})
                        </option>
                      ))
                    )}
                  </select>
                  {pets.length === 0 && (
                    <Link
                      to="/my-pets/new"
                      className="inline-flex items-center gap-1 text-xs text-brand mt-1.5 hover:underline"
                    >
                      <Plus size={12} /> Thêm thú cưng mới
                    </Link>
                  )}
                </div>

                {/* Service */}
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">
                    Dịch vụ <span className="text-error">*</span>
                  </label>
                  <select
                    value={form.serviceId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, serviceId: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-warm border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                  >
                    <option value="">Chọn dịch vụ</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} — {s.price?.toLocaleString()}đ
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clinic */}
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">
                    Phòng khám <span className="text-error">*</span>
                  </label>
                  <select
                    value={form.hospitalId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, hospitalId: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-warm border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                  >
                    <option value="">Chọn phòng khám</option>
                    {hospitals.map((h) => (
                      <option key={h.id} value={h.id}>
                        🏥 {h.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vet */}
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">
                    Bác sĩ thú y <span className="text-error">*</span>
                  </label>
                  <select
                    value={form.vetId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, vetId: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-warm border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                  >
                    <option value="">Chọn bác sĩ</option>
                    {vets.map((v) => (
                      <option key={v.id} value={v.id}>
                        BS. {v.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date + Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-text mb-1.5">
                      Ngày <span className="text-error">*</span>
                    </label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, date: e.target.value }))
                      }
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-3 bg-warm border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-1.5">
                      Giờ <span className="text-error">*</span>
                    </label>
                    <input
                      type="time"
                      value={form.time}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, time: e.target.value }))
                      }
                      className="w-full px-4 py-3 bg-warm border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">
                    Ghi chú
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, notes: e.target.value }))
                    }
                    rows={2}
                    placeholder="Triệu chứng, yêu cầu đặc biệt..."
                    className="w-full px-4 py-3 bg-warm border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 resize-none"
                  />
                </div>

                {formError && (
                  <p className="text-sm text-error bg-red-50 p-3 rounded-xl">
                    {formError}
                  </p>
                )}

                <button
                  onClick={submitBooking}
                  disabled={submitting}
                  className="w-full py-3 bg-brand text-white rounded-2xl font-semibold text-sm hover:bg-brand-dark transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Đang đặt...
                    </>
                  ) : (
                    "Xác nhận đặt lịch"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Appointments List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : apps.length === 0 ? (
          <div className="text-center py-20">
            <Calendar size={48} className="text-muted/30 mx-auto mb-4" />
            <p className="text-muted mb-4">Chưa có lịch hẹn nào</p>
            <button onClick={openForm} className="btn-brand text-sm">
              <Plus size={16} /> Đặt lịch khám đầu tiên
            </button>
          </div>
        ) : (
          apps.map((a) => (
            <div key={a.id} className="card p-5 mb-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-teal/10 rounded-xl flex items-center justify-center text-xl">
                    🐾
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-text">
                      {a.service?.name}
                    </h3>
                    <p className="text-sm text-muted">
                      {a.pet?.name}
                      {a.vet && (
                        <span className="text-brand"> • BS. {a.vet.name}</span>
                      )}
                    </p>
                    {a.notes && (
                      <p className="text-xs text-muted mt-1 italic">
                        "{a.notes}"
                      </p>
                    )}
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[a.status]}`}
                >
                  {STATUS_LABEL[a.status]}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(a.dateTime).toLocaleDateString("vi-VN")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {new Date(a.dateTime).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {a.status === "COMPLETED" && (
                  <span className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle2 size={14} /> Đã khám
                  </span>
                )}
                {(a.status === "PENDING" || a.status === "CONFIRMED") && (
                  <button
                    onClick={() => cancelAppt(a.id)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Hủy lịch
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-lg text-sm font-medium animate-bounce max-w-md text-center">
          {successMsg}
        </div>
      )}
    </div>
  );
}
