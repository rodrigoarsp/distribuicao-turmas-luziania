import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { ClassFormModal } from './ClassFormModal';
import { Plus, BookOpen, Sun, Moon, Sunset, Star, Edit3, Trash2, AlertCircle } from 'lucide-react';

export function ClassList() {
  const { schoolTurmas, schoolEscolhas, schoolProfessores, saveTurma, deleteTurma } = useApp();

  const [activeTurno, setActiveTurno] = useState('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  const filteredTurmas = schoolTurmas.filter((t) => activeTurno === 'todos' || t.turno === activeTurno);

  const handleOpenEdit = (turma) => {
    setEditingClass(turma);
    setIsModalOpen(true);
  };

  const handleOpenNew = () => {
    setEditingClass(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Topo / Filtros por Turno */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-theme-surface p-4 rounded-2xl border border-theme shadow-xs theme-transition">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTurno('todos')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTurno === 'todos' ? 'bg-slate-800 dark:bg-slate-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-theme-muted hover:bg-slate-200'
            }`}
          >
            Todos os Turnos ({schoolTurmas.length})
          </button>
          <button
            onClick={() => setActiveTurno('matutino')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTurno === 'matutino' ? 'bg-[#006633] text-white' : 'bg-slate-100 dark:bg-slate-800 text-theme-muted hover:bg-slate-200'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-400" /> Matutino
          </button>
          <button
            onClick={() => setActiveTurno('vespertino')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTurno === 'vespertino' ? 'bg-[#003399] text-white' : 'bg-slate-100 dark:bg-slate-800 text-theme-muted hover:bg-slate-200'
            }`}
          >
            <Sunset className="w-3.5 h-3.5 text-orange-400" /> Vespertino
          </button>
          <button
            onClick={() => setActiveTurno('noturno')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTurno === 'noturno' ? 'bg-purple-800 text-white' : 'bg-slate-100 dark:bg-slate-800 text-theme-muted hover:bg-slate-200'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-indigo-300" /> Noturno
          </button>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-5 py-2 bg-gradient-sme text-white text-xs font-extrabold rounded-xl shadow-md hover:opacity-95 flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Cadastrar Turma
        </button>
      </div>

      {/* Grid de Cards de Turmas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTurmas.length > 0 ? (
          filteredTurmas.map((turma) => {
            const escolha = schoolEscolhas.find((e) => e.turma_id === turma.id);
            const professorOcupante = escolha ? schoolProfessores.find((p) => p.id === escolha.professor_id) : null;
            const isOcupada = turma.status === 'ocupada' || Boolean(escolha);

            return (
              <div
                key={turma.id}
                className={`card-modern p-5 flex flex-col justify-between ${
                  isOcupada ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/20' : ''
                }`}
              >
                <div>
                  
                  {/* Topo do Card */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-theme-muted flex items-center gap-1">
                      {turma.turno === 'matutino' && <Sun className="w-3.5 h-3.5 text-amber-500" />}
                      {turma.turno === 'vespertino' && <Sunset className="w-3.5 h-3.5 text-orange-500" />}
                      {turma.turno === 'noturno' && <Moon className="w-3.5 h-3.5 text-indigo-500" />}
                      {turma.turno}
                    </span>

                    <div className="flex items-center space-x-1.5">
                      {turma.eh_alfamais && (
                        <Badge variant="green" className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> AlfaMais
                        </Badge>
                      )}
                      <Badge variant={isOcupada ? 'blue' : 'amber'}>
                        {isOcupada ? 'Ocupada' : 'Disponível'}
                      </Badge>
                    </div>
                  </div>

                  {/* Nome da Turma */}
                  <h4 className="text-base font-extrabold text-theme-main mb-1 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#006633] dark:text-emerald-400" /> {turma.descricao}
                  </h4>
                  <p className="text-xs text-theme-muted mb-4">
                    Etapa: <strong className="capitalize">{turma.tipo === 'creche_1_4' ? 'Creche 1 ao 4' : turma.tipo.replace(/_/g, ' ')}</strong> • Ano Letivo: {turma.ano_letivo}
                  </p>

                  {/* Status de Ocupação */}
                  {isOcupada && professorOcupante ? (
                    <div className="bg-emerald-50 dark:bg-emerald-950/50 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-300 mb-2">
                      <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-0.5">
                        Turma Escolhida Por:
                      </p>
                      <p className="font-extrabold text-sm">{professorOcupante.nome}</p>
                      <p className="text-[11px] opacity-80">
                        Classificação #{professorOcupante.posicao_ranking} ({Number(professorOcupante.pontuacao_total).toFixed(2)} pts)
                      </p>
                    </div>
                  ) : (
                    <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-theme text-xs text-theme-muted mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      <span>Aguardando chamada na sessão de escolha.</span>
                    </div>
                  )}

                </div>

                {/* Ações */}
                <div className="border-t border-theme pt-3 mt-2 flex items-center justify-end space-x-2 text-xs">
                  <button
                    onClick={() => handleOpenEdit(turma)}
                    className="p-1.5 text-theme-muted hover:text-[#006633] dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 font-bold"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Editar
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Confirma a exclusão da turma ${turma.descricao}?`)) {
                        deleteTurma(turma.id);
                      }
                    }}
                    className="p-1.5 text-theme-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })
        ) : (
          <div className="col-span-full bg-theme-surface p-8 text-center rounded-2xl border border-theme text-theme-muted text-sm">
            Nenhuma turma cadastrada para este turno.
          </div>
        )}
      </div>

      {/* Modal Form */}
      <ClassFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={saveTurma}
        classToEdit={editingClass}
      />

    </div>
  );
}
