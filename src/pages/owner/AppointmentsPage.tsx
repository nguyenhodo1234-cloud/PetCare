import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import api from '../../services/api';
import type { RootState } from '../../store';

interface Appt { id: number; dateTime: string; status: string; notes?: string; pet: { name: string }; service: { name: string }; }

const statusBadge: Record<string, string> = { PENDING: 'badge-pending', CONFIRMED: 'badge-confirmed', COMPLETED: 'badge-completed', CANCELLED: 'badge-cancelled' };
const statusLabel: Record<string, string> = { PENDING: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận', COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy' };

export default function AppointmentsPage() {
  const { token } = useSelector((s: RootState) => s.auth);
  const [apps, setApps] = useState<Appt[]>([]);
  useEffect(() => { if (token) api.get('/appointments').then(r => setApps(r.data.data)).catch(() => {}); }, [token]);

  return (
    <div className="min-h-screen bg-warm font-body">
      <header className="bg-surface border-b border-border sticky top-0 z-40">
        <div className="container-max px-4 py-3 flex items-center gap-3">
          <Link to="/dashboard" className="p-2 rounded-lg hover:bg-warm text-muted"><ArrowLeft size={20} /></Link>
          <h1 className="font-display font-bold text-lg text-text">📅 Lịch hẹn</h1>
        </div>
      </header>
      <div className="container-max px-4 py-6 max-w-2xl mx-auto">
        {apps.length === 0 ? (
          <div className="text-center py-20"><Calendar size={48} className="text-muted/30 mx-auto mb-4" /><p className="text-muted">Chưa có lịch hẹn nào</p></div>
        ) : apps.map(a => (
          <div key={a.id} className="card p-5 mb-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-teal/10 rounded-xl flex items-center justify-center text-xl">🐾</div>
                <div>
                  <h3 className="font-display font-bold text-text">{a.service.name}</h3>
                  <p className="text-sm text-muted">{a.pet.name}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge[a.status]}`}>{statusLabel[a.status]}</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted">
              <span className="flex items-center gap-1"><Calendar size={14} />{new Date(a.dateTime).toLocaleDateString('vi-VN')}</span>
              <span className="flex items-center gap-1"><Clock size={14} />{new Date(a.dateTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
