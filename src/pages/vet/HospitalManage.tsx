import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  Building2,
  Users,
  Stethoscope,
  Plus,
  Search,
  X,
  Pencil,
  Trash2,
  Phone,
  Mail,
  Clock,
  Award,
} from "lucide-react";
import api from "../../services/api";
import type { RootState } from "../../store";

interface Doctor {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  specialty?: string;
  experience?: number;
  licenseNumber?: string;
  avatar?: string;
  status: string;
  createdAt: string;
}

interface Hospital {
  id: number;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  veterinarians: Doctor[];
  services: { id: number; name: string }[];
}

const SPECIALTIES = [
  "Nội khoa", "Ngoại khoa", "Da liễu", "Mắt", "Tai mũi họng",
  "Tim mạch", "Tiêu hóa", "Thần kinh", "Cơ xương khớp",
  "Chẩn đoán hình ảnh", "Gây mê", "Cấp cứu", "Tổng quát",
];

export default function HospitalManage() {
  const { user } = useSelector((s: RootState) => s.auth);
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Doctor | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const [form, setForm] = useState({
    name: "", email: "", phone: "", specialty: "",
    experience: "", licenseNumber: "",
  });

  const fetchHospital = async () => {
    setLoading(true);
    try {
      const r = await api.get("/hospitals/me");
      setHospital(r.data.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchHospital(); }, []);

  const filteredDoctors = (hospital?.veterinarians || [])
    .filter((d) => filterStatus === "ALL" || d.status === filterStatus)
    .filter((d) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        d.email?.toLowerCase().includes(q) ||
        d.specialty?.toLowerCase().includes(q) ||
        d.licenseNumber?.toLowerCase().includes(q)
      );
    });

  const openAdd = () => {
    setForm({ name: "", email: "", phone: "", specialty: "", experience: "", licenseNumber: "" });
    setError("");
    setShowAddDoctor(true);
  };

  const openEdit = (d: Doctor) => {
    setForm({
      name: d.name, email: d.email || "", phone: d.phone || "",
      specialty: d.specialty || "", experience: String(d.experience || ""),
      licenseNumber: d.licenseNumber || "",
    });
    setError("");
    setEditingDoctor(d);
  };

  const submitDoctor = async () => {
    if (!form.name) return setError("Tên bác sĩ là bắt buộc");
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        specialty: form.specialty || undefined,
        experience: form.experience ? +form.experience : undefined,
        licenseNumber: form.licenseNumber || undefined,
      };

      if (editingDoctor) {
        await api.patch(`/hospitals/me/doctors/${editingDoctor.id}`, payload);
        setToast("✅ Đã cập nhật bác sĩ");
      } else {
        await api.post("/hospitals/me/doctors", payload);
        setToast("✅ Đã thêm bác sĩ");
      }
      setShowAddDoctor(false);
      setEditingDoctor(null);
      fetchHospital();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Lỗi");
    }
    setSubmitting(false);
    setTimeout(() => setToast(""), 3000);
  };

  const deleteDoctor = async () => {
    if (!deleteConfirm) return;
    await api.delete(`/hospitals/me/doctors/${deleteConfirm.id}`);
    setToast("✅ Đã xóa bác sĩ");
    setDeleteConfirm(null);
    fetchHospital();
    setTimeout(() => setToast(""), 3000);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F7F5EE] flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-[#256F63] border-t-transparent rounded-full" />
    </div>
  );

  if (!hospital) return (
    <div className="min-h-screen bg-[#F7F5EE] flex items-center justify-center">
      <div className="text-center p-8">
        <Building2 size={48} className="mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500">Bạn chưa có bệnh viện</p>
        <Link to="/partner-register" className="text-[#256F63] text-sm mt-2 inline-block hover:underline">
          Đăng ký đối tác →
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F5EE] font-body">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container-max px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/vet" className="p-2 rounded-xl hover:bg-gray-50 text-gray-500">
              <ArrowLeft size={20} />
            </Link>
            <span className="font-display font-bold text-lg text-[#256F63]">
              {hospital.name}
            </span>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#DDF2EA] flex items-center justify-center text-[#256F63] font-bold text-sm">
            {user?.name?.charAt(0) || "V"}
          </div>
        </div>
      </header>

      <div className="container-max px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { icon: Stethoscope, label: "Bác sĩ", value: hospital.veterinarians.filter(d => d.status === "ACTIVE").length, color: "bg-[#256F63]/10 text-[#256F63]" },
            { icon: Users, label: "Tổng nhân sự", value: hospital.veterinarians.length, color: "bg-blue-100 text-blue-600" },
            { icon: Award, label: "Dịch vụ", value: hospital.services.length, color: "bg-purple-100 text-purple-600" },
            { icon: Building2, label: "Trạng thái", value: hospital.status === "ACTIVE" ? "Đang hoạt động" : "Chờ duyệt", color: "bg-green-100 text-green-600" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center mb-3`}>
                <s.icon size={20} />
              </div>
              <p className="text-2xl font-display font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search + Add */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm bác sĩ theo tên, email, chuyên khoa..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#256F63]/20"
            />
          </div>
          <button onClick={openAdd} className="btn-brand !py-3 !px-5 !rounded-2xl text-sm whitespace-nowrap"
            style={{ background: "#256F63" }}>
            <Plus size={16} /> Thêm bác sĩ
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
          {[{ key: "ALL", label: "Tất cả" }, { key: "ACTIVE", label: "Đang làm" }, { key: "INACTIVE", label: "Đã nghỉ" }].map((t) => (
            <button key={t.key} onClick={() => setFilterStatus(t.key)}
              className={`px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-colors ${
                filterStatus === t.key ? "bg-[#256F63] text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Doctor List */}
        {filteredDoctors.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl">
            <Stethoscope size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-sm">Chưa có bác sĩ nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDoctors.map((d) => (
              <div key={d.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 bg-[#DDF2EA] rounded-2xl flex items-center justify-center text-2xl shrink-0">
                    {d.avatar ? <img src={d.avatar} alt="" className="w-full h-full rounded-2xl object-cover" /> : "👨‍⚕️"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-gray-800">{d.name}</h3>
                    <p className="text-sm text-gray-500">{d.specialty || "Chưa có chuyên khoa"}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      d.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {d.status === "ACTIVE" ? "Đang làm" : "Đã nghỉ"}
                    </span>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-gray-500 mb-4">
                  {d.phone && <p className="flex items-center gap-1.5"><Phone size={12} />{d.phone}</p>}
                  {d.email && <p className="flex items-center gap-1.5"><Mail size={12} />{d.email}</p>}
                  {d.experience && <p className="flex items-center gap-1.5"><Clock size={12} />{d.experience} năm kinh nghiệm</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(d)}
                    className="flex-1 py-2 bg-[#DDF2EA] text-[#256F63] rounded-xl text-xs font-medium hover:bg-[#c5e8d8] transition-colors flex items-center justify-center gap-1">
                    <Pencil size={12} /> Sửa
                  </button>
                  <button onClick={() => setDeleteConfirm(d)}
                    className="flex-1 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-1">
                    <Trash2 size={12} /> Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Doctor Modal */}
      {(showAddDoctor || editingDoctor) && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => { setShowAddDoctor(false); setEditingDoctor(null); }}>
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-gray-800">
                {editingDoctor ? "Sửa bác sĩ" : "Thêm bác sĩ mới"}
              </h3>
              <button onClick={() => { setShowAddDoctor(false); setEditingDoctor(null); }} className="p-1.5 rounded-xl hover:bg-gray-50">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <Input label="Tên bác sĩ *" value={form.name} onChange={(v) => setForm(f => ({ ...f, name: v }))} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Email" value={form.email} onChange={(v) => setForm(f => ({ ...f, email: v }))} type="email" />
                <Input label="SĐT" value={form.phone} onChange={(v) => setForm(f => ({ ...f, phone: v }))} type="tel" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Chuyên khoa</label>
                <select value={form.specialty} onChange={(e) => setForm(f => ({ ...f, specialty: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#F7F5EE] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#256F63]/20">
                  <option value="">Chọn chuyên khoa</option>
                  {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Kinh nghiệm (năm)" value={form.experience} onChange={(v) => setForm(f => ({ ...f, experience: v }))} type="number" />
                <Input label="Số giấy phép" value={form.licenseNumber} onChange={(v) => setForm(f => ({ ...f, licenseNumber: v }))} />
              </div>
              {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-xl">{error}</p>}
              <button onClick={submitDoctor} disabled={submitting}
                className="w-full py-3 text-white rounded-2xl font-semibold text-sm transition-colors disabled:opacity-50"
                style={{ background: "#256F63" }}>
                {submitting ? "Đang lưu..." : editingDoctor ? "Cập nhật" : "Thêm bác sĩ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-xl">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="font-display font-bold text-lg mb-2">Xác nhận xóa</h3>
            <p className="text-sm text-gray-500 mb-6">Bạn có chắc muốn xóa bác sĩ <strong>{deleteConfirm.name}</strong>?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border rounded-xl text-sm">Hủy</button>
              <button onClick={deleteDoctor} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm">Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-lg text-sm font-medium animate-bounce">
          {toast}
        </div>
      )}
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-[#F7F5EE] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#256F63]/20" />
    </div>
  );
}
