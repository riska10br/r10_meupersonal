import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth, Role } from '../auth/AuthContext';
import { Activity, Users, PlusCircle, Search, ChevronRight, X, Info, Dumbbell, TrendingUp, DollarSign, BrainCircuit, Edit2 } from 'lucide-react';
import { Student } from '../types';
import { WEEK_DAYS } from '../constants';
import { StudentDetails } from '../components/StudentDetails';
import { useStudents } from '../hooks/useStudents';
import { useUsers } from '../hooks/useUsers';

const GOAL_OPTIONS = [
  'Hipertrofia', 'Emagrecimento', 'Condicionamento Físico', 'Flexibilidade', 'Saúde/Bem-estar', 'Performance Atleta', 'Reabilitação', 'Ganho de Força'
];

export const PersonalDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const { students, addStudent, updateStudent: handleUpdateStudent } = useStudents();
  const { createUser } = useUsers();
  
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [createError, setCreateError] = useState('');
  
  // Custom states for modal
  const [formData, setFormData] = useState({
    name: '', age: 25, height: 175, weight: 75,
    sedentaryLevel: 'Moderadamente Ativo' as Student['sedentaryLevel'],
    goals: [GOAL_OPTIONS[0]], level: 'Iniciante' as Student['level'],
    restrictions: '', whatsapp: '', instagram: '', email: ''
  });
  const [hasCustomGoal, setHasCustomGoal] = useState(false);
  const [customGoal, setCustomGoal] = useState('');
  
  const [showNewWorkoutMenu, setShowNewWorkoutMenu] = useState(false);
  const [pendingWorkoutType, setPendingWorkoutType] = useState<'WORKOUT_IA' | 'WORKOUT_MANUAL' | null>(null);
  const [initialActionForStudent, setInitialActionForStudent] = useState<'WORKOUT_IA' | 'WORKOUT_MANUAL' | undefined>(undefined);

  const toggleGoal = (goalStr: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goalStr)
        ? prev.goals.filter(g => g !== goalStr)
        : [...prev.goals, goalStr]
    }));
  };

  const handleConfirmCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    if (!formData.name || !formData.email) {
       setCreateError('Nome e E-mail são obrigatórios');
       return;
    }
    
    const finalGoals = [...formData.goals];
    if (hasCustomGoal && customGoal.trim()) finalGoals.push(customGoal.trim());
    
    try {
      // Create user auth
      const authUserId = await createUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: 'aluno',
        personalId: user?.id,
        academiaId: user?.academiaId || null,
      }, '123456');

      const newStudent: Student = {
        id: authUserId, // Use the auth user id
        name: formData.name.trim(), age: formData.age, height: formData.height, weight: formData.weight,
        sedentaryLevel: formData.sedentaryLevel, goal: finalGoals.join(', ') || 'Nenhum', level: formData.level,
        restrictions: formData.restrictions, whatsapp: formData.whatsapp, instagram: formData.instagram, email: formData.email.trim(),
        avatarUrl: `https://picsum.photos/200/200?random=${Date.now()}`,
        weeklyPlan: { days: WEEK_DAYS.map(day => ({ dayOfWeek: day, exercises: [], focus: 'A definir' })) },
        meditationChallenges: [{ title: 'Foco Inicial', description: 'Realizar 2 minutos de respiração', completed: false }],
        progress: []
      };
      
      await addStudent(newStudent);
      setSelectedStudentId(newStudent.id);
      setShowCreateModal(false);
    } catch (error: any) {
      setCreateError(error.message || 'Erro ao cadastrar aluno');
    }
  };


  const activeStudent = students.find(s => s.id === selectedStudentId);

  // If a student is selected, show details
  if (selectedStudentId && activeStudent) {
    return <StudentDetails 
       student={activeStudent} 
       allStudents={students} 
       onBack={() => { setSelectedStudentId(null); setInitialActionForStudent(undefined); }} 
       onUpdateStudent={handleUpdateStudent} 
       initialAction={initialActionForStudent}
    />;
  }

  // Views based on location
  const isMeusAlunos = location.pathname === '/meus-alunos';
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.goal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isMeusAlunos) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-20">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-3"><Users className="text-lime-400" size={24} /> Todos os Alunos</h2>
            <button onClick={() => setShowCreateModal(true)} className="hidden sm:flex bg-lime-400 text-slate-900 px-4 py-2 rounded-xl font-black uppercase text-[10px] items-center gap-2 shadow-lg shadow-lime-400/20 active:scale-95 transition-transform hover:bg-lime-500">
              <PlusCircle size={16} /> Cadastrar Aluno
            </button>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input type="text" placeholder="Buscar aluno..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-slate-900 border border-slate-800 text-white pl-12 pr-4 py-3 rounded-2xl outline-none w-full text-sm" />
            </div>
            <button onClick={() => setShowCreateModal(true)} className="sm:hidden bg-lime-400 text-slate-900 p-3 rounded-xl font-black shadow-lg shadow-lime-400/20 active:scale-95 transition-transform">
              <PlusCircle size={20} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map(student => (
             <div key={student.id} onClick={() => setSelectedStudentId(student.id)} className="group bg-[#151f32] p-6 rounded-[2rem] border border-slate-800 hover:border-lime-400/50 transition-all cursor-pointer shadow-lg relative overflow-hidden flex flex-col justify-between">
               <div className="flex items-start gap-4 relative z-10 w-full mb-4">
                  <img src={student.avatarUrl} className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-700 group-hover:border-lime-400 transition-colors shrink-0 shadow-lg shadow-lime-400/5" alt={student.name} />
                  <div className="min-w-0 flex-1 pt-1">
                     <h3 className="font-black text-white text-lg group-hover:text-lime-400 transition-colors truncate">{student.name}</h3>
                     <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[9px] font-black text-slate-300 uppercase tracking-widest truncate">{student.level}</span>
                  </div>
                  <div className="p-2 bg-slate-800/50 rounded-xl text-slate-700 group-hover:text-lime-400 group-hover:bg-lime-400/10 transition-colors shrink-0"><ChevronRight size={20} /></div>
               </div>
               <div className="flex items-center gap-3 pt-4 border-t border-slate-800/50">
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Objetivo Principal</p>
                    <p className="text-xs font-bold text-white truncate mt-0.5">{student.goal}</p>
                  </div>
               </div>
             </div>
          ))}
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 z-[500]">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-lg border border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-widest">Novo Aluno</h2>
                  <p className="text-xs text-slate-400 mt-2 flex items-start gap-1.5 leading-relaxed">
                    <Info size={16} className="shrink-0 mt-0.5 text-lime-400" /> 
                    Preencha os dados básicos. A inteligência artificial usará peso, altura e objetivo para gerar as melhores recomendações.
                  </p>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-white transition-colors bg-slate-800 p-2 rounded-full"><X size={20} /></button>
              </div>
              <form onSubmit={handleConfirmCreate} className="space-y-4">
                {createError && <div className="p-3 mb-4 bg-red-400/10 border border-red-400/50 rounded-xl text-red-400 text-sm">{createError}</div>}
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Nome Completo</label>
                  <input required type="text" placeholder="Ex: João da Silva" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-lime-400/50 transition-colors" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">E-mail</label>
                    <input required type="email" placeholder="aluno@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-lime-400/50 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">WhatsApp</label>
                    <input type="text" placeholder="Ex: (11) 99999-9999" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-lime-400/50 transition-colors" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                   <div>
                     <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Peso (kg)</label>
                     <input type="number" placeholder="Ex: 75" value={formData.weight} onChange={e => setFormData({...formData, weight: parseFloat(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-lime-400/50 transition-colors" />
                   </div>
                   <div>
                     <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Altura (cm)</label>
                     <input type="number" placeholder="Ex: 175" value={formData.height} onChange={e => setFormData({...formData, height: parseInt(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-lime-400/50 transition-colors" />
                   </div>
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-500 uppercase block mb-2">Objetivos (Selecione 1 ou mais)</label>
                   <div className="flex flex-wrap gap-2 mb-2">
                      {GOAL_OPTIONS.map(opt => (
                        <button 
                           key={opt}
                           type="button"
                           onClick={() => toggleGoal(opt)}
                           className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${formData.goals.includes(opt) ? 'bg-lime-400/20 border-lime-400 text-lime-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                        >
                          {opt}
                        </button>
                      ))}
                      <button 
                           type="button"
                           onClick={() => setHasCustomGoal(!hasCustomGoal)}
                           className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${hasCustomGoal ? 'bg-lime-400/20 border-lime-400 text-lime-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                      >
                        Outro objetivo...
                      </button>
                   </div>
                   {hasCustomGoal && (
                     <div className="animate-fade-in mt-2">
                       <input type="text" placeholder="Descreva o outro objetivo" value={customGoal} onChange={e => setCustomGoal(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-lime-400/50 transition-colors text-sm" />
                     </div>
                   )}
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full bg-lime-400 hover:bg-lime-500 py-4 rounded-xl font-black text-slate-900 uppercase tracking-widest text-xs transition-transform active:scale-95">Finalizar Matrícula</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // List students with already registered workouts
  const isTreinos = location.pathname === '/treinos';
  if (isTreinos) {
    const studentsWithWorkouts = students.filter(s => s.weeklyPlan && s.weeklyPlan.days.some(d => d.exercises.length > 0));
    return (
      <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-20">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-3"><Dumbbell className="text-lime-400" size={24} /> Treinos Cadastrados</h2>
          <button onClick={() => setShowNewWorkoutMenu(true)} className="w-full sm:w-auto bg-lime-400 text-slate-900 px-6 py-3 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 shadow-lg shadow-lime-400/20 active:scale-95 transition-transform hover:bg-lime-500">
             <PlusCircle size={18} /> Criar Novo Treino
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {studentsWithWorkouts.map(student => (
             <div key={student.id} onClick={() => setSelectedStudentId(student.id)} className="bg-slate-900/80 p-5 rounded-[2rem] border border-slate-800 hover:border-lime-400/50 transition-colors cursor-pointer group">
               <div className="flex items-center gap-4 mb-4">
                 <img src={student.avatarUrl} className="w-12 h-12 rounded-full border-2 border-slate-700 group-hover:border-lime-400 object-cover" alt={student.name} />
                 <div>
                   <p className="text-sm font-bold text-white group-hover:text-lime-400">{student.name}</p>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{student.weeklyPlan.days.reduce((acc, curr) => acc + curr.exercises.length, 0)} exercícios na semana</p>
                 </div>
               </div>
               <button className="w-full py-2 bg-lime-400/10 text-lime-400 text-xs font-bold uppercase rounded-lg border border-lime-400/20">Acessar Ficha</button>
             </div>
          ))}
        </div>

        {showNewWorkoutMenu && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 z-[500]">
             <div className="bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-lg border border-slate-800 shadow-2xl animate-scale-in flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-start mb-8 shrink-0">
                   <h2 className="text-xl font-black text-white uppercase tracking-widest">Criar Treino</h2>
                   <button onClick={() => { setShowNewWorkoutMenu(false); setPendingWorkoutType(null); }} className="text-slate-500 hover:text-white transition-colors bg-slate-800 p-2 rounded-full"><X size={20} /></button>
                </div>
                {!pendingWorkoutType ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
                     <button onClick={() => setPendingWorkoutType('WORKOUT_IA')} className="bg-[#151f32] border border-lime-400/30 hover:border-lime-400 p-6 rounded-3xl flex flex-col items-center gap-4 transition-all group active:scale-95">
                       <div className="p-4 bg-lime-400/10 rounded-full group-hover:scale-110 transition-transform"><BrainCircuit className="text-lime-400" size={32} /></div>
                       <span className="font-black text-white uppercase text-xs text-center">Criar Treino<br/><span className="text-lime-400">Com IA</span></span>
                     </button>
                     <button onClick={() => setPendingWorkoutType('WORKOUT_MANUAL')} className="bg-[#151f32] border border-slate-700 hover:border-slate-500 p-6 rounded-3xl flex flex-col items-center gap-4 transition-all group active:scale-95">
                       <div className="p-4 bg-slate-800 rounded-full group-hover:scale-110 transition-transform"><Edit2 className="text-white" size={32} /></div>
                       <span className="font-black text-white uppercase text-xs text-center">Criar Treino<br/><span className="text-slate-400">Manual</span></span>
                     </button>
                   </div>
                ) : (
                   <div className="animate-fade-in flex flex-col flex-1 overflow-hidden">
                      <p className="text-xs font-black uppercase text-slate-400 mb-4 tracking-widest shrink-0">
                         Selecione o aluno para o treino {pendingWorkoutType === 'WORKOUT_IA' ? <span className="text-lime-400">com IA</span> : 'Manual'}:
                      </p>
                      <div className="overflow-y-auto space-y-2 pr-2 custom-scrollbar flex-1">
                        {students.map(s => (
                           <button key={s.id} onClick={() => {
                              setSelectedStudentId(s.id);
                              setInitialActionForStudent(pendingWorkoutType);
                              setShowNewWorkoutMenu(false);
                              setPendingWorkoutType(null);
                           }} className="w-full flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors border border-transparent hover:border-slate-700 active:scale-95">
                              <img src={s.avatarUrl} className="w-10 h-10 rounded-lg object-cover" />
                              <span className="font-bold text-white text-sm">{s.name}</span>
                              <ChevronRight size={16} className="ml-auto text-slate-500" />
                           </button>
                        ))}
                        {students.length === 0 && <p className="text-center text-slate-500 text-xs py-4">Nenhum aluno encontrado.</p>}
                      </div>
                   </div>
                )}
             </div>
          </div>
        )}
      </div>
    );
  }

  // Default Dashboard View
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-20">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-[2.5rem] border border-slate-700 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6 w-full md:w-auto">
           <div className="w-20 h-20 rounded-full bg-slate-700 border-2 border-lime-400 p-1 shrink-0">
             <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=200&auto=format&fit=crop" className="w-full h-full bg-slate-600 rounded-full object-cover" alt="Personal" />
           </div>
           <div>
             <span className="text-[10px] font-black text-lime-400 uppercase tracking-widest bg-lime-400/10 px-3 py-1 rounded-md inline-block mb-2">Treinador(a)</span>
             <h1 className="text-2xl sm:text-3xl font-black text-white">{user?.name}</h1>
           </div>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="w-full md:w-auto bg-lime-400 text-slate-900 px-6 py-4 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 shadow-lg shadow-lime-400/20 active:scale-95 transition-transform">
          <PlusCircle size={18} /> Cadastrar Aluno
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Meus Alunos', val: students.length, icon: Users, color: 'blue', onClick: () => navigate('/meus-alunos') },
          { label: 'Treinos Cadastrados', val: students.filter(s => s.weeklyPlan && s.weeklyPlan.days.some(d => d.exercises.length > 0)).length, icon: Activity, color: 'lime', onClick: () => navigate('/treinos') }
        ].map((stat, i) => (
          <div key={i} onClick={stat.onClick} className="bg-[#151f32] p-6 rounded-3xl border border-slate-800 flex flex-col justify-between h-40 cursor-pointer hover:bg-slate-800/60 transition-colors">
             <div className={`bg-${stat.color}-400/10 w-fit p-3 rounded-xl mb-4`}><stat.icon className={`text-${stat.color}-400`} size={24} /></div>
             <div>
               <p className="text-3xl font-black text-white">{stat.val}</p>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{stat.label}</p>
             </div>
          </div>
        ))}
      </div>

      {/* Quantitative & Financial Area - "Minha Turma Atual" */}
      <div className="bg-[#151f32] border border-slate-800 rounded-[2.5rem] p-6 md:p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-orange-400/10 rounded-xl"><TrendingUp className="text-orange-400" size={24} /></div>
          <h2 className="text-lg font-black text-white uppercase tracking-widest">Minha Turma Atual: Finanças & Dados</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
             <div className="p-4 bg-emerald-400/10 rounded-full"><DollarSign size={24} className="text-emerald-400" /></div>
             <div>
               <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Faturamento Mensal</p>
               <p className="text-2xl font-black text-white">R$ 4.250,00</p>
             </div>
           </div>
           
           <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
             <div className="p-4 bg-blue-400/10 rounded-full"><Users size={24} className="text-blue-400" /></div>
             <div>
               <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Matrículas Ativas</p>
               <p className="text-2xl font-black text-white">{students.length} <span className="text-sm font-medium text-slate-500">alunos</span></p>
             </div>
           </div>
           
           <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 flex items-center gap-4">
             <div className="p-4 bg-purple-400/10 rounded-full"><Activity size={24} className="text-purple-400" /></div>
             <div>
               <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Taxa de Retenção</p>
               <p className="text-2xl font-black text-white">92% <span className="text-xs text-lime-400 ml-1">↑ 2%</span></p>
             </div>
           </div>
        </div>
        
        <div className="mt-6 p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
           <p className="text-sm text-slate-400 font-medium">A unidade matriz tem repassado <strong className="text-white">R$ 150,00</strong> médio por aluno. Para aumentar sua participação, adicione mais planos premium com dieta incluída.</p>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 z-[500]">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-lg border border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-widest">Novo Aluno</h2>
                <p className="text-xs text-slate-400 mt-2 flex items-start gap-1.5 leading-relaxed">
                  <Info size={16} className="shrink-0 mt-0.5 text-lime-400" /> 
                  Preencha os dados básicos. A inteligência artificial usará peso, altura e objetivo para gerar as melhores recomendações.
                </p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-white transition-colors bg-slate-800 p-2 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleConfirmCreate} className="space-y-4">
              {createError && <div className="p-3 mb-4 bg-red-400/10 border border-red-400/50 rounded-xl text-red-400 text-sm">{createError}</div>}
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Nome Completo</label>
                <input required type="text" placeholder="Ex: João da Silva" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-lime-400/50 transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">E-mail</label>
                  <input required type="email" placeholder="aluno@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-lime-400/50 transition-colors" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">WhatsApp</label>
                  <input type="text" placeholder="Ex: (11) 99999-9999" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-lime-400/50 transition-colors" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div>
                   <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Peso (kg)</label>
                   <input type="number" placeholder="Ex: 75" value={formData.weight} onChange={e => setFormData({...formData, weight: parseFloat(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-lime-400/50 transition-colors" />
                 </div>
                 <div>
                   <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Altura (cm)</label>
                   <input type="number" placeholder="Ex: 175" value={formData.height} onChange={e => setFormData({...formData, height: parseInt(e.target.value)})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-lime-400/50 transition-colors" />
                 </div>
              </div>
              <div>
                 <label className="text-[10px] font-black text-slate-500 uppercase block mb-2">Objetivos (Selecione 1 ou mais)</label>
                 <div className="flex flex-wrap gap-2 mb-2">
                    {GOAL_OPTIONS.map(opt => (
                      <button 
                         key={opt}
                         type="button"
                         onClick={() => toggleGoal(opt)}
                         className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${formData.goals.includes(opt) ? 'bg-lime-400/20 border-lime-400 text-lime-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                      >
                        {opt}
                      </button>
                    ))}
                    <button 
                         type="button"
                         onClick={() => setHasCustomGoal(!hasCustomGoal)}
                         className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${hasCustomGoal ? 'bg-lime-400/20 border-lime-400 text-lime-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                    >
                      Outro objetivo...
                    </button>
                 </div>
                 {hasCustomGoal && (
                   <div className="animate-fade-in mt-2">
                     <input type="text" placeholder="Descreva o outro objetivo" value={customGoal} onChange={e => setCustomGoal(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-lime-400/50 transition-colors text-sm" />
                   </div>
                 )}
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full bg-lime-400 hover:bg-lime-500 py-4 rounded-xl font-black text-slate-900 uppercase tracking-widest text-xs transition-transform active:scale-95">Finalizar Matrícula</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
