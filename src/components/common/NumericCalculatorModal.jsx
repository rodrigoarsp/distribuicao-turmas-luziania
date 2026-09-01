import React, { useState } from 'react';
import { Calculator, X, Delete } from 'lucide-react';

export function NumericCalculatorModal({ isOpen, onClose }) {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  if (!isOpen) return null;

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

      setPrevValue(newValue);
      setDisplay(String(newValue));
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl p-5 max-w-xs w-full space-y-4 select-none">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Calculator className="w-4 h-4" /> Calculadora
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 cursor-pointer rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Display Screen */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 text-right">
          <div className="text-xs text-slate-400 h-4 font-mono">
            {prevValue !== null && operation ? `${prevValue} ${operation}` : ''}
          </div>
          <div className="text-2xl font-black font-mono text-white tracking-wider truncate">
            {display}
          </div>
        </div>

        {/* Keypad Buttons */}
        <div className="grid grid-cols-4 gap-2 text-sm font-bold">
          <button
            type="button"
            onClick={clearAll}
            className="p-3 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl transition-all cursor-pointer active:scale-95"
          >
            AC
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all flex items-center justify-center cursor-pointer active:scale-95"
          >
            <Delete className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={inputPercent}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer active:scale-95"
          >
            %
          </button>
          <button
            type="button"
            onClick={() => performOperation('÷')}
            className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all cursor-pointer active:scale-95"
          >
            ÷
          </button>

          <button
            type="button"
            onClick={() => inputDigit(7)}
            className="p-3 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl transition-all cursor-pointer active:scale-95"
          >
            7
          </button>
          <button
            type="button"
            onClick={() => inputDigit(8)}
            className="p-3 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl transition-all cursor-pointer active:scale-95"
          >
            8
          </button>
          <button
            type="button"
            onClick={() => inputDigit(9)}
            className="p-3 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl transition-all cursor-pointer active:scale-95"
          >
            9
          </button>
          <button
            type="button"
            onClick={() => performOperation('×')}
            className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all cursor-pointer active:scale-95"
          >
            ×
          </button>

          <button
            type="button"
            onClick={() => inputDigit(4)}
            className="p-3 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl transition-all cursor-pointer active:scale-95"
          >
            4
          </button>
          <button
            type="button"
            onClick={() => inputDigit(5)}
            className="p-3 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl transition-all cursor-pointer active:scale-95"
          >
            5
          </button>
          <button
            type="button"
            onClick={() => inputDigit(6)}
            className="p-3 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl transition-all cursor-pointer active:scale-95"
          >
            6
          </button>
          <button
            type="button"
            onClick={() => performOperation('-')}
            className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all cursor-pointer active:scale-95"
          >
            -
          </button>

          <button
            type="button"
            onClick={() => inputDigit(1)}
            className="p-3 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl transition-all cursor-pointer active:scale-95"
          >
            1
          </button>
          <button
            type="button"
            onClick={() => inputDigit(2)}
            className="p-3 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl transition-all cursor-pointer active:scale-95"
          >
            2
          </button>
          <button
            type="button"
            onClick={() => inputDigit(3)}
            className="p-3 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl transition-all cursor-pointer active:scale-95"
          >
            3
          </button>
          <button
            type="button"
            onClick={() => performOperation('+')}
            className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all cursor-pointer active:scale-95"
          >
            +
          </button>

          <button
            type="button"
            onClick={toggleSign}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer active:scale-95"
          >
            +/-
          </button>
          <button
            type="button"
            onClick={() => inputDigit(0)}
            className="p-3 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl transition-all cursor-pointer active:scale-95"
          >
            0
          </button>
          <button
            type="button"
            onClick={inputDot}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer active:scale-95"
          >
            ,
          </button>
          <button
            type="button"
            onClick={() => performOperation('=')}
            className="p-3 bg-[#006633] hover:bg-emerald-600 text-white rounded-xl transition-all shadow-md cursor-pointer active:scale-95"
          >
            =
          </button>
        </div>

      </div>
    </div>
  );
}
