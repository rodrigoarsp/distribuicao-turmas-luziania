import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Check } from 'lucide-react';

export function ClassFormModal({ isOpen, onClose, onSave, classToEdit }) {
  const [formData, setFormData] = useState({
    descricao: '',
    turno: 'matutino',
    tipo: '1_ano',
    eh_alfamais: true,
    ano_letivo: 2026
  });

  useEffect(() => {
    if (classToEdit) {
      setFormData(classToEdit);
    } else {
      setFormData({
        descricao: '',
        turno: 'matutino',
        tipo: '1_ano',
        eh_alfamais: true,
        ano_letivo: 2026
      });
    }
  }, [classToEdit, isOpen]);

  const handleTipoChange = (newTipo) => {
    const isAlfa = ['pre_i', 'pre_ii', '1_ano', '2_ano'].includes(newTipo);
    setFormData({
      ...formData,
      tipo: newTipo,
      eh_alfamais: isAlfa
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={classToEdit ? `Editar Turma: ${classToEdit.descricao}` : 'Cadastrar Nova Turma Ofertada'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-theme-main">
        <div>
          <label className="block text-xs font-semibold text-theme-muted mb-1">Descrição da Turma *</label>
          <input
            type="text"
            required
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            placeholder="Ex: 1º Ano - Turma A"
            className="w-full px-3 py-2 text-xs border border-theme dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-[#006633]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-theme-muted mb-1">Turno *</label>
            <select
              value={formData.turno}
              onChange={(e) => setFormData({ ...formData, turno: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-theme dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-[#006633]"
            >
              <option value="matutino">Matutino (Diurno)</option>
              <option value="vespertino">Vespertino (Diurno)</option>
              <option value="noturno">Noturno</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-theme-muted mb-1">Ano Letivo</label>
            <input
              type="number"
              value={formData.ano_letivo}
              onChange={(e) => setFormData({ ...formData, ano_letivo: Number(e.target.value) })}
              className="w-full px-3 py-2 text-xs border border-theme dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-[#006633]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-theme-muted mb-1">Etapa / Modalidade de Ensino *</label>
          <select
            value={formData.tipo}
            onChange={(e) => handleTipoChange(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-theme dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-[#006633]"
          >
            <option value="creche_1_4">Creche 1 ao 4</option>
            <option value="pre_i">Pré-Escola I (AlfaMais)</option>
            <option value="pre_ii">Pré-Escola II (AlfaMais)</option>
            <option value="1_ano">1º Ano Ensino Fundamental (AlfaMais)</option>
            <option value="2_ano">2º Ano Ensino Fundamental (AlfaMais)</option>
            <option value="3_ano_5_ano">3º ao 5º Ano Ensino Fundamental</option>
            <option value="eja">Educação de Jovens e Adultos (EJA)</option>
            <option value="educacao_especial">Educação Especial (Atendimento Especializado)</option>
          </select>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-theme flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-theme-main">Turma do Programa AlfaMais?</p>
            <p className="text-[11px] text-theme-muted">Concede prioridade inicial de escolha (Art. 4º).</p>
          </div>
          <input
            type="checkbox"
            checked={formData.eh_alfamais}
            onChange={(e) => setFormData({ ...formData, eh_alfamais: e.target.checked })}
            className="w-5 h-5 text-[#006633] rounded-sm focus:ring-[#006633] cursor-pointer"
          />
        </div>

        <div className="border-t border-theme pt-4 flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-theme-muted hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-gradient-sme rounded-xl shadow-md hover:opacity-95 flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" /> Salvar Turma
          </button>
        </div>
      </form>
    </Modal>
  );
}
