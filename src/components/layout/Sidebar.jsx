import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Users, 
  BookOpen, 
  CheckCircle2, 
  PlayCircle, 
  FileCheck, 
  Building2, 
  Activity, 
  ShieldAlert, 
  BarChart3,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user } = useAuth();
  const { isSidebarCollapsed, toggleSidebar } = useTheme();

  if (!user) return null;

  const role = user.perfil;

  const gestorItems = [
    { id: 'professores', label: 'Professores & Pontuação', icon: Users },
    { id: 'turmas', label: 'Turmas Ofertadas', icon: BookOpen },
    { id: 'validacao', label: 'Conferência & Validação', icon: CheckCircle2 },
    { id: 'escolha', label: 'Sessão de Escolha (Ao Vivo)', icon: PlayCircle, highlight: true },
    { id: 'ata', label: 'Ata Final (ANEXO I)', icon: FileCheck }
  ];

  const adminItems = [
    { id: 'escolas', label: 'Cadastro de Escolas', icon: Building2 },
    { id: 'monitoramento', label: 'Acompanhamento Real-Time', icon: Activity },
    { id: 'todas_turmas', label: 'Turmas da Rede', icon: BookOpen },
    { id: 'todas_atas', label: 'Atas Geradas', icon: FileCheck }
  ];

  const tecnicoItems = [
    { id: 'painel_geral', label: 'Painel Geral de Monitoramento', icon: BarChart3 },
    { id: 'gestao_completa', label: 'Acesso Total (Escolas/Prof)', icon: Building2 },
    { id: 'logs', label: 'Logs de Auditoria', icon: ShieldAlert, highlight: true }
  ];

  let items = gestorItems;
  if (role === 'administrador') items = adminItems;
  if (role === 'tecnico') items = tecnicoItems;

  return (
    <aside
      className={`no-print bg-theme-surface border-r border-theme min-h-[calc(100vh-4rem)] p-3.5 flex flex-col justify-between transition-all duration-300 ${
        isSidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        {/* Cabeçalho do Painel Lateral com Botão Retrátil */}
        <div className="flex items-center justify-between px-2 py-1 mb-2.5 border-b border-theme/60 pb-2">
          {!isSidebarCollapsed && (
            <span className="text-[10px] font-bold text-theme-muted uppercase tracking-wider">
              Navegação ({role})
            </span>
          )}
          <button
            onClick={toggleSidebar}
            title={isSidebarCollapsed ? 'Expandir Menu Lateral' : 'Recolher Menu Lateral'}
            className={`p-1.5 rounded-xl text-theme-muted hover:text-theme-main hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
              isSidebarCollapsed ? 'mx-auto' : 'ml-auto'
            }`}
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav className="space-y-1.5">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={isSidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${
                  isSidebarCollapsed ? 'justify-center px-0' : 'space-x-3 px-3'
                } py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? item.highlight
                      ? 'bg-gradient-sme text-white shadow-xs font-bold'
                      : 'bg-emerald-50 dark:bg-emerald-950/60 text-[#006633] dark:text-emerald-400 font-bold border-l-4 border-[#006633] dark:border-emerald-400'
                    : 'text-theme-muted hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-theme-main'
                }`}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 ${
                    isActive
                      ? item.highlight
                        ? 'text-white'
                        : 'text-[#006633] dark:text-emerald-400'
                      : 'text-theme-muted'
                  }`}
                />
                {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Box Informativo */}
      {!isSidebarCollapsed && (
        <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-theme text-xs space-y-1">
          <p className="font-bold text-theme-main flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-[#003399] dark:text-blue-400" /> Portaria nº 947/2025
          </p>
          <p className="text-theme-muted leading-relaxed text-[11px]">
            Escolhas agendadas para <strong>19/12/2025</strong> (13h diurno / 18h noturno).
          </p>
        </div>
      )}
    </aside>
  );
}
