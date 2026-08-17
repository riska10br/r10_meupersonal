import React, { useState } from 'react';
import { Users, Search, Activity, Calendar, Building, ChevronRight, ChevronLeft, Plus, X, Pencil, Camera, MapPin, Phone } from 'lucide-react';

import { MOCK_ALUNOS, MOCK_ACADEMIAS, MOCK_PERSONAIS } from '../../data/mockData';

interface AlunoAdmin {
    id: string;
    nome: string;
    academia: string | null;
    personal: string | null;
    diasLogin: number;
    treinosConcluidos: number;
    avatarUrl?: string;
    plano?: string;
    peso?: number;
    altura?: number;
    objetivos?: string[];
    niveis?: string[];
    atividades?: string[];
    restricoes?: string;
    idade?: string | number;
    cidade?: string;
    whatsapp?: string;
    email?: string;
    avaliacoes?: any[];
}

export const AdminAlunos = () => {
    const [alunos, setAlunos] = useState<AlunoAdmin[]>(MOCK_ALUNOS);
    const [selectedAluno, setSelectedAluno] = useState<AlunoAdmin | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [filter, setFilter] = useState<'todos' | 'com_academia' | 'com_personal' | 'sem_vinculo'>('todos');
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        whatsapp: '',
        academia: '',
        personal: '',
        idade: '',
        peso: '',
        altura: '',
        cidade: '',
        objetivos: [] as string[],
        niveis: [] as string[],
        atividades: [] as string[],
        restricoes: ''
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [dropdowns, setDropdowns] = useState({
        nivel: false,
        objetivo: false,
        atividade: false
    });

    const [showEditModal, setShowEditModal] = useState(false);
    const [editingAlunoId, setEditingAlunoId] = useState<string | null>(null);

    const [showMedidasModal, setShowMedidasModal] = useState(false);
    const [medidasData, setMedidasData] = useState({
        id: '',
        data: '',
        historicoSaude: [] as string[],
        lesoes: [] as string[],
        medicamentos: '',
        outrasInformacoes: '',
        peso: '',
        altura: '',
        composicaoCorporal: '',
        pescoco: '',
        ombroE: '', ombroD: '',
        peitoral: '',
        cintura: '',
        abdomen: '',
        quadril: '',
        bracoRelaxadoE: '', bracoRelaxadoD: '',
        bracoContraidoE: '', bracoContraidoD: '',
        antebracoE: '', antebracoD: '',
        coxaE: '', coxaD: '',
        panturrilhaE: '', panturrilhaD: '',
        dobraToracica: '',
        dobraAxilarMedia: '',
        dobraTriceps: '',
        dobraSubescapular: '',
        dobraAbdominal: '',
        dobraSuprailiaca: '',
        dobraCoxa: '',
        posturaFrente: '',
        posturaCostas: '',
        posturaPerfil: '',
        flexibilidade: '',
        resistenciaMuscular: '',
        metaPeso: '',
        metaCintura: '',
        metaPercentualGordura: ''
    });

    const [anamneseDropdowns, setAnamneseDropdowns] = useState({
        historicoSaude: false,
        lesoes: false
    });

    const toggleHistoricoSaude = (item: string) => {
        setMedidasData(prev => ({
            ...prev,
            historicoSaude: prev.historicoSaude.includes(item) 
                ? prev.historicoSaude.filter(x => x !== item) 
                : [...prev.historicoSaude, item]
        }));
    };

    const toggleLesoes = (item: string) => {
        setMedidasData(prev => ({
            ...prev,
            lesoes: prev.lesoes.includes(item) 
                ? prev.lesoes.filter(x => x !== item) 
                : [...prev.lesoes, item]
        }));
    };

    const handleOpenMedidas = (avaliacao?: any) => {
        if (selectedAluno) {
            if (avaliacao && avaliacao.id) {
                setMedidasData({
                    ...avaliacao,
                    id: avaliacao.id,
                    data: avaliacao.data,
                    historicoSaude: avaliacao.historicoSaude || [],
                    lesoes: avaliacao.lesoes || []
                });
            } else {
                setMedidasData({
                    id: Math.random().toString(),
                    data: new Date().toLocaleDateString('pt-BR'),
                    historicoSaude: [] as string[],
                    lesoes: [] as string[],
                    medicamentos: '',
                    outrasInformacoes: '',
                    peso: selectedAluno.peso?.toString() || '',
                    altura: selectedAluno.altura?.toString() || '',
                    composicaoCorporal: '',
                    pescoco: '',
                    ombroE: '', ombroD: '',
                    peitoral: '',
                    cintura: '',
                    abdomen: '',
                    quadril: '',
                    bracoRelaxadoE: '', bracoRelaxadoD: '',
                    bracoContraidoE: '', bracoContraidoD: '',
                    antebracoE: '', antebracoD: '',
                    coxaE: '', coxaD: '',
                    panturrilhaE: '', panturrilhaD: '',
                    dobraToracica: '',
                    dobraAxilarMedia: '',
                    dobraTriceps: '',
                    dobraSubescapular: '',
                    dobraAbdominal: '',
                    dobraSuprailiaca: '',
                    dobraCoxa: '',
                    posturaFrente: '',
                    posturaCostas: '',
                    posturaPerfil: '',
                    flexibilidade: '',
                    resistenciaMuscular: '',
                    metaPeso: '',
                    metaCintura: '',
                    metaPercentualGordura: ''
                });
            }
            setShowMedidasModal(true);
        }
    };

    const handleSaveMedidas = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedAluno) {
            const avaliacoesAtuais = selectedAluno.avaliacoes || [];
            const isEditing = avaliacoesAtuais.some(a => a.id === medidasData.id);
            
            let novasAvaliacoes;
            if (isEditing) {
                novasAvaliacoes = avaliacoesAtuais.map(a => a.id === medidasData.id ? medidasData : a);
            } else {
                novasAvaliacoes = [medidasData, ...avaliacoesAtuais];
            }

            const updated = { 
                ...selectedAluno, 
                avaliacoes: novasAvaliacoes, 
                peso: parseFloat(medidasData.peso) || selectedAluno.peso, 
                altura: parseFloat(medidasData.altura) || selectedAluno.altura 
            };
            setSelectedAluno(updated);
            setAlunos(alunos.map(a => a.id === updated.id ? updated : a));
        }
        setShowMedidasModal(false);
    };

    const toggleNivel = (n: string) => {
        setFormData(prev => ({
            ...prev,
            niveis: prev.niveis.includes(n) ? prev.niveis.filter(x => x !== n) : [...prev.niveis, n]
        }));
    };

    const toggleObjetivo = (o: string) => {
        setFormData(prev => ({
            ...prev,
            objetivos: prev.objetivos.includes(o) ? prev.objetivos.filter(x => x !== o) : [...prev.objetivos, o]
        }));
    };

    const toggleAtividade = (a: string) => {
        setFormData(prev => ({
            ...prev,
            atividades: prev.atividades.includes(a) ? prev.atividades.filter(x => x !== a) : [...prev.atividades, a]
        }));
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingAlunoId) {
            setAlunos(alunos.map(a => a.id === editingAlunoId ? {
                ...a,
                nome: formData.nome,
                academia: formData.academia || null,
                personal: formData.personal || null,
                peso: parseFloat(formData.peso) || 0,
                altura: parseFloat(formData.altura) || 0,
                idade: formData.idade,
                cidade: formData.cidade,
                whatsapp: formData.whatsapp,
                email: formData.email,
                objetivos: formData.objetivos,
                niveis: formData.niveis,
                atividades: formData.atividades,
                restricoes: formData.restricoes
            } : a));
            if (selectedAluno && selectedAluno.id === editingAlunoId) {
                setSelectedAluno(alunos.find(a => a.id === editingAlunoId) ? {
                    ...selectedAluno,
                    nome: formData.nome,
                    academia: formData.academia || null,
                    personal: formData.personal || null,
                    peso: parseFloat(formData.peso) || 0,
                    altura: parseFloat(formData.altura) || 0,
                    idade: formData.idade,
                    cidade: formData.cidade,
                    whatsapp: formData.whatsapp,
                    email: formData.email,
                    objetivos: formData.objetivos,
                    niveis: formData.niveis,
                    atividades: formData.atividades,
                    restricoes: formData.restricoes
                } : selectedAluno);
            }
            setShowEditModal(false);
            setEditingAlunoId(null);
        } else {
            const newAluno: AlunoAdmin = {
                id: Math.random().toString(),
                nome: formData.nome,
                academia: formData.academia || null,
                personal: formData.personal || null,
                diasLogin: 0,
                treinosConcluidos: 0,
                peso: parseFloat(formData.peso) || 0,
                altura: parseFloat(formData.altura) || 0,
                idade: formData.idade,
                cidade: formData.cidade,
                whatsapp: formData.whatsapp,
                email: formData.email,
                objetivos: formData.objetivos,
                niveis: formData.niveis,
                atividades: formData.atividades,
                restricoes: formData.restricoes
            };
            setAlunos([...alunos, newAluno]);
            setShowCreateModal(false);
        }
        setFormData({ nome: '', email: '', whatsapp: '', academia: '', personal: '', idade: '', peso: '', altura: '', cidade: '', objetivos: [], niveis: [], atividades: [], restricoes: '' });
        setDropdowns({ nivel: false, objetivo: false, atividade: false });
    };

    const handleOpenEdit = (aluno: AlunoAdmin) => {
        setEditingAlunoId(aluno.id);
        setFormData({
            nome: aluno.nome || '',
            email: aluno.email || '',
            whatsapp: aluno.whatsapp || '',
            academia: aluno.academia || '',
            personal: aluno.personal || '',
            idade: aluno.idade?.toString() || '',
            peso: aluno.peso?.toString() || '',
            altura: aluno.altura?.toString() || '',
            cidade: aluno.cidade || '',
            objetivos: aluno.objetivos || [],
            niveis: aluno.niveis || [],
            atividades: aluno.atividades || [],
            restricoes: aluno.restricoes || ''
        });
        setShowEditModal(true);
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && selectedAluno) {
            const file = e.target.files[0];
            const imageUrl = URL.createObjectURL(file);
            
            const updatedAluno = { ...selectedAluno, avatarUrl: imageUrl };
            setSelectedAluno(updatedAluno);
            setAlunos(alunos.map(a => a.id === selectedAluno.id ? updatedAluno : a));
        }
    };

    const RetractableSelect = ({ label, options, selected, onChange, isOpen, onToggle }: any) => (
        <div>
            <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">{label}</label>
            <div 
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white cursor-pointer flex justify-between items-center"
                onClick={onToggle}
            >
                <span className="truncate text-sm text-slate-300">
                    {selected.length > 0 ? selected.join(', ') : '(Nenhuma opção)'}
                </span>
                <ChevronRight size={16} className={`transition-transform ${isOpen ? 'rotate-90' : ''}`} />
            </div>
            {isOpen && (
                <div className="mt-2 bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 max-h-48 overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {options.map((opt: string) => (
                            <label key={opt} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
                                <input 
                                    type="checkbox" 
                                    className="accent-lime-400"
                                    checked={selected.includes(opt)}
                                    onChange={() => onChange(opt)}
                                />
                                {opt}
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const sortedAndFilteredAlunos = [...alunos]
        .filter(aluno => 
            aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (aluno.academia && aluno.academia.toLowerCase().includes(searchTerm.toLowerCase())) || 
            (aluno.personal && aluno.personal.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .filter(aluno => {
            if (filter === 'todos') return true;
            if (filter === 'com_academia') return !!aluno.academia;
            if (filter === 'com_personal') return !!aluno.personal;
            if (filter === 'sem_vinculo') return !aluno.academia && !aluno.personal;
            return true;
        })
        .sort((a, b) => a.nome.localeCompare(b.nome));

    return (
        <>
            {selectedAluno ? (
                <div className="space-y-6 animate-fade-in">
                <button onClick={() => setSelectedAluno(null)} className="text-lime-400 hover:text-lime-300 font-bold text-sm uppercase flex items-center gap-2">
                    <ChevronLeft size={16} /> Voltar para Alunos
                </button>
                
                <div className="bg-[#151f32] p-8 rounded-3xl border border-slate-800">
                    <div className="flex items-center gap-6 mb-8 group relative">
                        <div className="relative w-24 h-24 rounded-full bg-slate-800 border-4 border-lime-400/20 overflow-hidden flex items-center justify-center shrink-0">
                           {selectedAluno.avatarUrl ? (
                               <img src={selectedAluno.avatarUrl} alt={selectedAluno.nome} className="w-full h-full object-cover" />
                           ) : (
                               <span className="text-3xl font-black text-slate-500">{selectedAluno.nome.charAt(0)}</span>
                           )}
                           <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                               <Camera size={20} className="text-lime-400 mb-1" />
                               <span className="text-[9px] uppercase font-bold text-white">Alterar</span>
                               <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                           </label>
                        </div>
                        <div className="w-full">
                            <div className="flex justify-between items-start">
                                <h2 className="text-3xl font-black text-white flex items-center gap-3">
                                    {selectedAluno.nome}
                                    <button onClick={() => handleOpenEdit(selectedAluno)} className="text-slate-500 hover:text-lime-400 transition-colors">
                                        <Pencil size={20} />
                                    </button>
                                </h2>
                            </div>
                            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-sm">
                                {selectedAluno.idade && <span className="flex items-center gap-1 text-slate-400"><Users size={16} className="text-slate-500" /> {selectedAluno.idade} anos</span>}
                                {selectedAluno.cidade && <span className="flex items-center gap-1 text-slate-400"><MapPin size={16} className="text-slate-500" /> {selectedAluno.cidade}</span>}
                                {selectedAluno.whatsapp && (
                                    <a href={`https://wa.me/${selectedAluno.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-slate-400 hover:text-lime-400 transition-colors">
                                        <Phone size={16} className="text-slate-500 hover:text-lime-400" /> {selectedAluno.whatsapp}
                                    </a>
                                )}
                                <span className="flex items-center gap-1 text-slate-400"><Building size={16} className="text-slate-500" /> {selectedAluno.academia || 'Sem Academia'}</span>
                                <span className="flex items-center gap-1 text-slate-400"><Activity size={16} className="text-slate-500" /> {selectedAluno.personal || 'Sem Personal'}</span>
                            </div>
                        </div>
                    </div>

                    {selectedAluno.peso && selectedAluno.altura ? (
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Informações de Saúde (IMC)</h3>
                            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center gap-8">
                                <div className="text-center shrink-0">
                                    <p className="text-[10px] font-black text-slate-500 uppercase">IMC Atual</p>
                                    <p className="text-4xl font-black text-white mt-1">{(selectedAluno.peso / ((selectedAluno.altura / 100) * (selectedAluno.altura / 100))).toFixed(1)}</p>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs w-full">
                                    <div className={`p-2 rounded-lg text-center ${((selectedAluno.peso / ((selectedAluno.altura / 100) * (selectedAluno.altura / 100))) < 18.5) ? 'bg-blue-400/20 text-blue-400 font-bold border border-blue-400/30' : 'bg-slate-800 text-slate-500'}`}>
                                        <p className="font-bold mb-1">Abaixo de 18.5</p>
                                        <p className="text-[10px] uppercase">Abaixo do Peso</p>
                                    </div>
                                    <div className={`p-2 rounded-lg text-center ${((selectedAluno.peso / ((selectedAluno.altura / 100) * (selectedAluno.altura / 100))) >= 18.5 && (selectedAluno.peso / ((selectedAluno.altura / 100) * (selectedAluno.altura / 100))) < 24.9) ? 'bg-lime-400/20 text-lime-400 font-bold border border-lime-400/30' : 'bg-slate-800 text-slate-500'}`}>
                                        <p className="font-bold mb-1">18.5 - 24.9</p>
                                        <p className="text-[10px] uppercase">Peso Normal</p>
                                    </div>
                                    <div className={`p-2 rounded-lg text-center ${((selectedAluno.peso / ((selectedAluno.altura / 100) * (selectedAluno.altura / 100))) >= 25 && (selectedAluno.peso / ((selectedAluno.altura / 100) * (selectedAluno.altura / 100))) < 29.9) ? 'bg-orange-400/20 text-orange-400 font-bold border border-orange-400/30' : 'bg-slate-800 text-slate-500'}`}>
                                        <p className="font-bold mb-1">25.0 - 29.9</p>
                                        <p className="text-[10px] uppercase">Sobrepeso</p>
                                    </div>
                                    <div className={`p-2 rounded-lg text-center ${((selectedAluno.peso / ((selectedAluno.altura / 100) * (selectedAluno.altura / 100))) >= 30) ? 'bg-red-400/20 text-red-400 font-bold border border-red-400/30' : 'bg-slate-800 text-slate-500'}`}>
                                        <p className="font-bold mb-1">Acima de 30.0</p>
                                        <p className="text-[10px] uppercase">Obesidade</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                            <p className="text-[10px] font-black text-slate-500 uppercase">Dias de Login</p>
                            <p className="text-2xl font-black text-white mt-1">{selectedAluno.diasLogin}</p>
                        </div>
                        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                            <p className="text-[10px] font-black text-slate-500 uppercase">Treinos Concluídos</p>
                            <p className="text-2xl font-black text-white mt-1">{selectedAluno.treinosConcluidos}</p>
                        </div>
                        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                            <p className="text-[10px] font-black text-slate-500 uppercase">Status</p>
                            <span className="inline-block mt-2 px-3 py-1 bg-lime-400/10 text-lime-400 rounded-full text-xs font-bold uppercase">Ativo</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="bg-[#151f32] p-6 rounded-3xl border border-slate-800">
                        <h3 className="text-lg font-black text-white mb-4 uppercase">Treinos Criados (Personal)</h3>
                        <div className="flex items-center justify-center p-8 bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl">
                            <p className="text-center text-slate-500 text-sm">Nenhum treino disponível atualmente.</p>
                        </div>
                    </div>

                    <div className="bg-[#151f32] p-6 rounded-3xl border border-slate-800">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-black text-white uppercase">Evolução e Medidas</h3>
                            <button onClick={() => handleOpenMedidas()} className="text-xs bg-lime-400 text-slate-900 px-3 py-1.5 rounded-lg font-bold uppercase flex items-center gap-1 hover:bg-lime-500 transition-colors">
                                <Plus size={14} /> Adicionar
                            </button>
                        </div>
                        <div className="flex flex-col gap-3">
                            {selectedAluno.avaliacoes && selectedAluno.avaliacoes.length > 0 ? (
                                selectedAluno.avaliacoes.map((aval: any) => (
                                    <div key={aval.id} onClick={() => handleOpenMedidas(aval)} className="w-full bg-slate-900/50 border border-slate-800 hover:border-lime-400 cursor-pointer rounded-2xl p-4 transition-colors">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-lime-400 font-bold text-sm">{aval.data}</span>
                                            <span className="text-slate-500 text-xs">Ver detalhes <ChevronRight size={14} className="inline" /></span>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2 text-xs">
                                            <div className="bg-slate-800 p-2 rounded-lg text-center"><span className="block text-[9px] text-slate-500 uppercase font-black">Peso</span><span className="text-white font-bold">{aval.peso || '--'}kg</span></div>
                                            <div className="bg-slate-800 p-2 rounded-lg text-center"><span className="block text-[9px] text-slate-500 uppercase font-black">Cintura</span><span className="text-white font-bold">{aval.cintura || '--'}cm</span></div>
                                            <div className="bg-slate-800 p-2 rounded-lg text-center"><span className="block text-[9px] text-slate-500 uppercase font-black">Fat %</span><span className="text-white font-bold">{aval.composicaoCorporal || '--'}</span></div>
                                            <div className="bg-slate-800 p-2 rounded-lg text-center"><span className="block text-[9px] text-slate-500 uppercase font-black">Meta Peso</span><span className="text-white font-bold">{aval.metaPeso || '--'}kg</span></div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex items-center justify-center p-8 bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl">
                                    <p className="text-center text-slate-500 text-sm">Dados de evolução não registrados no momento.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            ) : (
            <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="w-full md:w-auto">
                    <h1 className="text-3xl font-black text-white italic">Gestão de Alunos</h1>
                    <p className="text-slate-400 mt-1 mb-4">Acompanhe todos os alunos vinculados à plataforma.</p>
                    <div className="flex flex-wrap gap-3">
                        <button onClick={() => setFilter('todos')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-colors border ${filter === 'todos' ? 'bg-lime-400 text-slate-900 border-lime-400' : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'}`}>
                            Total: {alunos.length}
                        </button>
                        <button onClick={() => setFilter('com_academia')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-colors border ${filter === 'com_academia' ? 'bg-purple-400 text-slate-900 border-purple-400' : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'}`}>
                            Academias: {alunos.filter(a => !!a.academia).length}
                        </button>
                        <button onClick={() => setFilter('com_personal')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-colors border ${filter === 'com_personal' ? 'bg-blue-400 text-slate-900 border-blue-400' : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'}`}>
                            Personais: {alunos.filter(a => !!a.personal).length}
                        </button>
                        <button onClick={() => setFilter('sem_vinculo')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-colors border ${filter === 'sem_vinculo' ? 'bg-red-400 text-slate-900 border-red-400' : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'}`}>
                            Sem Vínculo: {alunos.filter(a => !a.academia && !a.personal).length}
                        </button>
                    </div>
                </div>
                <button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-lime-400 text-slate-900 px-6 py-3 rounded-xl font-bold uppercase text-sm tracking-wide flex items-center gap-2 hover:bg-lime-500 transition-colors shrink-0"
                >
                    <Plus size={20} /> Novo Aluno
                </button>
            </div>

            <div className="bg-[#151f32] p-1 border border-slate-800 rounded-2xl flex items-center mb-6">
                <div className="p-3 text-slate-500"><Search size={20} /></div>
                <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por aluno, academia ou personal..." 
                    className="bg-transparent border-none outline-none text-white w-full pr-4" 
                />
            </div>

            <div className="space-y-4">
                {sortedAndFilteredAlunos.length === 0 ? (
                    <div className="py-16 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                        <Users className="mx-auto h-12 w-12 text-slate-600 mb-4" />
                        <h3 className="text-lg font-bold text-slate-300">Nenhum aluno encontrado</h3>
                        <p className="text-slate-500 mt-2">Os alunos aparecerão aqui conforme se cadastrarem.</p>
                    </div>
                ) : (
                    sortedAndFilteredAlunos.map(aluno => (
                        <button 
                            key={aluno.id}
                            onClick={() => setSelectedAluno(aluno)}
                            className="bg-[#151f32] p-4 md:p-6 rounded-2xl border border-slate-800 hover:border-lime-400/50 transition-colors text-left flex flex-col md:flex-row items-start md:items-center justify-between w-full group"
                        >
                            <div className="flex items-center gap-4 mb-4 md:mb-0">
                                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-black text-slate-400 group-hover:text-lime-400 transition-colors">
                                    {aluno.nome.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg flex items-center gap-2">
                                        {aluno.nome} 
                                        {aluno.plano && <span className="text-[10px] bg-slate-900 border border-slate-700 px-2 rounded-full text-slate-400">{aluno.plano}</span>}
                                    </h3>
                                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-1 text-xs text-slate-400">
                                        <span className="flex items-center gap-1"><Building size={14}/> {aluno.academia || 'Nenhuma'}</span>
                                        <span className="flex items-center gap-1"><Activity size={14}/> {aluno.personal || 'Nenhum'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 w-full md:w-auto">
                                <div className="flex gap-6 w-full justify-around md:justify-end">
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-slate-500 uppercase">Acessos</p>
                                        <p className="font-bold text-white">{aluno.diasLogin}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-slate-500 uppercase">Treinos</p>
                                        <p className="font-bold text-lime-400">{aluno.treinosConcluidos}</p>
                                    </div>
                                </div>
                                <div className="hidden md:block">
                                    <ChevronRight className="text-slate-600 group-hover:text-lime-400 transition-colors" />
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>
            </div>
            )}

            {(showCreateModal || showEditModal) && (
                <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
                    <div className="bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-slate-800 shrink-0">
                            <h2 className="text-xl font-black text-white uppercase italic">{editingAlunoId ? 'Editar Aluno' : 'Novo Aluno'}</h2>
                            <button onClick={() => { setShowCreateModal(false); setShowEditModal(false); setEditingAlunoId(null); }} className="text-slate-400 hover:text-white"><X size={24} /></button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto no-scrollbar">
                            <form id="aluno-form" onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Nome Completo</label>
                                    <input required type="text" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-lime-400" />
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">WhatsApp</label>
                                        <input type="text" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-lime-400" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Idade</label>
                                        <input type="number" value={formData.idade} onChange={e => setFormData({...formData, idade: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-lime-400" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Peso (kg)</label>
                                        <input type="number" step="0.1" value={formData.peso} onChange={e => setFormData({...formData, peso: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-lime-400" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Altura (cm)</label>
                                        <input type="number" value={formData.altura} onChange={e => setFormData({...formData, altura: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-lime-400" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">E-mail</label>
                                        <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-lime-400" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Cidade</label>
                                        <input type="text" value={formData.cidade} onChange={e => setFormData({...formData, cidade: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-lime-400" placeholder="Ex: São Paulo - SP" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Restrições Médicas / Físicas</label>
                                    <input type="text" value={formData.restricoes} onChange={e => setFormData({...formData, restricoes: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-lime-400" placeholder="Ex: Dor no joelho, Asma" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <RetractableSelect 
                                        label="Opções de Nível"
                                        options={['Iniciante', 'Intermediário', 'Avançado']}
                                        selected={formData.niveis}
                                        onChange={toggleNivel}
                                        isOpen={dropdowns.nivel}
                                        onToggle={() => setDropdowns(prev => ({ ...prev, nivel: !prev.nivel }))}
                                    />
                                    <RetractableSelect 
                                        label="Objetivos"
                                        options={['Hipertrofia', 'Emagrecimento', 'Saúde e Bem-estar', 'Condicionamento Físico', 'Mobilidade', 'Flexibilidade', 'Resistência Muscular', 'Força']}
                                        selected={formData.objetivos}
                                        onChange={toggleObjetivo}
                                        isOpen={dropdowns.objetivo}
                                        onToggle={() => setDropdowns(prev => ({ ...prev, objetivo: !prev.objetivo }))}
                                    />
                                    <div className="md:col-span-2">
                                        <RetractableSelect 
                                            label="Pratica alguma atividade física?"
                                            options={['Musculação', 'Corrida', 'Ciclismo', 'Natação', 'Luta', 'Crossfit', 'Yoga', 'Pilates', 'Dança', 'Esportes de Quadra']}
                                            selected={formData.atividades}
                                            onChange={toggleAtividade}
                                            isOpen={dropdowns.atividade}
                                            onToggle={() => setDropdowns(prev => ({ ...prev, atividade: !prev.atividade }))}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Academia</label>
                                        <select value={formData.academia} onChange={e => setFormData({...formData, academia: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-lime-400 appearance-none">
                                            <option value="">(Nenhuma)</option>
                                            {MOCK_ACADEMIAS.map(ac => <option key={ac.id} value={ac.nome}>{ac.nome}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Personal</label>
                                        <select value={formData.personal} onChange={e => setFormData({...formData, personal: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-lime-400 appearance-none">
                                            <option value="">(Nenhum)</option>
                                            {MOCK_PERSONAIS.map(p => <option key={p.id} value={p.nome}>{p.nome}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-slate-800 shrink-0">
                            <button type="submit" form="aluno-form" className="w-full bg-lime-400 text-slate-900 font-black uppercase text-sm tracking-wider py-4 rounded-xl hover:bg-lime-500 transition-colors">
                                {editingAlunoId ? 'Salvar Alterações' : 'Cadastrar Aluno'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showMedidasModal && (
                <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
                    <div className="bg-slate-900 w-full max-w-4xl rounded-3xl border border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-slate-800 shrink-0">
                            <h2 className="text-xl font-black text-white uppercase italic">Evolução e Medidas</h2>
                            <button onClick={() => setShowMedidasModal(false)} className="text-slate-400 hover:text-white"><X size={24} /></button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto no-scrollbar">
                            <form id="medidas-form" onSubmit={handleSaveMedidas} className="space-y-8">
                                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
                                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-1">Data da Avaliação</label>
                                    <input 
                                        type="text" 
                                        value={medidasData.data} 
                                        onChange={e => setMedidasData({...medidasData, data: e.target.value})} 
                                        placeholder="DD/MM/AAAA"
                                        className="w-full md:w-1/3 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-lime-400" 
                                    />
                                </div>

                                {/* 1. Anamnese (Simplificada) */}
                                <div>
                                    <h3 className="text-lg font-bold text-lime-400 border-b border-slate-800 pb-2 mb-4">1. Anamnese</h3>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <RetractableSelect 
                                                label="Histórico de Saúde"
                                                options={['Diabetes', 'Hipertensão', 'Cardiopatia', 'Asma', 'Colesterol Alto']}
                                                selected={medidasData.historicoSaude}
                                                onChange={toggleHistoricoSaude}
                                                isOpen={anamneseDropdowns.historicoSaude}
                                                onToggle={() => setAnamneseDropdowns(prev => ({ ...prev, historicoSaude: !prev.historicoSaude }))}
                                            />
                                            <RetractableSelect 
                                                label="Histórico de Lesões"
                                                options={['Joelho', 'Ombro', 'Coluna', 'Tornozelo', 'Quadril']}
                                                selected={medidasData.lesoes}
                                                onChange={toggleLesoes}
                                                isOpen={anamneseDropdowns.lesoes}
                                                onToggle={() => setAnamneseDropdowns(prev => ({ ...prev, lesoes: !prev.lesoes }))}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Medicamentos em Uso</label>
                                                <input type="text" value={medidasData.medicamentos} onChange={e => setMedidasData({...medidasData, medicamentos: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-lime-400" placeholder="Ex: Losartana..." />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Outras Informações de Saúde</label>
                                                <input type="text" value={medidasData.outrasInformacoes} onChange={e => setMedidasData({...medidasData, outrasInformacoes: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-lime-400" placeholder="Alergias, cirurgias passadas..." />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Dados Básicos e Composição Corporal */}
                                <div>
                                    <h3 className="text-lg font-bold text-lime-400 border-b border-slate-800 pb-2 mb-4">2. Medidas Básicas e Composição</h3>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Peso (kg)</label>
                                                <input type="number" step="0.1" value={medidasData.peso} onChange={e => setMedidasData({...medidasData, peso: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-lime-400" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Altura (cm)</label>
                                                <input type="number" step="0.1" value={medidasData.altura} onChange={e => setMedidasData({...medidasData, altura: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-lime-400" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Composição Corporal (%)</label>
                                                <input type="text" value={medidasData.composicaoCorporal} onChange={e => setMedidasData({...medidasData, composicaoCorporal: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-lime-400" placeholder="Ex: 15% Gordura, 40kg Massa Magra" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Perímetros */}
                                <div>
                                    <h3 className="text-lg font-bold text-lime-400 border-b border-slate-800 pb-2 mb-4">3. Perímetros (Circunferências) - cm</h3>
                                    <p className="text-xs text-slate-500 mb-4">Medir com fita métrica antropométrica, preferencialmente no lado direito (ou ambos para verificar assimetrias), buscando a maior circunferência da área, exceto onde indicado.</p>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Pescoço</label><input type="number" step="0.1" value={medidasData.pescoco} onChange={e => setMedidasData({...medidasData, pescoco: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-lime-400 text-sm" /></div>
                                        <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Peitoral/Torácico</label><input type="number" step="0.1" value={medidasData.peitoral} onChange={e => setMedidasData({...medidasData, peitoral: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-lime-400 text-sm" /></div>
                                        <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Cintura</label><input type="number" step="0.1" value={medidasData.cintura} onChange={e => setMedidasData({...medidasData, cintura: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-lime-400 text-sm" /></div>
                                        <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Abdômen</label><input type="number" step="0.1" value={medidasData.abdomen} onChange={e => setMedidasData({...medidasData, abdomen: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-lime-400 text-sm" /></div>
                                        <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Quadril</label><input type="number" step="0.1" value={medidasData.quadril} onChange={e => setMedidasData({...medidasData, quadril: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-lime-400 text-sm" /></div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                        <div className="col-span-2">
                                            <h4 className="text-[11px] font-bold text-slate-400 uppercase mb-2">Ombros</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input type="number" step="0.1" placeholder="Esq" value={medidasData.ombroE} onChange={e => setMedidasData({...medidasData, ombroE: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-lime-400 text-sm" />
                                                <input type="number" step="0.1" placeholder="Dir" value={medidasData.ombroD} onChange={e => setMedidasData({...medidasData, ombroD: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-lime-400 text-sm" />
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <h4 className="text-[11px] font-bold text-slate-400 uppercase mb-2">Braços Relaxados</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input type="number" step="0.1" placeholder="Esq" value={medidasData.bracoRelaxadoE} onChange={e => setMedidasData({...medidasData, bracoRelaxadoE: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-lime-400 text-sm" />
                                                <input type="number" step="0.1" placeholder="Dir" value={medidasData.bracoRelaxadoD} onChange={e => setMedidasData({...medidasData, bracoRelaxadoD: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-lime-400 text-sm" />
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <h4 className="text-[11px] font-bold text-slate-400 uppercase mb-2">Braços Contraídos</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input type="number" step="0.1" placeholder="Esq" value={medidasData.bracoContraidoE} onChange={e => setMedidasData({...medidasData, bracoContraidoE: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-lime-400 text-sm" />
                                                <input type="number" step="0.1" placeholder="Dir" value={medidasData.bracoContraidoD} onChange={e => setMedidasData({...medidasData, bracoContraidoD: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-lime-400 text-sm" />
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <h4 className="text-[11px] font-bold text-slate-400 uppercase mb-2">Antebraços</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input type="number" step="0.1" placeholder="Esq" value={medidasData.antebracoE} onChange={e => setMedidasData({...medidasData, antebracoE: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-lime-400 text-sm" />
                                                <input type="number" step="0.1" placeholder="Dir" value={medidasData.antebracoD} onChange={e => setMedidasData({...medidasData, antebracoD: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-lime-400 text-sm" />
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <h4 className="text-[11px] font-bold text-slate-400 uppercase mb-2">Coxas</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input type="number" step="0.1" placeholder="Esq" value={medidasData.coxaE} onChange={e => setMedidasData({...medidasData, coxaE: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-lime-400 text-sm" />
                                                <input type="number" step="0.1" placeholder="Dir" value={medidasData.coxaD} onChange={e => setMedidasData({...medidasData, coxaD: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-lime-400 text-sm" />
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <h4 className="text-[11px] font-bold text-slate-400 uppercase mb-2">Panturrilhas</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input type="number" step="0.1" placeholder="Esq" value={medidasData.panturrilhaE} onChange={e => setMedidasData({...medidasData, panturrilhaE: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-lime-400 text-sm" />
                                                <input type="number" step="0.1" placeholder="Dir" value={medidasData.panturrilhaD} onChange={e => setMedidasData({...medidasData, panturrilhaD: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-lime-400 text-sm" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Dobras Cutâneas */}
                                <div>
                                    <h3 className="text-lg font-bold text-lime-400 border-b border-slate-800 pb-2 mb-4">4. Dobras Cutâneas (Protocolo de 7 Dobras) - mm</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Torácica</label><input type="number" step="0.1" value={medidasData.dobraToracica} onChange={e => setMedidasData({...medidasData, dobraToracica: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-lime-400 text-sm" /></div>
                                        <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Axilar Média</label><input type="number" step="0.1" value={medidasData.dobraAxilarMedia} onChange={e => setMedidasData({...medidasData, dobraAxilarMedia: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-lime-400 text-sm" /></div>
                                        <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Tríceps</label><input type="number" step="0.1" value={medidasData.dobraTriceps} onChange={e => setMedidasData({...medidasData, dobraTriceps: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-lime-400 text-sm" /></div>
                                        <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Subescapular</label><input type="number" step="0.1" value={medidasData.dobraSubescapular} onChange={e => setMedidasData({...medidasData, dobraSubescapular: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-lime-400 text-sm" /></div>
                                        <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Abdominal</label><input type="number" step="0.1" value={medidasData.dobraAbdominal} onChange={e => setMedidasData({...medidasData, dobraAbdominal: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-lime-400 text-sm" /></div>
                                        <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Suprailíaca</label><input type="number" step="0.1" value={medidasData.dobraSuprailiaca} onChange={e => setMedidasData({...medidasData, dobraSuprailiaca: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-lime-400 text-sm" /></div>
                                        <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Coxa</label><input type="number" step="0.1" value={medidasData.dobraCoxa} onChange={e => setMedidasData({...medidasData, dobraCoxa: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-lime-400 text-sm" /></div>
                                    </div>
                                </div>

                                {/* Avaliação Funcional e Postural */}
                                <div>
                                    <h3 className="text-lg font-bold text-lime-400 border-b border-slate-800 pb-2 mb-4">5. Avaliação Funcional e Postural</h3>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Postura (Frente)</label>
                                                <input type="text" value={medidasData.posturaFrente} onChange={e => setMedidasData({...medidasData, posturaFrente: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-lime-400 text-sm" placeholder="Observações..." />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Postura (Costas)</label>
                                                <input type="text" value={medidasData.posturaCostas} onChange={e => setMedidasData({...medidasData, posturaCostas: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-lime-400 text-sm" placeholder="Observações..." />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Postura (Perfil)</label>
                                                <input type="text" value={medidasData.posturaPerfil} onChange={e => setMedidasData({...medidasData, posturaPerfil: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-lime-400 text-sm" placeholder="Observações..." />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Flexibilidade</label>
                                                <input type="text" value={medidasData.flexibilidade} onChange={e => setMedidasData({...medidasData, flexibilidade: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-lime-400 text-sm" placeholder="Ex: Sentar e alcançar (+5cm)" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Resistência Muscular</label>
                                                <input type="text" value={medidasData.resistenciaMuscular} onChange={e => setMedidasData({...medidasData, resistenciaMuscular: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-lime-400 text-sm" placeholder="Ex: 30 abs / 15 flexões (1 min)" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Metas */}
                                <div>
                                    <h3 className="text-lg font-bold text-lime-400 border-b border-slate-800 pb-2 mb-4">6. Metas</h3>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Meta de Peso (kg)</label>
                                                <input type="number" step="0.1" value={medidasData.metaPeso} onChange={e => setMedidasData({...medidasData, metaPeso: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-lime-400" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Meta % Gordura</label>
                                                <input type="number" step="0.1" value={medidasData.metaPercentualGordura} onChange={e => setMedidasData({...medidasData, metaPercentualGordura: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-lime-400" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Meta de Cintura (cm)</label>
                                                <input type="number" step="0.1" value={medidasData.metaCintura} onChange={e => setMedidasData({...medidasData, metaCintura: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-lime-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-slate-800 shrink-0">
                            <button type="submit" form="medidas-form" className="w-full bg-lime-400 text-slate-900 font-black uppercase text-sm tracking-wider py-4 rounded-xl hover:bg-lime-500 transition-colors">
                                Salvar Medidas
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
