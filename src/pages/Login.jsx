import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Building2, ShieldCheck, Users, Lock, Mail, ArrowRight, Sparkles, Sun, Moon } from 'lucide-react';

export function Login({ onLoginSuccess }) {
  const { loginWithEmail, switchRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleCustomLogin = async (e) => {
    e.preventDefault();
    await loginWithEmail(email, 'gestor');
    if (onLoginSuccess) onLoginSuccess();
  };

  const handleQuickLogin = (roleKey) => {
    switchRole(roleKey);
    if (onLoginSuccess) onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-slate-900 dark:bg-[#0B0B14] flex items-center justify-center p-4 relative overflow-hidden transition-colors">
      
      {/* Elementos decorativos de fundo */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#006633]/20 dark:bg-[#2E7D32]/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#003399]/20 dark:bg-[#1565C0]/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Botão de Alternância de Tema no Canto Superior */}
      <button
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Modo Claro' : 'Modo Noturno'}
        className="absolute top-6 right-6 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all shadow-lg"
      >
        {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-200" />}
      </button>

      <div className="relative max-w-md w-full bg-white dark:bg-[#1E1E2F] rounded-3xl shadow-2xl p-8 border border-slate-100 dark:border-slate-800 space-y-6 theme-transition">
        
        {/* Cabeçalho */}
        <div className="text-center space-y-2">
          <div className="bg-white p-3 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-[240px] mx-auto flex items-center justify-center">
            <img
              src="/logo-sme-luziania.png"
              alt="Secretaria de Educação de Luziânia - GO"
              className="h-12 w-auto object-contain"
            />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
            Distribuição de Turmas
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            Prefeitura Municipal de Luziânia • Portaria nº 947/2025
          </p>
        </div>

        {/* Formulário de Login */}
        <form onSubmit={handleCustomLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">E-mail Institucional</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@luziania.go.gov.br"
                className="w-full pl-10 pr-4 py-3 text-xs border border-slate-200 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white rounded-xl focus:ring-2 focus:ring-[#006633] focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Senha</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 text-xs border border-slate-200 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white rounded-xl focus:ring-2 focus:ring-[#006633] focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-sme text-white text-xs font-extrabold rounded-xl shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2"
          >
            Entrar no Sistema <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Botões de Acesso Rápido por Perfil (Modo Demo) */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2">
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Acesso Rápido de Demonstração
          </p>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickLogin('gestor')}
              className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center hover:scale-105 transition-all"
            >
              <Users className="w-4 h-4 text-[#006633] dark:text-emerald-400 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-emerald-950 dark:text-emerald-300">Gestor</p>
              <p className="text-[9px] text-emerald-700 dark:text-emerald-400">Escola JK</p>
            </button>

            <button
              onClick={() => handleQuickLogin('administrador')}
              className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-center hover:scale-105 transition-all"
            >
              <Building2 className="w-4 h-4 text-[#003399] dark:text-blue-400 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-blue-950 dark:text-blue-300">Admin</p>
              <p className="text-[9px] text-blue-700 dark:text-blue-400">Visão Geral</p>
            </button>

            <button
              onClick={() => handleQuickLogin('tecnico')}
              className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl text-center hover:scale-105 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-purple-700 dark:text-purple-400 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-purple-950 dark:text-purple-300">Técnico</p>
              <p className="text-[9px] text-purple-700 dark:text-purple-400">Logs Total</p>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
