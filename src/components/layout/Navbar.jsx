import React from 'react';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { Building2, Sun, Moon, LogOut, Sparkles, Menu, ChevronLeft } from 'lucide-react';

export default function Navbar() {
  const { user, switchRole, activeSchoolId, setActiveSchoolId, logout } = useAuth();
  const { escolas, currentSchool } = useApp();
  const { theme, toggleTheme, isSidebarCollapsed, toggleSidebar } = useTheme();

  if (!user) return null;

  return (
    <header className="no-print sticky top-0 z-40 bg-theme-surface border-b border-theme shadow-xs theme-transition">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-4 lg:px-4">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Lado Esquerdo: Logo Institucional + Título */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-theme shadow-xs flex items-center justify-center shrink-0">
              <img
                src="/logo-sme-luziania.png"
                alt="Secretaria de Educação de Luziânia - GO"
                className="h-8 sm:h-9 w-auto object-contain shrink-0"
              />
            </div>

            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-theme-main tracking-tight leading-snug whitespace-nowrap">
                  Distribuição de Turmas
                </h1>
                <span className="text-[#006633] dark:text-emerald-400 text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap shrink-0">
                  Portaria 947/2025
                </span>
              </div>
              <p className="text-[11px] text-theme-muted hidden sm:block font-medium leading-tight">
                Prefeitura Municipal de Luziânia - GO
              </p>
            </div>
          </div>

          {/* Lado Direito: Seletor de Escola, Alternador de Tema e Perfil */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            
            {/* Seletor de Escola (para Admin/Técnico) */}
            {user.perfil !== 'gestor' && (
              <div className="hidden md:flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-xs border border-theme max-w-[210px] lg:max-w-[260px]">
                <Building2 className="w-3.5 h-3.5 text-[#003399] dark:text-blue-400 shrink-0" />
                <span className="font-medium text-theme-muted shrink-0">Escola:</span>
                <select
                  value={activeSchoolId}
                  onChange={(e) => setActiveSchoolId(e.target.value)}
                  className="bg-transparent font-semibold text-theme-main border-none focus:outline-hidden cursor-pointer truncate w-full text-xs"
                >
                  {escolas.map((esc) => (
                    <option key={esc.id} value={esc.id} className="dark:bg-[#1E1E2F]">
                      {esc.nome}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Troca Rápida de Perfil */}
            <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-theme text-xs">
              <span className="px-2 font-medium text-theme-muted flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Perfil:
              </span>
              <button
                onClick={() => switchRole('gestor')}
                className={`px-2.5 py-1 rounded-lg transition-all font-semibold text-xs ${
                  user.perfil === 'gestor'
                    ? 'bg-[#006633] text-white shadow-xs'
                    : 'text-theme-muted hover:text-theme-main'
                }`}
              >
                Gestor
              </button>
              <button
                onClick={() => switchRole('administrador')}
                className={`px-2.5 py-1 rounded-lg transition-all font-semibold text-xs ${
                  user.perfil === 'administrador'
                    ? 'bg-[#003399] text-white shadow-xs'
                    : 'text-theme-muted hover:text-theme-main'
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => switchRole('tecnico')}
                className={`px-2.5 py-1 rounded-lg transition-all font-semibold text-xs ${
                  user.perfil === 'tecnico'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'text-theme-muted hover:text-theme-main'
                }`}
              >
                Técnico
              </button>
            </div>

            {/* TOGGLE MODO NOTURNO */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Noturno'}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-amber-500 dark:text-amber-300 border border-theme hover:scale-105 active:scale-95 transition-all shadow-xs"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Usuário e Logout */}
            <div className="flex items-center space-x-2 border-l border-theme pl-2.5">
              <div className="text-right hidden sm:block max-w-[150px] truncate">
                <p className="text-xs font-semibold text-theme-main truncate leading-tight">{user.nome}</p>
                <p className="text-[10px] uppercase font-semibold tracking-wide text-theme-muted truncate mt-0.5">
                  {user.perfil} {user.perfil === 'gestor' && currentSchool ? `- ${currentSchool.nome}` : ''}
                </p>
              </div>
              <button
                onClick={logout}
                title="Sair do sistema"
                className="p-1.5 text-theme-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
