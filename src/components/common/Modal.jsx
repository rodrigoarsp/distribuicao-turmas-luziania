import React from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className={`relative bg-theme-surface rounded-2xl shadow-2xl w-full ${maxWidth} overflow-hidden border border-theme transform transition-all`}>
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme bg-slate-50 dark:bg-slate-800/80">
          <h3 className="text-base font-bold text-theme-main">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-theme-muted hover:text-theme-main hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
