import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { ScoreDetailsModal } from './ScoreDetailsModal';
import { CheckCircle2, Eye, ShieldCheck, Check } from 'lucide-react';

export function PontuationReview() {
  const { schoolProfessores, validateProfessorScore } = useApp();

  const [selectedTeacherDetails, setSelectedTeacherDetails] = useState(null);
  const [justificationModal, setJustificationModal] = useState(null);
  const [justificationText, setJustificationText] = useState('');

  const handleOpenJustification = (teacher, status) => {
    setJustificationModal({ teacher, status });
    setJustificationText(teacher.justificativa_validacao || 'Pontuação e documentação conferidas com base nos anexos da Portaria nº 947/2025.');
  };

  const handleConfirmValidation = () => {
    if (justificationModal) {
      validateProfessorScore(justificationModal.teacher.id, justificationModal.status, justificationText);
      setJustificationModal(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Banner Informativo */}
      <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <ShieldCheck className="w-6 h-6 text-[#006633] dark:text-emerald-400 mt-0.5" />
          <div>
            <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-200">Conferência & Validação de Pontuação</h3>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
              O gestor escolar deve revisar cada pontuação calculada pelo sistema antes de iniciar a sala virtual de escolha.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="font-bold text-theme-main">Total Validado:</span>
          <span className="px-3 py-1 bg-theme-surface font-black text-[#006633] dark:text-emerald-400 rounded-xl border border-emerald-300 dark:border-emerald-800 shadow-xs">
            {schoolProfessores.filter((p) => p.status_validacao === 'validado').length} / {schoolProfessores.length}
          </span>
        </div>
      </div>

      {/* Tabela de Validação */}
      <div className="table-container bg-theme-surface shadow-xs overflow-hidden theme-transition">
        <table className="w-full text-left border-collapse table-zebra">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800/90 border-b border-theme text-[11px] font-extrabold text-theme-muted uppercase tracking-wider sticky top-0">
              <th className="py-3.5 px-4 text-center">Classif.</th>
              <th className="py-3.5 px-4">Professor</th>
              <th className="py-3.5 px-4">Pontuação Calculada</th>
              <th className="py-3.5 px-4">Status de Validação</th>
              <th className="py-3.5 px-4">Parecer do Gestor</th>
              <th className="py-3.5 px-4 text-center">Ações de Validação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-theme text-xs">
            {schoolProfessores.map((prof) => {
              const isValidated = prof.status_validacao === 'validado';
              return (
                <tr key={prof.id} className="transition-colors">
                  
                  <td className="py-3.5 px-4 text-center font-black text-theme-main">
                    #{prof.posicao_ranking}
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-bold text-theme-main">{prof.nome}</p>
                    <p className="text-[10px] text-theme-muted">CPF: {prof.cpf}</p>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-black text-sm text-[#006633] dark:text-emerald-400">
                      {Number(prof.pontuacao_total).toFixed(2)} pts
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge variant={isValidated ? 'green' : 'amber'}>
                      {isValidated ? 'Validado' : 'Pendente de Revisão'}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 max-w-xs text-theme-muted truncate">
                    {prof.justificativa_validacao || <span className="italic opacity-50">Sem parecer gravado</span>}
                  </td>

                  <td className="py-3.5 px-4 text-center space-x-2">
                    <button
                      onClick={() => setSelectedTeacherDetails(prof)}
                      className="px-2.5 py-1 text-[11px] font-bold text-theme-main bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Detalhes
                    </button>

                    <button
                      onClick={() => handleOpenJustification(prof, 'validado')}
                      className={`px-3 py-1 text-[11px] font-extrabold rounded-lg transition-colors inline-flex items-center gap-1 ${
                        isValidated
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-gradient-sme text-white shadow-xs hover:opacity-90'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> {isValidated ? 'Re-Validar' : 'Validar'}
                    </button>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal de Justificativa */}
      {justificationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-theme-surface rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-theme text-theme-main">
            <h3 className="text-base font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#006633] dark:text-emerald-400" /> Parecer de Validação de Pontuação
            </h3>
            <p className="text-xs text-theme-muted">
              Professor: <strong>{justificationModal.teacher.nome}</strong> ({Number(justificationModal.teacher.pontuacao_total).toFixed(2)} pts)
            </p>

            <div>
              <label className="block text-xs font-semibold text-theme-muted mb-1">Justificativa / Parecer do Gestor Escolar *</label>
              <textarea
                rows="3"
                value={justificationText}
                onChange={(e) => setJustificationText(e.target.value)}
                className="w-full text-xs p-2.5 border border-theme dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-[#006633]"
                placeholder="Informe o parecer de validação dos documentos..."
              ></textarea>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setJustificationModal(null)}
                className="px-4 py-2 text-xs font-bold text-theme-muted hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmValidation}
                className="px-5 py-2 text-xs font-bold text-white bg-gradient-sme rounded-xl shadow-md hover:opacity-95 flex items-center gap-1"
              >
                <Check className="w-4 h-4" /> Confirmar Validação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Memória de Cálculo */}
      <ScoreDetailsModal
        isOpen={Boolean(selectedTeacherDetails)}
        onClose={() => setSelectedTeacherDetails(null)}
        teacher={selectedTeacherDetails}
      />

    </div>
  );
}
