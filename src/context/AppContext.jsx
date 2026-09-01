import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_ESCOLAS, INITIAL_PROFESSORES, INITIAL_TURMAS, INITIAL_ESCOLHAS, INITIAL_LOGS } from '../services/mockData';
import { calculateTeacherScore } from '../services/scoringEngine';
import { sortAndRankTeachers, buildCallQueue } from '../services/tieBreakEngine';
import { createLogEntry } from '../utils/auditLogger';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export function AppProvider({ children }) {
  const { user, activeSchoolId } = useAuth();

  // Escolas
  const [escolas, setEscolas] = useState(() => {
    const saved = localStorage.getItem('sme_luziania_escolas');
    if (!saved) return INITIAL_ESCOLAS;
    try {
      const parsed = JSON.parse(saved);
      if (parsed.length < INITIAL_ESCOLAS.length) {
        const existingIneps = new Set(parsed.map(e => e.codigo_inep || e.id));
        const missing = INITIAL_ESCOLAS.filter(e => !existingIneps.has(e.codigo_inep) && !existingIneps.has(e.id));
        return [...parsed, ...missing];
      }
      return parsed;
    } catch {
      return INITIAL_ESCOLAS;
    }
  });

  // Professores
  const [professores, setProfessores] = useState(() => {
    const saved = localStorage.getItem('sme_luziania_professores');
    const rawList = saved ? JSON.parse(saved) : INITIAL_PROFESSORES;

    return rawList.map((p) => {
      const { pontuacaoTotal, detalhamento } = calculateTeacherScore(p);
      return {
        ...p,
        pontuacao_total: pontuacaoTotal,
        pontuacao_detalhada: detalhamento
      };
    });
  });

  // Turmas
  const [turmas, setTurmas] = useState(() => {
    const saved = localStorage.getItem('sme_luziania_turmas');
    return saved ? JSON.parse(saved) : INITIAL_TURMAS;
  });

  // Escolhas
  const [escolhas, setEscolhas] = useState(() => {
    const saved = localStorage.getItem('sme_luziania_escolhas');
    return saved ? JSON.parse(saved) : INITIAL_ESCOLHAS;
  });

  // Lista de Professores que abdicaram da Prioridade AlfaMais
  const [abdicaramAlfaMais, setAbdicaramAlfaMais] = useState(() => {
    const saved = localStorage.getItem('sme_luziania_abdicaram_alfamais');
    return saved ? JSON.parse(saved) : [];
  });

  // Logs
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('sme_luziania_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  // Persistência em LocalStorage
  useEffect(() => {
    localStorage.setItem('sme_luziania_escolas', JSON.stringify(escolas));
  }, [escolas]);

  useEffect(() => {
    localStorage.setItem('sme_luziania_professores', JSON.stringify(professores));
  }, [professores]);

  useEffect(() => {
    localStorage.setItem('sme_luziania_turmas', JSON.stringify(turmas));
  }, [turmas]);

  useEffect(() => {
    localStorage.setItem('sme_luziania_escolhas', JSON.stringify(escolhas));
  }, [escolhas]);

  useEffect(() => {
    localStorage.setItem('sme_luziania_abdicaram_alfamais', JSON.stringify(abdicaramAlfaMais));
  }, [abdicaramAlfaMais]);

  useEffect(() => {
    localStorage.setItem('sme_luziania_logs', JSON.stringify(logs));
  }, [logs]);

  const logAction = (acao, detalhes) => {
    const entry = createLogEntry(user, acao, detalhes);
    setLogs((prev) => [entry, ...prev]);
  };

  // --------------------------------------------------------------------------
  // ESCOLAS
  // --------------------------------------------------------------------------
  const addEscola = (novaEscola) => {
    const id = `e-${Date.now()}`;
    const escolaCompleta = {
      id,
      ...novaEscola,
      status_processo: 'nao_iniciado',
      data_inicio_escolha: novaEscola.data_inicio_escolha || '2025-12-19T13:00:00-03:00'
    };
    setEscolas((prev) => [...prev, escolaCompleta]);
    logAction('Cadastro de Escola', { escola_nome: novaEscola.nome });
  };

  const updateEscola = (id, dadosAtualizados) => {
    setEscolas((prev) => prev.map((e) => (e.id === id ? { ...e, ...dadosAtualizados } : e)));
    logAction('Edição de Escola', { escola_id: id, dados: dadosAtualizados });
  };

  const deleteEscola = (id) => {
    const escola = escolas.find((e) => e.id === id);
    setEscolas((prev) => prev.filter((e) => e.id !== id));
    logAction('Exclusão de Escola', { escola_id: id, escola_nome: escola?.nome });
  };

  // --------------------------------------------------------------------------
  // PROFESSORES
  // --------------------------------------------------------------------------
  const saveProfessor = (profData) => {
    const isEdit = Boolean(profData.id);
    const { pontuacaoTotal, detalhamento } = calculateTeacherScore(profData);

    const updatedProf = {
      ...profData,
      id: isEdit ? profData.id : `p-${Date.now()}`,
      escola_id: profData.escola_id || activeSchoolId,
      pontuacao_total: pontuacaoTotal,
      pontuacao_detalhada: detalhamento,
      status_validacao: profData.status_validacao || 'validado'
    };

    if (isEdit) {
      setProfessores((prev) => prev.map((p) => (p.id === updatedProf.id ? updatedProf : p)));
      logAction('Edição de Professor e Recálculo', { professor: updatedProf.nome, pontuacao: pontuacaoTotal });
    } else {
      setProfessores((prev) => [...prev, updatedProf]);
      logAction('Cadastro de Novo Professor', { professor: updatedProf.nome, pontuacao: pontuacaoTotal });
    }
  };

  const deleteProfessor = (id) => {
    const prof = professores.find((p) => p.id === id);
    setProfessores((prev) => prev.filter((p) => p.id !== id));
    logAction('Exclusão de Professor', { professor_id: id, nome: prof?.nome });
  };

  const validateProfessorScore = (id, status, justificativa) => {
    setProfessores((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status_validacao: status, justificativa_validacao: justificativa } : p))
    );
    const prof = professores.find((p) => p.id === id);
    logAction('Validação de Pontuação do Professor', { professor: prof?.nome, status, justificativa });
  };

  // --------------------------------------------------------------------------
  // ALFA MAIS
  // --------------------------------------------------------------------------
  const declineAlfaMaisPriority = (professorId) => {
    if (!abdicaramAlfaMais.includes(professorId)) {
      setAbdicaramAlfaMais((prev) => [...prev, professorId]);
      const prof = professores.find((p) => p.id === professorId);
      logAction('Renúncia de Turno Prioritário AlfaMais', {
        professor: prof?.nome,
        motivo: 'Professor optou por não escolher turma AlfaMais no momento inicial e retornou para a Fila Geral.'
      });
    }
  };

  const restoreAlfaMaisPriority = (professorId) => {
    setAbdicaramAlfaMais((prev) => prev.filter((id) => id !== professorId));
  };

  // --------------------------------------------------------------------------
  // TURMAS
  // --------------------------------------------------------------------------
  const saveTurma = (turmData) => {
    const isEdit = Boolean(turmData.id);
    const updatedTurma = {
      ...turmData,
      id: isEdit ? turmData.id : `t-${Date.now()}`,
      escola_id: turmData.escola_id || activeSchoolId,
      status: turmData.status || 'disponivel'
    };

    if (isEdit) {
      setTurmas((prev) => prev.map((t) => (t.id === updatedTurma.id ? updatedTurma : t)));
      logAction('Edição de Turma', { turma: updatedTurma.descricao });
    } else {
      setTurmas((prev) => [...prev, updatedTurma]);
      logAction('Cadastro de Nova Turma', { turma: updatedTurma.descricao });
    }
  };

  const deleteTurma = (id) => {
    const turma = turmas.find((t) => t.id === id);
    setTurmas((prev) => prev.filter((t) => t.id !== id));
    logAction('Exclusão de Turma', { turma_id: id, descricao: turma?.descricao });
  };

  // --------------------------------------------------------------------------
  // SESSÃO DE ESCOLHA DE TURMAS (REGISTRO, TROCA E CANCELAMENTO ANTES DE ENCERRAR)
  // --------------------------------------------------------------------------
  const recordChoice = (professorId, turmaId, turnoSelecionado, ordemClassificacao) => {
    const novaEscolha = {
      id: `c-${Date.now()}`,
      escola_id: activeSchoolId,
      turma_id: turmaId,
      professor_id: professorId,
      ordem_classificacao: ordemClassificacao,
      turno_selecionado: turnoSelecionado,
      status: 'confirmada',
      data_escolha: new Date().toISOString()
    };

    setTurmas((prev) => prev.map((t) => (t.id === turmaId ? { ...t, status: 'ocupada' } : t)));
    setEscolhas((prev) => [...prev, novaEscolha]);
    setEscolas((prev) => prev.map((e) => (e.id === activeSchoolId ? { ...e, status_processo: 'em_andamento' } : e)));

    const prof = professores.find((p) => p.id === professorId);
    const turma = turmas.find((t) => t.id === turmaId);
    logAction('Registro de Escolha de Turma', {
      professor: prof?.nome,
      turma: turma?.descricao,
      turno: turnoSelecionado,
      ordem: ordemClassificacao
    });
  };

  // Troca de turma permitida pelo gestor ANTES do encerramento final (suporta troca simples e permuta com outro professor)
  const changeTeacherClass = (escolhaId, newTurmaId) => {
    const escolha = escolhas.find((e) => e.id === escolhaId);
    if (!escolha) return;

    const oldTurmaId = escolha.turma_id;
    const newTurma = turmas.find((t) => t.id === newTurmaId);
    const oldTurma = turmas.find((t) => t.id === oldTurmaId);
    const prof = professores.find((p) => p.id === escolha.professor_id);

    if (!newTurma) return;

    // Verificar se a turma de destino já foi escolhida por outro professor (Permuta Direta)
    const targetEscolha = escolhas.find((e) => e.turma_id === newTurmaId && e.id !== escolhaId);

    if (targetEscolha) {
      const targetProf = professores.find((p) => p.id === targetEscolha.professor_id);

      // Troca cruzada (Permuta) entre as duas escolhas
      setEscolhas((prev) =>
        prev.map((e) => {
          if (e.id === escolhaId) {
            return {
              ...e,
              turma_id: newTurmaId,
              turno_selecionado: newTurma.turno,
              data_escolha: new Date().toISOString()
            };
          }
          if (e.id === targetEscolha.id) {
            return {
              ...e,
              turma_id: oldTurmaId,
              turno_selecionado: oldTurma ? oldTurma.turno : e.turno_selecionado,
              data_escolha: new Date().toISOString()
            };
          }
          return e;
        })
      );

      logAction('Permuta / Troca Direta de Turma Entre Professores', {
        professor_1: prof?.nome,
        turma_1_nova: newTurma.descricao,
        professor_2: targetProf?.nome,
        turma_2_nova: oldTurma?.descricao
      });
    } else {
      // Libera a turma antiga e ocupa a nova turma
      setTurmas((prev) =>
        prev.map((t) => {
          if (t.id === oldTurmaId) return { ...t, status: 'disponivel' };
          if (t.id === newTurmaId) return { ...t, status: 'ocupada' };
          return t;
        })
      );

      // Atualiza o registro da escolha
      setEscolhas((prev) =>
        prev.map((e) =>
          e.id === escolhaId
            ? {
                ...e,
                turma_id: newTurmaId,
                turno_selecionado: newTurma.turno,
                data_escolha: new Date().toISOString()
              }
            : e
        )
      );

      logAction('Troca de Turma pelo Gestor Antes do Encerramento', {
        professor: prof?.nome,
        turma_anterior_id: oldTurmaId,
        nova_turma: newTurma.descricao,
        novo_turno: newTurma.turno
      });
    }
  };

  const cancelChoice = (escolhaId) => {
    const escolha = escolhas.find((e) => e.id === escolhaId);
    if (escolha) {
      setTurmas((prev) => prev.map((t) => (t.id === escolha.turma_id ? { ...t, status: 'disponivel' } : t)));
      setEscolhas((prev) => prev.filter((e) => e.id !== escolhaId));

      // Restaura prioridade AlfaMais do professor caso tenha sido excluído da turma
      if (escolha.professor_id) {
        setAbdicaramAlfaMais((prev) => prev.filter((id) => id !== escolha.professor_id));
      }

      const prof = professores.find((p) => p.id === escolha.professor_id);
      logAction('Cancelamento / Exclusão de Escolha de Turma', { escolha_id: escolhaId, professor: prof?.nome });
    }
  };

  const finalizeSchoolProcess = (escolaId) => {
    setEscolas((prev) => prev.map((e) => (e.id === escolaId ? { ...e, status_processo: 'concluido' } : e)));
    const escola = escolas.find((e) => e.id === escolaId);
    logAction('Encerramento e Homologação Final da Sessão de Escolha', { escola: escola?.nome });
  };

  const reopenSchoolProcess = (escolaId) => {
    setEscolas((prev) => prev.map((e) => (e.id === escolaId ? { ...e, status_processo: 'em_andamento' } : e)));
    
    // Restaura a prioridade AlfaMais dos professores da escola reaberta
    const schoolProfIds = professores.filter((p) => p.escola_id === escolaId).map((p) => p.id);
    setAbdicaramAlfaMais((prev) => prev.filter((id) => !schoolProfIds.includes(id)));

    const escola = escolas.find((e) => e.id === escolaId);
    logAction('Reabertura do Processo de Escolha para Ajustes', { escola: escola?.nome });
  };

  // Listas da escola ativa
  const currentSchool = escolas.find((e) => e.id === activeSchoolId) || escolas[0];
  const schoolProfessoresRaw = professores.filter((p) => p.escola_id === activeSchoolId);
  const schoolProfessores = sortAndRankTeachers(schoolProfessoresRaw);
  const schoolTurmas = turmas.filter((t) => t.escola_id === activeSchoolId);
  const schoolEscolhas = escolhas.filter((e) => e.escola_id === activeSchoolId);

  const callQueueInfo = buildCallQueue(schoolProfessoresRaw, schoolEscolhas, abdicaramAlfaMais, schoolTurmas);

  return (
    <AppContext.Provider
      value={{
        escolas,
        professores,
        turmas,
        escolhas,
        logs,
        abdicaramAlfaMais,
        currentSchool,
        schoolProfessores,
        schoolTurmas,
        schoolEscolhas,
        callQueueInfo,
        addEscola,
        updateEscola,
        deleteEscola,
        saveProfessor,
        deleteProfessor,
        validateProfessorScore,
        saveTurma,
        deleteTurma,
        recordChoice,
        changeTeacherClass,
        cancelChoice,
        declineAlfaMaisPriority,
        restoreAlfaMaisPriority,
        finalizeSchoolProcess,
        reopenSchoolProcess,
        logAction
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
