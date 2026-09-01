import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { TeacherFormModal } from './TeacherFormModal';
import { ScoreDetailsModal } from './ScoreDetailsModal';
import { Plus, Search, Eye, Edit3, Trash2, Star, Filter } from 'lucide-react';

export function TeacherList() {
  const { schoolProfessores, saveProfessor, deleteProfessor } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterVinculo, setFilterVinculo] = useState('todos');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTeacherEdit, setSelectedTeacherEdit] = useState(null);
  const [selectedTeacherDetails, setSelectedTeacherDetails] = useState(null);

  const filteredTeachers = schoolProfessores.filter((p) => {
    const matchesSearch =
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.cpf && p.cpf.includes(searchTerm));
    const matchesVinculo = filterVinculo === 'todos' || p.tipo_vinculo === filterVinculo;
    return matchesSearch && matchesVinculo;
  });

  const handleOpenEdit = (prof) => {
    setSelectedTeacherEdit(prof);
    setIsFormOpen(true);
  };

  const handleOpenNew = () => {
    setSelectedTeacherEdit(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Topo / Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-theme-surface p-4 rounded-2xl border border-theme shadow-xs theme-transition">
        <div className="flex items-center space-x-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-theme-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar professor por nome ou CPF..."
              className="w-full pl-9 pr-4 py-2.5 text-xs border border-theme dark:bg-slate-800/60 dark:text-white rounded-xl focus:ring-2 focus:ring-[#006633] focus:outline-hidden"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-theme-muted" />
            <select
              value={filterVinculo}
              onChange={(e) => setFilterVinculo(e.target.value)}
              className="text-xs py-2.5 px-3 border border-theme rounded-xl bg-theme-surface font-semibold text-theme-main"
            >
              <option value="todos">Todos os Vínculos</option>
              <option value="efetivo">Efetivos</option>
              <option value="contrato_temporario">Contrato Temporário</option>
              <option value="comissionado">Comissionados / SME</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-5 py-2.5 bg-gradient-sme text-white text-xs font-extrabold rounded-xl shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Cadastrar Professor
        </button>
      </div>

      {/* Tabela de Professores com Zebra Striping e Dark Mode */}
      <div className="table-container bg-theme-surface shadow-xs theme-transition overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-zebra">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/90 border-b border-theme text-[11px] font-extrabold text-theme-muted uppercase tracking-wider sticky top-0">
                <th className="py-3.5 px-4 text-center">Classif.</th>
                <th className="py-3.5 px-4">Professor / CPF</th>
                <th className="py-3.5 px-4">Vínculo & Carga</th>
                <th className="py-3.5 px-4">Prioridade AlfaMais</th>
                <th className="py-3.5 px-4 text-center">Faltas 2025</th>
                <th className="py-3.5 px-4 text-right">Pontuação Total</th>
                <th className="py-3.5 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme text-xs">
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map((prof) => {
                  const hasPriority = Number(prof.frequencia_alfamais_percentual) >= 90.0;
                  return (
                    <tr key={prof.id} className="transition-colors">
                      
                      {/* Ranking */}
                      <td className="py-3.5 px-4 text-center font-black">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-theme text-theme-main">
                          #{prof.posicao_ranking}
                        </span>
                      </td>

                      {/* Nome e CPF */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-theme-main text-sm">{prof.nome}</p>
                        <p className="text-[11px] text-theme-muted">CPF: {prof.cpf || 'Não informado'}</p>
                      </td>

                      {/* Vínculo */}
                      <td className="py-3.5 px-4 font-medium text-theme-main">
                        <p className="capitalize font-bold">{prof.tipo_vinculo.replace('_', ' ')}</p>
                        <p className="text-[10px] text-theme-muted">{prof.carga_horaria}h semanais</p>
                      </td>

                      {/* AlfaMais */}
                      <td className="py-3.5 px-4">
                        {hasPriority ? (
                          <Badge variant="green" className="flex items-center gap-1 w-fit">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            {prof.frequencia_alfamais_percentual}% AlfaMais
                          </Badge>
                        ) : (
                          <span className="text-theme-muted text-[11px]">
                            {prof.frequencia_alfamais_percentual}% (Sem Prioridade)
                          </span>
                        )}
                      </td>

                      {/* Faltas */}
                      <td className="py-3.5 px-4 text-center font-bold">
                        {prof.faltas_injustificadas_2025 > 0 ? (
                          <span className="text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                            {prof.faltas_injustificadas_2025} falta(s)
                          </span>
                        ) : (
                          <span className="text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                            0 faltas
                          </span>
                        )}
                      </td>

                      {/* Pontuação */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-sm font-black text-[#006633] dark:text-emerald-400">
                          {Number(prof.pontuacao_total || 0).toFixed(2)} pts
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 px-4 text-center space-x-1">
                        <button
                          onClick={() => setSelectedTeacherDetails(prof)}
                          title="Ver memória de cálculo"
                          className="p-1.5 text-theme-muted hover:text-[#003399] dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(prof)}
                          title="Editar cadastro"
                          className="p-1.5 text-theme-muted hover:text-[#006633] dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Confirma a exclusão do professor ${prof.nome}?`)) {
                              deleteProfessor(prof.id);
                            }
                          }}
                          title="Excluir professor"
                          className="p-1.5 text-theme-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-theme-muted text-sm">
                    Nenhum professor encontrado para os critérios selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Formulário */}
      <TeacherFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={saveProfessor}
        teacherToEdit={selectedTeacherEdit}
      />

      {/* Modal de Memória de Cálculo */}
      <ScoreDetailsModal
        isOpen={Boolean(selectedTeacherDetails)}
        onClose={() => setSelectedTeacherDetails(null)}
        teacher={selectedTeacherDetails}
      />

    </div>
  );
}
