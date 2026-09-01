import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  BookOpen, 
  Sun, 
  Moon, 
  Sunset, 
  Star, 
  ArrowDownRight,
  RefreshCw,
  Trash2,
  Lock,
  Unlock,
  Check,
  AlertTriangle,
  ArrowRightLeft
} from 'lucide-react';

export function ChoiceSession() {
  const { 
    currentSchool, 
    schoolProfessores, 
    schoolTurmas, 
    schoolEscolhas, 
    callQueueInfo,
    abdicaramAlfaMais,
    recordChoice, 
    changeTeacherClass,
    cancelChoice, 
    declineAlfaMaisPriority,
    finalizeSchoolProcess,
    reopenSchoolProcess 
  } = useApp();

  const [selectedTurnoFilter, setSelectedTurnoFilter] = useState('matutino');
  const [confirmModal, setConfirmModal] = useState(null); // { teacher, turma }
  const [changeModal, setChangeModal] = useState(null); // { escolha, prof }
  const [declineConfirmModal, setDeclineConfirmModal] = useState(null); // teacher
  const [deleteChoiceModal, setDeleteChoiceModal] = useState(null); // { escolha, prof, turma }
  const [selectedNewTurmaId, setSelectedNewTurmaId] = useState('');
  const [isFinalizeConfirmOpen, setIsFinalizeConfirmOpen] = useState(false);

  const { prioGroup, generalGroup, fullCallQueue, alreadyChosen, allAlfaMaisTaken } = callQueueInfo;

  const isConcluido = currentSchool?.status_processo === 'concluido';
  const currentPickingTeacher = fullCallQueue[0] || null;
  const isAlfaMaisPriorityTurn = currentPickingTeacher && prioGroup.some((p) => p.id === currentPickingTeacher.id);

  // Turmas disponíveis filtradas
  const availableTurmas = schoolTurmas.filter((t) => {
    const ocupada = schoolEscolhas.some((e) => e.turma_id === t.id);
    const bateTurno = selectedTurnoFilter === 'todos' || t.turno === selectedTurnoFilter;
    return !ocupada && bateTurno;
  });

  const totalProfessores = schoolProfessores.length;
  const totalEscolhas = schoolEscolhas.length;
  const progressoPercent = totalProfessores > 0 ? Math.round((totalEscolhas / totalProfessores) * 100) : 0;

  const handleOpenConfirm = (turma) => {
    if (!currentPickingTeacher || isConcluido) return;
    setConfirmModal({
      teacher: currentPickingTeacher,
      turma
    });
  };

  const handleExecuteChoice = () => {
    if (!confirmModal) return;
    const { teacher, turma } = confirmModal;
    recordChoice(teacher.id, turma.id, turma.turno, teacher.posicao_ranking);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    setConfirmModal(null);
  };

  const handleExecuteDeclinePriority = () => {
    if (declineConfirmModal) {
      declineAlfaMaisPriority(declineConfirmModal.id);
      setDeclineConfirmModal(null);
    }
  };

  const handleExecuteDeleteChoice = () => {
    if (deleteChoiceModal) {
      cancelChoice(deleteChoiceModal.escolha.id);
      setDeleteChoiceModal(null);
    }
  };

  const handleOpenChangeModal = (escolha, prof) => {
    setChangeModal({ escolha, prof });
    setSelectedNewTurmaId('');
  };

  const handleExecuteClassChange = () => {
    if (changeModal && selectedNewTurmaId) {
      changeTeacherClass(changeModal.escolha.id, selectedNewTurmaId);
      setChangeModal(null);
      confetti({ particleCount: 50, spread: 50 });
    }
  };

  const handleFinalizeProcess = () => {
    finalizeSchoolProcess(currentSchool.id);
    setIsFinalizeConfirmOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Banner Principal da Sala Virtual */}
      <div className="bg-gradient-sme text-white p-6 rounded-3xl shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
            </span>
            <span className="text-xs uppercase font-black tracking-wider text-emerald-200">
              SESSÃO DE ESCOLHA EM TEMPO REAL - PORTARIA Nº 947/2025
            </span>
          </div>
          <h2 className="text-2xl font-black">{currentSchool?.nome}</h2>
          <p className="text-xs text-slate-200 mt-1">
            Data Agendada: 19/12/2025 • Progresso: <strong>{totalEscolhas} de {totalProfessores}</strong> escolhas concluídas ({progressoPercent}%)
          </p>
        </div>

        {/* Ação Principal: Encerrar Sessão vs Reabrir */}
        <div className="flex items-center space-x-3">
          {isConcluido ? (
            <div className="flex items-center space-x-2">
              <div className="bg-emerald-950/80 px-4 py-2 rounded-xl text-xs border border-emerald-500 font-bold flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" /> Sessão Encerrada & Homologada
              </div>
              <button
                onClick={() => reopenSchoolProcess(currentSchool.id)}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                title="Reabrir sessão para permitir trocas de turma pelo gestor"
              >
                <Unlock className="w-3.5 h-3.5" /> Reabrir p/ Ajustes
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsFinalizeConfirmOpen(true)}
              className="px-6 py-3 bg-emerald-400 text-slate-950 font-black rounded-xl shadow-lg hover:bg-emerald-300 transition-all flex items-center gap-2 text-xs uppercase tracking-wider"
            >
              <CheckCircle2 className="w-4 h-4 text-slate-950" /> Encerrar & Homologar Sessão
            </button>
          )}
        </div>
      </div>

      {/* Aviso de Troca Permitida Antes do Encerramento */}
      {!isConcluido && (
        <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 p-4 rounded-2xl flex items-center justify-between text-xs text-blue-900 dark:text-blue-200">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 text-[#003399] dark:text-blue-400 flex-shrink-0" />
            <span>
              <strong>Ajustes permitidos antes do encerramento:</strong> O gestor pode realizar a troca de turma de um professor ou excluir a escolha para liberá-la novamente.
            </span>
          </div>
        </div>
      )}

      {/* Aviso de Fila de Prioridade AlfaMais Finalizada */}
      {allAlfaMaisTaken && (
        <div className="bg-amber-500/10 border border-amber-500/40 p-3.5 rounded-2xl flex items-center gap-3 text-xs text-amber-800 dark:text-amber-300 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <p className="font-extrabold text-xs">Fila de Prioridade AlfaMais Concluída</p>
            <p className="text-[11px] opacity-90">
              Todas as turmas abrangidas pelo programa AlfaMais (Pré I, II, 1º e 2º Ano) já foram preenchidas nesta escola. Os professores prioritários retornaram automaticamente para a <strong>Fila Geral por Pontuação</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Card em Destaque: É A VEZ DO PROFESSOR */}
      {!isConcluido && currentPickingTeacher ? (
        <div className={`card-modern p-6 flex flex-col md:flex-row items-center justify-between gap-6 transition-all ${
          isAlfaMaisPriorityTurn ? 'border-amber-500 bg-amber-50/20 dark:bg-amber-950/20' : 'border-[#006633] dark:border-emerald-500'
        }`}>
          <div className="flex items-center space-x-4">
            <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center font-black text-xl shadow-inner ${
              isAlfaMaisPriorityTurn ? 'bg-amber-100 dark:bg-amber-900/60 border-amber-500 text-amber-800 dark:text-amber-300' : 'bg-emerald-100 dark:bg-emerald-950 border-[#006633] text-[#006633] dark:text-emerald-400'
            }`}>
              #{currentPickingTeacher.posicao_ranking}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] uppercase font-extrabold tracking-wider text-theme-muted">
                  ► É A VEZ DE ESCOLHER A TURMA:
                </span>
                {isAlfaMaisPriorityTurn && (
                  <Badge variant="amber" className="flex items-center gap-1 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-600" /> CHAMADA DA PRIORIDADE ALFA MAIS (ART. 4º)
                  </Badge>
                )}
              </div>
              
              <h3 className="text-xl font-black text-theme-main mt-0.5">{currentPickingTeacher.nome}</h3>
              <div className="flex flex-wrap items-center gap-3 text-xs text-theme-muted mt-1 font-medium">
                <span>Carga: <strong>{currentPickingTeacher.carga_horaria}h</strong></span>
                <span>•</span>
                <span>Pontuação: <strong className="text-[#006633] dark:text-emerald-400 font-bold">{Number(currentPickingTeacher.pontuacao_total).toFixed(2)} pts</strong></span>
                <span>•</span>
                <span>AlfaMais: <strong>{currentPickingTeacher.frequencia_alfamais_percentual}%</strong></span>
              </div>

              {isAlfaMaisPriorityTurn && (
                <p className="text-[11px] text-amber-800 dark:text-amber-300 font-semibold mt-1.5 bg-amber-100/60 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-300/60 dark:border-amber-800/60 w-fit">
                  ⚠️ Chamada de Prioridade: Escolha restrita às turmas AlfaMais (Pré I, II, 1º e 2º Ano). Para escolher outros anos, clique em "Abrir mão da Prioridade".
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            {isAlfaMaisPriorityTurn && (
              <button
                onClick={() => setDeclineConfirmModal(currentPickingTeacher)}
                className="px-4 py-2.5 bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 hover:bg-amber-200 border border-amber-300 dark:border-amber-800 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <ArrowDownRight className="w-4 h-4 text-amber-700" /> Abrir mão da Prioridade (Ir p/ Fila Geral)
              </button>
            )}
          </div>
        </div>
      ) : isConcluido ? (
        <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 text-center">
          <CheckCircle2 className="w-12 h-12 text-[#006633] dark:text-emerald-400 mx-auto mb-2" />
          <h3 className="text-lg font-bold text-emerald-950 dark:text-emerald-200">Sessão de Escolha Encerrada e Homologada!</h3>
          <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1">
            As escolhas foram travadas. Acesse a aba <strong>Ata Final (ANEXO I)</strong> para emitir o documento oficial assinado.
          </p>
        </div>
      ) : null}

      {/* Grid Principal: Turmas Disponíveis vs Histórico de Escolhas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Turmas Ofertadas */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between bg-theme-surface p-4 rounded-2xl border border-theme shadow-xs theme-transition">
            <h4 className="text-sm font-bold text-theme-main flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#003399] dark:text-blue-400" /> Turmas Disponíveis Ofertadas
            </h4>

            <div className="flex items-center space-x-1.5 text-xs">
              <button
                onClick={() => setSelectedTurnoFilter('matutino')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
                  selectedTurnoFilter === 'matutino' ? 'bg-[#006633] text-white' : 'bg-slate-100 dark:bg-slate-800 text-theme-muted'
                }`}
              >
                <Sun className="w-3.5 h-3.5" /> Matutino
              </button>
              <button
                onClick={() => setSelectedTurnoFilter('vespertino')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
                  selectedTurnoFilter === 'vespertino' ? 'bg-[#003399] text-white' : 'bg-slate-100 dark:bg-slate-800 text-theme-muted'
                }`}
              >
                <Sunset className="w-3.5 h-3.5" /> Vespertino
              </button>
              <button
                onClick={() => setSelectedTurnoFilter('noturno')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  selectedTurnoFilter === 'noturno' ? 'bg-purple-800 text-white' : 'bg-slate-100 dark:bg-slate-800 text-theme-muted'
                }`}
              >
                <Moon className="w-3.5 h-3.5" /> Noturno
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {availableTurmas.length > 0 ? (
              availableTurmas.map((turma) => {
                const isTurmaAlfaMais = Boolean(
                  turma.eh_alfamais || 
                  ['pre_1', 'pre_2', '1_ano', '2_ano'].includes(turma.tipo) || 
                  turma.tipo?.includes('1_ano') || 
                  turma.tipo?.includes('2_ano') || 
                  turma.tipo?.includes('pre') ||
                  turma.descricao?.includes('1º') || 
                  turma.descricao?.includes('2º') || 
                  turma.descricao?.toLowerCase().includes('pré')
                );

                const isBlockedByAlfaMaisPriority = isAlfaMaisPriorityTurn && !isTurmaAlfaMais;
                const isButtonDisabled = !currentPickingTeacher || isConcluido || isBlockedByAlfaMaisPriority;

                return (
                  <div
                    key={turma.id}
                    className={`card-modern p-5 flex flex-col justify-between transition-all ${
                      isTurmaAlfaMais ? 'border-emerald-300 dark:border-emerald-800 shadow-xs' : ''
                    } ${isBlockedByAlfaMaisPriority ? 'opacity-70 bg-slate-100/50 dark:bg-slate-900/40 border-amber-300/40 dark:border-amber-900/40' : ''}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2 gap-1.5 flex-wrap">
                        <span className="text-[10px] uppercase font-extrabold text-theme-muted flex items-center gap-1">
                          {turma.turno}
                        </span>
                        {isTurmaAlfaMais ? (
                          <Badge variant="green" className="flex items-center gap-1 text-[10px]">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Turma Prioritária AlfaMais
                          </Badge>
                        ) : isAlfaMaisPriorityTurn ? (
                          <span className="text-[10px] text-amber-800 dark:text-amber-300 font-semibold bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                            ⛔ Exclusiva Fila Geral
                          </span>
                        ) : null}
                      </div>

                      <h4 className="text-base font-extrabold text-theme-main">{turma.descricao}</h4>
                      <p className="text-xs text-theme-muted mb-4">Etapa: <strong className="capitalize">{turma.tipo === 'creche_1_4' ? 'Creche 1 ao 4' : turma.tipo.replace(/_/g, ' ')}</strong></p>
                    </div>

                    <button
                      disabled={isButtonDisabled}
                      onClick={() => handleOpenConfirm(turma)}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 ${
                        isButtonDisabled
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700'
                          : 'bg-gradient-sme text-white hover:opacity-95 cursor-pointer'
                      }`}
                    >
                      {isBlockedByAlfaMaisPriority ? (
                        <>
                          <Lock className="w-4 h-4 text-amber-500" /> Restrita (Abra mão da Prioridade acima)
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> Selecionar Turma Para {currentPickingTeacher ? currentPickingTeacher.nome.split(' ')[0] : ''}
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full bg-theme-surface p-8 text-center rounded-2xl border border-theme text-theme-muted text-sm">
                Nenhuma turma disponível no turno {selectedTurnoFilter}.
              </div>
            )}
          </div>
        </div>

        {/* Fila de Chamada e Escolhas Realizadas com Ações de Troca/Exclusão */}
        <div className="space-y-4">
          <div className="bg-theme-surface p-4 rounded-2xl border border-theme shadow-xs space-y-4 theme-transition">
            
            {/* Bloco 1: Escolhas Já Concluídas (Permite Trocar ou Excluir Escolha) */}
            {alreadyChosen.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-theme-main uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Escolhas Efetuadas ({alreadyChosen.length})</span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400">Troca permitida antes do fim</span>
                </h4>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {alreadyChosen.map((prof) => {
                    const escolha = schoolEscolhas.find((e) => e.professor_id === prof.id);
                    const turmaEscolhida = schoolTurmas.find((t) => t.id === escolha?.turma_id);

                    return (
                      <div
                        key={prof.id}
                        className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-theme rounded-xl text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-theme-main">#{prof.posicao_ranking} {prof.nome}</span>
                          <span className="text-[11px] font-bold text-[#006633] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                            ✓ {turmaEscolhida?.descricao}
                          </span>
                        </div>

                        {/* Botões de Ação para Troca ou Exclusão da Escolha */}
                        {!isConcluido && escolha && (
                          <div className="flex items-center justify-end space-x-2 pt-1 border-t border-theme">
                            <button
                              onClick={() => handleOpenChangeModal(escolha, prof)}
                              className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950 text-[#003399] dark:text-blue-300 hover:bg-blue-100 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1"
                              title="Trocar este professor para outra turma disponível"
                            >
                              <RefreshCw className="w-3 h-3" /> Trocar Turma
                            </button>
                            <button
                              onClick={() => setDeleteChoiceModal({ escolha, prof, turma: turmaEscolhida })}
                              className="px-2.5 py-1 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 hover:bg-red-100 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                              title="Excluir a escolha e liberar a turma"
                            >
                              <Trash2 className="w-3 h-3" /> Excluir Escolha
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bloco 2: Fila Geral por Classificação */}
            <div>
              <h4 className="text-xs font-bold text-theme-muted uppercase tracking-wider mb-2">
                Aguardando Chamada ({generalGroup.length + prioGroup.length})
              </h4>

              <div className="space-y-1.5 max-h-[250px] overflow-y-auto pr-1">
                {fullCallQueue.map((prof) => {
                  const isCurrent = currentPickingTeacher?.id === prof.id;

                  return (
                    <div
                      key={prof.id}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                        isCurrent
                          ? 'border-[#006633] dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 shadow-xs ring-2 ring-[#006633]/20 font-bold'
                          : 'border-theme bg-theme-surface text-theme-main'
                      }`}
                    >
                      <span className="font-bold text-theme-main">
                        #{prof.posicao_ranking} {prof.nome}
                      </span>
                      <span className="font-black text-theme-main">{Number(prof.pontuacao_total).toFixed(1)} pts</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Modal para Troca de Turma pelo Gestor (Troca Vaga ou Permuta com outro Professor) */}
      {changeModal && (() => {
        const currentTurmaObj = schoolTurmas.find((t) => t.id === changeModal.escolha.turma_id);

        // Turmas Vagas
        const vagasTurmas = schoolTurmas.filter(
          (t) => !schoolEscolhas.some((e) => e.turma_id === t.id)
        );

        // Turmas Ocupadas por outros Professores (Permuta)
        const ocupadasOutros = schoolTurmas.filter(
          (t) => schoolEscolhas.some((e) => e.turma_id === t.id && e.professor_id !== changeModal.prof.id)
        );

        const selectedTargetEscolha = schoolEscolhas.find((e) => e.turma_id === selectedNewTurmaId);
        const selectedTargetProf = schoolProfessores.find((p) => p.id === selectedTargetEscolha?.professor_id);
        const selectedTurmaObj = schoolTurmas.find((t) => t.id === selectedNewTurmaId);
        const isPermuta = Boolean(selectedTargetProf);

        return (
          <Modal
            isOpen={Boolean(changeModal)}
            onClose={() => setChangeModal(null)}
            title={`Trocar Turma do(a) Professor(a): ${changeModal.prof.nome}`}
            maxWidth="max-w-md"
          >
            <div className="space-y-4 text-theme-main">
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-theme text-xs space-y-1">
                <p>
                  Turma Atual: <strong className="text-amber-600 font-bold">{currentTurmaObj?.descricao || 'Não definida'}</strong> ({currentTurmaObj?.turno?.toUpperCase()})
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  Selecione uma turma vaga ou a turma de outro professor para realizar uma <strong>permuta (troca direta)</strong>:
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Selecione a Nova Turma ou Professor *</label>
                <select
                  value={selectedNewTurmaId}
                  onChange={(e) => setSelectedNewTurmaId(e.target.value)}
                  className="w-full p-2.5 border border-theme rounded-xl text-xs bg-theme-surface text-theme-main font-medium focus:ring-2 focus:ring-[#006633] focus:outline-hidden"
                >
                  <option value="">-- Selecione uma turma / professor --</option>
                  
                  {vagasTurmas.length > 0 && (
                    <optgroup label="🟢 TURMAS VAGAS DISPONÍVEIS">
                      {vagasTurmas.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.descricao} ({t.turno.toUpperCase()}) {t.eh_alfamais ? '★ AlfaMais' : ''} - VAGA
                        </option>
                      ))}
                    </optgroup>
                  )}

                  {ocupadasOutros.length > 0 && (
                    <optgroup label="🔄 PERMUTA / TROCA DIRETA COM OUTRO PROFESSOR">
                      {ocupadasOutros.map((t) => {
                        const esc = schoolEscolhas.find((e) => e.turma_id === t.id);
                        const profOcupante = schoolProfessores.find((p) => p.id === esc?.professor_id);
                        return (
                          <option key={t.id} value={t.id}>
                            {t.descricao} ({t.turno.toUpperCase()}) - Prof. {profOcupante?.nome || 'Ocupada'} (PERMUTA)
                          </option>
                        );
                      })}
                    </optgroup>
                  )}
                </select>
              </div>

              {/* Informação destacada sobre a Permuta Direta */}
              {isPermuta && selectedTargetProf && (
                <div className="bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 p-3.5 rounded-xl text-xs space-y-2 text-amber-900 dark:text-amber-200">
                  <p className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                    <ArrowRightLeft className="w-4 h-4 text-amber-600" /> Permuta Direta entre Professores
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    A turma <strong>{selectedTurmaObj?.descricao}</strong> pertence atualmente ao(à) <strong>{selectedTargetProf.nome}</strong>. Ao confirmar, as turmas serão trocadas:
                  </p>
                  <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800 text-[11px] font-bold space-y-1">
                    <p className="text-emerald-700 dark:text-emerald-400">
                      • <strong>{changeModal.prof.nome}</strong> ➔ {selectedTurmaObj?.descricao} ({selectedTurmaObj?.turno?.toUpperCase()})
                    </p>
                    <p className="text-blue-700 dark:text-blue-400">
                      • <strong>{selectedTargetProf.nome}</strong> ➔ {currentTurmaObj?.descricao} ({currentTurmaObj?.turno?.toUpperCase()})
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2 border-t border-theme">
                <button
                  onClick={() => setChangeModal(null)}
                  className="px-4 py-2 text-xs font-bold text-theme-muted hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  disabled={!selectedNewTurmaId}
                  onClick={handleExecuteClassChange}
                  className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md flex items-center gap-1.5 transition-all ${
                    selectedNewTurmaId ? 'bg-gradient-sme cursor-pointer hover:opacity-95' : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {isPermuta ? 'Confirmar Permuta' : 'Confirmar Troca de Turma'}
                </button>
              </div>
            </div>
          </Modal>
        );
      })()}

      {/* Modal de Confirmação da Escolha Inicial */}
      {confirmModal && (
        <Modal
          isOpen={Boolean(confirmModal)}
          onClose={() => setConfirmModal(null)}
          title="Confirmar Escolha de Turma"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-theme-main">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-theme text-xs space-y-2">
              <p>Professor: <strong>{confirmModal.teacher.nome}</strong> (Ranking #{confirmModal.teacher.posicao_ranking})</p>
              <p>Turma Selecionada: <strong className="text-sm text-[#006633] dark:text-emerald-400">{confirmModal.turma.descricao}</strong></p>
              <p>Turno: <strong className="uppercase">{confirmModal.turma.turno}</strong></p>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 text-xs font-bold text-theme-muted hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleExecuteChoice}
                className="px-6 py-2 text-xs font-bold text-white bg-gradient-sme rounded-xl shadow-md hover:opacity-95 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Confirmar Escolha
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de Confirmação de Encerramento e Homologação */}
      {isFinalizeConfirmOpen && (
        <Modal
          isOpen={isFinalizeConfirmOpen}
          onClose={() => setIsFinalizeConfirmOpen(false)}
          title="Encerrar e Homologar Sessão de Escolha"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-theme-main">
            <div className="p-4 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-xl text-xs space-y-2 text-amber-900 dark:text-amber-200">
              <p className="font-bold flex items-center gap-1 text-sm">
                <AlertTriangle className="w-5 h-5 text-amber-600" /> Confirmação de Encerramento Definitivo
              </p>
              <p>
                Ao encerrar e homologar a sessão de escolha da escola <strong>{currentSchool?.nome}</strong>, o status do processo será gravado como <strong>CONCLUÍDO</strong> e a Ata Final (ANEXO I) será selada para emissão oficial.
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-theme">
              <button
                onClick={() => setIsFinalizeConfirmOpen(false)}
                className="px-4 py-2 text-xs font-bold text-theme-muted hover:bg-slate-100 rounded-xl"
              >
                Continuar em Sessão
              </button>
              <button
                onClick={handleFinalizeProcess}
                className="px-6 py-2 text-xs font-bold text-white bg-gradient-sme rounded-xl shadow-md hover:opacity-95 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Sim, Encerrar e Homologar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de Confirmação para Abrir Mão da Prioridade AlfaMais */}
      {declineConfirmModal && (
        <Modal
          isOpen={Boolean(declineConfirmModal)}
          onClose={() => setDeclineConfirmModal(null)}
          title="Abrir Mão da Prioridade AlfaMais (Art. 4º)"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-theme-main">
            <div className="p-4 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-xl text-xs space-y-2 text-amber-900 dark:text-amber-200">
              <p className="font-bold flex items-center gap-1.5 text-sm">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                Confirmação de Renúncia de Turno Prioritário
              </p>
              <p>
                Confirma que o(a) professor(a) <strong>{declineConfirmModal.nome}</strong> (Ranking #{declineConfirmModal.posicao_ranking}) deseja abrir mão do turno prioritário AlfaMais?
              </p>
              <div className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800 text-[11px] font-semibold leading-relaxed">
                • O professor sairá da chamada prioritária e retornará para a <strong>Fila Geral de Classificação</strong> por pontuação.
                <br />
                • Todas as demais turmas da unidade escolar ficarão liberadas para escolha.
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-theme">
              <button
                onClick={() => setDeclineConfirmModal(null)}
                className="px-4 py-2 text-xs font-bold text-theme-muted hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleExecuteDeclinePriority}
                className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <ArrowDownRight className="w-4 h-4 text-slate-950" /> Sim, Abrir Mão da Prioridade
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de Confirmação para Excluir Escolha */}
      {deleteChoiceModal && (
        <Modal
          isOpen={Boolean(deleteChoiceModal)}
          onClose={() => setDeleteChoiceModal(null)}
          title="Cancelar / Excluir Escolha de Turma"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-theme-main">
            <div className="p-4 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-xl text-xs space-y-2 text-red-900 dark:text-red-200">
              <p className="font-bold flex items-center gap-1.5 text-sm">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                Confirmação de Cancelamento
              </p>
              <p>
                Confirma o cancelamento da escolha da turma <strong>{deleteChoiceModal.turma?.descricao}</strong> para o(a) professor(a) <strong>{deleteChoiceModal.prof.nome}</strong>?
              </p>
              <p className="text-[11px]">
                A turma será liberada e ficará disponível novamente para escolha. O(A) professor(a) retornará à lista de chamada preservando sua prioridade AlfaMais (Art. 4º).
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-theme">
              <button
                onClick={() => setDeleteChoiceModal(null)}
                className="px-4 py-2 text-xs font-bold text-theme-muted hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleExecuteDeleteChoice}
                className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Trash2 className="w-4 h-4" /> Sim, Excluir Escolha
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
