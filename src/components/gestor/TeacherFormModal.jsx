import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { DatePicker } from '../common/DatePicker';
import { NumericCalculatorModal } from '../common/NumericCalculatorModal';
import { Plus, Trash2, Award, BookOpen, Clock, FileCheck, Check, GraduationCap, Monitor, BarChart3, Calendar, Calculator, X } from 'lucide-react';
import { calculateTeacherScore } from '../../services/scoringEngine';

function calculatePeriodInfo(startDateStr, endDateStr) {
  if (!startDateStr || !endDateStr) return null;
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return null;

  const diffTime = end - start;
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive do dia final
  const fullYears = Math.floor(totalDays / 365);
  const remainingDays = totalDays % 365;
  const finalYears = fullYears + (remainingDays >= 180 ? 1 : 0);

  return {
    totalDays,
    fullYears,
    remainingDays,
    finalYears,
    hasExtraYearBonus: remainingDays >= 180
  };
}

export function TeacherFormModal({ isOpen, onClose, onSave, teacherToEdit }) {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    data_nascimento: '',
    data_admissao: '',
    carga_horaria: 40,
    tipo_vinculo: 'efetivo',
    faltas_injustificadas_2025: 0,
    frequencia_alfamais_percentual: 0,
    regencias: [],
    publicacoes: [],
    formacoes: [],
    avaliacoes: []
  });

  const [calculatedPreview, setCalculatedPreview] = useState(0);
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [showNumericCalcModal, setShowNumericCalcModal] = useState(false);
  const [calcStartDate, setCalcStartDate] = useState('');
  const [calcEndDate, setCalcEndDate] = useState('');

  useEffect(() => {
    if (teacherToEdit) {
      const sanitizedRegencias = (teacherToEdit.regencias || []).map((r) => {
        let anosVal = r.anos;
        if (anosVal === undefined || anosVal === null || anosVal === '') {
          const dias = Number(r.dias_trabalhados) || 0;
          const anosCompletos = Math.floor(dias / 365);
          const restoDias = dias % 365;
          anosVal = anosCompletos + (restoDias >= 180 ? 1 : 0);
        }
        return {
          ...r,
          anos: Number(anosVal) || 0,
          showCalculator: Boolean(r.showCalculator),
          data_inicio: r.data_inicio || '',
          data_fim: r.data_fim || ''
        };
      });

      setFormData({
        ...teacherToEdit,
        regencias: sanitizedRegencias,
        publicacoes: teacherToEdit.publicacoes || [],
        formacoes: teacherToEdit.formacoes || [],
        avaliacoes: teacherToEdit.avaliacoes || []
      });
    } else {
      setFormData({
        nome: '',
        cpf: '',
        data_nascimento: '',
        data_admissao: '',
        carga_horaria: 40,
        tipo_vinculo: 'efetivo',
        faltas_injustificadas_2025: 0,
        frequencia_alfamais_percentual: 0,
        regencias: [],
        publicacoes: [],
        formacoes: [],
        avaliacoes: []
      });
    }
  }, [teacherToEdit, isOpen]);

  useEffect(() => {
    const { pontuacaoTotal } = calculateTeacherScore(formData);
    setCalculatedPreview(pontuacaoTotal);
  }, [formData]);

  // Regências (Seção I)
  const addRegencia = () => {
    setFormData((prev) => ({
      ...prev,
      regencias: [
        ...prev.regencias,
        {
          tipo: 'efetivo_unidade',
          carga_horaria: prev.carga_horaria,
          anos: 1,
          showCalculator: false,
          data_inicio: '',
          data_fim: ''
        }
      ]
    }));
  };

  const removeRegencia = (index) => {
    setFormData((prev) => ({
      ...prev,
      regencias: prev.regencias.filter((_, i) => i !== index)
    }));
  };

  // Publicações
  const addPublicacao = () => {
    setFormData((prev) => ({
      ...prev,
      publicacoes: [...prev.publicacoes, { tipo: 'tecnica_pedagogica', titulo: '' }]
    }));
  };

  const removePublicacao = (index) => {
    setFormData((prev) => ({
      ...prev,
      publicacoes: prev.publicacoes.filter((_, i) => i !== index)
    }));
  };



  // Helpers para controle de limites máximos e prevenção de dupla seleção
  const latoCount = formData.formacoes.filter(f => f.tipo === 'lato_sensu').length;
  const mestradoCount = formData.formacoes.filter(f => f.tipo === 'mestrado').length;
  const doutoradoCount = formData.formacoes.filter(f => f.tipo === 'doutorado').length;

  const getTitulacaoCountOtherRows = (tipo, excludeRealIndex) => {
    return formData.formacoes
      .filter((f, idx) => idx !== excludeRealIndex && f.tipo === tipo)
      .length;
  };

  const presencialCaps = {
    alfabetizacao_presencial: 100,
    ed_infantil_presencial: 100,
    ed_especial_presencial: 100,
    palestras_smel: 100,
    outros_orgaos_publicos: 100
  };

  const getPresencialCategoryHoursOtherRows = (catKey, excludeRealIndex) => {
    return formData.formacoes
      .filter((f, idx) => idx !== excludeRealIndex && f.modalidade === 'presencial' && f.tipo === catKey)
      .reduce((sum, c) => sum + (Number(c.carga_horaria) || 0), 0);
  };

  const eadCaps = {
    alfabetizacao_ead: 200,
    ed_infantil_ead: 200,
    ed_especial_ead: 200,
    palestras_ead: 200,
    outros_ead: 200
  };

  const getEadCategoryHoursOtherRows = (catKey, excludeRealIndex) => {
    return formData.formacoes
      .filter((f, idx) => idx !== excludeRealIndex && (f.modalidade === 'ead' || f.modalidade === 'semipresencial') && f.tipo === catKey)
      .reduce((sum, c) => sum + (Number(c.carga_horaria) || 0), 0);
  };

  // Titulações Presenciais
  const addTitulacao = () => {
    let nextTipo = 'lato_sensu';
    if (latoCount >= 4 && mestradoCount < 2) nextTipo = 'mestrado';
    else if (latoCount >= 4 && mestradoCount >= 2 && doutoradoCount < 1) nextTipo = 'doutorado';
    else if (latoCount >= 4 && mestradoCount >= 2 && doutoradoCount >= 1) return;

    setFormData((prev) => ({
      ...prev,
      formacoes: [...prev.formacoes, { tipo: nextTipo, nome_curso: '', carga_horaria: 360, modalidade: 'presencial' }]
    }));
  };

  // Formações Presenciais 2025
  const addFormacaoPresencial = () => {
    const optionsOrder = ['alfamais', 'sintego', 'praxis_pedagogica', 'alfabetizacao_presencial', 'ed_infantil_presencial', 'ed_especial_presencial', 'palestras_smel', 'outros_orgaos_publicos'];
    const availableTipo = optionsOrder.find((t) => {
      const cap = presencialCaps[t];
      if (!cap) return true;
      return getPresencialCategoryHoursOtherRows(t, -1) < cap;
    }) || 'alfamais';

    setFormData((prev) => ({
      ...prev,
      formacoes: [...prev.formacoes, { tipo: availableTipo, nome_curso: '', carga_horaria: 40, modalidade: 'presencial' }]
    }));
  };

  // Formações EAD 2025
  const addFormacaoEAD = () => {
    const optionsOrder = ['alfabetizacao_ead', 'ed_infantil_ead', 'ed_especial_ead', 'palestras_ead', 'outros_ead'];
    const availableTipo = optionsOrder.find((t) => getEadCategoryHoursOtherRows(t, -1) < 200) || 'outros_ead';

    setFormData((prev) => ({
      ...prev,
      formacoes: [...prev.formacoes, { tipo: availableTipo, nome_curso: '', carga_horaria: 40, modalidade: 'ead' }]
    }));
  };

  const removeFormacao = (index) => {
    setFormData((prev) => ({
      ...prev,
      formacoes: prev.formacoes.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  // Listas de formações separadas para a interface
  const titulosPresenciais = formData.formacoes.filter(f => ['lato_sensu', 'mestrado', 'doutorado'].includes(f.tipo));
  const cursosPresenciais = formData.formacoes.filter(f => f.modalidade === 'presencial' && !['lato_sensu', 'mestrado', 'doutorado'].includes(f.tipo));
  const cursosEAD = formData.formacoes.filter(f => f.modalidade === 'ead' || f.modalidade === 'semipresencial');

  // Cálculo da pontuação em tempo real
  const { pontuacaoTotal, detalhamento } = calculateTeacherScore(formData);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={teacherToEdit ? `Editar Pontuação: ${teacherToEdit.nome}` : 'Ficha de Pontuação de Professor - Portaria Nº 947/2025'}
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-theme-main">
        
        {/* Banner com Pontuação Total e Selo Oficial */}
        <div className="bg-gradient-sme text-white p-4 rounded-2xl flex items-center justify-between shadow-md">
          <div>
            <p className="text-[11px] uppercase font-bold tracking-wider text-emerald-200">Pontuação Total Calculada (Em Tempo Real)</p>
            <h4 className="text-3xl font-black">{pontuacaoTotal.toFixed(2)} <span className="text-sm font-normal text-emerald-100">pontos acumulados</span></h4>
          </div>
          <div className="text-right text-xs opacity-90 hidden sm:block">
            <p className="font-semibold">Calculado pelas regras oficiais da</p>
            <p className="font-extrabold text-amber-300">Portaria Nº 947/2025 - SME Luziânia</p>
          </div>
        </div>

        {/* 1. DADOS PESSOAIS & CRITÉRIOS DE DESEMPATE */}
        <div className="bg-theme-surface p-4 rounded-2xl border border-theme space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-theme-main">
            <Award className="w-4 h-4 text-[#006633] dark:text-emerald-400" /> 1. Dados Pessoais & Vínculo Funcional
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex flex-col justify-end">
              <div className="h-5 flex items-center mb-1">
                <label className="block text-xs font-semibold text-theme-muted whitespace-nowrap">Nome Completo *</label>
              </div>
              <input
                type="text"
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-theme dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-[#006633] h-9"
                placeholder="Ex: Profa. Maria Auxiliadora"
              />
            </div>

            <div className="flex flex-col justify-end">
              <div className="h-5 flex items-center mb-1">
                <label className="block text-xs font-semibold text-theme-muted whitespace-nowrap">CPF *</label>
              </div>
              <input
                type="text"
                required
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-theme dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-[#006633] h-9"
                placeholder="000.000.000-00"
              />
            </div>

            <div className="flex flex-col justify-end">
              <div className="h-5 flex items-center mb-1">
                <label className="block text-xs font-semibold text-theme-muted whitespace-nowrap">Data Nascimento (Critério e) *</label>
              </div>
              <DatePicker
                required
                value={formData.data_nascimento}
                onChange={(val) => setFormData({ ...formData, data_nascimento: val })}
                minYear={1940}
                maxYear={2026}
              />
            </div>

            <div className="flex flex-col justify-end">
              <div className="h-5 flex items-center mb-1">
                <label className="block text-xs font-semibold text-theme-muted whitespace-nowrap">Data de Admissão *</label>
              </div>
              <DatePicker
                required
                value={formData.data_admissao}
                onChange={(val) => setFormData({ ...formData, data_admissao: val })}
                minYear={1970}
                maxYear={2026}
              />
            </div>

            <div className="flex flex-col justify-end">
              <div className="h-5 flex items-center mb-1">
                <label className="block text-xs font-semibold text-theme-muted whitespace-nowrap">Carga Horária Semanal *</label>
              </div>
              <select
                value={formData.carga_horaria}
                onChange={(e) => setFormData({ ...formData, carga_horaria: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-theme dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-[#006633] h-9"
              >
                <option value={20}>20 horas semanais</option>
                <option value={30}>30 horas semanais</option>
                <option value={40}>40 horas semanais</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <div className="h-5 flex items-center mb-1">
                <label className="block text-xs font-semibold text-theme-muted whitespace-nowrap">Tipo de Vínculo *</label>
              </div>
              <select
                disabled
                value="efetivo"
                className="w-full px-3 py-2 text-xs border border-theme bg-slate-100 dark:bg-slate-800/80 text-theme-main rounded-xl font-bold h-9 cursor-not-allowed"
                title="Processo exclusivo para Professores Efetivos da Rede Municipal"
              >
                <option value="efetivo">Professor Efetivo</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <div className="h-5 flex items-center mb-1">
                <label className="block text-xs font-semibold text-theme-muted whitespace-nowrap">Faltas Injustificadas 2025 (Art. 2º V a)</label>
              </div>
              <input
                type="number"
                min="0"
                value={formData.faltas_injustificadas_2025}
                onChange={(e) => setFormData({ ...formData, faltas_injustificadas_2025: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-theme dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-[#006633] h-9"
              />
            </div>

            <div className="flex flex-col justify-end">
              <div className="h-5 flex items-center mb-1">
                <label className="block text-xs font-semibold text-theme-muted whitespace-nowrap">Frequência AlfaMais (%) (Art. 4º - mín 90%)</label>
              </div>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.frequencia_alfamais_percentual}
                onChange={(e) => setFormData({ ...formData, frequencia_alfamais_percentual: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-theme dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-[#006633] h-9"
              />
            </div>

            <div className="flex flex-col justify-end">
              <div className="h-5 flex items-center mb-1">
                <label className="block text-xs font-semibold text-theme-muted whitespace-nowrap">Avaliação Desempenho 2025 (%)</label>
              </div>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.avaliacoes[0]?.percentual ?? 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    avaliacoes: [{ ano: 2025, percentual: e.target.value === '' ? '' : Number(e.target.value) }]
                  })
                }
                className="w-full px-3 py-2 text-xs border border-theme dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-[#006633] h-9"
              />
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] font-black text-[#006633] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  Parcial: {(detalhamento.secaoVI_desempenho || 0).toFixed(2)} pts
                </span>
                <span className="text-[10px] font-black text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded-md border border-amber-300 dark:border-amber-700">
                  Total: {pontuacaoTotal.toFixed(2)} pts
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SEÇÃO I – TEMPO DE SERVIÇO POR MATRÍCULA/ANO (REGÊNCIAS E CARGOS) */}
        <div className="bg-theme-surface p-4 rounded-2xl border border-theme space-y-3">
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-theme-main">
              <Clock className="w-4 h-4 text-[#003399] dark:text-blue-400" /> SEÇÃO I - Regências & Tempo de Serviço (Calculado em Anos)
            </h4>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-[#006633] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-800 shadow-xs">
                  Parcial Seção I: {detalhamento.secaoI_tempoServico || 0} pts
                </span>
                <span className="text-xs font-black text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-lg border border-amber-300 dark:border-amber-700 shadow-xs">
                  Total: {pontuacaoTotal.toFixed(2)} pts
                </span>
              </div>
              <button
                type="button"
                onClick={addRegencia}
                className="text-xs text-[#006633] dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Regência
              </button>
            </div>
            <p className="text-[11px] text-theme-muted">
              Cômputo oficial em <strong>Anos</strong>. Use a Calculadora de Datas para contar os dias e converter 180+ dias em 1 ano (Art. 2º, VI).
            </p>
          </div>

          {formData.regencias.length === 0 ? (
            <p className="text-xs text-theme-muted italic">Nenhuma regência cadastrada. Clique em "Adicionar Regência".</p>
          ) : (
            <div className="space-y-2">
              {formData.regencias.map((reg, idx) => {
              const periodInfo = calculatePeriodInfo(reg.data_inicio, reg.data_fim);
              const itemPts = detalhamento.regenciasBreakdown?.[idx]?.pontos || 0;

              return (
                <div key={idx} className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-theme space-y-2">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2">
                    
                    {/* Dropdown Tipo de Regência */}
                    <select
                      value={reg.tipo}
                      onChange={(e) => {
                        const copy = [...formData.regencias];
                        copy[idx].tipo = e.target.value;
                        setFormData({ ...formData, regencias: copy });
                      }}
                      className="text-xs p-2 border border-theme rounded-lg bg-theme-surface text-theme-main flex-1 w-full"
                    >
                      <option value="efetivo_rede">a) Efetivo Regência na Rede (14/16/28 pts/ano)</option>
                      <option value="efetivo_unidade">b) Efetivo Regência nesta Unidade (8/10/16 pts/ano)</option>
                      <option value="contrato_temporario">c) Contrato Temporário (3/4/6 pts/ano)</option>
                      <option value="cargo_sme">d) Diretor, Supervisor, Secretário/Comissionado SME (14/16/28 pts/ano)</option>
                      <option value="mandato_classista">e) Mandato Classista / Conselhos Escolar/Fundeb (14/16/28 pts/ano)</option>
                    </select>
                    
                    <div className="flex items-center gap-2 w-full lg:w-auto shrink-0 flex-wrap">
                      {/* Dropdown Carga Horária */}
                      <select
                        value={reg.carga_horaria}
                        onChange={(e) => {
                          const copy = [...formData.regencias];
                          copy[idx].carga_horaria = Number(e.target.value);
                          setFormData({ ...formData, regencias: copy });
                        }}
                        className="text-xs p-2 border border-theme rounded-lg bg-theme-surface text-theme-main"
                      >
                        <option value={20}>20h</option>
                        <option value={30}>30h</option>
                        <option value={40}>40h</option>
                      </select>
                      
                      {/* Campo ANOS TRABALHADOS */}
                      <div className="flex items-center gap-1.5 text-xs bg-theme-surface px-2.5 py-1.5 border border-theme rounded-lg">
                        <span className="text-theme-muted font-bold">Anos:</span>
                        <input
                          type="number"
                          min="0"
                          max="50"
                          value={reg.anos ?? 0}
                          onChange={(e) => {
                            const copy = [...formData.regencias];
                            copy[idx].anos = Number(e.target.value);
                            setFormData({ ...formData, regencias: copy });
                          }}
                          className="w-14 p-1 text-center font-bold border border-theme rounded-md text-xs bg-slate-50 dark:bg-slate-800 text-theme-main focus:ring-2 focus:ring-[#006633]"
                        />
                      </div>

                      {/* Pontuação calculada do item */}
                      <span className="w-[105px] min-w-[105px] text-center inline-flex items-center justify-center text-xs font-black text-[#006633] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 shrink-0">
                        = {itemPts} pts
                      </span>

                      {/* Botão Calculadora de Período (Datas) */}
                      <button
                        type="button"
                        onClick={() => {
                          const copy = [...formData.regencias];
                          copy[idx].showCalculator = !copy[idx].showCalculator;
                          setFormData({ ...formData, regencias: copy });
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-all ${
                          reg.showCalculator
                            ? 'bg-[#003399] text-white border-[#003399]'
                            : 'bg-slate-100 dark:bg-slate-800 text-theme-main border-theme hover:bg-slate-200 dark:hover:bg-slate-700 dark:hover:text-white'
                        }`}
                        title="Calculadora de Período por Datas (Dia/Mês/Ano)"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Calculadora de Datas</span>
                      </button>

                      {/* Remover Regência */}
                      <button
                        type="button"
                        onClick={() => removeRegencia(idx)}
                        className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40"
                        title="Remover Regência"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>

                  {/* CALCULADORA DE DATAS (Se expandida pelo gestor) */}
                  {reg.showCalculator && (
                    <div className="mt-2 p-3 bg-blue-50/70 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-xl space-y-2.5 text-xs">
                      <div className="flex items-center justify-between font-bold text-[#003399] dark:text-blue-300">
                        <span className="flex items-center gap-1.5">
                          <Calculator className="w-4 h-4" /> Calculadora de Dias e Anos por Período de Trabalho (Art. 2º, VI)
                        </span>
                        <span className="text-[11px] font-normal text-theme-muted">Selecione início e fim</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Data de Início (Dia / Mês / Ano) *</label>
                          <DatePicker
                            value={reg.data_inicio || ''}
                            onChange={(val) => {
                              const copy = [...formData.regencias];
                              copy[idx].data_inicio = val;
                              setFormData({ ...formData, regencias: copy });
                            }}
                            minYear={1970}
                            maxYear={2026}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Data de Fim (Dia / Mês / Ano) *</label>
                          <DatePicker
                            value={reg.data_fim || ''}
                            onChange={(val) => {
                              const copy = [...formData.regencias];
                              copy[idx].data_fim = val;
                              setFormData({ ...formData, regencias: copy });
                            }}
                            minYear={1970}
                            maxYear={2026}
                          />
                        </div>
                      </div>

                      {/* Resultado do Período Calculado */}
                      {periodInfo ? (
                        <div className="p-3 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 text-xs">
                              <span>🗓️ Período Selecionado: <strong>{periodInfo.totalDays} dia(s)</strong> de trabalho contados</span>
                            </p>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                              Decomposição: {periodInfo.fullYears} ano(s) completo(s) + {periodInfo.remainingDays} dia(s) restante(s).
                              {periodInfo.hasExtraYearBonus ? (
                                <strong className="text-emerald-700 dark:text-emerald-400 block sm:inline sm:ml-1">
                                  (≥ 180 dias restantes → Garante +1 ano extra pela Portaria Art. 2º, VI!)
                                </strong>
                              ) : (
                                <span className="text-slate-500 dark:text-slate-400 block sm:inline sm:ml-1">
                                  (&lt; 180 dias restantes)
                                </span>
                              )}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const copy = [...formData.regencias];
                              copy[idx].anos = periodInfo.finalYears;
                              copy[idx].dias_trabalhados = periodInfo.totalDays;
                              setFormData({ ...formData, regencias: copy });
                            }}
                            className="px-3 py-2 bg-[#006633] hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors shrink-0 flex items-center gap-1 justify-center"
                          >
                            <Check className="w-3.5 h-3.5" /> Usar {periodInfo.finalYears} ano(s) no cálculo
                          </button>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic bg-white/60 dark:bg-slate-800/60 p-2 rounded-lg border border-blue-100 dark:border-blue-900">
                          💡 Selecione a data inicial e final no calendário acima. O sistema calculará os dias decorridos no período e indicará se o número de dias ultrapassa 180 dias para arredondar para +1 ano conforme a Portaria.
                        </p>
                      )}

                    </div>
                  )}

                </div>
              );
            })}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (formData.regencias.length > 0) {
                      const copy = [...formData.regencias];
                      const lastIdx = copy.length - 1;
                      copy[lastIdx].showCalculator = !copy[lastIdx].showCalculator;
                      setFormData({ ...formData, regencias: copy });
                    } else {
                      setShowCalcModal(true);
                    }
                  }}
                  className="text-xs text-[#003399] dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer py-1 px-2.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                  title="Usar Calculadora de Período por Datas (Art. 2º, VI)"
                >
                  <Calculator className="w-3.5 h-3.5 text-[#003399] dark:text-blue-400" /> Calculadora de Datas
                </button>
                <button
                  type="button"
                  onClick={addRegencia}
                  className="text-xs text-[#006633] dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer py-1 px-2.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Regência
                </button>
              </div>
            </div>
          )}
        </div>

        {/* PUBLICAÇÃO NA ÁREA DA EDUCAÇÃO */}
        <div className="bg-theme-surface p-4 rounded-2xl border border-theme space-y-3">
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-theme-main">
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> PUBLICAÇÃO NA ÁREA DA EDUCAÇÃO
            </h4>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-800 shadow-xs">
                  Parcial Publicações: {detalhamento.secaoII_publicacoes || 0} pts
                </span>
                <span className="text-xs font-black text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-lg border border-amber-300 dark:border-amber-700 shadow-xs">
                  Total: {pontuacaoTotal.toFixed(2)} pts
                </span>
              </div>
              <button
                type="button"
                onClick={addPublicacao}
                className="text-xs text-[#006633] dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Publicação
              </button>
            </div>
          </div>

          {formData.publicacoes.length === 0 ? (
            <p className="text-xs text-theme-muted italic">Nenhuma publicação cadastrada.</p>
          ) : (
            <div className="space-y-2">
              {formData.publicacoes.map((pub, idx) => {
              const pubPts = detalhamento.publicacoesBreakdown?.[idx]?.pontos || 0;

              return (
                <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-theme">
                  <input
                    type="text"
                    placeholder="Título do trabalho, livro ou artigo..."
                    value={pub.titulo}
                    onChange={(e) => {
                      const copy = [...formData.publicacoes];
                      copy[idx].titulo = e.target.value;
                      setFormData({ ...formData, publicacoes: copy });
                    }}
                    className="text-xs p-2 border border-theme rounded-lg bg-theme-surface text-theme-main flex-1 w-full"
                  />
                  <select
                    value={pub.tipo}
                    onChange={(e) => {
                      const copy = [...formData.publicacoes];
                      copy[idx].tipo = e.target.value;
                      setFormData({ ...formData, publicacoes: copy });
                    }}
                    className="text-xs p-2 border border-theme rounded-lg bg-theme-surface text-theme-main"
                  >
                    <option value="tecnica_pedagogica">a) Atividades Técnicas/Pedagógicas/Projetos (50 pts/título)</option>
                    <option value="artigo_issn">b) Artigos Qualis ou ISSN (100 pts/título)</option>
                    <option value="livro_isbn">c) Autor/Coautor de Livros ISBN (200 pts/título)</option>
                  </select>
                  <span className="w-[105px] min-w-[105px] text-center inline-flex items-center justify-center text-xs font-black text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 shrink-0">
                    = {pubPts} pts
                  </span>
                  <button
                    type="button"
                    onClick={() => removePublicacao(idx)}
                    className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowNumericCalcModal(true)}
                  className="text-xs text-[#003399] dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer py-1 px-2.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                  title="Abrir Calculadora Numérica"
                >
                  <Calculator className="w-3.5 h-3.5 text-[#003399] dark:text-blue-400" /> Calculadora
                </button>
                <button
                  type="button"
                  onClick={addPublicacao}
                  className="text-xs text-[#006633] dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer py-1 px-2.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Publicação
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SEÇÃO II – FORMAÇÃO PEDAGÓGICA / TITULAÇÃO PRESENCIAL */}
        <div className="bg-theme-surface p-4 rounded-2xl border border-theme space-y-3">
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-theme-main">
              <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" /> SEÇÃO II - Titulação Presencial (Pós, Mestrado, Doutorado)
            </h4>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/80 px-2.5 py-0.5 rounded-lg border border-purple-300 dark:border-purple-800 shadow-xs">
                  Parcial Seção II: {detalhamento.secaoIII_titulos || 0} pts
                </span>
                <span className="text-xs font-black text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-lg border border-amber-300 dark:border-amber-700 shadow-xs">
                  Total: {pontuacaoTotal.toFixed(2)} pts
                </span>
              </div>
              <button
                type="button"
                disabled={latoCount >= 4 && mestradoCount >= 2 && doutoradoCount >= 1}
                onClick={addTitulacao}
                className={`text-xs font-bold flex items-center gap-1 whitespace-nowrap ${
                  latoCount >= 4 && mestradoCount >= 2 && doutoradoCount >= 1
                    ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
                    : 'text-[#006633] dark:text-emerald-400 hover:underline cursor-pointer'
                }`}
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Titulação
              </button>
            </div>
          </div>

          {titulosPresenciais.length === 0 ? (
            <p className="text-xs text-theme-muted italic">Nenhuma titulação presencial cadastrada.</p>
          ) : (
            <div className="space-y-2">
              {titulosPresenciais.map((tit, idx) => {
              const realIndex = formData.formacoes.indexOf(tit);
              let itemPts = tit.tipo === 'lato_sensu' ? 50 : tit.tipo === 'mestrado' ? 200 : 300;

              return (
                <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-theme">
                  <input
                    type="text"
                    placeholder="Nome do curso / Instituição..."
                    value={tit.nome_curso}
                    onChange={(e) => {
                      const copy = [...formData.formacoes];
                      copy[realIndex].nome_curso = e.target.value;
                      setFormData({ ...formData, formacoes: copy });
                    }}
                    className="text-xs p-2 border border-theme rounded-lg bg-theme-surface text-theme-main flex-1 w-full"
                  />
                  <select
                    value={tit.tipo}
                    onChange={(e) => {
                      const copy = [...formData.formacoes];
                      copy[realIndex].tipo = e.target.value;
                      setFormData({ ...formData, formacoes: copy });
                    }}
                    className="text-xs p-2 border border-theme rounded-lg bg-theme-surface text-theme-main font-semibold"
                  >
                    <option value="lato_sensu" disabled={latoCount >= 4 && tit.tipo !== 'lato_sensu'}>
                      a) Pós Lato-Sensu (min 360h) - 50 pts (máx 4) {latoCount >= 4 && tit.tipo !== 'lato_sensu' ? '⛔ (Máx 4 Atingido)' : ''}
                    </option>
                    <option value="mestrado" disabled={mestradoCount >= 2 && tit.tipo !== 'mestrado'}>
                      b) Mestrado Stricto-Sensu - 200 pts (máx 2) {mestradoCount >= 2 && tit.tipo !== 'mestrado' ? '⛔ (Máx 2 Atingido)' : ''}
                    </option>
                    <option value="doutorado" disabled={doutoradoCount >= 1 && tit.tipo !== 'doutorado'}>
                      c) Doutorado Stricto-Sensu - 300 pts (máx 1) {doutoradoCount >= 1 && tit.tipo !== 'doutorado' ? '⛔ (Máx 1 Atingido)' : ''}
                    </option>
                  </select>
                  <span className="w-[105px] min-w-[105px] text-center inline-flex items-center justify-center text-xs font-black text-purple-700 dark:text-purple-300 bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800 shrink-0">
                    = {itemPts} pts
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFormacao(realIndex)}
                    className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowNumericCalcModal(true)}
                  className="text-xs text-[#003399] dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer py-1 px-2.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                  title="Abrir Calculadora Numérica"
                >
                  <Calculator className="w-3.5 h-3.5 text-[#003399] dark:text-blue-400" /> Calculadora
                </button>
                <button
                  type="button"
                  disabled={latoCount >= 4 && mestradoCount >= 2 && doutoradoCount >= 1}
                  onClick={addTitulacao}
                  className={`text-xs font-bold flex items-center gap-1 cursor-pointer py-1 px-2.5 rounded-lg transition-colors ${
                    latoCount >= 4 && mestradoCount >= 2 && doutoradoCount >= 1
                      ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
                      : 'text-[#006633] dark:text-emerald-400 hover:underline hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Titulação
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SEÇÃO III – FORMAÇÃO PEDAGÓGICA CONTINUADA PRESENCIAL EM 2025 */}
        <div className="bg-theme-surface p-4 rounded-2xl border border-theme space-y-3">
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-theme-main">
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" /> SEÇÃO III - Formação Continuada Presencial (2025)
            </h4>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 px-2.5 py-0.5 rounded-lg border border-blue-300 dark:border-blue-800 shadow-xs">
                  Parcial Seção III: {detalhamento.secaoIV_formacaoPresencial || 0} pts
                </span>
                <span className="text-xs font-black text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-lg border border-amber-300 dark:border-amber-700 shadow-xs">
                  Total: {pontuacaoTotal.toFixed(2)} pts
                </span>
              </div>
              <button
                type="button"
                onClick={addFormacaoPresencial}
                className="text-xs text-[#006633] dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Curso Presencial
              </button>
            </div>
          </div>

          {cursosPresenciais.length === 0 ? (
            <p className="text-xs text-theme-muted italic">Nenhum curso presencial de 2025 cadastrado.</p>
          ) : (
            <div className="space-y-2">
              {cursosPresenciais.map((curso, idx) => {
              const realIndex = formData.formacoes.indexOf(curso);
              const itemPts = detalhamento.presencialBreakdown?.[idx]?.pontos || 0;
              const hasCap = presencialCaps[curso.tipo] !== undefined;
              const usedOther = getPresencialCategoryHoursOtherRows(curso.tipo, realIndex);
              const maxAllowed = hasCap ? Math.max(0, 100 - usedOther) : undefined;
              const isCategoryExhausted = hasCap && usedOther >= 100;

              return (
                <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-theme">
                  <input
                    type="text"
                    placeholder="Nome do curso / instituição..."
                    value={curso.nome_curso}
                    onChange={(e) => {
                      const copy = [...formData.formacoes];
                      copy[realIndex].nome_curso = e.target.value;
                      setFormData({ ...formData, formacoes: copy });
                    }}
                    className="text-xs p-2 border border-theme rounded-lg bg-theme-surface text-theme-main flex-1 w-full"
                  />
                  <select
                    value={curso.tipo}
                    onChange={(e) => {
                      const copy = [...formData.formacoes];
                      const newType = e.target.value;
                      copy[realIndex].tipo = newType;
                      const capNew = presencialCaps[newType];
                      if (capNew) {
                        const usedOtherNew = getPresencialCategoryHoursOtherRows(newType, realIndex);
                        const remNew = Math.max(0, capNew - usedOtherNew);
                        if (copy[realIndex].carga_horaria > remNew) {
                          copy[realIndex].carga_horaria = remNew;
                        }
                      }
                      setFormData({ ...formData, formacoes: copy });
                    }}
                    className="text-xs p-2 border border-theme rounded-lg bg-theme-surface text-theme-main font-medium"
                  >
                    <option value="alfamais">a) AlfaMais Goiás (2 pts/h - sem limite)</option>
                    <option value="alfabetizacao_presencial" disabled={getPresencialCategoryHoursOtherRows('alfabetizacao_presencial', realIndex) >= 100}>
                      b) Alfabetização (2 pts/h, máx 200pts/100h) {getPresencialCategoryHoursOtherRows('alfabetizacao_presencial', realIndex) >= 100 ? '⛔ (Teto 100h Atingido)' : ''}
                    </option>
                    <option value="ed_infantil_presencial" disabled={getPresencialCategoryHoursOtherRows('ed_infantil_presencial', realIndex) >= 100}>
                      c) Educação Infantil (2 pts/h, máx 200pts/100h) {getPresencialCategoryHoursOtherRows('ed_infantil_presencial', realIndex) >= 100 ? '⛔ (Teto 100h Atingido)' : ''}
                    </option>
                    <option value="ed_especial_presencial" disabled={getPresencialCategoryHoursOtherRows('ed_especial_presencial', realIndex) >= 100}>
                      d) Educação Especial (2 pts/h, máx 200pts/100h) {getPresencialCategoryHoursOtherRows('ed_especial_presencial', realIndex) >= 100 ? '⛔ (Teto 100h Atingido)' : ''}
                    </option>
                    <option value="palestras_smel" disabled={getPresencialCategoryHoursOtherRows('palestras_smel', realIndex) >= 100}>
                      e) Palestras / Congressos SMEL (2 pts/h, máx 200pts/100h) {getPresencialCategoryHoursOtherRows('palestras_smel', realIndex) >= 100 ? '⛔ (Teto 100h Atingido)' : ''}
                    </option>
                    <option value="outros_orgaos_publicos" disabled={getPresencialCategoryHoursOtherRows('outros_orgaos_publicos', realIndex) >= 100}>
                      f) Outros Órgãos Públicos / SMEL (2 pts/h, máx 200pts/100h) {getPresencialCategoryHoursOtherRows('outros_orgaos_publicos', realIndex) >= 100 ? '⛔ (Teto 100h Atingido)' : ''}
                    </option>
                    <option value="praxis_pedagogica">g) Educação Especial "Práxis Pedagógica" (2 pts/h - sem limite)</option>
                    <option value="sintego">h) Formação Continuada SINTEGO (5 pts/h - sem limite)</option>
                  </select>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-theme-muted font-bold">Horas:</span>
                    <input
                      type="number"
                      min="0"
                      max={maxAllowed}
                      value={curso.carga_horaria}
                      onChange={(e) => {
                        const copy = [...formData.formacoes];
                        let val = Number(e.target.value);
                        if (maxAllowed !== undefined && val > maxAllowed) {
                          val = maxAllowed;
                        }
                        copy[realIndex].carga_horaria = val;
                        setFormData({ ...formData, formacoes: copy });
                      }}
                      className="w-16 p-1.5 border border-theme rounded-lg text-xs bg-theme-surface text-theme-main font-bold"
                      placeholder="40"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`w-[105px] min-w-[105px] text-center inline-flex items-center justify-center text-xs font-black px-2.5 py-1.5 rounded-lg border shrink-0 ${
                      isCategoryExhausted || (hasCap && itemPts === 0 && Number(curso.carga_horaria) > 0)
                        ? 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700'
                        : 'text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-800'
                    }`}>
                      = {itemPts} pts
                    </span>
                    {isCategoryExhausted && (
                      <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-2 py-1 rounded-md border border-amber-300 dark:border-amber-700 shrink-0">
                        ⛔ Teto Atingido
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFormacao(realIndex)}
                    className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowNumericCalcModal(true)}
                  className="text-xs text-[#003399] dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer py-1 px-2.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                  title="Abrir Calculadora Numérica"
                >
                  <Calculator className="w-3.5 h-3.5 text-[#003399] dark:text-blue-400" /> Calculadora
                </button>
                <button
                  type="button"
                  onClick={addFormacaoPresencial}
                  className="text-xs text-[#006633] dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer py-1 px-2.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Curso Presencial
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SEÇÃO IV – FORMAÇÃO PEDAGÓGICA CONTINUADA SEMI-PRESENCIAL E EAD EM 2025 */}
        <div className="bg-theme-surface p-4 rounded-2xl border border-theme space-y-3">
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-theme-main">
              <Monitor className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> SEÇÃO IV - Formação Semi-Presencial e EAD (2025)
            </h4>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-0.5 rounded-lg border border-indigo-300 dark:border-indigo-800 shadow-xs">
                  Parcial Seção IV: {detalhamento.secaoV_formacaoEAD || 0} pts
                </span>
                <span className="text-xs font-black text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-lg border border-amber-300 dark:border-amber-700 shadow-xs">
                  Total: {pontuacaoTotal.toFixed(2)} pts
                </span>
              </div>
              <button
                type="button"
                onClick={addFormacaoEAD}
                className="text-xs text-[#006633] dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Curso EAD
              </button>
            </div>
          </div>

          {cursosEAD.length === 0 ? (
            <p className="text-xs text-theme-muted italic">Nenhum curso EAD / semipresencial cadastrado.</p>
          ) : (
            <div className="space-y-2">
              {cursosEAD.map((curso, idx) => {
              const realIndex = formData.formacoes.indexOf(curso);
              const itemPts = detalhamento.eadBreakdown?.[idx]?.pontos || 0;
              const usedOther = getEadCategoryHoursOtherRows(curso.tipo, realIndex);
              const maxAllowed = Math.max(0, 200 - usedOther);
              const isCategoryExhausted = usedOther >= 200;

              return (
                <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-theme">
                  <input
                    type="text"
                    placeholder="Nome do curso EAD..."
                    value={curso.nome_curso}
                    onChange={(e) => {
                      const copy = [...formData.formacoes];
                      copy[realIndex].nome_curso = e.target.value;
                      setFormData({ ...formData, formacoes: copy });
                    }}
                    className="text-xs p-2 border border-theme rounded-lg bg-theme-surface text-theme-main flex-1 w-full"
                  />
                  <select
                    value={curso.tipo}
                    onChange={(e) => {
                      const copy = [...formData.formacoes];
                      const newType = e.target.value;
                      copy[realIndex].tipo = newType;
                      const remNew = Math.max(0, 200 - getEadCategoryHoursOtherRows(newType, realIndex));
                      if (copy[realIndex].carga_horaria > remNew) {
                        copy[realIndex].carga_horaria = remNew;
                      }
                      setFormData({ ...formData, formacoes: copy });
                    }}
                    className="text-xs p-2 border border-theme rounded-lg bg-theme-surface text-theme-main font-medium"
                  >
                    <option value="alfabetizacao_ead" disabled={getEadCategoryHoursOtherRows('alfabetizacao_ead', realIndex) >= 200}>
                      a) Alfabetização EAD (0,5 pt/h, máx 100pts/200h) {getEadCategoryHoursOtherRows('alfabetizacao_ead', realIndex) >= 200 ? '⛔ (Teto 200h Atingido)' : ''}
                    </option>
                    <option value="ed_infantil_ead" disabled={getEadCategoryHoursOtherRows('ed_infantil_ead', realIndex) >= 200}>
                      b) Educação Infantil EAD (0,5 pt/h, máx 100pts/200h) {getEadCategoryHoursOtherRows('ed_infantil_ead', realIndex) >= 200 ? '⛔ (Teto 200h Atingido)' : ''}
                    </option>
                    <option value="ed_especial_ead" disabled={getEadCategoryHoursOtherRows('ed_especial_ead', realIndex) >= 200}>
                      c) Educação Especial EAD (0,5 pt/h, máx 100pts/200h) {getEadCategoryHoursOtherRows('ed_especial_ead', realIndex) >= 200 ? '⛔ (Teto 200h Atingido)' : ''}
                    </option>
                    <option value="palestras_ead" disabled={getEadCategoryHoursOtherRows('palestras_ead', realIndex) >= 200}>
                      d) Palestras/Seminários EAD (0,5 pt/h, máx 100pts/200h) {getEadCategoryHoursOtherRows('palestras_ead', realIndex) >= 200 ? '⛔ (Teto 200h Atingido)' : ''}
                    </option>
                    <option value="outros_ead" disabled={getEadCategoryHoursOtherRows('outros_ead', realIndex) >= 200}>
                      e) Particulares / Públicas EAD (0,5 pt/h, máx 100pts/200h) {getEadCategoryHoursOtherRows('outros_ead', realIndex) >= 200 ? '⛔ (Teto 200h Atingido)' : ''}
                    </option>
                  </select>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-theme-muted font-bold">Horas:</span>
                    <input
                      type="number"
                      min="0"
                      max={maxAllowed}
                      value={curso.carga_horaria}
                      onChange={(e) => {
                        const copy = [...formData.formacoes];
                        let val = Number(e.target.value);
                        if (val > maxAllowed) {
                          val = maxAllowed;
                        }
                        copy[realIndex].carga_horaria = val;
                        setFormData({ ...formData, formacoes: copy });
                      }}
                      className="w-16 p-1.5 border border-theme rounded-lg text-xs bg-theme-surface text-theme-main font-bold"
                      placeholder="40"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`w-[105px] min-w-[105px] text-center inline-flex items-center justify-center text-xs font-black px-2.5 py-1.5 rounded-lg border shrink-0 ${
                      isCategoryExhausted || (itemPts === 0 && Number(curso.carga_horaria) > 0)
                        ? 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700'
                        : 'text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800'
                    }`}>
                      = {itemPts} pts
                    </span>
                    {isCategoryExhausted && (
                      <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-2 py-1 rounded-md border border-amber-300 dark:border-amber-700 shrink-0">
                        ⛔ Teto Atingido
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFormacao(realIndex)}
                    className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowNumericCalcModal(true)}
                  className="text-xs text-[#003399] dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer py-1 px-2.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                  title="Abrir Calculadora Numérica"
                >
                  <Calculator className="w-3.5 h-3.5 text-[#003399] dark:text-blue-400" /> Calculadora
                </button>
                <button
                  type="button"
                  onClick={addFormacaoEAD}
                  className="text-xs text-[#006633] dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer py-1 px-2.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Curso EAD
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RODAPÉ COM AÇÕES */}
        <div className="border-t border-theme pt-4 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-theme-muted hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-sme rounded-xl shadow-md hover:opacity-95 flex items-center gap-2"
          >
            <Check className="w-4 h-4" /> Salvar & Calcular Pontuação
          </button>
        </div>

      </form>

      {/* MODAL CALCULADORA DE DATAS & PERÍODO */}
      {showCalcModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 max-w-md w-full space-y-4 text-slate-800 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2 text-[#003399] dark:text-blue-400">
                <Calculator className="w-5 h-5" /> Calculadora de Período & Datas (Art. 2º, VI)
              </h3>
              <button
                type="button"
                onClick={() => setShowCalcModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-300">
                Informe a data inicial e final para calcular a contagem de dias e anos de serviço conforme a Portaria.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Data de Início *</label>
                  <DatePicker
                    value={calcStartDate}
                    onChange={setCalcStartDate}
                    minYear={1970}
                    maxYear={2026}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">Data de Fim *</label>
                  <DatePicker
                    value={calcEndDate}
                    onChange={setCalcEndDate}
                    minYear={1970}
                    maxYear={2026}
                  />
                </div>
              </div>

              {(() => {
                const info = calculatePeriodInfo(calcStartDate, calcEndDate);
                if (!info) {
                  return (
                    <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl text-slate-500 dark:text-slate-400 italic text-[11px] border border-blue-100 dark:border-blue-900">
                      💡 Selecione a data de início e a data de fim no calendário acima.
                    </div>
                  );
                }
                return (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2">
                    <p className="font-bold text-[#006633] dark:text-emerald-300 text-xs">
                      🗓️ Total do Período: {info.totalDays} dia(s) de trabalho
                    </p>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300">
                      Decomposição: {info.fullYears} ano(s) completo(s) + {info.remainingDays} dia(s) restante(s).
                    </p>
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-emerald-300 dark:border-emerald-700 flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">Resultado para Cômputo:</span>
                      <span className="text-sm font-black text-[#006633] dark:text-emerald-400">
                        {info.finalYears} ano(s) {info.hasExtraYearBonus ? '(+1 ano extra)' : ''}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCalcModal(false)}
                className="px-4 py-2 bg-[#006633] hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
              >
                Fechar Calculadora
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL CALCULADORA NUMÉRICA PADRÃO */}
      <NumericCalculatorModal
        isOpen={showNumericCalcModal}
        onClose={() => setShowNumericCalcModal(false)}
      />
    </Modal>
  );
}
