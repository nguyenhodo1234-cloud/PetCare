import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  CheckCircle2,
  Clock4,
  Play,
  User,
  Phone,
  Mail,
  FileText,
  X,
} from "lucide-react";
import api from "../../services/api";
import type { RootState } from "../../store";

interface Appointment {
  id: number;
  dateTime: string;
  status: string;
  notes?: string;
  pet: { id: number; name: string; species: string; avatar?: string };
  service: { id: number; name: string };
  customer?: { id: number; name: string; phone: string };
}

interface AppointmentDetail {
  id: number;
  dateTime: string;
  status: string;
  notes?: string;
  pet: { id: number; name: string; species: string; avatar?: string };
  service: { id: number; name: string };
  customer: { id: number; name: string; phone: string; email: string } | null;
  history: { id: number; status: string; notes: string; createdAt: string }[];
  medicalRecords: {
    id: number;
    diagnosis?: string;
    treatment?: string;
    notes?: string;
    recordDate: string;
    files: { fileName: string; fileUrl: string }[];
  }[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  CONFIRMED: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-700" },
  IN_PROGRESS: { label: "Đang khám", color: "bg-purple-100 text-purple-700" },
  COMPLETED: { label: "Hoàn thành", color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Đã hủy", color: "bg-red-100 text-red-700" },
  PENDING: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-700" },
};

const FILTER_TABS = [
  { key: "ALL", label: "Tất cả" },
  { key: "CONFIRMED", label: "Đã xác nhận" },
  { key: "IN_PROGRESS", label: "Đang khám" },
  { key: "COMPLETED", label: "Hoàn thành" },
];

function formatDate(d: Date) {
  const days = [
    "Chủ nhật",
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
  ];
  return `${days[d.getDay()]}, ${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
}

function isToday(d: Date) {
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

export default function VetDashboard() {
  const { user } = useSelector((s: RootState) => s.auth);
  const [stats, setStats] = useState({
    total: 0,
    waiting: 0,
    inProgress: 0,
    completed: 0,
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [detail, setDetail] = useState<AppointmentDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [completeForm, setCompleteForm] = useState({
    diagnosis: "",
    treatment: "",
    notes: "",
  });
  const [showComplete, setShowComplete] = useState(false);
  const [completingId, setCompletingId] = useState<number | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const r = await api.get("/vet/dashboard");
      setStats(r.data.data.stats);
      setAppointments(r.data.data.appointments);
    } catch {}
    setLoading(false);
  };

  const fetchByDate = async (date: Date) => {
    setLoading(true);
    try {
      const r = await api.get("/vet/appointments", {
        params: { date: date.toISOString(), status: activeFilter },
      });
      setAppointments(r.data.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    if (isToday(selectedDate)) {
      fetchDashboard();
    } else {
      fetchByDate(selectedDate);
    }
  }, [selectedDate, activeFilter]);

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d);
  };

  const openDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const r = await api.get(`/vet/appointments/${id}`);
      setDetail(r.data.data);
    } catch {}
    setDetailLoading(false);
  };

  const startExam = async (id: number) => {
    await api.post(`/vet/appointments/${id}/start`);
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "IN_PROGRESS" } : a)),
    );
    if (detail?.id === id) setDetail({ ...detail, status: "IN_PROGRESS" });
  };

  const completeExam = async () => {
    if (!completingId || !completeForm.diagnosis) return;
    await api.post(`/vet/appointments/${completingId}/complete`, completeForm);
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === completingId ? { ...a, status: "COMPLETED" } : a,
      ),
    );
    if (detail?.id === completingId)
      setDetail({ ...detail, status: "COMPLETED" });
    setShowComplete(false);
    setCompletingId(null);
    setCompleteForm({ diagnosis: "", treatment: "", notes: "" });
  };

  const openComplete = (id: number) => {
    setCompletingId(id);
    setCompleteForm({ diagnosis: "", treatment: "", notes: "" });
    setShowComplete(true);
  };

  const confirmAppt = async (id: number) => {
    await api.patch(`/vet/appointments/${id}/confirm`);
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "CONFIRMED" } : a)),
    );
    if (detail?.id === id) setDetail({ ...detail, status: "CONFIRMED" });
  };

  const filtered =
    activeFilter === "ALL"
      ? appointments
      : appointments.filter((a) => a.status === activeFilter);

  const needPrepareCount = appointments.filter(
    (a) => a.status === "CONFIRMED",
  ).length;

  return (
    <div className="min-h-screen bg-[#F8F7F2] font-body">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container-max px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="p-2 rounded-xl hover:bg-gray-50 text-gray-500"
            >
              <ArrowLeft size={20} />
            </Link>
            <span className="font-display font-bold text-lg text-[#2E7D5A]">
              Pet<span className="text-gray-800">Connect</span>
            </span>
            <span className="text-xs text-gray-400 hidden sm:inline">
              Care • Connect • Grow
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#2E7D5A]/10 flex items-center justify-center text-[#2E7D5A] font-bold text-sm">
              {user?.name?.charAt(0) || "V"}
            </div>
          </div>
        </div>
      </header>

      <div className="container-max px-4 py-6">
        {/* Hero */}
        <div className="mb-6">
          <h1 className="font-display text-2xl font-extrabold text-gray-800 mb-1">
            Chào buổi sáng, {user?.name || "Bác sĩ"}!
          </h1>
          <p className="text-gray-500 text-sm">
            Theo dõi các ca khám, tình trạng tiếp nhận và bác sĩ phụ trách trong
            ngày.
          </p>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => changeDate(-1)}
            className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-600"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex-1 text-center">
            <p className="font-display font-bold text-gray-800">
              {formatDate(selectedDate)}
            </p>
            <p className="text-xs text-gray-500">
              {isToday(selectedDate) ? "Hôm nay • " : ""}
              {appointments.length} lịch khám
            </p>
          </div>
          <button
            onClick={() => changeDate(1)}
            className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-600"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            {
              icon: Calendar,
              label: "Tổng lịch khám",
              value: stats.total,
              color: "bg-[#2E7D5A]/10 text-[#2E7D5A]",
            },
            {
              icon: Play,
              label: "Đang khám",
              value: stats.inProgress,
              color: "bg-purple-100 text-purple-600",
            },
            {
              icon: Clock4,
              label: "Chờ khám",
              value: stats.waiting,
              color: "bg-yellow-100 text-yellow-600",
            },
            {
              icon: CheckCircle2,
              label: "Hoàn thành",
              value: stats.completed,
              color: "bg-green-100 text-green-600",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
            >
              <div
                className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center mb-3`}
              >
                <s.icon size={20} />
              </div>
              <p className="text-2xl font-display font-bold text-gray-800">
                {s.value}
              </p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
          {FILTER_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveFilter(t.key)}
              className={`px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-colors ${
                activeFilter === t.key
                  ? "bg-[#2E7D5A] text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Appointments List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-sm">Không có lịch khám nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((a) => (
              <div
                key={a.id}
                onClick={() => openDetail(a.id)}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md cursor-pointer transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="text-center shrink-0 min-w-[50px]">
                    <p className="text-lg font-display font-bold text-gray-800">
                      {new Date(a.dateTime).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-[#E8F4EE] rounded-xl flex items-center justify-center text-2xl shrink-0">
                    {a.pet.avatar ? (
                      <img
                        src={a.pet.avatar}
                        alt=""
                        className="w-full h-full rounded-xl object-cover"
                      />
                    ) : (
                      "🐾"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-gray-800">
                      {a.pet.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {a.customer?.name || "—"} • {a.service.name}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[a.status]?.color}`}
                  >
                    {STATUS_CONFIG[a.status]?.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Alert */}
        {needPrepareCount > 0 && (
          <div className="mt-6 bg-[#E8F4EE] rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#2E7D5A]/10 rounded-xl flex items-center justify-center text-[#2E7D5A]">
                <Stethoscope size={20} />
              </div>
              <p className="text-sm font-medium text-[#2E7D5A]">
                {needPrepareCount} hồ sơ cần chuẩn bị trước buổi chiều
              </p>
            </div>
            <button
              onClick={() => setActiveFilter("CONFIRMED")}
              className="text-sm font-medium text-[#2E7D5A] hover:underline"
            >
              Xem danh sách
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detail && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setDetail(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {detailLoading ? (
              <div className="p-12 flex justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-[#2E7D5A] border-t-transparent rounded-full" />
              </div>
            ) : (
              <>
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-display font-bold text-lg text-gray-800">
                    Chi tiết lịch khám
                  </h3>
                  <button
                    onClick={() => setDetail(null)}
                    className="p-1.5 rounded-xl hover:bg-gray-50"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${STATUS_CONFIG[detail.status]?.color}`}
                    >
                      {STATUS_CONFIG[detail.status]?.label}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(detail.dateTime).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {" • "}
                      {new Date(detail.dateTime).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  <div className="bg-[#F8F7F2] rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-14 h-14 bg-[#E8F4EE] rounded-2xl flex items-center justify-center text-3xl">
                      🐾
                    </div>
                    <div>
                      <p className="font-display font-bold text-gray-800">
                        {detail.pet.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {detail.pet.species} • {detail.service.name}
                      </p>
                    </div>
                  </div>

                  {detail.customer && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase">
                        Chủ nuôi
                      </p>
                      <div className="space-y-1.5 text-sm">
                        <p className="flex items-center gap-2 text-gray-700">
                          <User size={14} />
                          {detail.customer.name}
                        </p>
                        <p className="flex items-center gap-2 text-gray-700">
                          <Phone size={14} />
                          {detail.customer.phone}
                        </p>
                        <p className="flex items-center gap-2 text-gray-700">
                          <Mail size={14} />
                          {detail.customer.email}
                        </p>
                      </div>
                    </div>
                  )}

                  {detail.medicalRecords &&
                    detail.medicalRecords.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase">
                          Lịch sử khám
                        </p>
                        {detail.medicalRecords.map((r) => (
                          <div
                            key={r.id}
                            className="bg-[#F8F7F2] rounded-xl p-3 text-sm"
                          >
                            <p className="text-gray-500 text-xs">
                              {new Date(r.recordDate).toLocaleDateString(
                                "vi-VN",
                              )}
                            </p>
                            {r.diagnosis && (
                              <p className="font-medium text-gray-800">
                                🩺 {r.diagnosis}
                              </p>
                            )}
                            {r.treatment && (
                              <p className="text-gray-600">💊 {r.treatment}</p>
                            )}
                            {r.files.length > 0 && (
                              <div className="flex gap-2 mt-2">
                                {r.files.map((f) => (
                                  <a
                                    key={f.fileName}
                                    href={f.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-[#2E7D5A] underline flex items-center gap-1"
                                  >
                                    <FileText size={12} />
                                    {f.fileName}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase">
                      Lịch sử trạng thái
                    </p>
                    {detail.history.map((h) => (
                      <div
                        key={h.id}
                        className="flex items-center gap-2 text-sm text-gray-600"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        <span className="text-xs text-gray-400">
                          {new Date(h.createdAt).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span>
                          {STATUS_CONFIG[h.status]?.label || h.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-2">
                    {detail.status === "PENDING" && (
                      <button
                        onClick={() => confirmAppt(detail.id)}
                        className="flex-1 py-3 bg-blue-500 text-white rounded-2xl font-semibold text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={16} /> Xác nhận lịch
                      </button>
                    )}
                    {detail.status === "CONFIRMED" && (
                      <button
                        onClick={() => startExam(detail.id)}
                        className="flex-1 py-3 bg-[#2E7D5A] text-white rounded-2xl font-semibold text-sm hover:bg-[#236A48] transition-colors flex items-center justify-center gap-2"
                      >
                        <Play size={16} /> Bắt đầu khám
                      </button>
                    )}
                    {detail.status === "IN_PROGRESS" && (
                      <button
                        onClick={() => openComplete(detail.id)}
                        className="flex-1 py-3 bg-green-500 text-white rounded-2xl font-semibold text-sm hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={16} /> Hoàn thành khám
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Complete Exam Modal */}
      {showComplete && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setShowComplete(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-gray-800">
                🩺 Hoàn thành khám
              </h3>
              <button
                onClick={() => setShowComplete(false)}
                className="p-1.5 rounded-xl hover:bg-gray-50"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Chẩn đoán <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={completeForm.diagnosis}
                  onChange={(e) =>
                    setCompleteForm((f) => ({
                      ...f,
                      diagnosis: e.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="VD: Viêm da dị ứng, Nhiễm trùng đường ruột..."
                  className="w-full px-4 py-3 bg-[#F8F7F2] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D5A]/20 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Điều trị
                </label>
                <textarea
                  value={completeForm.treatment}
                  onChange={(e) =>
                    setCompleteForm((f) => ({
                      ...f,
                      treatment: e.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="VD: Vệ sinh da, dùng thuốc kháng sinh, tái khám sau 7 ngày..."
                  className="w-full px-4 py-3 bg-[#F8F7F2] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D5A]/20 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Ghi chú thêm
                </label>
                <input
                  value={completeForm.notes}
                  onChange={(e) =>
                    setCompleteForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  placeholder="Lưu ý cho chủ nuôi..."
                  className="w-full px-4 py-3 bg-[#F8F7F2] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D5A]/20"
                />
              </div>
              <button
                onClick={completeExam}
                disabled={!completeForm.diagnosis}
                className="w-full py-3 bg-green-500 text-white rounded-2xl font-semibold text-sm hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✅ Xác nhận hoàn thành
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
