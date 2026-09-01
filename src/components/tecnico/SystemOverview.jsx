import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Database, FileText } from 'lucide-react';

export function SystemOverview() {
  const { escolas, professores, turmas, escolhas, logs } = useApp();
  const { isSupabaseConfigured } = useAuth();

  return (
    <div className="space-y-6">
      
      {/* Banner de Infraestrutura */}
      <div className="bg-slate-900 dark:bg-[#1E1E2F] text-white p-6 rounded-3xl shadow-md border border-theme flex flex-col md:flex-row md:items-center justify-between gap-6 theme-transition">
        <div>
          <span className="text-[10px] uppercase tracking-widest font-black text-purple-400">
            MÓDULO DE ENGENHARIA E OPERAÇÕES
          </span>
          <h2 className="text-xl font-bold mt-1">Painel Técnico do Sistema SME Luziânia</h2>
          <p className="text-xs text-slate-400 mt-1">
            Status da infraestrutura PostgreSQL (Supabase), RLS e scripts de migração MySQL.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="bg-slate-800 dark:bg-slate-800/80 border border-slate-700 px-3.5 py-2 rounded-xl text-right">
            <p className="text-slate-400 text-[10px]">Banco de Dados:</p>
            <p className="font-bold text-emerald-400">
              {isSupabaseConfigured ? 'Supabase Conectado' : 'Modo Demo / Híbrido Ativo'}
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Estatísticas Gerais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-modern p-5">
          <p className="text-xs text-theme-muted font-bold uppercase">Escolas Ativas</p>
          <h3 className="text-2xl font-black text-theme-main mt-1">{escolas.length}</h3>
          <p className="text-[11px] text-theme-muted mt-1">Rede Municipal de Luziânia</p>
        </div>

        <div className="card-modern p-5">
          <p className="text-xs text-theme-muted font-bold uppercase">Professores Cadastrados</p>
          <h3 className="text-2xl font-black text-theme-main mt-1">{professores.length}</h3>
          <p className="text-[11px] text-[#006633] dark:text-emerald-400 mt-1 font-bold">Validados: {professores.filter(p=>p.status_validacao==='validado').length}</p>
        </div>

        <div className="card-modern p-5">
          <p className="text-xs text-theme-muted font-bold uppercase">Turmas Ofertadas</p>
          <h3 className="text-2xl font-black text-theme-main mt-1">{turmas.length}</h3>
          <p className="text-[11px] text-[#003399] dark:text-blue-400 mt-1 font-bold">Ocupadas: {escolhas.length}</p>
        </div>

        <div className="card-modern p-5">
          <p className="text-xs text-theme-muted font-bold uppercase">Logs Registrados</p>
          <h3 className="text-2xl font-black text-purple-900 dark:text-purple-300 mt-1">{logs.length}</h3>
          <p className="text-[11px] text-purple-700 dark:text-purple-400 mt-1 font-bold">Auditoria Ativa</p>
        </div>
      </div>

      {/* Arquivos SQL */}
      <div className="bg-theme-surface p-6 rounded-2xl border border-theme shadow-xs space-y-4 theme-transition">
        <h3 className="text-base font-bold text-theme-main flex items-center gap-2">
          <Database className="w-5 h-5 text-[#006633] dark:text-emerald-400" /> Arquivos de Migração e Banco de Dados Disponíveis
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-theme bg-slate-50 dark:bg-slate-800/60 space-y-1">
            <p className="font-bold text-theme-main flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#006633] dark:text-emerald-400" /> supabase/schema.sql
            </p>
            <p className="text-theme-muted">PostgreSQL com UUIDs, RLS, Triggers e Restrições.</p>
          </div>

          <div className="p-4 rounded-xl border border-theme bg-slate-50 dark:bg-slate-800/60 space-y-1">
            <p className="font-bold text-theme-main flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#003399] dark:text-blue-400" /> supabase/seed.sql
            </p>
            <p className="text-theme-muted">Dados iniciais com escolas de Luziânia e turmas.</p>
          </div>

          <div className="p-4 rounded-xl border border-theme bg-slate-50 dark:bg-slate-800/60 space-y-1">
            <p className="font-bold text-theme-main flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-purple-700 dark:text-purple-400" /> supabase/mysql_migration.sql
            </p>
            <p className="text-theme-muted">Esquema 100% compatível com MySQL/MariaDB.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
