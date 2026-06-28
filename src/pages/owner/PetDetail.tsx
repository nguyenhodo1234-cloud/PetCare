import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft, Syringe, FileText, X, ChevronRight } from "lucide-react";
import api from "../../services/api";
import type { RootState } from "../../store";

export default function PetDetail() {
  const { id } = useParams();
  const { token } = useSelector((s: RootState) => s.auth);
  const [pet, setPet] = useState<any>(null);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

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
          <h3 className="font-display font-bold text-text flex items-center gap-2 mb-4">
            <FileText size={18} className="text-brand" /> Bệnh án
          </h3>
          {pet.medicalRecords?.length === 0 ? (
            <p className="text-sm text-muted">Chưa có bệnh án</p>
          ) : (
            pet.medicalRecords?.map((r: any) => (
              <button
                key={r.id}
                onClick={() => setSelectedRecord(r)}
                className="w-full text-left py-3 border-b border-border last:border-0 hover:bg-warm/50 transition-colors rounded-lg px-2 -mx-2"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-text">
                    {r.diagnosis || "Khám tổng quát"}
                  </p>
                  <ChevronRight size={14} className="text-muted shrink-0" />
                </div>
                <div className="flex items-center gap-3 text-xs text-muted">
                  <span>
                    {new Date(r.recordDate).toLocaleDateString("vi-VN")}
                  </span>
                  {r.vet && <span>👨‍⚕️ BS. {r.vet.name}</span>}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Medical Record Detail Modal */}
      {selectedRecord && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setSelectedRecord(null)}
        >
          <div
            className="bg-surface rounded-3xl max-w-md w-full max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-text">
                📋 Chi tiết bệnh án
              </h3>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 rounded-xl hover:bg-warm text-muted"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-warm rounded-2xl p-4">
                <p className="text-xs text-muted mb-1">Chẩn đoán</p>
                <p className="text-text font-semibold">
                  {selectedRecord.diagnosis || "Khám tổng quát"}
                </p>
              </div>
              {selectedRecord.treatment && (
                <div className="bg-warm rounded-2xl p-4">
                  <p className="text-xs text-muted mb-1">Điều trị</p>
                  <p className="text-text">{selectedRecord.treatment}</p>
                </div>
              )}
              {selectedRecord.notes && (
                <div className="bg-warm rounded-2xl p-4">
                  <p className="text-xs text-muted mb-1">Ghi chú</p>
                  <p className="text-text">{selectedRecord.notes}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                {selectedRecord.vet && (
                  <div className="bg-warm rounded-2xl p-4">
                    <p className="text-xs text-muted mb-1">Bác sĩ</p>
                    <p className="text-text font-medium">
                      👨‍⚕️ BS. {selectedRecord.vet.name}
                    </p>
                  </div>
                )}
                <div className="bg-warm rounded-2xl p-4">
                  <p className="text-xs text-muted mb-1">Ngày khám</p>
                  <p className="text-text font-medium">
                    {new Date(selectedRecord.recordDate).toLocaleDateString(
                      "vi-VN",
                    )}
                  </p>
                </div>
              </div>
              {selectedRecord.files?.length > 0 && (
                <div>
                  <p className="text-xs text-muted mb-2 font-medium">
                    📎 File đính kèm
                  </p>
                  <div className="space-y-2">
                    {selectedRecord.files.map((f: any) => (
                      <a
                        key={f.fileName}
                        href={f.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 p-3 bg-warm rounded-xl hover:bg-brand/5 transition-colors"
                      >
                        <FileText size={18} className="text-brand" />
                        <span className="text-sm text-text">{f.fileName}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
