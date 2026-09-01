import React from 'react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { Building2, Activity, CheckCircle2, Clock } from 'lucide-react';

export function RealTimeMonitor() {
  const { escolas, professores, turmas, escolhas } = useApp();

  const totalEscolas = escolas.length;
  const concluidas = escolas.filter((e) => e.status_processo === 'concluido').length;
  const emAndamento = escolas.filter((e) => e.status_processo === 'em_andamento').length;
  const naoIniciadas = escolas.filter((e) => e.status_processo === 'nao_iniciado').length;

  return (
    <div className="space-y-6">
      
      {/* 4 Cards de Métricas Consolidadas da Rede */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="card-modern p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-theme-muted font-bold uppercase tracking-wider">Total de Escolas</p>
            <h3 className="text-2xl font-black text-theme-main mt-1">{totalEscolas}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-[#003399] dark:text-blue-400 border border-blue-100 dark:border-blue-800 flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="card-modern p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-theme-muted font-bold uppercase tracking-wider">Processos Concluídos</p>
            <h3 className="text-2xl font-black text-[#006633] dark:text-emerald-400 mt-1">{concluidas}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-[#006633] dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="card-modern p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-theme-muted font-bold uppercase tracking-wider">Em Andamento</p>
            <h3 className="text-2xl font-black text-blue-700 dark:text-blue-400 mt-1">{emAndamento}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800 flex items-center justify-center font-bold">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="card-modern p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-theme-muted font-bold uppercase tracking-wider">Não Iniciados</p>
            <h3 className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1">{naoIniciadas}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Lista Real-Time de Escolas */}
      <div className="bg-theme-surface rounded-2xl border border-theme shadow-xs p-6 space-y-4 theme-transition">
        <h3 className="text-base font-bold text-theme-main flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#003399] dark:text-blue-400" /> Acompanhamento em Tempo Real da Rede Municipal
        </h3>

        <div className="space-y-4">
          {escolas.map((escola) => {
            const profsEscola = professores.filter((p) => p.escola_id === escola.id);
            const turmasEscola = turmas.filter((t) => t.escola_id === escola.id);
            const escolhasEscola = escolhas.filter((e) => e.escola_id === escola.id);

            const percent = profsEscola.length > 0 ? Math.round((escolhasEscola.length / profsEscola.length) * 100) : 0;

            return (
              <div
                key={escola.id}
                className="bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-theme p-5 space-y-3 theme-transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-base font-bold text-theme-main tracking-tight">{escola.nome}</h4>
                    <p className="text-xs text-theme-muted mt-0.5">
                      Gestor: {escola.gestor_nome} • INEP: {escola.codigo_inep}
                    </p>
                  </div>
                  <Badge variant={escola.status_processo === 'concluido' ? 'green' : escola.status_processo === 'em_andamento' ? 'blue' : 'amber'}>
                    {escola.status_processo === 'concluido' ? '✓ Processo Finalizado' : escola.status_processo === 'em_andamento' ? '► Escolhas em Andamento' : 'Aguardando Início'}
                  </Badge>
                </div>

                {/* Barra de Progresso */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-theme-muted mb-1">
                    <span>Progresso das Escolhas</span>
                    <span>{escolhasEscola.length} de {profsEscola.length} professores ({percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-sme h-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Resumo em Grid */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs bg-theme-surface p-3 rounded-xl border border-theme">
                  <div>
                    <p className="text-theme-muted text-[10px] uppercase font-semibold tracking-wider">Professores</p>
                    <p className="font-bold text-theme-main mt-0.5">{profsEscola.length}</p>
                  </div>
                  <div>
                    <p className="text-theme-muted text-[10px] uppercase font-semibold tracking-wider">Turmas Ofertadas</p>
                    <p className="font-bold text-theme-main mt-0.5">{turmasEscola.length}</p>
                  </div>
                  <div>
                    <p className="text-theme-muted text-[10px] uppercase font-semibold tracking-wider">Atas Emitidas</p>
                    <p className="font-bold text-[#006633] dark:text-emerald-400 mt-0.5">{escola.status_processo === 'concluido' ? '1 Ata Homologada' : '0'}</p>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
