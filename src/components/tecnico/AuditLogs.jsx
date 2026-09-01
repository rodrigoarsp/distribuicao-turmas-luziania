import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { exportLogsToCSV } from '../../utils/auditLogger';
import { ShieldAlert, Search, Download, Terminal, Filter } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';

export function AuditLogs() {
  const { logs } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPerfil, setFilterPerfil] = useState('todos');
  const [selectedLogJson, setSelectedLogJson] = useState(null);

  const filteredLogs = logs.filter((l) => {
    const search = searchTerm.toLowerCase();
    const matchSearch =
      (l.usuario_nome && l.usuario_nome.toLowerCase().includes(search)) ||
      (l.acao && l.acao.toLowerCase().includes(search));
    const matchPerfil = filterPerfil === 'todos' || l.usuario_perfil === filterPerfil;
    return matchSearch && matchPerfil;
  });

  return (
    <div className="space-y-6">
      
      {/* Banner Técnico */}
      <div className="bg-purple-950 dark:bg-purple-950/90 border border-purple-900 text-white p-6 rounded-3xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <ShieldAlert className="w-8 h-8 text-purple-300" />
          <div>
            <h3 className="text-lg font-bold">Central de Audit Logs & Rastreabilidade Geral</h3>
            <p className="text-xs text-purple-200">
              Acesso restrito ao perfil Técnico (SME). Registro imutável de todas as ações no sistema.
            </p>
          </div>
        </div>

        <button
          onClick={() => exportLogsToCSV(filteredLogs)}
          className="px-5 py-2.5 bg-white text-purple-950 text-xs font-extrabold rounded-xl shadow-md hover:bg-purple-50 transition-all flex items-center gap-1.5"
        >
          <Download className="w-4 h-4 text-purple-900" /> Exportar Logs em CSV
        </button>
      </div>

      {/* Filtros de Busca */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-theme-surface p-4 rounded-2xl border border-theme shadow-xs theme-transition">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-theme-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por usuário ou ação realizada..."
            className="w-full pl-9 pr-4 py-2.5 text-xs border border-theme dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-700"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <Filter className="w-4 h-4 text-theme-muted" />
          <select
            value={filterPerfil}
            onChange={(e) => setFilterPerfil(e.target.value)}
            className="py-2.5 px-3 border border-theme rounded-xl bg-theme-surface font-semibold text-theme-main"
          >
            <option value="todos">Todos os Perfis</option>
            <option value="gestor">Gestor Escolar</option>
            <option value="administrador">Administrador SME</option>
            <option value="tecnico">Técnico de Suporte</option>
          </select>
        </div>
      </div>

      {/* Tabela de Logs com Zebra Striping */}
      <div className="table-container bg-theme-surface shadow-xs overflow-hidden theme-transition">
        <table className="w-full text-left border-collapse table-zebra">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800/90 border-b border-theme text-[11px] font-extrabold text-theme-muted uppercase tracking-wider sticky top-0">
              <th className="py-3.5 px-4">Timestamp</th>
              <th className="py-3.5 px-4">Usuário</th>
              <th className="py-3.5 px-4">Perfil</th>
              <th className="py-3.5 px-4">Ação Executada</th>
              <th className="py-3.5 px-4">Endereço IP</th>
              <th className="py-3.5 px-4 text-center">Detalhes JSON</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-theme text-xs font-mono">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="transition-colors">
                <td className="py-3.5 px-4 text-theme-muted font-sans text-[11px]">
                  {new Date(log.timestamp).toLocaleString('pt-BR')}
                </td>
                <td className="py-3.5 px-4 font-sans font-bold text-theme-main">
                  {log.usuario_nome || 'Sistema'}
                </td>
                <td className="py-3.5 px-4 font-sans">
                  <Badge variant={log.usuario_perfil === 'tecnico' ? 'purple' : log.usuario_perfil === 'administrador' ? 'blue' : 'green'}>
                    {log.usuario_perfil}
                  </Badge>
                </td>
                <td className="py-3.5 px-4 font-sans font-bold text-theme-main">
                  {log.acao}
                </td>
                <td className="py-3.5 px-4 text-theme-muted text-[11px]">
                  {log.ip || '127.0.0.1'}
                </td>
                <td className="py-3.5 px-4 text-center">
                  <button
                    onClick={() => setSelectedLogJson(log)}
                    className="p-1.5 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/60 rounded-lg transition-colors inline-flex items-center gap-1 font-sans text-xs font-bold"
                  >
                    <Terminal className="w-3.5 h-3.5" /> Inspetor
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Inspetor de JSON */}
      <Modal
        isOpen={Boolean(selectedLogJson)}
        onClose={() => setSelectedLogJson(null)}
        title="Inspetor de Dados JSON da Ação de Auditoria"
        maxWidth="max-w-xl"
      >
        {selectedLogJson && (
          <div className="space-y-4">
            <div className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto shadow-inner border border-slate-800">
              <pre>{JSON.stringify(selectedLogJson, null, 2)}</pre>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedLogJson(null)}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl"
              >
                Fechar Inspetor
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
