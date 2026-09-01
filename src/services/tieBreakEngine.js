/**
 * MOTOR DE DESEMPATE E PRIORIDADE ALFA MAIS (ART. 2º, V E ART. 4º)
 * Secretaria Municipal de Educação de Luziânia
 */

/**
 * Retorna os dias totais acumulados de um tipo de regência específico.
 */
function getTotalRegenciaDays(teacher, tipoRegencia) {
  if (!teacher.regencias) return 0;
  return teacher.regencias
    .filter((r) => r.tipo === tipoRegencia)
    .reduce((acc, curr) => acc + (Number(curr.dias_trabalhados) || 0), 0);
}

/**
 * Retorna a média das últimas avaliações de desempenho.
 */
function getAverageDesempenho(teacher) {
  if (!teacher.avaliacoes || teacher.avaliacoes.length === 0) return 0;
  const sum = teacher.avaliacoes.reduce((acc, curr) => acc + (Number(curr.percentual) || 0), 0);
  return sum / teacher.avaliacoes.length;
}

/**
 * Função de comparação pura para ordenação dos professores.
 */
export function compareTeachers(teacherA, teacherB) {
  // 1. Pontuação Total Decrescente
  const scoreDiff = (teacherB.pontuacao_total || 0) - (teacherA.pontuacao_total || 0);
  if (Math.abs(scoreDiff) > 0.001) return scoreDiff;

  // --- CRITÉRIOS DE DESEMPATE (ART. 2º, V) ---

  // 1º Desempate: Ausência de falta injustificada no ano vigente
  const faltasA = Number(teacherA.faltas_injustificadas_2025) || 0;
  const faltasB = Number(teacherB.faltas_injustificadas_2025) || 0;
  if (faltasA !== faltasB) return faltasA - faltasB;

  // 2º Desempate: Maior tempo de serviço em regência de classe na REDE MUNICIPAL
  const diasRedeA = getTotalRegenciaDays(teacherA, 'efetivo_rede');
  const diasRedeB = getTotalRegenciaDays(teacherB, 'efetivo_rede');
  if (diasRedeA !== diasRedeB) return diasRedeB - diasRedeA;

  // 3º Desempate: Maior tempo de serviço em regência de classe nesta UNIDADE ESCOLAR
  const diasUnidadeA = getTotalRegenciaDays(teacherA, 'efetivo_unidade');
  const diasUnidadeB = getTotalRegenciaDays(teacherB, 'efetivo_unidade');
  if (diasUnidadeA !== diasUnidadeB) return diasUnidadeB - diasUnidadeA;

  // 4º Desempate: Maior média das 3 últimas avaliações de desempenho
  const mediaAvA = getAverageDesempenho(teacherA);
  const mediaAvB = getAverageDesempenho(teacherB);
  if (Math.abs(mediaAvB - mediaAvA) > 0.001) return mediaAvB - mediaAvA;

  // 5º Desempate: Maior idade (data de nascimento mais antiga)
  if (teacherA.data_nascimento && teacherB.data_nascimento) {
    if (teacherA.data_nascimento < teacherB.data_nascimento) return -1;
    if (teacherA.data_nascimento > teacherB.data_nascimento) return 1;
  }

  return 0;
}

/**
 * Ordena uma lista de professores aplicando a classificação geral por pontuação e desempate.
 */
export function sortAndRankTeachers(teachers) {
  if (!Array.isArray(teachers)) return [];

  const copy = [...teachers];
  copy.sort(compareTeachers);

  return copy.map((teacher, index) => ({
    ...teacher,
    posicao_ranking: index + 1
  }));
}

/**
 * Verifica se o professor possui prioridade AlfaMais (frequência >= 90%).
 */
export function hasAlfaMaisPriority(teacher) {
  return Number(teacher.frequencia_alfamais_percentual) >= 90.0;
}

/**
 * Verifica se uma turma se enquadra na prioridade do Programa AlfaMais Goiás (Art. 4º):
 * Pré I, Pré II, 1º Ano e 2º Ano do Ensino Fundamental.
 */
export function isTurmaAlfaMais(turma) {
  if (!turma) return false;
  return Boolean(
    turma.eh_alfamais || 
    ['pre_1', 'pre_2', '1_ano', '2_ano'].includes(turma.tipo) || 
    turma.tipo?.includes('1_ano') || 
    turma.tipo?.includes('2_ano') || 
    turma.tipo?.includes('pre') ||
    turma.descricao?.includes('1º') || 
    turma.descricao?.includes('2º') || 
    turma.descricao?.toLowerCase().includes('pré')
  );
}

/**
 * Retorna a fila combinada de chamada para escolha de turmas:
 * 1º Bloco: Professores com Prioridade AlfaMais (que ainda NÃO abdicaram e NÃO escolheram).
 * 2º Bloco: Fila Geral por Pontuação / Desempate (professores sem prioridade + professores prioritários que abdicaram).
 * 
 * Regra do Art. 4º: Se não houver mais turmas AlfaMais disponíveis na escola,
 * os professores com prioridade voltam AUTOMATICAMENTE para a Fila Geral de classificação normal.
 */
export function buildCallQueue(teachers, escolhas = [], abdicaramAlfaMais = [], turmas = []) {
  const rankedAll = sortAndRankTeachers(teachers);

  // Se houver turmas passadas, verifica se ainda existe alguma turma AlfaMais DISPONÍVEL
  const totalAlfaMaisTurmas = turmas.filter((t) => isTurmaAlfaMais(t));
  const hasAvailableAlfaMaisTurmas = turmas.length === 0 || totalAlfaMaisTurmas.some((t) => {
    return !escolhas.some((e) => e.turma_id === t.id);
  });

  // Se NÃO houver mais turmas AlfaMais disponíveis na escola,
  // os professores com prioridade voltam automaticamente para a Fila Geral normal.
  const prioGroup = hasAvailableAlfaMaisTurmas
    ? rankedAll.filter((t) => {
        const jaEscolheu = escolhas.some((e) => e.professor_id === t.id);
        const abdicou = abdicaramAlfaMais.includes(t.id);
        return hasAlfaMaisPriority(t) && !jaEscolheu && !abdicou;
      })
    : [];

  // Fila Geral: Todos os que ainda não escolheram e não estão no grupo de prioridade atual
  const generalGroup = rankedAll.filter((t) => {
    const jaEscolheu = escolhas.some((e) => e.professor_id === t.id);
    const estaNoPrioGroup = prioGroup.some((p) => p.id === t.id);
    return !jaEscolheu && !estaNoPrioGroup;
  });

  const allAlfaMaisTaken = turmas.length > 0 && totalAlfaMaisTurmas.length > 0 && !hasAvailableAlfaMaisTurmas;

  return {
    prioGroup,
    generalGroup,
    fullCallQueue: [...prioGroup, ...generalGroup],
    alreadyChosen: rankedAll.filter((t) => escolhas.some((e) => e.professor_id === t.id)),
    hasAvailableAlfaMaisTurmas,
    allAlfaMaisTaken
  };
}
