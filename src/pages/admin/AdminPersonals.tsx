import React, { useState } from 'react';
import { Activity, Plus, Search, ChevronRight, X, Phone, Mail, MapPin, Building, Users } from 'lucide-react';

import { MOCK_PERSONAIS } from '../../data/mockData';

interface Personal {
    id: string;
    nome: string;
    whatsapp: string;
    email: string;
    endereco: string;
    cref: string;
    especialidade: string;
    academias: string[];
    plano?: string;
    status?: 'ativo' | 'inativo';
}

const ESPECIALIDADES = [
    'Hipertrofia', 
    'Emagrecimento', 
    'Reabilitação', 
    'Treinamento Funcional', 
    'Gestante',
    'Terceira Idade',
    'Performance Esportiva'
];

export const AdminPersonals = () => {
  const [personals, setPersonals] = useState<Personal[]>(MOCK_PERSONAIS.map((p, i) => ({ ...p, status: i % 3 === 0 ? 'inativo' : 'ativo' })));
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'todos' | 'ativo' | 'inativo'>('todos');

  const [formData, setFormData] = useState({
      nome: '',
      whatsapp: '',
      email: '',
      endereco: '',
      cref: '',
      especialidades: [] as string[]
  });

  const toggleEspecialidade = (esp: string) => {
      setFormData(prev => ({
          ...prev,
          especialidades: prev.especialidades.includes(esp) 
            ? prev.especialidades.filter(e => e !== esp)
            : [...prev.especialidades, esp]
      }));
  };

  const handleCreate = (e: React.FormEvent) => {
      e.preventDefault();
      const newPersonal: Personal = {
          id: Math.random().toString(),
          ...formData,
          especialidade: formData.especialidades.join(', '),
          academias: [], // starts with none
          status: 'ativo'
      };
      setPersonals([...personals, newPersonal]);
      setShowCreateModal(false);
      setFormData({ nome: '', whatsapp: '', email: '', endereco: '', cref: '', especialidades: [] });
  };

  const filteredPersonals = personals.filter(p => filter === 'todos' || p.status === filter);

  return (
    <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-black text-white italic">Gestão de Personais</h1>
                <p className="text-slate-400 mt-1 mb-4">Cadastre personais, vincule a academias e alunos.</p>
                <div className="flex gap-3">
                    <button onClick={() => setFilter('todos')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-colors border ${filter === 'todos' ? 'bg-lime-400 text-slate-900 border-lime-400' : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'}`}>
                        Total: {personals.length}
                    </button>
                    <button onClick={() => setFilter('ativo')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-colors border ${filter === 'ativo' ? 'bg-blue-400 text-slate-900 border-blue-400' : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'}`}>
                        Ativos: {personals.filter(p => p.status === 'ativo').length}
                    </button>
                    <button onClick={() => setFilter('inativo')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-colors border ${filter === 'inativo' ? 'bg-red-400 text-slate-900 border-red-400' : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'}`}>
                        Inativos: {personals.filter(p => p.status === 'inativo').length}
                    </button>
                </div>
            </div>
            <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-lime-400 text-slate-900 px-6 py-3 rounded-xl font-bold uppercase text-sm tracking-wide flex items-center gap-2 hover:bg-lime-500 transition-colors"
            >
                <Plus size={20} /> Novo Personal
            </button>
        </div>

        <div className="bg-[#151f32] p-1 border border-slate-800 rounded-2xl flex items-center mb-6">
            <div className="p-3 text-slate-500"><Search size={20} /></div>
            <input type="text" placeholder="Buscar por personal, CREF ou especialidade..." className="bg-transparent border-none outline-none text-white w-full pr-4" />
        </div>

        <div className="space-y-4">
            {filteredPersonals.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                    <Activity className="mx-auto h-12 w-12 text-slate-600 mb-4" />
                    <h3 className="text-lg font-bold text-slate-300">Nenhum personal encontrado</h3>
                    <p className="text-slate-500 mt-2">Nenhum personal para este filtro.</p>
                </div>
            ) : (
                filteredPersonals.map(personal => (
                    <div key={personal.id} className="bg-[#151f32] p-4 md:p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between w-full hover:border-lime-400/50 transition-colors group">
                        <div className="flex items-center gap-4 mb-4 md:mb-0 w-full md:w-auto">
                            <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-lime-400/50 flex items-center justify-center text-xl font-black text-white uppercase shrink-0">
                                {personal.nome.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white flex items-center gap-2">
                                    {personal.nome}
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${personal.status === 'ativo' ? 'bg-blue-400/10 text-blue-400 border-blue-400/20' : 'bg-red-400/10 text-red-400 border-red-400/20'}`}>
                                        {personal.status}
                                    </span>
                                </h3>
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-1 text-xs text-slate-400">
                                    <span className="font-bold text-lime-400">{personal.especialidade}</span>
                                    <span>CREF: {personal.cref}</span>
                                    <span className="flex items-center gap-1"><Building size={14} className="text-slate-500" /> {personal.academias.length > 0 ? personal.academias.join(', ') : 'Sem vínculo'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0 justify-end">
                            {personal.plano && (
                                <span className="bg-slate-900 px-3 py-1 rounded-full text-[10px] font-bold text-slate-400 uppercase border border-slate-800">
                                    Plano {personal.plano}
                                </span>
                            )}
                            <button className="bg-slate-900 hover:bg-slate-800 text-lime-400 border border-slate-800 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-colors whitespace-nowrap">
                                Editar Opções
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>

        {showCreateModal && (
            <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
                <div className="bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="flex justify-between items-center p-6 border-b border-slate-800 shrink-0">
                        <h2 className="text-xl font-black text-white uppercase italic">Novo Personal</h2>
                        <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white"><X size={24} /></button>
                    </div>
                    
                    <div className="p-6 overflow-y-auto no-scrollbar">
                        <form id="personal-form" onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Nome Completo</label>
                                <input required type="text" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-lime-400" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">WhatsApp</label>
                                    <input type="text" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-lime-400" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">E-mail</label>
                                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-lime-400" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Endereço</label>
                                <input type="text" value={formData.endereco} onChange={e => setFormData({...formData, endereco: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-lime-400" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">CREF</label>
                                <input type="text" value={formData.cref} onChange={e => setFormData({...formData, cref: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-lime-400" placeholder="Ex: 000000-G/UF" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase block mb-2">Especialidades</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {ESPECIALIDADES.map(esp => (
                                        <label key={esp} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={formData.especialidades.includes(esp)}
                                                onChange={() => toggleEspecialidade(esp)}
                                                className="accent-lime-400"
                                            />
                                            {esp}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="p-6 border-t border-slate-800 shrink-0">
                        <button type="submit" form="personal-form" className="w-full bg-lime-400 text-slate-900 font-black uppercase text-sm tracking-wider py-4 rounded-xl hover:bg-lime-500 transition-colors">
                            Cadastrar Personal
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
