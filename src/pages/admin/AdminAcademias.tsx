import React, { useState } from 'react';
import { Building, Plus, Search, ChevronRight, X, Phone, Mail, MapPin, User, Users, Activity, DollarSign } from 'lucide-react';

import { MOCK_ACADEMIAS, MOCK_PERSONAIS, MOCK_ALUNOS } from '../../data/mockData';

interface Academia {
    id: string;
    nome: string;
    endereco: string;
    administrador: string;
    email: string;
    whatsapp: string;
    totalPersonais: number;
    totalAlunos: number;
    plano?: string;
}

export const AdminAcademias = () => {
  const [academias, setAcademias] = useState<Academia[]>(MOCK_ACADEMIAS);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAcademia, setSelectedAcademia] = useState<Academia | null>(null);

  const [formData, setFormData] = useState({
      nome: '',
      endereco: '',
      administrador: '',
      email: '',
      whatsapp: ''
  });

  const handleCreate = (e: React.FormEvent) => {
      e.preventDefault();
      const newAcademia: Academia = {
          id: Math.random().toString(),
          ...formData,
          totalPersonais: 0,
          totalAlunos: 0
      };
      setAcademias([...academias, newAcademia]);
      setShowCreateModal(false);
      setFormData({ nome: '', endereco: '', administrador: '', email: '', whatsapp: '' });
  };

  if (selectedAcademia) {
      return (
          <div className="space-y-6">
              <button onClick={() => setSelectedAcademia(null)} className="text-lime-400 hover:text-lime-300 font-bold text-sm uppercase flex items-center gap-2">
                  &larr; Voltar para Academias
              </button>
              
              <div className="bg-[#151f32] p-8 rounded-3xl border border-slate-800">
                  <div className="flex justify-between items-start mb-6">
                      <div>
                          <h1 className="text-3xl font-black text-white italic">{selectedAcademia.nome}</h1>
                          <p className="text-slate-400 mt-2 flex items-center gap-2"><MapPin size={16} /> {selectedAcademia.endereco}</p>
                      </div>
                      <div className="bg-lime-400/10 p-4 rounded-2xl flex flex-col items-center">
                          <Building size={32} className="text-lime-400 mb-2" />
                          <span className="text-lime-400 font-bold uppercase text-xs">Unidade Ativa</span>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                      <div className="space-y-4">
                          <h3 className="text-white font-bold uppercase text-sm border-b border-slate-800 pb-2">Contato Administrativo</h3>
                          <p className="text-slate-300 flex items-center gap-3"><User size={18} className="text-slate-500" /> {selectedAcademia.administrador}</p>
                          <p className="text-slate-300 flex items-center gap-3"><Mail size={18} className="text-slate-500"/> {selectedAcademia.email}</p>
                          <p className="text-slate-300 flex items-center gap-3"><Phone size={18} className="text-slate-500"/> {selectedAcademia.whatsapp}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 text-center">
                              <Activity className="text-blue-400 mx-auto mb-2" />
                              <p className="text-2xl font-black text-white">{selectedAcademia.totalPersonais}</p>
                              <p className="text-[10px] text-slate-500 uppercase font-bold">Personais</p>
                          </div>
                          <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 text-center">
                              <Users className="text-purple-400 mx-auto mb-2" />
                              <p className="text-2xl font-black text-white">{selectedAcademia.totalAlunos}</p>
                              <p className="text-[10px] text-slate-500 uppercase font-bold">Alunos</p>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#151f32] p-6 rounded-3xl border border-slate-800">
                    <h3 className="text-white font-bold uppercase mb-4 flex items-center gap-2 pt-2"><Activity size={18} className="text-blue-400"/> Lista de Personais</h3>
                        {selectedAcademia.totalPersonais === 0 ? (
                            <p className="text-slate-500 text-sm">Nenhum personal vinculado.</p>
                        ) : (
                            <ul className="space-y-4">
                                {MOCK_PERSONAIS.filter(p => p.academias.includes(selectedAcademia.nome)).map(p => (
                                    <li key={p.id} className="flex justify-between items-center text-sm">
                                        <div>
                                            <p className="text-white font-bold">{p.nome}</p>
                                            <p className="text-slate-500 text-xs">{p.especialidade} • {p.whatsapp}</p>
                                        </div>
                                        <span className="text-xs bg-slate-900 px-2 py-1 rounded text-slate-400 border border-slate-800">Plano {p.plano}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="bg-[#151f32] p-6 rounded-3xl border border-slate-800">
                        <h3 className="text-white font-bold uppercase mb-4 flex items-center gap-2 pt-2"><Users size={18} className="text-purple-400"/> Lista de Alunos</h3>
                        {selectedAcademia.totalAlunos === 0 ? (
                            <p className="text-slate-500 text-sm">Nenhum aluno vinculado.</p>
                        ) : (
                            <ul className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar">
                                {MOCK_ALUNOS.filter(a => a.academia === selectedAcademia.nome).map(a => (
                                    <li key={a.id} className="flex justify-between items-center text-sm p-2 bg-slate-900/50 rounded-xl">
                                        <div>
                                            <p className="text-white font-bold">{a.nome}</p>
                                            <p className="text-slate-500 text-[10px] uppercase">Personal: {a.personal || 'Sem Personal'}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}

                </div>
              </div>

              <div className="bg-[#151f32] p-6 rounded-3xl border border-slate-800">
                  <h3 className="text-white font-bold uppercase mb-4 flex items-center gap-2"><DollarSign size={18} className="text-green-400"/> Setor Financeiro</h3>
                  <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                      <p className="text-slate-400 text-sm">Resumo financeiro e repasses desta unidade aparecerão aqui.</p>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <div className="flex items-center gap-4">
                   <h1 className="text-3xl font-black text-white italic">Gestão de Academias</h1>
                   <div className="bg-lime-400/10 text-lime-400 border border-lime-400/20 px-3 py-1.5 rounded-lg font-black text-sm uppercase cursor-pointer hover:bg-lime-400/20 transition-colors">
                      {academias.length} Total
                   </div>
                </div>
                <p className="text-slate-400 mt-1">Cadastre e gerencie as academias parceiras.</p>
            </div>
            <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-lime-400 text-slate-900 px-6 py-3 rounded-xl font-bold uppercase text-sm tracking-wide flex items-center gap-2 hover:bg-lime-500 transition-colors"
            >
                <Plus size={20} /> Nova Academia
            </button>
        </div>

        <div className="bg-[#151f32] p-1 border border-slate-800 rounded-2xl flex items-center mb-6">
            <div className="p-3 text-slate-500"><Search size={20} /></div>
            <input type="text" placeholder="Buscar por academia..." className="bg-transparent border-none outline-none text-white w-full pr-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {academias.length === 0 ? (
                <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                    <Building className="mx-auto h-12 w-12 text-slate-600 mb-4" />
                    <h3 className="text-lg font-bold text-slate-300">Nenhuma academia cadastrada</h3>
                    <p className="text-slate-500 mt-2">Clique no botão "Nova Academia" para começar.</p>
                </div>
            ) : (
                academias.map(academia => (
                    <button 
                        key={academia.id}
                        onClick={() => setSelectedAcademia(academia)}
                        className="bg-[#151f32] p-6 rounded-3xl border border-slate-800 hover:border-lime-400/50 transition-colors text-left flex flex-col group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-slate-900/50 p-4 rounded-2xl w-fit group-hover:bg-lime-400/10 transition-colors">
                                <Building className="text-slate-400 group-hover:text-lime-400 transition-colors" />
                            </div>
                            {academia.plano && (
                                <span className="bg-slate-900 px-3 py-1 rounded-full text-[10px] font-bold text-lime-400 uppercase border border-lime-400/20">
                                    Plano {academia.plano}
                                </span>
                            )}
                        </div>
                        <h3 className="text-xl font-black text-white mb-1">{academia.nome}</h3>
                        <p className="text-sm text-slate-500 mb-4 line-clamp-1">{academia.endereco}</p>
                        
                        <div className="mt-auto flex justify-between items-center border-t border-slate-800 pt-4">
                            <div className="flex gap-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase">Personais</span>
                                    <span className="text-white font-black">{academia.totalPersonais}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase">Alunos</span>
                                    <span className="text-white font-black">{academia.totalAlunos}</span>
                                </div>
                            </div>
                            <ChevronRight className="text-lime-400" />
                        </div>
                    </button>
                ))
            )}
        </div>

        {showCreateModal && (
            <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
                <div className="bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="flex justify-between items-center p-6 border-b border-slate-800 shrink-0">
                        <h2 className="text-xl font-black text-white uppercase italic">Nova Academia</h2>
                        <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white"><X size={24} /></button>
                    </div>
                    
                    <div className="p-6 overflow-y-auto no-scrollbar">
                        <form id="academia-form" onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Nome da Academia</label>
                                <input required type="text" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-lime-400" placeholder="Ex: SmartFit Paulista" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Endereço Completo</label>
                                <input type="text" value={formData.endereco} onChange={e => setFormData({...formData, endereco: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-lime-400" placeholder="Ex: Av Paulista, 1000" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Nome do Administrador</label>
                                <input type="text" value={formData.administrador} onChange={e => setFormData({...formData, administrador: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-lime-400" placeholder="Ex: João Souza" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">E-mail</label>
                                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-lime-400" placeholder="contato@..." />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">WhatsApp</label>
                                    <input type="text" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-lime-400" placeholder="(11) 99999-9999" />
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="p-6 border-t border-slate-800 shrink-0">
                        <button type="submit" form="academia-form" className="w-full bg-lime-400 text-slate-900 font-black uppercase text-sm tracking-wider py-4 rounded-xl hover:bg-lime-500 transition-colors">
                            Cadastrar Academia
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
