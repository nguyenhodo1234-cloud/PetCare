import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../../services/api';

export default function AddPet() {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', species: '', breed: '', weight: '', birthDate: '', notes: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.species) return;
    setLoading(true);
    await api.post('/pets', { ...form, weight: form.weight ? +form.weight : null });
    nav('/my-pets');
  };

  return (
    <div className="min-h-screen bg-warm font-body">
      <header className="bg-surface border-b border-border sticky top-0 z-40">
        <div className="container-max px-4 py-3 flex items-center gap-3">
          <Link to="/my-pets" className="p-2 rounded-lg hover:bg-warm text-muted"><ArrowLeft size={20} /></Link>
          <h1 className="font-display font-bold text-lg text-text">Thêm thú cưng mới</h1>
        </div>
      </header>
      <div className="container-max px-4 py-6 max-w-md mx-auto">
        <form onSubmit={submit} className="card p-6 space-y-4">
          {[{l:'Tên thú cưng *',k:'name',t:'text',p:'Bé Miu'},{l:'Loài *',k:'species',t:'text',p:'Chó / Mèo / Chim...'},{l:'Giống',k:'breed',t:'text',p:'Golden, Corgi...'},{l:'Cân nặng (kg)',k:'weight',t:'number',p:'5.5'},{l:'Ngày sinh',k:'birthDate',t:'date',p:''},{l:'Ghi chú',k:'notes',t:'text',p:'Ghi chú thêm...'}].map(f => (
            <div key={f.k}>
              <label className="block text-sm font-medium text-text mb-1">{f.l}</label>
              <input type={f.t} value={(form as any)[f.k]} onChange={e => setForm({ ...form, [f.k]: e.target.value })} placeholder={f.p}
                className="w-full px-4 py-2.5 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/30 text-text placeholder-muted" />
            </div>
          ))}
          <button type="submit" disabled={loading} className="w-full btn-brand justify-center">
            <Save size={18} /> {loading ? 'Đang lưu...' : 'Lưu thú cưng'}
          </button>
        </form>
      </div>
    </div>
  );
}
