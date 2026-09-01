import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Plus, Search, Building2, Edit3, Trash2, Calendar, Phone, MapPin, User, Check } from 'lucide-react';

export function SchoolManagement() {
  const { escolas, addEscola, updateEscola, deleteEscola } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);

  const [formData, setFormData] = useState({
    nome: '',
    codigo_inep: '',
    endereco: '',
    contato: '',
    gestor_nome: '',
    data_inicio_escolha: '2025-12-19T13:00'
  });

  const filteredEscolas = escolas.filter((e) =>
    e.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.codigo_inep && e.codigo_inep.includes(searchTerm)) ||
    (e.gestor_nome && e.gestor_nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (e.bairro && e.bairro.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenNew = () => {
    setEditingSchool(null);
    setFormData({
      nome: '',
      codigo_inep: '',
      endereco: '',
      contato: '',
      gestor_nome: '',
      data_inicio_escolha: '2025-12-19T13:00'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (escola) => {
    setEditingSchool(escola);
    setFormData({
      nome: escola.nome,
      codigo_inep: escola.codigo_inep || '',
      endereco: escola.endereco || '',
      contato: escola.contato || '',
      gestor_nome: escola.gestor_nome || '',
      data_inicio_escolha: escola.data_inicio_escolha ? escola.data_inicio_escolha.slice(0, 16) : '2025-12-19T13:00'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingSchool) {
      updateEscola(editingSchool.id, formData);
    } else {
      addEscola(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Topo / Filtros / Ação */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-theme-surface p-4 rounded-2xl border border-theme shadow-xs theme-transition">
        <div className="flex flex-1 items-center gap-3 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-theme-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar escola por nome, INEP, gestor ou bairro..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-theme dark:bg-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-[#003399]"
            />
          </div>
          <span className="text-xs font-semibold text-theme-muted px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl whitespace-nowrap">
            Total: <strong className="font-bold text-theme-main">{filteredEscolas.length}</strong> de {escolas.length}
          </span>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2 bg-gradient-sme text-white text-xs font-bold rounded-xl shadow-xs hover:opacity-95 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Cadastrar Escola
        </button>
      </div>

      {/* Grid de Escolas Cadastradas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEscolas.map((escola) => (
          <div
            key={escola.id}
            className="card-modern p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3 gap-2">
                <span className="text-[10px] uppercase font-semibold text-theme-muted bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md tracking-wider">
                  INEP: {escola.codigo_inep}
                </span>
                <Badge variant={escola.status_processo === 'concluido' ? 'green' : escola.status_processo === 'em_andamento' ? 'blue' : 'amber'}>
                  {escola.status_processo === 'concluido' ? 'Concluído' : escola.status_processo === 'em_andamento' ? 'Em Andamento' : 'Não Iniciado'}
                </Badge>
              </div>

              <h4 className="text-sm sm:text-base font-bold text-theme-main mb-2.5 flex items-start gap-2 leading-snug tracking-tight">
                <Building2 className="w-4 h-4 text-[#003399] dark:text-blue-400 shrink-0 mt-1" /> 
                <span>{escola.nome}</span>
              </h4>

              <div className="space-y-1.5 text-xs text-theme-muted mb-4 font-normal">
                <p className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 opacity-60 shrink-0" /> Gestor: <strong className="font-semibold text-theme-main">{escola.gestor_nome}</strong>
                </p>
                <p className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 opacity-60 shrink-0 mt-0.5" /> <span>{escola.endereco}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 opacity-60 shrink-0" /> {escola.contato}
                </p>
                {escola.email && (
                  <p className="flex items-center gap-1.5 truncate">
                    <span className="opacity-60 text-[10px]">✉</span> <span className="truncate">{escola.email}</span>
                  </p>
                )}
                <p className="flex items-center gap-1.5 text-[#006633] dark:text-emerald-400 font-semibold pt-1">
                  <Calendar className="w-3.5 h-3.5" /> Escolha: {new Date(escola.data_inicio_escolha).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>

            <div className="border-t border-theme pt-3 flex items-center justify-end space-x-2 text-xs">
              <button
                onClick={() => handleOpenEdit(escola)}
                className="p-1.5 text-theme-muted hover:text-[#003399] dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 font-semibold"
              >
                <Edit3 className="w-3.5 h-3.5" /> Editar
              </button>
              <button
                onClick={() => {
                  if (confirm(`Confirma a exclusão da escola ${escola.nome}?`)) {
                    deleteEscola(escola.id);
                  }
                }}
                className="p-1.5 text-theme-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form Escola */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSchool ? `Editar Escola: ${editingSchool.nome}` : 'Cadastrar Nova Escola Municipal'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-theme-main">
          <div>
            <label className="block text-xs font-semibold text-theme-muted mb-1">Nome da Escola *</label>
            <input
              type="text"
              required
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Escola Municipal Luziânia"
              className="w-full px-3 py-2 text-xs border border-theme dark:bg-slate-800 dark:text-white rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-theme-muted mb-1">Código INEP *</label>
              <input
                type="text"
                required
                value={formData.codigo_inep}
                onChange={(e) => setFormData({ ...formData, codigo_inep: e.target.value })}
                placeholder="52012345"
                className="w-full px-3 py-2 text-xs border border-theme dark:bg-slate-800 dark:text-white rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-theme-muted mb-1">Contato Telefone</label>
              <input
                type="text"
                value={formData.contato}
                onChange={(e) => setFormData({ ...formData, contato: e.target.value })}
                placeholder="(61) 3622-0000"
                className="w-full px-3 py-2 text-xs border border-theme dark:bg-slate-800 dark:text-white rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-theme-muted mb-1">Gestor(a) Responsável *</label>
            <input
              type="text"
              required
              value={formData.gestor_nome}
              onChange={(e) => setFormData({ ...formData, gestor_nome: e.target.value })}
              placeholder="Nome do(a) Diretor(a)"
              className="w-full px-3 py-2 text-xs border border-theme dark:bg-slate-800 dark:text-white rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-theme-muted mb-1">Endereço Completo</label>
            <input
              type="text"
              value={formData.endereco}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
              placeholder="Rua, Bairro - Luziânia/GO"
              className="w-full px-3 py-2 text-xs border border-theme dark:bg-slate-800 dark:text-white rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-theme-muted mb-1">Data/Hora da Escolha (Art. 2º, III)</label>
            <input
              type="datetime-local"
              value={formData.data_inicio_escolha}
              onChange={(e) => setFormData({ ...formData, data_inicio_escolha: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-theme dark:bg-slate-800 dark:text-white rounded-xl"
            />
          </div>

          <div className="border-t border-theme pt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-theme-muted hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-sme rounded-xl shadow-md hover:opacity-95 flex items-center gap-1"
            >
              <Check className="w-4 h-4" /> Salvar Escola
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
