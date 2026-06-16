import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Users,
  Building2,
  Calendar,
  TrendingUp,
  ArrowLeft,
  Store,
  Check,
  X,
  Eye,
  FileText,
  Pencil,
  Trash2,
} from "lucide-react";
import api from "../../services/api";
import type { RootState } from "../../store";

interface Partner {
  id: number;
  businessType: string;
  shopName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  businessLicense: string | null;
  vetCertificate: string | null;
  status: string;
  createdAt: string;
}

const BUSINESS_LABELS: Record<string, string> = {
  clinic: "Phòng khám thú y",
  shop: "Cửa hàng thú cưng",
  spa: "Spa thú cưng",
};

export default function AdminDashboard() {
  const { user } = useSelector((s: RootState) => s.auth);
  const [stats, setStats] = useState({
    users: 0,
    appointments: 0,
    shops: 0,
    partners: 0,
  });
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [editForm, setEditForm] = useState({
    shopName: "",
    ownerName: "",
    phone: "",
    email: "",
    address: "",
    businessType: "",
  });
  const [editError, setEditError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<Partner | null>(null);
  const [activeTab, setActiveTab] = useState<"users" | "partners">("users");

  useEffect(() => {
    api.get("/admin/stats").then((r) => setStats(r.data.data));
    api.get("/admin/users").then((r) => setAllUsers(r.data.data));
    api.get("/admin/partners").then((r) => setPartners(r.data.data));
  }, []);

  const toggleStatus = async (id: number, status: string) => {
    await api.patch(`/admin/users/${id}/status`, { status });
    setAllUsers((p) => p.map((u) => (u.id === id ? { ...u, status } : u)));
  };

  const approvePartner = async (id: number) => {
    await api.patch(`/admin/partners/${id}/approve`);
    setPartners((p) =>
      p.map((pt) => (pt.id === id ? { ...pt, status: "approved" } : pt)),
    );
  };

  const rejectPartner = async (id: number) => {
    await api.patch(`/admin/partners/${id}/reject`);
    setPartners((p) =>
      p.map((pt) => (pt.id === id ? { ...pt, status: "rejected" } : pt)),
    );
  };

  const openEdit = (p: Partner) => {
    setEditingPartner(p);
    setEditForm({
      shopName: p.shopName,
      ownerName: p.ownerName,
      phone: p.phone,
      email: p.email,
      address: p.address,
      businessType: p.businessType,
    });
    setEditError("");
  };

  const saveEdit = async () => {
    if (!editingPartner) return;
    setEditError("");
    try {
      const res = await api.put(
        `/admin/partners/${editingPartner.id}`,
        editForm,
      );
      setPartners((p) =>
        p.map((pt) =>
          pt.id === editingPartner.id ? { ...pt, ...res.data.data } : pt,
        ),
      );
      setEditingPartner(null);
    } catch (err: any) {
      setEditError(err?.response?.data?.error || "Lỗi khi cập nhật");
    }
  };

  const deletePartner = async () => {
    if (!deleteConfirm) return;
    await api.delete(`/admin/partners/${deleteConfirm.id}`);
    setPartners((p) => p.filter((pt) => pt.id !== deleteConfirm.id));
    setDeleteConfirm(null);
  };

  const pendingCount = partners.filter((p) => p.status === "pending").length;

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
              ⚙️ Admin Dashboard
            </h1>
          </div>
          <span className="text-xs bg-brand/10 text-brand px-3 py-1 rounded-full font-medium">
            {user?.name}
          </span>
        </div>
      </header>

      <div className="container-max px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            {
              icon: Users,
              label: "Người dùng",
              value: stats.users,
              color: "bg-brand/10 text-brand",
            },
            {
              icon: Building2,
              label: "Cửa hàng",
              value: stats.shops,
              color: "bg-teal/10 text-teal",
            },
            {
              icon: Calendar,
              label: "Lịch hẹn",
              value: stats.appointments,
              color: "bg-blue-100 text-blue-600",
            },
            {
              icon: Store,
              label: "ĐK đối tác",
              value: stats.partners,
              color: "bg-orange-100 text-orange-600",
            },
            {
              icon: TrendingUp,
              label: "Tăng trưởng",
              value: "+12%",
              color: "bg-green-100 text-green-600",
            },
          ].map((s, i) => (
            <div key={i} className="card p-5">
              <div
                className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center mb-3`}
              >
                <s.icon size={20} />
              </div>
              <p className="text-2xl font-display font-bold text-text">
                {s.value}
              </p>
              <p className="text-xs text-muted">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-5 py-3 text-sm font-medium rounded-t-xl transition-colors ${
              activeTab === "users"
                ? "bg-surface border border-border border-b-surface -mb-px text-text"
                : "text-muted hover:text-text"
            }`}
          >
            <Users size={16} className="inline mr-2" />
            Người dùng
          </button>
          <button
            onClick={() => setActiveTab("partners")}
            className={`px-5 py-3 text-sm font-medium rounded-t-xl transition-colors relative ${
              activeTab === "partners"
                ? "bg-surface border border-border border-b-surface -mb-px text-text"
                : "text-muted hover:text-text"
            }`}
          >
            <Store size={16} className="inline mr-2" />
            Đăng ký đối tác
            {pendingCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="card">
            <div className="p-4 border-b border-border">
              <h2 className="font-display font-bold text-text">
                Quản lý người dùng
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-warm/50 text-muted text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Tên</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Vai trò</th>
                    <th className="px-4 py-3 text-left">Trạng thái</th>
                    <th className="px-4 py-3 text-left">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {allUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-warm/30">
                      <td className="px-4 py-3 text-text font-mono text-xs">
                        #{u.id}
                      </td>
                      <td className="px-4 py-3 text-text font-medium">
                        {u.name}
                      </td>
                      <td className="px-4 py-3 text-muted">{u.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            u.role === "ADMIN"
                              ? "bg-purple-100 text-purple-700"
                              : u.role === "VET"
                                ? "bg-teal/10 text-teal"
                                : u.role === "SHOP_OWNER"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            u.status === "ACTIVE"
                              ? "badge-active"
                              : u.status === "BANNED"
                                ? "badge-cancelled"
                                : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {u.role !== "ADMIN" && (
                          <button
                            onClick={() =>
                              toggleStatus(
                                u.id,
                                u.status === "ACTIVE" ? "BANNED" : "ACTIVE",
                              )
                            }
                            className={`text-xs font-medium px-3 py-1 rounded-lg transition-colors ${
                              u.status === "ACTIVE"
                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                : "bg-green-50 text-green-600 hover:bg-green-100"
                            }`}
                          >
                            {u.status === "ACTIVE" ? "Khóa" : "Mở khóa"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Partners Tab */}
        {activeTab === "partners" && (
          <div className="card">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-display font-bold text-text">
                Đăng ký đối tác ({partners.length})
              </h2>
              <div className="flex gap-2 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-yellow-400" /> Chờ
                  duyệt
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500" /> Đã
                  duyệt
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500" /> Từ chối
                </span>
              </div>
            </div>
            {partners.length === 0 ? (
              <div className="p-12 text-center text-muted text-sm">
                Chưa có đăng ký đối tác nào
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-warm/50 text-muted text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left">ID</th>
                      <th className="px-4 py-3 text-left">Tên shop</th>
                      <th className="px-4 py-3 text-left">Chủ shop</th>
                      <th className="px-4 py-3 text-left">Loại hình</th>
                      <th className="px-4 py-3 text-left">SĐT</th>
                      <th className="px-4 py-3 text-left">Trạng thái</th>
                      <th className="px-4 py-3 text-left">Ngày đăng ký</th>
                      <th className="px-4 py-3 text-left">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {partners.map((p) => (
                      <tr key={p.id} className="hover:bg-warm/30">
                        <td className="px-4 py-3 text-text font-mono text-xs">
                          #{p.id}
                        </td>
                        <td className="px-4 py-3 text-text font-medium">
                          {p.shopName}
                        </td>
                        <td className="px-4 py-3 text-text">{p.ownerName}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-brand/10 text-brand">
                            {BUSINESS_LABELS[p.businessType] || p.businessType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted">{p.phone}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              p.status === "approved"
                                ? "badge-active"
                                : p.status === "rejected"
                                  ? "badge-cancelled"
                                  : "badge-pending"
                            }`}
                          >
                            {p.status === "approved"
                              ? "Đã duyệt"
                              : p.status === "rejected"
                                ? "Từ chối"
                                : "Chờ duyệt"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted text-xs">
                          {new Date(p.createdAt).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setSelectedPartner(p)}
                              className="p-1.5 rounded-lg hover:bg-warm text-muted hover:text-text transition-colors"
                              title="Xem chi tiết"
                            >
                              <Eye size={16} />
                            </button>
                            {p.status === "pending" && (
                              <>
                                <button
                                  onClick={() => approvePartner(p.id)}
                                  className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                  title="Duyệt"
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  onClick={() => rejectPartner(p.id)}
                                  className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                  title="Từ chối"
                                >
                                  <X size={16} />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => openEdit(p)}
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                              title="Sửa"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(p)}
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                              title="Xóa"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Detail Modal */}
        {selectedPartner && (
          <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setSelectedPartner(null)}
          >
            <div
              className="bg-surface rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h3 className="font-display font-bold text-lg text-text">
                  Chi tiết đăng ký #{selectedPartner.id}
                </h3>
                <button
                  onClick={() => setSelectedPartner(null)}
                  className="p-1.5 rounded-lg hover:bg-warm text-muted"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <InfoField
                    label="Loại hình"
                    value={BUSINESS_LABELS[selectedPartner.businessType]}
                  />
                  <InfoField
                    label="Trạng thái"
                    value={
                      selectedPartner.status === "approved"
                        ? "Đã duyệt"
                        : selectedPartner.status === "rejected"
                          ? "Từ chối"
                          : "Chờ duyệt"
                    }
                  />
                  <InfoField
                    label="Tên shop"
                    value={selectedPartner.shopName}
                  />
                  <InfoField
                    label="Chủ shop"
                    value={selectedPartner.ownerName}
                  />
                  <InfoField
                    label="Số điện thoại"
                    value={selectedPartner.phone}
                  />
                  <InfoField label="Email" value={selectedPartner.email} />
                </div>
                <InfoField label="Địa chỉ" value={selectedPartner.address} />
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted">Giấy tờ</p>
                  <div className="flex gap-3">
                    {selectedPartner.businessLicense ? (
                      <a
                        href={selectedPartner.businessLicense}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 bg-warm rounded-xl border border-border text-sm text-text hover:border-brand/50 transition-colors"
                      >
                        <FileText size={16} className="text-brand" />
                        Giấy phép kinh doanh
                      </a>
                    ) : (
                      <span className="text-xs text-muted italic">
                        Chưa có giấy phép KD
                      </span>
                    )}
                    {selectedPartner.vetCertificate ? (
                      <a
                        href={selectedPartner.vetCertificate}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 bg-warm rounded-xl border border-border text-sm text-text hover:border-brand/50 transition-colors"
                      >
                        <FileText size={16} className="text-brand" />
                        Chứng chỉ thú y
                      </a>
                    ) : (
                      <span className="text-xs text-muted italic">
                        Chưa có chứng chỉ
                      </span>
                    )}
                  </div>
                </div>
                {selectedPartner.status === "pending" && (
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        approvePartner(selectedPartner.id);
                        setSelectedPartner(null);
                      }}
                      className="flex-1 py-2.5 bg-green-500 text-white rounded-xl font-medium text-sm hover:bg-green-600 transition-colors"
                    >
                      Duyệt đăng ký
                    </button>
                    <button
                      onClick={() => {
                        rejectPartner(selectedPartner.id);
                        setSelectedPartner(null);
                      }}
                      className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-medium text-sm hover:bg-red-600 transition-colors"
                    >
                      Từ chối
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingPartner && (
          <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setEditingPartner(null)}
          >
            <div
              className="bg-surface rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h3 className="font-display font-bold text-lg text-text">
                  Sửa đăng ký #{editingPartner.id}
                </h3>
                <button
                  onClick={() => setEditingPartner(null)}
                  className="p-1.5 rounded-lg hover:bg-warm text-muted"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Loại hình
                  </label>
                  <select
                    value={editForm.businessType}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        businessType: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                  >
                    <option value="clinic">Phòng khám thú y</option>
                    <option value="shop">Cửa hàng thú cưng</option>
                    <option value="spa">Spa thú cưng</option>
                  </select>
                </div>
                <EditField
                  label="Tên shop / phòng khám"
                  value={editForm.shopName}
                  onChange={(v) => setEditForm((f) => ({ ...f, shopName: v }))}
                />
                <EditField
                  label="Tên chủ shop"
                  value={editForm.ownerName}
                  onChange={(v) => setEditForm((f) => ({ ...f, ownerName: v }))}
                />
                <EditField
                  label="Số điện thoại"
                  value={editForm.phone}
                  onChange={(v) => setEditForm((f) => ({ ...f, phone: v }))}
                  type="tel"
                />
                <EditField
                  label="Email"
                  value={editForm.email}
                  onChange={(v) => setEditForm((f) => ({ ...f, email: v }))}
                  type="email"
                />
                <EditField
                  label="Địa chỉ"
                  value={editForm.address}
                  onChange={(v) => setEditForm((f) => ({ ...f, address: v }))}
                />
                {editError && (
                  <p className="text-sm text-error bg-red-50 p-3 rounded-xl">
                    {editError}
                  </p>
                )}
                <button
                  onClick={saveEdit}
                  className="w-full py-2.5 bg-brand text-white rounded-xl font-medium text-sm hover:bg-brand-dark transition-colors"
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirm */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-surface rounded-2xl max-w-sm w-full p-6 text-center shadow-xl">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="font-display font-bold text-lg text-text mb-2">
                Xác nhận xóa
              </h3>
              <p className="text-sm text-muted mb-6">
                Bạn có chắc muốn xóa đăng ký của{" "}
                <strong>{deleteConfirm.shopName}</strong>?
                <br />
                Hành động này không thể hoàn tác.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium text-muted hover:bg-warm transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={deletePartner}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted mb-0.5">{label}</p>
      <p className="text-sm text-text font-medium">{value || "—"}</p>
    </div>
  );
}

function EditField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-text mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand/20"
      />
    </div>
  );
}
