import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, X } from 'lucide-react';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const MONTH_SHORT = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez'
];

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// Helper to format ISO YYYY-MM-DD to DD/MM/YYYY
function isoToDisplay(isoStr) {
  if (!isoStr || typeof isoStr !== 'string') return '';
  const parts = isoStr.split('-');
  if (parts.length !== 3) return '';
  const [year, month, day] = parts;
  if (!year || !month || !day) return '';
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
}

// Helper to format typed DD/MM/YYYY to YYYY-MM-DD
function displayToIso(displayStr) {
  if (!displayStr) return '';
  const cleaned = displayStr.replace(/\D/g, '');
  if (cleaned.length !== 8) return null;
  const day = cleaned.substring(0, 2);
  const month = cleaned.substring(2, 4);
  const year = cleaned.substring(4, 8);

  const d = parseInt(day, 10);
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);

  if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > 2100) return null;

  // Validate days in month
  const daysInM = new Date(y, m, 0).getDate();
  if (d > daysInM) return null;

  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'DD/MM/AAAA',
  required = false,
  className = '',
  disabled = false,
  minYear = 1940,
  maxYear = 2030
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState(isoToDisplay(value));
  const [viewMode, setViewMode] = useState('days'); // 'days' | 'months' | 'years'

  // Internal state for calendar navigation
  const initialDate = value ? new Date(value + 'T00:00:00') : new Date();
  const [navYear, setNavYear] = useState(isNaN(initialDate.getFullYear()) ? new Date().getFullYear() : initialDate.getFullYear());
  const [navMonth, setNavMonth] = useState(isNaN(initialDate.getMonth()) ? new Date().getMonth() : initialDate.getMonth());

  const containerRef = useRef(null);
  const yearListRef = useRef(null);

  // Sync external value to display text
  useEffect(() => {
    setInputText(isoToDisplay(value));
    if (value) {
      const d = new Date(value + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setNavYear(d.getFullYear());
        setNavMonth(d.getMonth());
      }
    }
  }, [value]);

  // Handle click outside to close popover
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll active year into view when year picker opens
  useEffect(() => {
    if (viewMode === 'years' && yearListRef.current) {
      const activeEl = yearListRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'center' });
      }
    }
  }, [viewMode]);

  // Handle manual input text changes with auto-formatting slashes
  const handleInputChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '');
    if (raw.length > 8) raw = raw.substring(0, 8);

    let formatted = raw;
    if (raw.length > 2 && raw.length <= 4) {
      formatted = `${raw.substring(0, 2)}/${raw.substring(2)}`;
    } else if (raw.length > 4) {
      formatted = `${raw.substring(0, 2)}/${raw.substring(2, 4)}/${raw.substring(4)}`;
    }

    setInputText(formatted);

    if (raw.length === 8) {
      const iso = displayToIso(formatted);
      if (iso) {
        onChange(iso);
        const [y, m] = iso.split('-');
        setNavYear(parseInt(y, 10));
        setNavMonth(parseInt(m, 10) - 1);
      }
    } else if (raw.length === 0) {
      onChange('');
    }
  };

  const handleSelectDay = (day) => {
    const monthStr = String(navMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const iso = `${navYear}-${monthStr}-${dayStr}`;
    onChange(iso);
    setInputText(isoToDisplay(iso));
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    if (navMonth === 0) {
      setNavMonth(11);
      setNavYear(prev => prev - 1);
    } else {
      setNavMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (navMonth === 11) {
      setNavMonth(0);
      setNavYear(prev => prev + 1);
    } else {
      setNavMonth(prev => prev + 1);
    }
  };

  // Calculate days for the calendar grid
  const daysInMonth = new Date(navYear, navMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(navYear, navMonth, 1).getDay(); // 0 = Sun

  const selectedIso = value;

  // Years array
  const years = [];
  for (let y = minYear; y <= maxYear; y++) {
    years.push(y);
  }

  return (
    <div className="relative inline-block w-full" ref={containerRef}>
      {/* Input Display Box */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          onClick={() => !disabled && setIsOpen(true)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full pl-3 pr-9 py-2 text-xs border border-theme dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-[#006633] outline-none h-9 font-medium ${className}`}
        />
        <div className="absolute right-2.5 flex items-center gap-1 text-slate-400">
          {inputText && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setInputText('');
                onChange('');
              }}
              className="hover:text-red-500 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            className="hover:text-[#006633] dark:hover:text-emerald-400 p-0.5 cursor-pointer"
          >
            <CalendarIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Popover Calendar */}
      {isOpen && (
        <div className="absolute left-0 mt-1 z-50 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-3 text-slate-800 dark:text-slate-100 select-none animate-in fade-in zoom-in-95 duration-100">
          
          {/* Header Navigation */}
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Mês anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Quick Header Toggle (Year & Month Selector) */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'months' ? 'days' : 'months')}
                className="text-xs font-bold px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 flex items-center gap-1 capitalize"
              >
                {MONTH_NAMES[navMonth]}
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'years' ? 'days' : 'years')}
                className="text-xs font-black px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#006633] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1"
              >
                {navYear}
                <ChevronDown className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Próximo mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* VIEW MODE 1: YEAR SELECTOR LIST */}
          {viewMode === 'years' && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
                Selecione o Ano
              </div>
              <div
                ref={yearListRef}
                className="grid grid-cols-4 gap-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700"
              >
                {years.map((y) => {
                  const isSelected = y === navYear;
                  return (
                    <button
                      key={y}
                      type="button"
                      data-active={isSelected ? 'true' : 'false'}
                      onClick={() => {
                        setNavYear(y);
                        setViewMode('months');
                      }}
                      className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-[#006633] text-white border-[#006633] shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {y}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW MODE 2: MONTH SELECTOR GRID (Like user screenshot!) */}
          {viewMode === 'months' && (
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center flex items-center justify-center gap-1">
                Selecione o Mês ({navYear})
              </div>
              <div className="grid grid-cols-3 gap-2 py-1">
                {MONTH_SHORT.map((mShort, mIdx) => {
                  const isSelected = mIdx === navMonth;
                  return (
                    <button
                      key={mIdx}
                      type="button"
                      onClick={() => {
                        setNavMonth(mIdx);
                        setViewMode('days');
                      }}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all capitalize ${
                        isSelected
                          ? 'bg-[#006633] text-white border-[#006633] shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {mShort}
                    </button>
                  );
                })}
              </div>
              <div className="pt-1 flex justify-center">
                <button
                  type="button"
                  onClick={() => setViewMode('years')}
                  className="text-[11px] text-[#006633] dark:text-emerald-400 font-bold hover:underline"
                >
                  Alterar Ano ({navYear})
                </button>
              </div>
            </div>
          )}

          {/* VIEW MODE 3: DAYS CALENDAR GRID */}
          {viewMode === 'days' && (
            <div>
              {/* Weekdays header */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {WEEK_DAYS.map((day, i) => (
                  <span key={i} className="text-[10px] font-bold text-slate-400 uppercase">
                    {day}
                  </span>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty slots for offset */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {/* Days of month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dayIso = `${navYear}-${String(navMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const isSelected = selectedIso === dayIso;
                  const isToday =
                    new Date().getDate() === dayNum &&
                    new Date().getMonth() === navMonth &&
                    new Date().getFullYear() === navYear;

                  return (
                    <button
                      key={dayNum}
                      type="button"
                      onClick={() => handleSelectDay(dayNum)}
                      className={`h-7 w-7 mx-auto flex items-center justify-center text-xs font-semibold rounded-lg transition-all ${
                        isSelected
                          ? 'bg-[#006633] text-white shadow-sm font-bold scale-105'
                          : isToday
                          ? 'border border-[#006633] text-[#006633] dark:text-emerald-400 font-bold bg-emerald-50/50 dark:bg-emerald-950/30'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>

              {/* Quick Footer Action Buttons */}
              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    const y = today.getFullYear();
                    const m = String(today.getMonth() + 1).padStart(2, '0');
                    const d = String(today.getDate()).padStart(2, '0');
                    const iso = `${y}-${m}-${d}`;
                    setNavYear(y);
                    setNavMonth(today.getMonth());
                    onChange(iso);
                    setInputText(isoToDisplay(iso));
                    setIsOpen(false);
                  }}
                  className="text-[#006633] dark:text-emerald-400 font-bold hover:underline"
                >
                  Hoje
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewMode('years')}
                    className="text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium"
                  >
                    Mudar Ano
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('months')}
                    className="text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium"
                  >
                    Mudar Mês
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
