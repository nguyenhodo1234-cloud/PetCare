import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Plus, ArrowLeft, PawPrint } from 'lucide-react';
import api from '../../services/api';
import type { RootState } from '../../store';

interface Pet { id: number; name: string; species: string; breed?: string; avatar?: string; birthDate?: string; weight?: number; }

export default function MyPets() {
  const { token } = useSelector((s: RootState) => s.auth);
  const [pets, setPets] = useState<Pet[]>([]);

  useEffect(() => { if (token) api.get('/pets').then(r => setPets(r.data.data)).catch(() => {}); }, [token]);

  return (
    <div className="min-h-screen bg-warm font-body">
      <header className="bg-surface border-b border-border sticky top-0 z-40">
        <div className="container-max px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="p-2 rounded-lg hover:bg-warm text-muted"><ArrowLeft size={20} /></Link>
            <h1 className="font-display font-bold text-lg text-text">Thú cưng của tôi</h1>
          </div>
          <Link to="/my-pets/new" className="btn-brand text-sm !py-2 !px-4"><Plus size={16} /> Thêm thú cưng</Link>
        </div>
      </header>
      <div className="container-max px-4 py-6">
        {pets.length === 0 ? (
          <div className="text-center py-20">
            <PawPrint size={48} className="text-muted/30 mx-auto mb-4" />
            <p className="text-muted">Chưa có thú cưng nào</p>
            <Link to="/my-pets/new" className="btn-brand mt-4 inline-flex">Thêm thú cưng đầu tiên</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pets.map(p => (
              <Link key={p.id} to={`/my-pets/${p.id}`} className="card p-5 flex items-center gap-4 hover:-translate-y-1 transition-transform">
                <div className="w-14 h-14 bg-brand/10 rounded-xl flex items-center justify-center text-2xl">{p.avatar || '🐾'}</div>
                <div>
                  <h3 className="font-display font-bold text-text">{p.name}</h3>
                  <p className="text-sm text-muted">{p.species}{p.breed ? ` · ${p.breed}` : ''}</p>
                  {p.weight && <p className="text-xs text-muted">{p.weight}kg</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
