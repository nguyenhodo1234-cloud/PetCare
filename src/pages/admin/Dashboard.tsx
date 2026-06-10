import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Users, Building2, Calendar, TrendingUp, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import type { RootState } from '../../store';

export default function AdminDashboard() {
  const { user } = useSelector((s: RootState) => s.auth);
  const [stats, setStats] = useState({ users: 0, appointments: 0, shops: 0 });
  const [allUsers, setAllUsers] = useState<any[]>([]);
  useEffect(() => { api.get('/admin/stats').then(r => setStats(r.data.data)); api.get('/admin/users').then(r => setAllUsers(r.data.data)); }, []);

  const toggleStatus = async (id: number, status: string) => {
    await api.patch(`/admin/users/${id}/status`, { status });
    setAllUsers(p => p.map(u => u.id === id ? { ...u, status } : u));
  };

  return (
    <div className="min-h-screen bg-warm font-body">
      <header className="bg-surface border-b border-border sticky top-0 z-40">
        <div className="container-max px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="p-2 rounded-lg hover:bg-warm text-muted"><ArrowLeft size={20} /></Link>
            <h1 className="font-display font-bold text-lg text-text">⚙️ Admin Dashboard</h1>
          </div>
          <span className="text-xs bg-brand/10 text-brand px-3 py-1 rounded-full font-medium">{user?.name}</span>
        </div>
      </header>
      <div className="container-max px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[{ icon: Users, label: 'Người dùng', value: stats.users, color: 'bg-brand/10 text-brand' },{ icon: Building2, label: 'Cửa hàng', value: stats.shops, color: 'bg-teal/10 text-teal' },{ icon: Calendar, label: 'Lịch hẹn', value: stats.appointments, color: 'bg-blue-100 text-blue-600' },{ icon: TrendingUp, label: 'Tăng trưởng', value: '+12%', color: 'bg-green-100 text-green-600' }].map((s,i) => (
            <div key={i} className="card p-5"><div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center mb-3`}><s.icon size={20} /></div><p className="text-2xl font-display font-bold text-text">{s.value}</p><p className="text-xs text-muted">{s.label}</p></div>
          ))}
        </div>
        <div className="card">
          <div className="p-4 border-b border-border"><h2 className="font-display font-bold text-text">Quản lý người dùng</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-warm/50 text-muted text-xs uppercase"><tr><th className="px-4 py-3 text-left">ID</th><th className="px-4 py-3 text-left">Tên</th><th className="px-4 py-3 text-left">Email</th><th className="px-4 py-3 text-left">Vai trò</th><th className="px-4 py-3 text-left">Trạng thái</th><th className="px-4 py-3 text-left">Hành động</th></tr></thead>
              <tbody className="divide-y divide-border">
                {allUsers.map(u => (
                  <tr key={u.id} className="hover:bg-warm/30">
                    <td className="px-4 py-3 text-text font-mono text-xs">#{u.id}</td>
                    <td className="px-4 py-3 text-text font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-muted">{u.email}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role==='ADMIN'?'bg-purple-100 text-purple-700':u.role==='VET'?'bg-teal/10 text-teal':u.role==='SHOP_OWNER'?'bg-orange-100 text-orange-700':'bg-blue-100 text-blue-700'}`}>{u.role}</span></td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.status==='ACTIVE'?'badge-active':u.status==='BANNED'?'badge-cancelled':'bg-gray-100 text-gray-600'}`}>{u.status}</span></td>
                    <td className="px-4 py-3">{u.role!=='ADMIN'&&<button onClick={()=>toggleStatus(u.id,u.status==='ACTIVE'?'BANNED':'ACTIVE')} className={`text-xs font-medium px-3 py-1 rounded-lg transition-colors ${u.status==='ACTIVE'?'bg-red-50 text-red-600 hover:bg-red-100':'bg-green-50 text-green-600 hover:bg-green-100'}`}>{u.status==='ACTIVE'?'Khóa':'Mở khóa'}</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
