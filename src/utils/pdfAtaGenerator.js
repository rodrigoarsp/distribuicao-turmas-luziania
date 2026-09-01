import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * GERADOR DA ATA OFICIAL DE ESCOLHA DE TURMAS (MODELO ANEXO I)
 * @param {Object} escola Dados da Escola
 * @param {Array} escolhas Lista de escolhas realizadas
 * @param {Array} professores Lista de professores ordenados
 * @param {Object} headerConfig Dados customizados do cabeçalho preenchidos pelo gestor
 */
export function generateAtaPDF(escola = {}, escolhas = [], professores = [], turmas = [], headerConfig = {}) {
  // Tratamento de segurança para argumentos flexíveis
  if (!Array.isArray(turmas) && typeof turmas === 'object') {
    headerConfig = turmas;
    turmas = [];
  }

  const safeEscolhas = Array.isArray(escolhas) ? escolhas : [];
  const safeProfessores = Array.isArray(professores) ? professores : [];
  const safeTurmas = Array.isArray(turmas) ? turmas : [];
  const safeHeader = (headerConfig && typeof headerConfig === 'object') ? headerConfig : {};

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const blackColor = [0, 0, 0];
  const fontName = 'helvetica';

  // Configurações Padrão com Fallback
  const dia = safeHeader.dia || new Date().getDate().toString();
  const mes = safeHeader.mes || 'dezembro';
  const anoExtenso = safeHeader.anoExtenso || 'dois mil e vinte e seis';
  const anoNumero = safeHeader.anoNumero || '2026';
  const hora = safeHeader.hora || '13:00';
  const sala = safeHeader.sala || 'Auditório / Sala de Reuniões';
  const nomeEscola = safeHeader.nomeEscola || escola?.nome || 'Escola Municipal';
  const numeroPortaria = safeHeader.numeroPortaria || '947/2025';
  const mesPortaria = safeHeader.mesPortaria || 'junho de 2025';
  const nomeLavrador = safeHeader.nomeLavrador || escola?.gestor_nome || 'Diretor(a) / Secretário(a)';

  // --------------------------------------------------------------------------
  // 0. CABEÇALHO TIMBRADO DA ESCOLA (ALTURA PADRÃO DE 3cm / 30mm NO TOPO A4)
  // --------------------------------------------------------------------------
  const topY = 10;
  const headerHeight = 30; // 3cm = 30mm
  const printableWidth = 170; // Margem esquerda 15mm, margem direita 25mm -> Fim limpo em X = 185mm (A4 = 210mm)
  const rightMarginX = 185;

  const linha1 = safeHeader.linha1 || 'ESTADO DE GOIÁS - PREFEITURA MUNICIPAL DE LUZIÂNIA';
  const linha2 = safeHeader.linha2 || 'SECRETARIA MUNICIPAL DE EDUCAÇÃO - SME';
  const linha3 = safeHeader.linha3 || (escola?.nome ? `${escola.nome} • INEP: ${escola.codigo_inep || '52098222'}` : 'UNIDADE ESCOLAR MUNICIPAL');
  const linha4 = safeHeader.linha4 || (escola?.endereco ? `Endereço: ${escola.endereco}` : 'Prefeitura Municipal de Luziânia - GO');

  let hasLogo = false;
  let logoW = 38;
  let logoH = 15;
  let logoY = topY + 7.5;

  if (safeHeader.logoImage && typeof safeHeader.logoImage === 'string' && safeHeader.logoImage.startsWith('data:image')) {
    try {
      const format = safeHeader.logoImage.includes('image/png') ? 'PNG' : 'JPEG';
      const aspect = Number(safeHeader.logoAspect) || 2.5;

      if (aspect >= 1.2) {
        logoW = Math.min(40, 17 * aspect);
        logoH = logoW / aspect;
        if (logoH > 22) {
          logoH = 22;
          logoW = logoH * aspect;
        }
      } else {
        logoH = 22;
        logoW = logoH * aspect;
      }
      logoY = topY + (30 - logoH) / 2;

      doc.addImage(safeHeader.logoImage, format, 15, logoY, logoW, logoH);
      hasLogo = true;
    } catch (err) {
      console.warn('Erro ao inserir logo customizada no PDF:', err);
    }
  }

  const textX = hasLogo ? (15 + logoW + 4) : 15;
  const textWidth = rightMarginX - textX;

  // Fonte oficial de exportação: Arial (Helvetica)
  doc.setFont(fontName, 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(linha1.toUpperCase(), textX, topY + 6, { maxWidth: textWidth });

  doc.setFontSize(9.5);
  doc.text(linha2.toUpperCase(), textX, topY + 12, { maxWidth: textWidth });

  doc.setFontSize(10);
  doc.setTextColor(0, 51, 153);
  doc.text(linha3.toUpperCase(), textX, topY + 18, { maxWidth: textWidth });

  doc.setFont(fontName, 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const splitL4 = doc.splitTextToSize(linha4, textWidth);
  doc.text(splitL4, textX, topY + 24, { maxWidth: textWidth });

  // Posições sequenciais do documento oficial após o cabeçalho de 3cm
  const startContentY = topY + headerHeight + 7; // Y = 47mm

  // --------------------------------------------------------------------------
  // 1. TÍTULO PRINCIPAL DA ATA
  // --------------------------------------------------------------------------
  doc.setFont(fontName, 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...blackColor);
  doc.text(`ATA DE ESCOLHA DE TURMA DA ESCOLA PARA O ANO LETIVO DE ${anoNumero}`, 100, startContentY, { align: 'center' });

  // --------------------------------------------------------------------------
  // 2. PARÁGRAFO DE INTRODUÇÃO (PARÁGRAFO FORMAL RESTRITO À MARGEM SEGURA)
  // --------------------------------------------------------------------------
  doc.setFont(fontName, 'normal');
  doc.setFontSize(9.5);

  const introText = `Aos ${dia} dias do mês de ${mes} de ${anoExtenso}, às ${hora} horas, na sala ${sala} da Unidade de Ensino ${nomeEscola}, reuniram-se os servidores para realização do processo de distribuição de turma para o ano letivo de ${anoNumero}. Nesta oportunidade, o (a) diretor (a) deu abertura à reunião fazendo a leitura da Portaria de nº ${numeroPortaria} de ${mesPortaria} e, segundo ordem de escolha, iniciou a distribuição dos professores por turma, ficando determinado da seguinte forma:`;

  const splitIntro = doc.splitTextToSize(introText, printableWidth);
  doc.text(splitIntro, 15, startContentY + 9, { align: 'justify', maxWidth: printableWidth });

  // Posição Y atual após o parágrafo
  const startYTable = startContentY + 9 + splitIntro.length * 4.8 + 4;

  // --------------------------------------------------------------------------
  // 3. TABELA OFICIAL (3 COLUNAS CONFORME IMAGEM DO ANEXO I)
  // --------------------------------------------------------------------------
  const tableData = safeProfessores.map((prof) => {
    const escolha = safeEscolhas.find((e) => e.professor_id === prof.id);
    const turmaObj = escolha ? (escolha.turma || safeTurmas.find((t) => t.id === escolha.turma_id)) : null;
    const turmaDesc = turmaObj ? turmaObj.descricao : (escolha ? `Turma #${escolha.turma_id}` : '');
    const turnoDesc = turmaObj ? turmaObj.turno?.toUpperCase() : (escolha ? escolha.turno_selecionado?.toUpperCase() : '');

    return [
      prof.nome || '',
      turmaDesc || '',
      turnoDesc || ''
    ];
  });

  // A tabela exibe estritamente a quantidade de professores da escola
  if (tableData.length === 0) {
    tableData.push(['', '', '']);
  }

  autoTable(doc, {
    startY: startYTable,
    margin: { left: 15, right: 25 },
    head: [['Nome completo do(a) professor(a)', 'Turma escolhida', 'Turno']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 10,
      lineWidth: 0.3,
      lineColor: [0, 0, 0],
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 9.5,
      textColor: [0, 0, 0],
      lineWidth: 0.3,
      lineColor: [0, 0, 0],
      minCellHeight: 8
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 52 },
      2: { cellWidth: 28, halign: 'center' }
    }
  });

  // --------------------------------------------------------------------------
  // 4. PARÁGRAFO DE ENCERRAMENTO E LINHAS DE ASSINATURA
  // --------------------------------------------------------------------------
  let finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : startYTable + 100;

  // Se a tabela estendeu para a página seguinte ou estiver muito perto do fim
  if (finalY > 240) {
    doc.addPage();
    finalY = 20;
  }

  doc.setFont(fontName, 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...blackColor);

  const closingText = `Não tendo mais assunto a tratar, eu, ${nomeLavrador}, lavro a presente ata, sendo firmada a assinatura de todos os presentes. (assinar com o nome legível por extenso, sem espaço entre os nomes).`;
  const splitClosing = doc.splitTextToSize(closingText, printableWidth);
  doc.text(splitClosing, 15, finalY, { align: 'justify', maxWidth: printableWidth });

  let lineY = finalY + splitClosing.length * 4.8 + 8;

  // Gerar linhas continuas de assinatura ajustadas à quantidade de professores
  const totalSignatureLines = Math.max(safeProfessores.length + 1, 2);
  for (let i = 0; i < totalSignatureLines; i++) {
    if (lineY > 280) {
      doc.addPage();
      lineY = 20;
    }
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.4);
    doc.line(15, lineY, rightMarginX, lineY);
    lineY += 7.5;
  }

  return doc;
}
