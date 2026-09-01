import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { generateAtaPDF } from '../../utils/pdfAtaGenerator';
import { FileText, Download, Printer, Edit3, Settings, Check, Image, Type } from 'lucide-react';

export function AtaGeneratorView() {
  const { currentSchool, schoolProfessores, schoolEscolhas, schoolTurmas } = useApp();

  const [headerConfig, setHeaderConfig] = useState({
    // Timbre Oficial da Escola (3cm de altura)
    fonteCabecalho: 'arial', // 'arial' ou 'times'
    logoImage: '/logo-sme-luziania.png',
    logoAspect: 2.5,
    linha1: 'ESTADO DE GOIÁS - PREFEITURA MUNICIPAL DE LUZIÂNIA',
    linha2: 'SECRETARIA MUNICIPAL DE EDUCAÇÃO - SME',
    linha3: currentSchool ? `${currentSchool.nome} • INEP: ${currentSchool.codigo_inep || '52098222'}` : 'CMEB MARIA LUCINDA LEITE',
    linha4: currentSchool ? `Endereço: ${currentSchool.endereco || 'Luziânia/GO'} • Contato: ${currentSchool.contato || '(61) 99638-2145'}` : 'Prefeitura Municipal de Luziânia - GO',

    // Dados da Reunião e Portaria
    dia: '19',
    mes: 'dezembro',
    anoExtenso: 'dois mil e vinte e seis',
    anoNumero: '2026',
    hora: '13:00',
    sala: 'Auditório Principal',
    nomeEscola: currentSchool?.nome || 'Escola Municipal Juscelino Kubitschek',
    numeroPortaria: '947/2025',
    mesPortaria: 'junho de 2025',
    nomeLavrador: currentSchool?.gestor_nome || 'Profa. Maria das Graças Silva'
  });

  const [isEditingHeader, setIsEditingHeader] = useState(false);

  const getImageBase64 = async (url) => {
    if (!url) return null;
    if (typeof url === 'string' && url.startsWith('data:image')) return url;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.warn('Não foi possível carregar a imagem em Base64:', err);
      return null;
    }
  };

  const handleDownloadPDF = async () => {
    try {
      let logoBase64 = headerConfig.logoImage;
      if (logoBase64 && typeof logoBase64 === 'string' && !logoBase64.startsWith('data:image')) {
        logoBase64 = await getImageBase64(logoBase64);
      }
      const configWithBase64 = { ...headerConfig, logoImage: logoBase64 };
      const doc = generateAtaPDF(currentSchool, schoolEscolhas, schoolProfessores, schoolTurmas, configWithBase64);
      
      const rawName = currentSchool?.nome || 'Escola';
      const schoolCleanName = rawName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w-]/gi, '_');
      doc.save(`Ata_Escolha_Turma_ANEXO_I_${schoolCleanName}_2026.pdf`);
    } catch (err) {
      console.error('Erro detalhado ao gerar PDF da Ata:', err);
      alert(`Ocorreu um erro ao gerar a Ata em PDF:\n${err?.message || err}`);
    }
  };

  const handlePrint = async () => {
    try {
      let logoBase64 = headerConfig.logoImage;
      if (logoBase64 && typeof logoBase64 === 'string' && !logoBase64.startsWith('data:image')) {
        logoBase64 = await getImageBase64(logoBase64);
      }
      const configWithBase64 = { ...headerConfig, logoImage: logoBase64 };
      const doc = generateAtaPDF(currentSchool, schoolEscolhas, schoolProfessores, schoolTurmas, configWithBase64);
      
      doc.autoPrint();
      const blobUrl = doc.output('bloburl');
      const printWin = window.open(blobUrl, '_blank');
      if (printWin) {
        printWin.focus();
      }
    } catch (err) {
      console.error('Erro ao preparar documento de impressão:', err);
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Topo / Barra de Ações */}
      <div className="no-print bg-theme-surface p-5 rounded-2xl border border-theme shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 theme-transition">
        <div>
          <h3 className="text-base font-bold text-theme-main flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#006633] dark:text-emerald-400" /> Ata Oficial de Escolha de Turma
          </h3>
          <p className="text-xs text-theme-muted">
            Formatado em folha A4 com cabeçalho timbrado padrão de 3cm para o Ano Letivo de {headerConfig.anoNumero}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsEditingHeader(!isEditingHeader)}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-theme-main text-xs font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-1.5 border border-theme"
          >
            <Settings className="w-4 h-4 text-[#003399] dark:text-blue-400" /> {isEditingHeader ? 'Fechar Montador' : 'Personalizar Cabeçalho (3cm)'}
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-900 transition-all flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> Imprimir Documento
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-5 py-2.5 bg-gradient-sme text-white text-xs font-bold rounded-xl shadow-md hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Baixar Ata em PDF
          </button>
        </div>
      </div>

      {/* Painel do Gestor para Personalizar o Cabeçalho Timbrado da Escola */}
      {isEditingHeader && (
        <div className="no-print bg-theme-surface border border-theme p-6 rounded-2xl space-y-6 shadow-sm text-theme-main theme-transition">
          
          {/* Seção 1: Cabeçalho Timbrado da Escola (3cm de Topo) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-theme pb-2">
              <h4 className="text-sm font-bold flex items-center gap-2 text-[#003399] dark:text-blue-400">
                <Image className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> 1. Personalização do Cabeçalho Timbrado da Escola (3cm de altura)
              </h4>
              <span className="text-[11px] text-theme-muted font-medium">Formato A4 • PDF gerado em fonte Arial</span>
            </div>

            {/* Linhas de Texto Customizadas do Timbre */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
              <div>
                <label className="block font-semibold text-theme-muted mb-1">Linha 1 (Órgão Superior / Ente)</label>
                <input
                  type="text"
                  value={headerConfig.linha1}
                  onChange={(e) => setHeaderConfig({ ...headerConfig, linha1: e.target.value })}
                  className="w-full px-3 py-2 border border-theme rounded-xl bg-theme-surface dark:bg-slate-800 dark:text-white font-medium"
                />
              </div>
              <div>
                <label className="block font-semibold text-theme-muted mb-1">Linha 2 (Secretaria / Departamento)</label>
                <input
                  type="text"
                  value={headerConfig.linha2}
                  onChange={(e) => setHeaderConfig({ ...headerConfig, linha2: e.target.value })}
                  className="w-full px-3 py-2 border border-theme rounded-xl bg-theme-surface dark:bg-slate-800 dark:text-white font-medium"
                />
              </div>
              <div>
                <label className="block font-semibold text-theme-muted mb-1">Linha 3 (Nome da Unidade Escolar & INEP)</label>
                <input
                  type="text"
                  value={headerConfig.linha3}
                  onChange={(e) => setHeaderConfig({ ...headerConfig, linha3: e.target.value })}
                  className="w-full px-3 py-2 border border-theme rounded-xl bg-theme-surface dark:bg-slate-800 dark:text-white font-medium text-blue-600 dark:text-blue-400"
                />
              </div>
              <div>
                <label className="block font-semibold text-theme-muted mb-1">Linha 4 (Endereço, Telefone e Contatos)</label>
                <input
                  type="text"
                  value={headerConfig.linha4}
                  onChange={(e) => setHeaderConfig({ ...headerConfig, linha4: e.target.value })}
                  className="w-full px-3 py-2 border border-theme rounded-xl bg-theme-surface dark:bg-slate-800 dark:text-white font-medium"
                />
              </div>
            </div>

          </div>

          {/* Seção 2: Dados da Reunião e da Portaria */}
          <div className="space-y-4 border-t border-theme pt-4">
            <h4 className="text-sm font-bold flex items-center gap-2 text-[#006633] dark:text-emerald-400">
              <Edit3 className="w-4 h-4" /> 2. Dados do Parágrafo Formal da Ata
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-theme-muted mb-1">Dia da Reunião</label>
                <input
                  type="text"
                  value={headerConfig.dia}
                  onChange={(e) => setHeaderConfig({ ...headerConfig, dia: e.target.value })}
                  className="w-full px-3 py-2 border border-theme rounded-xl bg-theme-surface dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-theme-muted mb-1">Mês da Reunião</label>
                <input
                  type="text"
                  value={headerConfig.mes}
                  onChange={(e) => setHeaderConfig({ ...headerConfig, mes: e.target.value })}
                  className="w-full px-3 py-2 border border-theme rounded-xl bg-theme-surface dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-theme-muted mb-1">Ano por Extenso</label>
                <input
                  type="text"
                  value={headerConfig.anoExtenso}
                  onChange={(e) => setHeaderConfig({ ...headerConfig, anoExtenso: e.target.value })}
                  className="w-full px-3 py-2 border border-theme rounded-xl bg-theme-surface dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-theme-muted mb-1">Horário de Início</label>
                <input
                  type="text"
                  value={headerConfig.hora}
                  onChange={(e) => setHeaderConfig({ ...headerConfig, hora: e.target.value })}
                  className="w-full px-3 py-2 border border-theme rounded-xl bg-theme-surface dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-theme-muted mb-1">Sala / Dependência</label>
                <input
                  type="text"
                  value={headerConfig.sala}
                  onChange={(e) => setHeaderConfig({ ...headerConfig, sala: e.target.value })}
                  className="w-full px-3 py-2 border border-theme rounded-xl bg-theme-surface dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-theme-muted mb-1">Unidade de Ensino (Escola)</label>
                <input
                  type="text"
                  value={headerConfig.nomeEscola}
                  onChange={(e) => setHeaderConfig({ ...headerConfig, nomeEscola: e.target.value })}
                  className="w-full px-3 py-2 border border-theme rounded-xl bg-theme-surface dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-theme-muted mb-1">Nº e Ano da Portaria</label>
                <input
                  type="text"
                  value={headerConfig.numeroPortaria}
                  onChange={(e) => setHeaderConfig({ ...headerConfig, numeroPortaria: e.target.value })}
                  className="w-full px-3 py-2 border border-theme rounded-xl bg-theme-surface dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-theme-muted mb-1">Nome do Lavrador(a) da Ata</label>
                <input
                  type="text"
                  value={headerConfig.nomeLavrador}
                  onChange={(e) => setHeaderConfig({ ...headerConfig, nomeLavrador: e.target.value })}
                  className="w-full px-3 py-2 border border-theme rounded-xl bg-theme-surface dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-theme">
            <button
              onClick={() => setIsEditingHeader(false)}
              className="px-5 py-2.5 bg-gradient-sme text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Aplicar e Salvar Configuração do Cabeçalho
            </button>
          </div>
        </div>
      )}

      {/* Prévia Fiel do Documento A4 com Cabeçalho Timbrado de 3cm */}
      <div className="bg-white p-10 rounded-2xl border border-slate-300 shadow-xl max-w-4xl mx-auto text-black leading-relaxed print-only">
        
        {/* CABEÇALHO TIMBRADO DA ESCOLA (ALTURA PADRÃO DE 3cm / 30mm) */}
        <div
          style={{
            fontFamily: headerConfig.fonteCabecalho === 'times' ? '"Times New Roman", Times, serif' : 'Arial, Helvetica, sans-serif'
          }}
          className="h-[113px] pb-3 mb-6 flex items-center gap-4 justify-between"
        >
          {headerConfig.logoImage && (
            <div className="h-full max-h-[90px] w-28 flex items-center justify-center shrink-0">
              <img src={headerConfig.logoImage} alt="Logo da Escola" className="max-h-full max-w-full object-contain" />
            </div>
          )}
          <div className="flex-1 space-y-0.5">
            <h5 className="text-[11px] font-bold uppercase tracking-tight text-slate-900 leading-tight">
              {headerConfig.linha1}
            </h5>
            <h4 className="text-[12px] font-bold uppercase tracking-wide text-slate-900 leading-tight">
              {headerConfig.linha2}
            </h4>
            <h3 className="text-[13px] font-extrabold uppercase text-[#003399] leading-tight">
              {headerConfig.linha3}
            </h3>
            <p className="text-[10px] text-slate-700 leading-tight font-normal">
              {headerConfig.linha4}
            </p>
          </div>
        </div>

        {/* CORPO DO DOCUMENTO OFICIAL */}
        <div className="text-center space-y-1 mb-6 font-sans">
          <h2 className="text-sm font-extrabold uppercase tracking-wide">
            ATA DE ESCOLHA DE TURMA DA ESCOLA PARA O ANO LETIVO DE {headerConfig.anoNumero}
          </h2>
        </div>

        <p className="text-xs text-justify leading-relaxed mb-6 font-normal font-sans">
          Aos <span className="font-bold underline px-1">{headerConfig.dia}</span> dias do mês de{' '}
          <span className="font-bold underline px-1">{headerConfig.mes}</span> de{' '}
          <span className="font-bold underline px-1">{headerConfig.anoExtenso}</span>, às{' '}
          <span className="font-bold underline px-1">{headerConfig.hora}</span> horas, na sala{' '}
          <span className="font-bold underline px-1">{headerConfig.sala}</span> da Unidade de Ensino{' '}
          <span className="font-bold underline px-1">{headerConfig.nomeEscola}</span>, reuniram-se os servidores para realização do processo de distribuição de turma para o ano letivo de {headerConfig.anoNumero}. Nesta oportunidade, o (a) diretor (a) deu abertura à reunião fazendo a leitura da Portaria de nº{' '}
          <span className="font-bold">{headerConfig.numeroPortaria}</span> de {headerConfig.mesPortaria} e, segundo ordem de escolha, iniciou a distribuição dos professores por turma, ficando determinado da seguinte forma:
        </p>

        <div className="overflow-x-auto mb-6 font-sans">
          <table className="w-full text-left border-collapse border border-black text-xs">
            <thead>
              <tr className="border-b border-black text-[11px] font-bold">
                <th className="border-r border-black p-2 w-1/2">Nome completo do(a) professor(a)</th>
                <th className="border-r border-black p-2 w-1/3">Turma escolhida</th>
                <th className="p-2 w-1/6 text-center">Turno</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black">
              {schoolProfessores.map((prof) => {
                const escolha = schoolEscolhas.find((e) => e.professor_id === prof.id);
                const turmaObj = escolha ? (escolha.turma || schoolTurmas.find((t) => t.id === escolha.turma_id)) : null;
                const turmaDesc = turmaObj ? turmaObj.descricao : (escolha ? `Turma #${escolha.turma_id}` : '');
                const turnoDesc = turmaObj ? turmaObj.turno?.toUpperCase() : (escolha ? escolha.turno_selecionado?.toUpperCase() : '');

                return (
                  <tr key={prof.id} className="h-8">
                    <td className="border-r border-black p-2 font-medium">{prof.nome}</td>
                    <td className="border-r border-black p-2 font-bold">{turmaDesc}</td>
                    <td className="p-2 text-center uppercase font-medium">{turnoDesc}</td>
                  </tr>
                );
              })}

              {schoolProfessores.length === 0 && (
                <tr className="h-8">
                  <td className="border-r border-black p-2 text-slate-400 italic font-normal">Nenhum professor cadastrado</td>
                  <td className="border-r border-black p-2">&nbsp;</td>
                  <td className="p-2">&nbsp;</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="space-y-6 text-xs pt-2 font-sans">
          <p className="text-justify leading-relaxed">
            Não tendo mais assunto a tratar, eu, <span className="font-bold underline px-1">{headerConfig.nomeLavrador}</span>, lavro a presente ata, sendo firmada a assinatura de todos os presentes. (assinar com o nome legível por extenso, sem espaço entre os nomes).
          </p>

          <div className="space-y-4 pt-2">
            {Array.from({ length: Math.max(schoolProfessores.length + 1, 2) }).map((_, idx) => (
              <div key={idx} className="border-b border-black w-full h-4"></div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
