import React from 'react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Award, Clock, BookOpen, GraduationCap, Monitor, BarChart3, CheckCircle2 } from 'lucide-react';

export function ScoreDetailsModal({ isOpen, onClose, teacher }) {
  if (!teacher) return null;

  const det = teacher.pontuacao_detalhada || {};

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Memória de Cálculo de Pontuação (Portaria 947/2025): ${teacher.nome}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4 text-theme-main">
        
        {/* Placa do Resultado Geral */}
        <div className="bg-slate-50 dark:bg-slate-800/80 border border-theme p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-theme-muted font-bold uppercase tracking-wider">Pontuação Total Final</p>
            <h3 className="text-3xl font-black text-[#006633] dark:text-emerald-400">{Number(teacher.pontuacao_total || 0).toFixed(2)} pts</h3>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant={teacher.status_validacao === 'validado' ? 'green' : 'amber'}>
              {teacher.status_validacao === 'validado' ? 'Pontuação Validada' : 'Aguardando Conferência'}
            </Badge>
            <span className="text-xs text-theme-muted font-medium">
              Vínculo: {teacher.tipo_vinculo === 'efetivo' ? 'Efetivo' : 'Contrato'} ({teacher.carga_horaria}h)
            </span>
          </div>
        </div>

        {/* Seção I - Tempo de Serviço */}
        <div className="border border-theme rounded-2xl p-4 bg-theme-surface">
          <h4 className="font-bold text-theme-main text-xs mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#003399] dark:text-blue-400" /> SEÇÃO I - Tempo de Serviço / Regências & Cargos</span>
            <span className="text-[#006633] dark:text-emerald-400 font-black">{det.secaoI_tempoServico || 0} pts</span>
          </h4>
          <ul className="divide-y divide-theme text-xs">
            {det.regenciasBreakdown?.map((item, idx) => (
              <li key={idx} className="py-2 flex items-center justify-between">
                <span className="text-theme-muted">{item.descricao}</span>
                <span className="font-bold text-theme-main">+{item.pontos} pts</span>
              </li>
            )) || <li className="text-theme-muted py-1">Nenhuma regência cadastrada</li>}
          </ul>
        </div>

        {/* Publicações Acadêmicas */}
        <div className="border border-theme rounded-2xl p-4 bg-theme-surface">
          <h4 className="font-bold text-theme-main text-xs mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> PUBLICAÇÃO NA ÁREA DA EDUCAÇÃO</span>
            <span className="text-[#006633] dark:text-emerald-400 font-black">{det.secaoII_publicacoes || 0} pts</span>
          </h4>
          <ul className="divide-y divide-theme text-xs">
            {det.publicacoesBreakdown?.map((item, idx) => (
              <li key={idx} className="py-2 flex items-center justify-between">
                <span className="text-theme-muted">{item.titulo} ({item.tipo})</span>
                <span className="font-bold text-theme-main">+{item.pontos} pts</span>
              </li>
            )) || <li className="text-theme-muted py-1">Nenhuma publicação cadastrada</li>}
          </ul>
        </div>

        {/* Seção II - Titulações Presenciais */}
        <div className="border border-theme rounded-2xl p-4 bg-theme-surface">
          <h4 className="font-bold text-theme-main text-xs mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2"><GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" /> SEÇÃO II - Titulações Presenciais (Pós, Mestrado, Doutorado)</span>
            <span className="text-[#006633] dark:text-emerald-400 font-black">{det.secaoIII_titulos || 0} pts</span>
          </h4>
          <ul className="divide-y divide-theme text-xs">
            {det.titulosBreakdown?.map((item, idx) => (
              <li key={idx} className="py-2 flex items-center justify-between">
                <span className="text-theme-muted">{item.descricao}</span>
                <span className="font-bold text-theme-main">+{item.pontos} pts</span>
              </li>
            )) || <li className="text-theme-muted py-1">Nenhum título presencial cadastrado</li>}
          </ul>
        </div>

        {/* Seção III - Formação Continuada Presencial */}
        <div className="border border-theme rounded-2xl p-4 bg-theme-surface">
          <h4 className="font-bold text-theme-main text-xs mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" /> SEÇÃO III - Formação Continuada Presencial (2025)</span>
            <span className="text-[#006633] dark:text-emerald-400 font-black">{det.secaoIV_formacaoPresencial || 0} pts</span>
          </h4>
          <ul className="divide-y divide-theme text-xs">
            {det.presencialBreakdown?.map((item, idx) => (
              <li key={idx} className="py-2 flex items-center justify-between">
                <span className="text-theme-muted">{item.nome} ({item.ch}h)</span>
                <span className="font-bold text-theme-main">+{item.pontos} pts</span>
              </li>
            )) || <li className="text-theme-muted py-1">Nenhum curso presencial cadastrado</li>}
          </ul>
        </div>

        {/* Seção IV - Formação Continuada EAD */}
        <div className="border border-theme rounded-2xl p-4 bg-theme-surface">
          <h4 className="font-bold text-theme-main text-xs mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2"><Monitor className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> SEÇÃO IV - Formação Semi-Presencial e EAD (2025)</span>
            <span className="text-[#006633] dark:text-emerald-400 font-black">{det.secaoV_formacaoEAD || 0} pts</span>
          </h4>
          <ul className="divide-y divide-theme text-xs">
            {det.eadBreakdown?.map((item, idx) => (
              <li key={idx} className="py-2 flex items-center justify-between">
                <span className="text-theme-muted">{item.nome} ({item.ch}h)</span>
                <span className="font-bold text-theme-main">+{item.pontos} pts</span>
              </li>
            )) || <li className="text-theme-muted py-1">Nenhum curso EAD cadastrado</li>}
          </ul>
        </div>

        {/* Seção V - Avaliação de Desempenho */}
        <div className="border border-theme rounded-2xl p-4 bg-theme-surface flex items-center justify-between">
          <span className="flex items-center gap-2 font-bold text-theme-main text-xs">
            <BarChart3 className="w-4 h-4 text-amber-500" /> SEÇÃO V - Avaliação de Desempenho (2025)
          </span>
          <span className="text-[#006633] dark:text-emerald-400 font-black text-xs">+{det.secaoVI_desempenho || 0} pts</span>
        </div>

        {/* Justificativa de validação */}
        {teacher.justificativa_validacao && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-900 dark:text-emerald-300">
            <strong className="flex items-center gap-1 mb-1 font-bold">
              <CheckCircle2 className="w-4 h-4 text-[#006633] dark:text-emerald-400" /> Parecer de Validação da Gestão:
            </strong>
            <p className="italic">{teacher.justificativa_validacao}</p>
          </div>
        )}

      </div>
    </Modal>
  );
}
