/**
 * MOTOR DE CÁLCULO DE PONTUAÇÃO - PORTARIA Nº 947/2025
 * Secretaria Municipal de Educação de Luziânia - GO
 */

/**
 * Calcula a pontuação total e o detalhamento por categoria de um professor.
 * @param {Object} teacher Dados do professor (incluindo regencias, publicacoes, formacoes e avaliacoes)
 * @returns {Object} { pontuacaoTotal, detalhamento }
 */
export function calculateTeacherScore(teacher) {
  if (!teacher) return { pontuacaoTotal: 0, detalhamento: {} };

  // --------------------------------------------------------------------------
  // SEÇÃO I – TEMPO DE SERVIÇO / ATIVIDADES NA REDE DE ENSINO
  // --------------------------------------------------------------------------
  let ptsSecaoI = 0;
  const regenciasBreakdown = [];

  const regencias = teacher.regencias || [];
  regencias.forEach((reg) => {
    let anosValidos = 0;
    if (reg.anos !== undefined && reg.anos !== null && reg.anos !== '') {
      anosValidos = Number(reg.anos) || 0;
    } else {
      const dias = Number(reg.dias_trabalhados) || 0;
      const anosCompletos = Math.floor(dias / 365);
      const restoDias = dias % 365;
      anosValidos = anosCompletos + (restoDias >= 180 ? 1 : 0);
    }
    const carga = Number(reg.carga_horaria) || 20;
    let fatorAno = 0;

    switch (reg.tipo) {
      case 'efetivo_rede':
        if (carga === 20) fatorAno = 14;
        else if (carga === 30) fatorAno = 16;
        else if (carga === 40) fatorAno = 28;
        break;

      case 'efetivo_unidade':
        if (carga === 20) fatorAno = 8;
        else if (carga === 30) fatorAno = 10;
        else if (carga === 40) fatorAno = 16;
        break;

      case 'contrato_temporario':
        if (carga === 20) fatorAno = 3;
        else if (carga === 30) fatorAno = 4;
        else if (carga === 40) fatorAno = 6;
        break;

      case 'cargo_sme':
      case 'mandato_classista':
        if (carga === 20) fatorAno = 14;
        else if (carga === 30) fatorAno = 16;
        else if (carga === 40) fatorAno = 28;
        break;

      default:
        fatorAno = 0;
    }

    const pontosReg = anosValidos * fatorAno;
    ptsSecaoI += pontosReg;

    regenciasBreakdown.push({
      descricao: `${reg.tipo.replace('_', ' ').toUpperCase()} (${carga}h) - ${anosValidos} ano(s)`,
      pontos: pontosReg
    });
  });

  // --------------------------------------------------------------------------
  // SEÇÃO II – PUBLICAÇÕES NA ÁREA DA EDUCAÇÃO
  // --------------------------------------------------------------------------
  let ptsSecaoII = 0;
  const publicacoesBreakdown = [];

  const publicacoes = teacher.publicacoes || [];
  publicacoes.forEach((pub) => {
    let pts = 0;
    if (pub.tipo === 'tecnica_pedagogica') pts = 50;
    else if (pub.tipo === 'artigo_issn') pts = 100;
    else if (pub.tipo === 'livro_isbn') pts = 200;

    ptsSecaoII += pts;
    publicacoesBreakdown.push({
      titulo: pub.titulo,
      tipo: pub.tipo,
      pontos: pts
    });
  });

  // --------------------------------------------------------------------------
  // SEÇÃO III – FORMAÇÃO PEDAGÓGICA / TITULAÇÃO (PRESENCIAL)
  // --------------------------------------------------------------------------
  let ptsSecaoIII = 0;
  const titulosBreakdown = [];

  const formacoes = teacher.formacoes || [];

  // Lato Sensu (máx 4 x 50 = 200 pts)
  const latoSensuList = formacoes.filter((f) => f.tipo === 'lato_sensu').slice(0, 4);
  const ptsLato = latoSensuList.length * 50;

  // Mestrado (máx 2 x 200 = 400 pts)
  const mestradoList = formacoes.filter((f) => f.tipo === 'mestrado').slice(0, 2);
  const ptsMestrado = mestradoList.length * 200;

  // Doutorado (máx 1 x 300 = 300 pts)
  const doutoradoList = formacoes.filter((f) => f.tipo === 'doutorado').slice(0, 1);
  const ptsDoutorado = doutoradoList.length * 300;

  ptsSecaoIII = ptsLato + ptsMestrado + ptsDoutorado;

  if (ptsLato > 0) titulosBreakdown.push({ descricao: `Pós-Graduação Lato Sensu (${latoSensuList.length} título/s)`, pontos: ptsLato });
  if (ptsMestrado > 0) titulosBreakdown.push({ descricao: `Mestrado Stricto Sensu (${mestradoList.length} título/s)`, pontos: ptsMestrado });
  if (ptsDoutorado > 0) titulosBreakdown.push({ descricao: `Doutorado (${doutoradoList.length} título/s)`, pontos: ptsDoutorado });

  // --------------------------------------------------------------------------
  // SEÇÃO IV – FORMAÇÃO CONTINUADA PRESENCIAL EM 2025
  // --------------------------------------------------------------------------
  let ptsSecaoIV = 0;
  const presencialBreakdown = [];

  const formacoesPresenciais = formacoes.filter((f) => f.modalidade === 'presencial' && !['lato_sensu', 'mestrado', 'doutorado'].includes(f.tipo));

  // Acumuladores de horas para categorias com teto de 200 pts (100h)
  const categoriaCap = {
    alfabetizacao_presencial: 200,
    ed_infantil_presencial: 200,
    ed_especial_presencial: 200,
    palestras_smel: 200,
    outros_orgaos_publicos: 200
  };

  const acumHoras = {
    alfabetizacao_presencial: 0,
    ed_infantil_presencial: 0,
    ed_especial_presencial: 0,
    palestras_smel: 0,
    outros_orgaos_publicos: 0
  };

  formacoesPresenciais.forEach((f) => {
    const ch = Number(f.carga_horaria) || 0;
    let pts = 0;

    if (f.tipo === 'alfamais') {
      // 2 pts / hora sem limite
      pts = ch * 2;
    } else if (f.tipo === 'praxis_pedagogica') {
      // 2 pts / hora sem limite
      pts = ch * 2;
    } else if (f.tipo === 'sintego') {
      // 5 pts / hora sem limite
      pts = ch * 5;
    } else if (categoriaCap[f.tipo] !== undefined) {
      const disponivel = Math.max(0, 100 - acumHoras[f.tipo]);
      const horasValidas = Math.min(ch, disponivel);
      pts = horasValidas * 2;
      acumHoras[f.tipo] += horasValidas;
    }

    ptsSecaoIV += pts;
    presencialBreakdown.push({ nome: f.nome_curso, tipo: f.tipo, ch, pontos: pts });
  });

  // --------------------------------------------------------------------------
  // SEÇÃO V – FORMAÇÃO CONTINUADA SEMIPRESENCIAL E EAD EM 2025
  // --------------------------------------------------------------------------
  let ptsSecaoV = 0;
  const eadBreakdown = [];

  const formacoesEAD = formacoes.filter((f) => f.modalidade === 'ead' || f.modalidade === 'semipresencial');

  // Cada categoria EAD tem teto de 100 pts (200 horas x 0.5)
  const acumEADHoras = {
    alfabetizacao_ead: 0,
    ed_infantil_ead: 0,
    ed_especial_ead: 0,
    palestras_ead: 0,
    outros_ead: 0
  };

  formacoesEAD.forEach((f) => {
    const ch = Number(f.carga_horaria) || 0;
    const catKey = acumEADHoras[f.tipo] !== undefined ? f.tipo : 'outros_ead';
    const disponivelHoras = Math.max(0, 200 - acumEADHoras[catKey]);
    const horasValidas = Math.min(ch, disponivelHoras);
    const pts = horasValidas * 0.5;

    acumEADHoras[catKey] += horasValidas;
    ptsSecaoV += pts;
    eadBreakdown.push({ nome: f.nome_curso, tipo: f.tipo, ch, pontos: pts });
  });

  // --------------------------------------------------------------------------
  // SEÇÃO VI – DESEMPENHO EM 2025
  // --------------------------------------------------------------------------
  let ptsSecaoVI = 0;
  const avaliacoes = teacher.avaliacoes || [];
  const av2025 = avaliacoes.find((a) => Number(a.ano) === 2025);

  if (av2025) {
    ptsSecaoVI = Number(av2025.percentual) || 0; // Ex: 88.5% -> 88.50 pts
  }

  // --------------------------------------------------------------------------
  // PONTUAÇÃO TOTAL E RETORNO DETALHADO
  // --------------------------------------------------------------------------
  const pontuacaoTotal = Number((ptsSecaoI + ptsSecaoII + ptsSecaoIII + ptsSecaoIV + ptsSecaoV + ptsSecaoVI).toFixed(2));

  return {
    pontuacaoTotal,
    detalhamento: {
      secaoI_tempoServico: ptsSecaoI,
      secaoII_publicacoes: ptsSecaoII,
      secaoIII_titulos: ptsSecaoIII,
      secaoIV_formacaoPresencial: ptsSecaoIV,
      secaoV_formacaoEAD: ptsSecaoV,
      secaoVI_desempenho: ptsSecaoVI,
      regenciasBreakdown,
      publicacoesBreakdown,
      titulosBreakdown,
      presencialBreakdown,
      eadBreakdown
    }
  };
}
