import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft, Syringe, FileText } from "lucide-react";
import api from "../../services/api";
import type { RootState } from "../../store";

export default function PetDetail() {
  const { id } = useParams();
  const { token } = useSelector((s: RootState) => s.auth);
  const [pet, setPet] = useState<any>(null);

  useEffect(() => {
    if (token) api.get(`/pets/${id}`).then((r) => setPet(r.data.data));
  }, [id, token]);

  if (!pet)
    return (
      <div className="min-h-screen bg-warm flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-brand border-t-transparent rounded-full" />
      </div>
    );

  return (
    <div className="min-h-screen bg-warm font-body">
      <header className="bg-surface border-b border-border sticky top-0 z-40">
        <div className="container-max px-4 py-3 flex items-center gap-3">
          <Link
            to="/my-pets"
            className="p-2 rounded-lg hover:bg-warm text-muted"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-display font-bold text-lg text-text">
            {pet.name}
          </h1>
        </div>
      </header>
      <div className="container-max px-4 py-6 max-w-2xl mx-auto space-y-6">
        <div className="card p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 bg-brand/10 rounded-2xl flex items-center justify-center text-4xl">
              {pet.avatar || "🐾"}
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-text">
                {pet.name}
              </h2>
              <p className="text-muted">
                {pet.species}
                {pet.breed ? ` · ${pet.breed}` : ""}
              </p>
              {pet.weight && (
                <p className="text-sm text-muted">⚖️ {pet.weight}kg</p>
              )}
              {pet.birthDate && (
                <p className="text-sm text-muted">
                  🎂 {new Date(pet.birthDate).toLocaleDateString("vi-VN")}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-text flex items-center gap-2">
              <Syringe size={18} className="text-teal" /> Tiêm phòng
            </h3>
            <button className="text-brand text-sm font-medium">+ Thêm</button>
          </div>
          {pet.vaccinations?.length === 0 ? (
            <p className="text-sm text-muted">Chưa có lịch tiêm</p>
          ) : (
            pet.vaccinations?.map((v: any) => (
              <div
                key={v.id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-text">
                    {v.vaccineName}
                  </p>
                  <p className="text-xs text-muted">
                    {new Date(v.dateGiven).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                {v.nextDueDate && (
                  <span className="text-xs text-warning">
                    Nhắc: {new Date(v.nextDueDate).toLocaleDateString("vi-VN")}
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-text flex items-center gap-2">
              <FileText size={18} className="text-brand" /> Bệnh án
            </h3>
            <button className="text-brand text-sm font-medium">+ Thêm</button>
          </div>
          {pet.medicalRecords?.length === 0 ? (
            <p className="text-sm text-muted">Chưa có bệnh án</p>
          ) : (
            pet.medicalRecords?.map((r: any) => (
              <div
                key={r.id}
                className="py-2 border-b border-border last:border-0"
              >
                <p className="text-sm font-medium text-text">
                  {r.diagnosis || "Khám tổng quát"}
                </p>
                <p className="text-xs text-muted">
                  {new Date(r.recordDate).toLocaleDateString("vi-VN")}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
