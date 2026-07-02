import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  Search,
  FileText,
  Stethoscope,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Plus,
  X,
  Upload,
} from "lucide-react";
import api from "../../services/api";
import type { RootState } from "../../store";

interface Record {
  id: number;
  petId: number;
  vetId?: number;
  hospitalId?: number;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  symptoms?: string;
  cause?: string;
  conclusion?: string;
  status: string;
  recordDate: string;
  updatedAt: string;
  pet: { id: number; name: string; species: string; breed?: string };
  files: { id: number; fileName: string; fileUrl: string }[];
  vet?: { id: number; name: string } | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  NEW: { label: "Mới", color: "bg-blue-100 text-blue-700" },
  DIAGNOSING: {
    label: "Đang chẩn đoán",
    color: "bg-yellow-100 text-yellow-700",
  },
  TREATING: { label: "Đang điều trị", color: "bg-purple-100 text-purple-700" },
  FOLLOW_UP: { label: "Tái khám", color: "bg-orange-100 text-orange-700" },
  COMPLETED: { label: "Hoàn tất", color: "bg-green-100 text-green-700" },
};

export default function MedicalRecordsPage() {
  const { user } = useSelector((s: RootState) => s.auth);
  const [records, setRecords] = useState<Record[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    treating: 0,
    followUp: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selected, setSelected] = useState<Record | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pets, setPets] = useState<any[]>([]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const r = await api.get("/medical-records", {
        params: { search, status: filter },
      });
      setRecords(r.data.data.records);
      setStats(r.data.data.stats);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchRecords();
  }, [search, filter]);

  const openDetail = async (id: number) => {
    try {
      const r = await api.get(`/medical-records/${id}`);
      setSelected(r.data.data);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#F8F5EE] font-body">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container-max px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/vet"
              className="p-2 rounded-xl hover:bg-gray-50 text-gray-500"
            >
              <ArrowLeft size={20} />
            </Link>
            <span className="font-display font-bold text-lg text-[#256F63]">
              PetConnect
            </span>
            <span className="text-xs text-gray-400 hidden sm:inline">
              Medical Records
            </span>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              api.get("/pets?all=1").then((r) => setPets(r.data.data));
            }}
            className="px-4 py-2 bg-[#256F63] text-white rounded-xl text-sm font-medium"
          >
            + Tạo hồ sơ
          </button>
        </div>
      </header>

      <div className="container-max px-4 py-6">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-extrabold text-gray-800 mb-1">
            Theo dõi sức khỏe từng bé cưng mỗi ngày
          </h1>
          <p className="text-gray-500 text-sm">
            Quản lý chẩn đoán, lịch điều trị và tái khám trong một nơi.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            {
              icon: FileText,
              label: "Tổng hồ sơ",
              value: stats.total,
              color: "bg-[#256F63]/10 text-[#256F63]",
            },
            {
              icon: AlertCircle,
              label: "Đang điều trị",
              value: stats.treating,
              color: "bg-purple-100 text-purple-600",
            },
            {
              icon: Clock,
              label: "Tái khám hôm nay",
              value: stats.followUp,
              color: "bg-orange-100 text-orange-600",
            },
            {
              icon: CheckCircle2,
              label: "Đã hoàn tất",
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

        {/* Search + Filter */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên thú cưng hoặc chẩn đoán..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm"
            />
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
          {[
            { k: "ALL", l: "Tất cả" },
            { k: "DIAGNOSING", l: "Đang chẩn đoán" },
            { k: "TREATING", l: "Đang điều trị" },
            { k: "FOLLOW_UP", l: "Tái khám" },
            { k: "COMPLETED", l: "Hoàn tất" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setFilter(t.k)}
              className={`px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap ${filter === t.k ? "bg-[#256F63] text-white" : "bg-white border text-gray-600"}`}
            >
              {t.l}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-16">
            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Chưa có hồ sơ nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((r) => (
              <button
                key={r.id}
                onClick={() => openDetail(r.id)}
                className="w-full text-left bg-white rounded-2xl p-5 shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#DDF2EA] rounded-2xl flex items-center justify-center text-2xl shrink-0">
                    🐾
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-bold text-gray-800">
                        {r.pet.name}
                      </h3>
                      <span className="text-xs text-gray-400">
                        {r.pet.species}
                        {r.pet.breed ? ` · ${r.pet.breed}` : ""}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_CONFIG[r.status]?.color}`}
                      >
                        {STATUS_CONFIG[r.status]?.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {r.diagnosis || "Chưa có chẩn đoán"}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1.5">
                      {r.vet && <span>👨‍⚕️ {r.vet.name}</span>}
                      <span>
                        {new Date(r.updatedAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 mt-2" />
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
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="font-display font-bold text-lg">
                Chi tiết hồ sơ #{selected.id}
              </h3>
              <button
                onClick={() => setSelected(null)}
                className="p-1.5 rounded-xl hover:bg-gray-50"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-3 p-4 bg-[#F8F5EE] rounded-2xl">
                <div className="w-14 h-14 bg-[#DDF2EA] rounded-2xl flex items-center justify-center text-2xl">
                  🐾
                </div>
                <div>
                  <p className="font-display font-bold text-gray-800">
                    {selected.pet?.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selected.pet?.species}
                    {selected.pet?.breed ? ` · ${selected.pet?.breed}` : ""}
                  </p>
                </div>
                <span
                  className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[selected.status]?.color}`}
                >
                  {STATUS_CONFIG[selected.status]?.label}
                </span>
              </div>
              {(selected as any).owner && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Chủ nuôi
                  </p>
                  <div className="text-sm space-y-1">
                    <p>👤 {(selected as any).owner.name}</p>
                    <p>📞 {(selected as any).owner.phone}</p>
                  </div>
                </div>
              )}
              {selected.symptoms && (
                <InfoBlock label="Triệu chứng" value={selected.symptoms} />
              )}
              {selected.diagnosis && (
                <InfoBlock label="Chẩn đoán" value={selected.diagnosis} />
              )}
              {selected.cause && (
                <InfoBlock label="Nguyên nhân" value={selected.cause} />
              )}
              {selected.treatment && (
                <InfoBlock label="Điều trị" value={selected.treatment} />
              )}
              {selected.conclusion && (
                <InfoBlock label="Kết luận" value={selected.conclusion} />
              )}
              {selected.notes && (
                <InfoBlock label="Ghi chú" value={selected.notes} />
              )}
              {selected.vet && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#F8F5EE] rounded-xl p-3">
                    <p className="text-xs text-gray-500">Bác sĩ</p>
                    <p className="text-sm font-medium">
                      👨‍⚕️ {selected.vet.name}
                    </p>
                  </div>
                  <div className="bg-[#F8F5EE] rounded-xl p-3">
                    <p className="text-xs text-gray-500">Ngày khám</p>
                    <p className="text-sm font-medium">
                      {new Date(selected.recordDate).toLocaleDateString(
                        "vi-VN",
                      )}
                    </p>
                  </div>
                </div>
              )}
              {selected.files?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    📎 File đính kèm
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selected.files.map((f) => (
                      <a
                        key={f.id}
                        href={f.fileUrl}
                        target="_blank"
                        className="px-3 py-2 bg-[#F8F5EE] rounded-xl text-sm text-[#256F63] hover:bg-[#DDF2EA]"
                      >
                        {f.fileName}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Form Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="font-display font-bold text-lg">
                Tạo hồ sơ bệnh án
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 rounded-xl hover:bg-gray-50"
              >
                <X size={20} />
              </button>
            </div>
            <CreateForm
              pets={pets}
              onDone={() => {
                setShowForm(false);
                fetchRecords();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#F8F5EE] rounded-xl p-4">
      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
        {label}
      </p>
      <p className="text-sm text-gray-800">{value}</p>
    </div>
  );
}

function CreateForm({ pets, onDone }: { pets: any[]; onDone: () => void }) {
  const [form, setForm] = useState({
    petId: "",
    diagnosis: "",
    treatment: "",
    notes: "",
    symptoms: "",
    cause: "",
    status: "NEW",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!form.petId) return setError("Vui lòng chọn thú cưng");
    setLoading(true);
    setError("");
    try {
      await api.post("/medical-records", form);
      onDone();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Lỗi");
    }
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-4">
      <select
        value={form.petId}
        onChange={(e) => setForm((f) => ({ ...f, petId: e.target.value }))}
        className="w-full px-4 py-3 bg-[#F8F5EE] border rounded-xl text-sm"
      >
        <option value="">Chọn thú cưng</option>
        {pets.map((p: any) => (
          <option key={p.id} value={p.id}>
            {p.name} ({p.species})
          </option>
        ))}
      </select>
      <textarea
        placeholder="Triệu chứng"
        value={form.symptoms}
        onChange={(e) => setForm((f) => ({ ...f, symptoms: e.target.value }))}
        rows={2}
        className="w-full px-4 py-3 bg-[#F8F5EE] border rounded-xl text-sm resize-none"
      />
      <textarea
        placeholder="Chẩn đoán"
        value={form.diagnosis}
        onChange={(e) => setForm((f) => ({ ...f, diagnosis: e.target.value }))}
        rows={2}
        className="w-full px-4 py-3 bg-[#F8F5EE] border rounded-xl text-sm resize-none"
      />
      <textarea
        placeholder="Nguyên nhân"
        value={form.cause}
        onChange={(e) => setForm((f) => ({ ...f, cause: e.target.value }))}
        rows={2}
        className="w-full px-4 py-3 bg-[#F8F5EE] border rounded-xl text-sm resize-none"
      />
      <textarea
        placeholder="Điều trị"
        value={form.treatment}
        onChange={(e) => setForm((f) => ({ ...f, treatment: e.target.value }))}
        rows={2}
        className="w-full px-4 py-3 bg-[#F8F5EE] border rounded-xl text-sm resize-none"
      />
      <textarea
        placeholder="Ghi chú"
        value={form.notes}
        onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        rows={2}
        className="w-full px-4 py-3 bg-[#F8F5EE] border rounded-xl text-sm resize-none"
      />
      {error && (
        <p className="text-sm text-red-500 bg-red-50 p-3 rounded-xl">{error}</p>
      )}
      <button
        onClick={submit}
        disabled={loading}
        className="w-full py-3 bg-[#256F63] text-white rounded-2xl font-semibold text-sm"
      >
        {loading ? "Đang tạo..." : "Tạo hồ sơ"}
      </button>
    </div>
  );
}
