import React, { useState, useEffect, useRef } from 'react';
import { Calculator, X, Delete, GripHorizontal } from 'lucide-react';

export function NumericCalculatorModal({ isOpen, onClose }) {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  // Position state for dragging
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const containerRef = useRef(null);

  // Set initial position centered at top right
  useEffect(() => {
    if (isOpen) {
      const initialX = Math.max(20, window.innerWidth - 340);
      const initialY = Math.max(20, Math.min(120, window.innerHeight / 4));
      setPosition({ x: initialX, y: initialY });
    }
  }, [isOpen]);

  const clearAll = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const inputDigit = (digit) => {
    if (waitingForOperand) {
      setDisplay(String(digit));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(digit) : display + digit);
    }
  };

  const inputDot = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const toggleSign = () => {
    const val = parseFloat(display);
    if (!isNaN(val)) {
      setDisplay(String(-val));
    }
  };

  const inputPercent = () => {
    const val = parseFloat(display);
    if (!isNaN(val)) {
      setDisplay(String(val / 100));
    }
  };

  const performOperation = (nextOperation) => {
    const inputValue = parseFloat(display);

    if (prevValue == null) {
      setPrevValue(inputValue);
    } else if (operation) {
      const currentValue = prevValue || 0;
      let newValue = currentValue;

      switch (operation) {
        case '+':
          newValue = currentValue + inputValue;
          break;
        case '-':
          newValue = currentValue - inputValue;
          break;
        case '×':
        case '*':
          newValue = currentValue * inputValue;
          break;
        case '÷':
        case '/':
          newValue = inputValue !== 0 ? currentValue / inputValue : 0;
          break;
        default:
          break;
      }

      // Round to 4 decimal places to prevent floating precision issues
      const rounded = Math.round(newValue * 10000) / 10000;
      setPrevValue(rounded);
      setDisplay(String(rounded));
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  // 1. KEYBOARD EVENT LISTENER
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      // Do not hijack typing if active element is an input, textarea or select
      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') {
        return;
      }

      const key = e.key;

      if (/^[0-9]$/.test(key)) {
        e.preventDefault();
        inputDigit(parseInt(key, 10));
      } else if (key === '.' || key === ',') {
        e.preventDefault();
        inputDot();
      } else if (key === '+') {
        e.preventDefault();
        performOperation('+');
      } else if (key === '-') {
        e.preventDefault();
        performOperation('-');
      } else if (key === '*' || key.toLowerCase() === 'x') {
        e.preventDefault();
        performOperation('×');
      } else if (key === '/') {
        e.preventDefault();
        performOperation('÷');
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        performOperation('=');
      } else if (key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (key.toLowerCase() === 'c') {
        e.preventDefault();
        clearAll();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, display, prevValue, operation, waitingForOperand]);

  // 2. DRAGGABLE EVENT LISTENERS
  const handleMouseDown = (e) => {
    if (e.target.closest('button')) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  useEffect(() => {
    if (!isDragging) return;

    function handleMouseMove(e) {
      const newX = Math.max(10, Math.min(window.innerWidth - 300, e.clientX - dragOffset.x));
      const newY = Math.max(10, Math.min(window.innerHeight - 450, e.clientY - dragOffset.y));
      setPosition({ x: newX, y: newY });
    }

    function handleMouseUp() {
      setIsDragging(false);
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Floating Draggable Calculator Card */}
      <div
        ref={containerRef}
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        className="absolute pointer-events-auto bg-slate-900 border border-slate-700/80 text-white rounded-3xl shadow-2xl p-4 w-72 space-y-3 select-none animate-in fade-in zoom-in-95 duration-150"
      >
        
        {/* Header - Drag Handle */}
        <div
          onMouseDown={handleMouseDown}
          className="flex items-center justify-between border-b border-slate-800 pb-2.5 cursor-grab active:cursor-grabbing hover:bg-slate-800/40 p-1 rounded-xl transition-colors"
          title="Clique e arraste para mover a calculadora na tela"
        >
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <GripHorizontal className="w-4 h-4 text-slate-500" />
            <Calculator className="w-4 h-4" />
            <span>Calculadora Numérica</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 cursor-pointer rounded-lg hover:bg-slate-800"
            title="Fechar Calculadora"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Display Screen */}
        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-right">
          <div className="text-[11px] text-slate-400 h-4 font-mono">
            {prevValue !== null && operation ? `${prevValue} ${operation}` : ''}
          </div>
          <div className="text-2xl font-black font-mono text-white tracking-wider truncate">
            {display}
          </div>
        </div>

        {/* Keypad Buttons */}
        <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
          <button
            type="button"
            onClick={clearAll}
            className="p-2.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl transition-all cursor-pointer active:scale-95"
            title="Limpar (Tecla C / Esc)"
          >
            AC
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all flex items-center justify-center cursor-pointer active:scale-95"
            title="Apagar (Backspace)"
          >
            <Delete className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={inputPercent}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer active:scale-95"
          >
            %
          </button>
          <button
            type="button"
            onClick={() => performOperation('÷')}
            className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all cursor-pointer active:scale-95 text-base"
          >
            ÷
          </button>

          <button
            type="button"
            onClick={() => inputDigit(7)}
            className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl transition-all cursor-pointer active:scale-95"
          >
            7
          </button>
          <button
            type="button"
            onClick={() => inputDigit(8)}
            className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl transition-all cursor-pointer active:scale-95"
          >
            8
          </button>
          <button
            type="button"
            onClick={() => inputDigit(9)}
            className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl transition-all cursor-pointer active:scale-95"
          >
            9
          </button>
          <button
            type="button"
            onClick={() => performOperation('×')}
            className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all cursor-pointer active:scale-95 text-base"
          >
            ×
          </button>

          <button
            type="button"
            onClick={() => inputDigit(4)}
            className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl transition-all cursor-pointer active:scale-95"
          >
            4
          </button>
          <button
            type="button"
            onClick={() => inputDigit(5)}
            className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl transition-all cursor-pointer active:scale-95"
          >
            5
          </button>
          <button
            type="button"
            onClick={() => inputDigit(6)}
            className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl transition-all cursor-pointer active:scale-95"
          >
            6
          </button>
          <button
            type="button"
            onClick={() => performOperation('-')}
            className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all cursor-pointer active:scale-95 text-base"
          >
            -
          </button>

          <button
            type="button"
            onClick={() => inputDigit(1)}
            className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl transition-all cursor-pointer active:scale-95"
          >
            1
          </button>
          <button
            type="button"
            onClick={() => inputDigit(2)}
            className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl transition-all cursor-pointer active:scale-95"
          >
            2
          </button>
          <button
            type="button"
            onClick={() => inputDigit(3)}
            className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl transition-all cursor-pointer active:scale-95"
          >
            3
          </button>
          <button
            type="button"
            onClick={() => performOperation('+')}
            className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all cursor-pointer active:scale-95 text-base"
          >
            +
          </button>

          <button
            type="button"
            onClick={toggleSign}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer active:scale-95"
          >
            +/-
          </button>
          <button
            type="button"
            onClick={() => inputDigit(0)}
            className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl transition-all cursor-pointer active:scale-95"
          >
            0
          </button>
          <button
            type="button"
            onClick={inputDot}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer active:scale-95"
          >
            ,
          </button>
          <button
            type="button"
            onClick={() => performOperation('=')}
            className="p-2.5 bg-[#006633] hover:bg-emerald-600 text-white rounded-xl transition-all shadow-md cursor-pointer active:scale-95 font-black"
            title="Calcular (Enter)"
          >
            =
          </button>
        </div>

        {/* Keyboard hint */}
        <div className="text-[10px] text-slate-500 text-center pt-1 border-t border-slate-800/60">
          💡 Teclado físico ativo (0-9, +, -, *, /, Enter)
        </div>

      </div>
    </div>
  );
}
