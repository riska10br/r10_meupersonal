import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, Role, User } from '../auth/AuthContext';
import { Users, Building, Activity, PlusCircle, Edit, Key, MoreVertical, Trash2, ShieldAlert, CheckCircle2, History, Dumbbell, Apple, Flower2, Trophy, Wind, ClipboardList, LineChart as LineChartIcon, BrainCircuit, Edit2, Calendar, FileDown, Play, Circle, Save, Send, Pencil, Search, X, Pause } from 'lucide-react';
import { useUsers } from '../hooks/useUsers';
import { useStudents } from '../hooks/useStudents';
import { MOCK_ACADEMIAS, MOCK_PERSONAIS, MOCK_ALUNOS } from '../data/mockData';
import { Student, WeeklyPlan, DayPlan, Exercise, MuscleGroup, ProgressEntry, Measurements, YogaPlan, NutriPlan, YogaPose, SportsPlan, CalisthenicsPlan } from '../types';
import { generateWorkoutPlan, generateYogaPlan, generateProgressInsights, generateMeditationAudio, generateNutriPlan, generateMeditationTips, generateExerciseNote, generateSportsPlan, generateCalisthenicsPlan, generateAssessmentReport } from '../services/geminiService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CALISTHENICS_SKILLS = ['Fundamentos', 'Muscle Up', 'Front Lever', 'Planche', 'Handstand', 'Pistol Squat'];
const SPORTS_LIST = ['Futebol', 'Futsal', 'Vôlei', 'Basquete', 'Corrida', 'Natação', 'Tênis', 'Crossfit'];

type GenerationType = 'WORKOUT' | 'NUTRI' | 'YOGA' | 'MEDITATION' | 'PROGRESS' | 'SPORTS' | 'CALISTHENICS' | 'ASSESSMENT' | 'GENERAL';

interface GenerationState {
  active: boolean;
  message: string;
  subMessage: string;
  type: GenerationType;
}

import { db } from '../auth/firebase';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';

// ... (existing imports, but add those above) ...

export const AdminDashboard = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { users, loading, createUser, updateUserProfile, updateUserPasswordAsAdmin, archiveUserRecord, restoreUserRecord, deleteUserRecord } = useUsers();
  const { students } = useStudents();
  
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState<User | null>(null);

  // Counters calculated directly from users
  const totalAcademias = users.filter(u => u.role === 'adm_academia').length;
  const totalPersonais = users.filter(u => u.role === 'personal').length; 
  const totalAlunos = users.filter(u => u.role === 'aluno').length;
  
  // Archiving and Deleting State
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<User | null>(null);

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('aluno');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Edit User Form State
  const [editUserName, setEditUserName] = useState('');
  const [editUserRole, setEditUserRole] = useState<Role>('aluno');
  const [editUserSenha, setEditUserSenha] = useState('');
  const [editError, setEditError] = useState('');

  // --- Creation Menus State (from StudentDetails) ---
  const [activeTab, setActiveTab] = useState<'WORKOUT' | 'PROGRESS' | 'NUTRI' | 'YOGA' | 'MEDITATION' | 'ASSESSMENT' | 'SPORTS' | 'CALISTHENICS'>('WORKOUT');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [selectedNutriDayIndex, setSelectedNutriDayIndex] = useState<number>(0);
  const [selectedCaliSkill, setSelectedCaliSkill] = useState(CALISTHENICS_SKILLS[0]);
  const [selectedSport, setSelectedSport] = useState(SPORTS_LIST[0]);
  
  // Fake state for generated plans
  const [generatedWorkout, setGeneratedWorkout] = useState<WeeklyPlan | null>(null);
  const [generatedNutri, setGeneratedNutri] = useState<NutriPlan | null>(null);
  const [generatedYoga, setGeneratedYoga] = useState<YogaPlan | null>(null);
  const [generatedSports, setGeneratedSports] = useState<SportsPlan | null>(null);
  const [generatedCalisthenics, setGeneratedCalisthenics] = useState<CalisthenicsPlan | null>(null);
  const [assessmentReport, setAssessmentReport] = useState<string | null>(null);

  const [expandedExerciseIds, setExpandedExerciseIds] = useState<string[]>([]);

  const toggleExerciseExpansion = (id: string) => {
    setExpandedExerciseIds(prev => prev.includes(id) ? prev.filter(eid => eid !== id) : [...prev, id]);
  };

  // Yoga Player States
  const [isYogaSessionActive, setIsYogaSessionActive] = useState(false);
  const [currentYogaPoseIndex, setCurrentYogaPoseIndex] = useState(0);
  const [yogaTimer, setYogaTimer] = useState(60);
  const [isYogaPaused, setIsYogaPaused] = useState(true);

  // IA Generation State
  const [generationState, setGenerationState] = useState<GenerationState>({ active: false, message: '', subMessage: '', type: 'GENERAL' });

  // Modals
  const [showPromptModal, setShowPromptModal] = useState<{ active: boolean, type: GenerationType }>({ active: false, type: 'GENERAL' });
  const [promptInput, setPromptInput] = useState("");
  
  // Send Plan States
  const [showSendModal, setShowSendModal] = useState<{ active: boolean, type: string }>({ active: false, type: '' });
  const [selectedStudentsForSend, setSelectedStudentsForSend] = useState<string[]>([]);
  const [sendSuccess, setSendSuccess] = useState(false);

  const handleWipeDatabase = async () => {
    if (!window.confirm("ATENÇÃO: Deseja realmente APAGAR TODOS OS DADOS do aplicativo (exceto o admin global)? Essa ação não pode ser desfeita.")) {
      return;
    }
    
    startGeneration("System Reset", "Apagando banco de dados...", 'GENERAL');
    
    try {
        const collections = ["students", "routines", "workoutLogs", "assessments", "faturas", "pagamentos", "academias", "personais", "assinaturas"];
        for (const col of collections) {
            const snap = await getDocs(collection(db, col));
            for (const docSnap of snap.docs) {
                await deleteDoc(doc(db, col, docSnap.id));
            }
        }

        const usersSnap = await getDocs(collection(db, "users"));
        for (const userDoc of usersSnap.docs) {
           if (userDoc.data().role !== 'admin') {
              await deleteDoc(doc(db, "users", userDoc.id));
           }
        }
        
        alert("Banco de dados resetado com sucesso!");
    } catch (e: any) {
        alert("Erro ao resetar banco: " + e.message);
    } finally {
        stopGeneration();
    }
  };

  const handleSendPlan = () => {
    // Simulates sending the plan to multiple students
    setSendSuccess(true);
    setTimeout(() => {
      setSendSuccess(false);
      setShowSendModal({ active: false, type: '' });
      setSelectedStudentsForSend([]);
    }, 2000);
  };

  const startGeneration = (message: string, subMessage: string, type: GenerationType) => {
    setGenerationState({ active: true, message, subMessage, type });
  };

  const stopGeneration = () => {
    setGenerationState(prev => ({ ...prev, active: false }));
    setPromptInput("");
  };

  // Timer Logic para Yoga
  useEffect(() => {
    let interval: any;
    if (isYogaSessionActive && !isYogaPaused && yogaTimer > 0) {
      interval = setInterval(() => setYogaTimer(prev => prev - 1), 1000);
    } else if (yogaTimer === 0) {
      if (generatedYoga && currentYogaPoseIndex < generatedYoga.poses.length - 1) {
        setCurrentYogaPoseIndex(prev => prev + 1);
        setYogaTimer(60);
      } else {
        setIsYogaSessionActive(false);
      }
    }
    return () => clearInterval(interval);
  }, [isYogaSessionActive, isYogaPaused, yogaTimer, generatedYoga, currentYogaPoseIndex]);

  // Handlers de IA Unificados
  const handleGenerate = async () => {
    const { type } = showPromptModal;
    setShowPromptModal({ active: false, type: 'GENERAL' });
    
    // Create a dummy student context for the prompts
    const dummyStudent: Student = {
        id: 'global-admin',
        name: 'Aluno Geral',
        age: 30,
        height: 175,
        weight: 70,
        goal: 'Geral',
        level: 'Intermediário',
        sedentaryLevel: 'Levemente Ativo',
        restrictions: '',
        whatsapp: '',
        instagram: '',
        email: '',
        avatarUrl: '',
        progress: [],
        weeklyPlan: { days: [] },
        meditationChallenges: []
    };
    
    if (type === 'WORKOUT') {
      startGeneration("Admin IA", "Construindo periodização global...", 'WORKOUT');
      const plan = await generateWorkoutPlan(dummyStudent, promptInput);
      if (plan) setGeneratedWorkout(plan);
    } else if (type === 'NUTRI') {
      startGeneration("Nutri IA", "Balanceando macros globais...", 'NUTRI');
      const plan = await generateNutriPlan(dummyStudent, promptInput);
      if (plan) setGeneratedNutri(plan);
    } else if (type === 'YOGA') {
      startGeneration("Yoga IA", "Desenhando fluxo zen global...", 'YOGA');
      const plan = await generateYogaPlan(dummyStudent, promptInput, 30);
      if (plan) setGeneratedYoga(plan);
    } else if (type === 'SPORTS') {
      startGeneration("Sport IA", `Treino global para ${selectedSport}...`, 'SPORTS');
      const plan = await generateSportsPlan(dummyStudent, selectedSport, promptInput);
      if (plan) setGeneratedSports(plan);
    } else if (type === 'CALISTHENICS') {
      startGeneration("Cali IA", `Skill global: ${selectedCaliSkill}...`, 'CALISTHENICS');
      const plan = await generateCalisthenicsPlan(dummyStudent, selectedCaliSkill, promptInput);
      if (plan) setGeneratedCalisthenics(plan);
    } else if (type === 'ASSESSMENT') {
      startGeneration("Bio IA", "Gerando avaliação global teórica...", 'ASSESSMENT');
      const report = await generateAssessmentReport(dummyStudent);
      setAssessmentReport(report);
    }
    stopGeneration();
  };

  const balloonStyle = useMemo(() => {
    const styles: Record<string, { gif: string, color: string, border: string }> = {
      WORKOUT: { gif: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f4aa/512.gif', color: 'text-lime-400', border: 'border-lime-400/50' },
      NUTRI: { gif: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f34f/512.gif', color: 'text-emerald-400', border: 'border-emerald-400/50' },
      YOGA: { gif: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f9d8_200d_2640_fe0f/512.gif', color: 'text-purple-400', border: 'border-purple-400/50' },
      SPORTS: { gif: 'https://fonts.gstatic.com/s/e/notoemoji/latest/26bd/512.gif', color: 'text-orange-400', border: 'border-orange-400/50' },
      MEDITATION: { gif: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f9e0/512.gif', color: 'text-sky-400', border: 'border-sky-400/50' },
      CALISTHENICS: { gif: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f938_200d_2642_fe0f/512.gif', color: 'text-yellow-400', border: 'border-yellow-400/50' },
      ASSESSMENT: { gif: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f4cb/512.gif', color: 'text-pink-400', border: 'border-pink-400/50' },
      GENERAL: { gif: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f916/512.gif', color: 'text-slate-400', border: 'border-slate-400/50' }
    };
    return styles[generationState.type] || styles.GENERAL;
  }, [generationState.type]);

  // --- End of Creation Menus State ---

  const handleOpenEdit = (userToEdit: User) => {
    setEditUserName(userToEdit.name);
    setEditUserRole(userToEdit.role);
    setEditUserSenha(userToEdit.senhaAcesso || '');
    setEditError('');
    setShowEdit(userToEdit);
  };

  const handleSaveEdit = async () => {
    if (!showEdit) return;
    setEditError('');
    try {
      const isPasswordChanged = editUserSenha !== showEdit.senhaAcesso;
      
      if (isPasswordChanged && editUserSenha.trim().length >= 6) {
        await updateUserPasswordAsAdmin(
          showEdit.id,
          showEdit.email,
          showEdit.senhaAcesso || '',
          editUserSenha,
          { name: editUserName, role: editUserRole }
        );
      } else {
        await updateUserProfile(showEdit.id, {
          name: editUserName,
          role: editUserRole,
          senhaAcesso: editUserSenha
        });
      }
      setShowEdit(null);
    } catch (e: any) {
      setEditError(e.message || 'Erro ao editar usuário');
      console.error(e);
    }
  };

  const generatePassword = () => {
      const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let pass = "";
      for (let i = 0; i < 8; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
      return pass;
  };

  const handleCreateUser = async () => {
    setCreateError('');
    setIsCreating(true);
    try {
      const password = generatePassword();
      await createUser({
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        role: newUserRole,
      }, password);
      
      setShowCreate(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserRole('aluno');
    } catch (error: any) {
      setCreateError(error.message || 'Erro ao criar usuário');
    } finally {
      setIsCreating(false);
    }
  };

  const [filterMode, setFilterMode] = useState<'ACTIVE' | 'ARCHIVED' | 'ORPHANS'>('ACTIVE');

  // Helper variables for migration from showArchivedTab
  const showArchivedTab = filterMode === 'ARCHIVED';

  const displayedUsers = useMemo(() => {
    return users
      .filter(u => {
        if (filterMode === 'ARCHIVED') return u.isArchived === true;
        if (filterMode === 'ORPHANS') return !u.isArchived && u.role === 'aluno' && !u.academiaId;
        return !u.isArchived;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [users, filterMode]);
  
  const handleArchiveUser = async () => {
     if (showArchiveConfirm) {
        await archiveUserRecord(showArchiveConfirm.id);
        setShowArchiveConfirm(null);
        setOpenActionMenuId(null);
     }
  };

  const handleDeleteUser = async () => {
    if (showDeleteConfirm) {
       await deleteUserRecord(showDeleteConfirm.id);
       setShowDeleteConfirm(null);
       setOpenActionMenuId(null);
    }
  };

  const handleRestoreUser = async (user: User) => {
     await restoreUserRecord(user.id);
  };
  
  const RoleLabel = ({ role }: { role: string }) => {
     let color = "text-slate-400 bg-slate-800";
     let text = role;
     if (role === 'admin') { color = "text-red-400 bg-red-400/10"; text = 'Admin Global'; }
     if (role === 'adm_academia') { color = "text-blue-400 bg-blue-400/10"; text = 'Admin Academia'; }
     if (role === 'personal') { color = "text-lime-400 bg-lime-400/10"; text = 'Personal'; }
     if (role === 'aluno') { color = "text-purple-400 bg-purple-400/10"; text = 'Aluno'; }
     return <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${color}`}>{text}</span>
  };

  if (loading) return <div className="p-8 text-white">Carregando painel...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-20 relative">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#151f32] to-[#0f172a] p-8 rounded-[2rem] border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-lime-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <h2 className="text-sm font-black text-lime-400 uppercase tracking-widest mb-2">Bem-vindo(a) ao Sistema</h2>
          <h1 className="text-3xl font-black text-white mb-4">Olá, {currentUser?.name}!</h1>
          <p className="text-slate-400 max-w-2xl leading-relaxed">
            Aqui você tem o controle total da plataforma. Acompanhe o crescimento das academias, 
            gerencie os perfis de personais e monitore a evolução global dos alunos.
          </p>
        </div>
      </div>

      {/* --- ADDED CREATION MENUS FROM STUDENTDETAILS --- */}
      <div className="bg-[#151f32] p-4 md:p-6 rounded-3xl border border-slate-800 shadow-xl mt-6">
        <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2 mb-4"><BrainCircuit className="text-lime-400" size={20}/> Criação de Planos Globais</h2>
        
        {/* Tab Selector */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 scroll-smooth snap-x">
          {[
            { id: 'WORKOUT', icon: Dumbbell, label: 'Treino', color: 'lime-400' },
            { id: 'NUTRI', icon: Apple, label: 'Dieta', color: 'emerald-400' },
            { id: 'YOGA', icon: Flower2, label: 'Yoga', color: 'purple-400' },
            { id: 'SPORTS', icon: Trophy, label: 'Esportes', color: 'orange-400' },
            { id: 'CALISTHENICS', icon: Activity, label: 'Calistenia', color: 'yellow-400' },
            { id: 'MEDITATION', icon: Wind, label: 'Zen', color: 'sky-400' },
            { id: 'PROGRESS', icon: LineChartIcon, label: 'Evolução', color: 'indigo-400' },
            { id: 'ASSESSMENT', icon: ClipboardList, label: 'Avaliação', color: 'pink-400' },
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id as any)} 
              className={`snap-start flex items-center gap-2 px-4 py-3 rounded-xl font-black text-[10px] uppercase transition-all whitespace-nowrap border ${activeTab === tab.id ? `bg-slate-800 border-${tab.color}/50 text-${tab.color} shadow-lg` : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'}`}
            >
              <tab.icon size={16} />{tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Rendering */}
        <div className="mt-6">
          {/* TREINO */}
          {activeTab === 'WORKOUT' && (
            <div className="animate-fade-in space-y-6">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button onClick={() => setShowPromptModal({active: true, type: 'WORKOUT'})} className="bg-lime-400 text-slate-900 p-4 rounded-2xl font-black flex flex-col items-center gap-2 transition-transform active:scale-95 hover:bg-lime-500"><BrainCircuit size={20} /><span className="text-[9px] uppercase">IA Treino</span></button>
                  <button className="bg-slate-800 border border-slate-700 p-4 rounded-2xl text-white font-black flex flex-col items-center gap-2 hover:bg-slate-700 transition-colors"><Edit2 size={18} /><span className="text-[9px] uppercase">Manual</span></button>
                  <button className="bg-slate-800 border border-slate-700 p-4 rounded-2xl text-slate-400 font-black flex flex-col items-center gap-2 hover:bg-slate-700 transition-colors"><Calendar size={18} /><span className="text-[9px] uppercase">Agenda</span></button>
                  <button className="bg-slate-800 border border-slate-700 p-4 rounded-2xl text-blue-400 font-black flex flex-col items-center gap-2 hover:bg-slate-700 transition-colors"><FileDown size={18} /><span className="text-[9px] uppercase">PDF</span></button>
               </div>
               {generatedWorkout?.days?.map((day, dIdx) => (
                  <div key={dIdx} className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
                     <h3 className="text-xs font-black text-white uppercase mb-4">{day.dayOfWeek} - {day.focus}</h3>
                     {day.exercises.length > 0 ? day.exercises.map(ex => (
                       <div key={ex.id} className="bg-slate-800/40 rounded-xl border border-slate-800 mb-2 overflow-hidden transition-colors hover:border-slate-700">
                          <div 
                             className="p-4 flex justify-between items-center cursor-pointer" 
                             onClick={() => toggleExerciseExpansion(ex.id)}
                          >
                             <div>
                                <h4 className="text-white font-bold text-xs hover:text-lime-400 transition-colors">{ex.name}</h4>
                                <p className="text-[9px] text-slate-500 uppercase">{ex.muscleGroup} • {ex.sets}x{ex.reps}</p>
                             </div>
                             <div className="flex gap-2">
                               <a 
                                 href={`https://www.google.com/search?q=${encodeURIComponent('Como executar o exercício ' + ex.name)}`} 
                                 target="_blank" 
                                 rel="noopener noreferrer" 
                                 className="p-2 bg-slate-900 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                                 onClick={(e) => e.stopPropagation()}
                               >
                                 <Search size={14} />
                               </a>
                               {ex.videoUrl && (
                                 <a 
                                   href={ex.videoUrl} 
                                   target="_blank" 
                                   rel="noopener noreferrer" 
                                   className="p-2 bg-slate-900 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                                   onClick={(e) => e.stopPropagation()}
                                 >
                                   <Play size={14} />
                                 </a>
                               )}
                             </div>
                          </div>
                          {expandedExerciseIds.includes(ex.id) && (
                             <div className="px-4 pb-4 animate-fade-in">
                                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                                  <h5 className="text-[10px] font-black text-lime-400 uppercase tracking-widest mb-1">Instruções de Execução</h5>
                                  <p className="text-xs text-slate-300 leading-relaxed">
                                    {ex.notes || 'Siga as instruções padrão para este exercício. Mantenha a postura correta e contraia a musculatura alvo durante o movimento. Caso tenha dúvidas, consulte a demonstração em vídeo ou realize uma pesquisa rápida.'}
                                  </p>
                                </div>
                             </div>
                          )}
                       </div>
                     )) : <p className="text-slate-600 text-[10px] italic">Nenhum exercício prescrito.</p>}
                  </div>
               ))}
               {generatedWorkout && (
                 <button onClick={() => setShowSendModal({ active: true, type: 'Treino Global' })} className="w-full bg-blue-500 hover:bg-blue-600 transition-colors text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex justify-center items-center gap-2 mt-6 shadow-lg shadow-blue-500/20"><Send size={18} /> Enviar plano para Aluno(s)</button>
               )}
            </div>
          )}

          {/* DIETA */}
          {activeTab === 'NUTRI' && (
            <div className="animate-fade-in space-y-6">
               <button onClick={() => setShowPromptModal({active: true, type: 'NUTRI'})} className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 p-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-transform active:scale-95"><Apple size={20} />Gerar Dieta IA</button>
               {generatedNutri ? (
                 <div className="space-y-6">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar snap-x pb-2">
                      {generatedNutri.weeklyMeals.map((day, idx) => (
                        <button key={idx} onClick={() => setSelectedNutriDayIndex(idx)} className={`snap-start px-6 py-3 rounded-2xl border shrink-0 transition-colors ${selectedNutriDayIndex === idx ? 'bg-emerald-500 border-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'}`}>
                          <span className="text-[10px] font-black uppercase whitespace-nowrap">{day.dayOfWeek}</span>
                        </button>
                      ))}
                    </div>
                    <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
                       <h3 className="text-xs font-black text-white uppercase mb-4">Cardápio Diário</h3>
                       {generatedNutri.weeklyMeals[selectedNutriDayIndex]?.meals.map((meal, mIdx) => (
                         <div key={mIdx} className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 mb-2">
                            <div className="flex justify-between items-center mb-1">
                               <span className="text-[10px] font-black text-emerald-400">{meal.time}</span>
                               <span className="text-[9px] font-black text-white uppercase">{meal.label}</span>
                            </div>
                            <p className="text-[11px] text-slate-400">{meal.description}</p>
                         </div>
                       ))}
                    </div>
                    <button onClick={() => setShowSendModal({ active: true, type: 'Dieta Global' })} className="w-full bg-blue-500 hover:bg-blue-600 transition-colors text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex justify-center items-center gap-2 mt-6 shadow-lg shadow-blue-500/20"><Send size={18} /> Enviar dieta para Aluno(s)</button>
                 </div>
               ) : <div className="text-center py-20 text-slate-600 italic text-sm">Nenhum plano nutricional gerado.</div>}
            </div>
          )}

          {/* YOGA */}
          {activeTab === 'YOGA' && (
            <div className="animate-fade-in space-y-6">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 <button onClick={() => setShowPromptModal({active: true, type: 'YOGA'})} className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-transform active:scale-95"><Flower2 size={20} />Gerar Fluxo IA</button>
                 {generatedYoga && <button onClick={() => { setIsYogaSessionActive(true); setIsYogaPaused(false); setCurrentYogaPoseIndex(0); setYogaTimer(60); }} className="bg-slate-800 hover:bg-slate-700 border border-purple-500/30 text-purple-400 p-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-colors"><Play size={20} />Iniciar Prática</button>}
               </div>
               {generatedYoga ? (
                 <div className="space-y-4">
                    {generatedYoga.poses.map((pose, idx) => (
                      <div key={idx} className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800">
                         <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-black text-white">{pose.name}</h4>
                            <span className="text-[9px] font-bold text-purple-400">{pose.duration}</span>
                         </div>
                         <p className="text-[11px] text-slate-400 leading-relaxed">{pose.description}</p>
                         <p className="text-[10px] text-purple-300 italic mt-2">✨ {pose.benefits}</p>
                      </div>
                    ))}
                    <button onClick={() => setShowSendModal({ active: true, type: 'Fluxo Yoga Global' })} className="w-full bg-blue-500 hover:bg-blue-600 transition-colors text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex justify-center items-center gap-2 mt-6 shadow-lg shadow-blue-500/20"><Send size={18} /> Enviar fluxo para Aluno(s)</button>
                 </div>
               ) : <div className="text-center py-20 text-slate-600 italic text-sm">Nenhuma rotina de Yoga definida.</div>}
            </div>
          )}

          {/* ESPORTES */}
          {activeTab === 'SPORTS' && (
             <div className="animate-fade-in space-y-6">
                <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-orange-500/20">
                   <h2 className="text-lg font-black text-white mb-4 uppercase">Drills Atléticos Globais</h2>
                   <div className="grid grid-cols-1 gap-3">
                      <select value={selectedSport} onChange={e => setSelectedSport(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl font-bold text-xs appearance-none">
                         {SPORTS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button onClick={() => setShowPromptModal({active: true, type: 'SPORTS'})} className="bg-orange-500 hover:bg-orange-600 text-slate-950 py-3 rounded-xl font-black text-[10px] uppercase transition-transform active:scale-95">Gerar Treino IA</button>
                   </div>
                </div>
                {generatedSports && (
                  <div className="space-y-4">
                    {generatedSports.weeklySchedule.map((day, idx) => (
                       <div key={idx} className="bg-slate-900/50 p-5 rounded-3xl border border-slate-800">
                          <h3 className="text-xs font-black text-orange-400 uppercase mb-4">{day.day} - {day.focus}</h3>
                          {day.drills.map((drill, dIdx) => (
                             <div key={dIdx} className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 mb-2">
                                <div className="flex justify-between items-center mb-1">
                                   <h4 className="text-[12px] font-black text-white">{drill.name}</h4>
                                   <span className="text-[9px] text-slate-500">{drill.duration}</span>
                                </div>
                                <p className="text-[10px] text-slate-400">{drill.description}</p>
                             </div>
                          ))}
                       </div>
                    ))}
                    <button onClick={() => setShowSendModal({ active: true, type: 'Treino Esportivo Global' })} className="w-full bg-blue-500 hover:bg-blue-600 transition-colors text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex justify-center items-center gap-2 mt-6 shadow-lg shadow-blue-500/20"><Send size={18} /> Enviar plano para Aluno(s)</button>
                  </div>
                )}
             </div>
          )}

          {/* CALISTENIA */}
          {activeTab === 'CALISTHENICS' && (
             <div className="animate-fade-in space-y-6">
                <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-yellow-500/20">
                   <h2 className="text-lg font-black text-white mb-4 uppercase">Bodyweight Skills Globais</h2>
                   <div className="grid grid-cols-1 gap-3">
                      <select value={selectedCaliSkill} onChange={e => setSelectedCaliSkill(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl font-bold text-xs appearance-none">
                         {CALISTHENICS_SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button onClick={() => setShowPromptModal({active: true, type: 'CALISTHENICS'})} className="bg-yellow-400 hover:bg-yellow-500 text-slate-950 py-3 rounded-xl font-black text-[10px] uppercase transition-transform active:scale-95">Planejar Skill IA</button>
                   </div>
                </div>
                {generatedCalisthenics && (
                  <div className="space-y-4">
                    {generatedCalisthenics.routine.map((day, idx) => (
                       <div key={idx} className="bg-slate-900/50 p-5 rounded-3xl border border-slate-800">
                          <h3 className="text-xs font-black text-yellow-400 uppercase mb-4">{day.day}</h3>
                          {day.exercises.map((ex, eIdx) => (
                             <div key={eIdx} className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 mb-2">
                                <div className="flex justify-between items-center mb-1">
                                   <h4 className="text-[12px] font-black text-white">{ex.name}</h4>
                                   <span className="text-[11px] font-black text-white">{ex.sets}x{ex.reps}</span>
                                </div>
                                <p className="text-[9px] text-yellow-500 font-bold uppercase">Progressão: {ex.progression}</p>
                             </div>
                          ))}
                       </div>
                    ))}
                    <button onClick={() => setShowSendModal({ active: true, type: 'Treino Calistenia Global' })} className="w-full bg-blue-500 hover:bg-blue-600 transition-colors text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex justify-center items-center gap-2 mt-6 shadow-lg shadow-blue-500/20"><Send size={18} /> Enviar plano para Aluno(s)</button>
                  </div>
                )}
             </div>
          )}

          {/* ZEN / MEDITAÇÃO */}
          {activeTab === 'MEDITATION' && (
             <div className="animate-fade-in space-y-6">
                <div className="bg-gradient-to-br from-sky-900/20 to-slate-900 p-8 rounded-[2rem] border border-sky-500/20 text-center">
                   <Wind size={40} className="mx-auto text-sky-400 mb-4" />
                   <h2 className="text-xl font-black text-white mb-2 uppercase">Recuperação Mental Global</h2>
                   <p className="text-slate-500 text-[11px] mb-8">Áudios guiados e meditações predefinidas.</p>
                   <div className="grid grid-cols-2 gap-3">
                      <button className="bg-slate-800 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-slate-700 transition-colors"><Play size={20} className="text-sky-400" /><span className="text-[9px] uppercase font-black">Foco Ativo</span></button>
                      <button className="bg-slate-800 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-slate-700 transition-colors"><Play size={20} className="text-sky-400" /><span className="text-[9px] uppercase font-black">Relax Profundo</span></button>
                   </div>
                </div>
             </div>
          )}

          {/* EVOLUÇÃO E AVALIAÇÃO - Globais (Apenas placeholders ou não faz sentido enviar) */}
          {(activeTab === 'PROGRESS' || activeTab === 'ASSESSMENT') && (
            <div className="text-center py-20 text-slate-600 italic text-sm border-2 border-dashed border-slate-700 rounded-3xl mt-4">
                Esta área é individual por aluno. Visite o perfil de um aluno específico no acesso 'Personal' para conferir sua evolução e avaliação técnica.
            </div>
          )}
        </div>
      </div>
      {/* --- END ADDED CREATION MENUS --- */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div onClick={() => navigate('/academias')} className="bg-[#151f32] p-6 rounded-3xl border border-slate-800 flex flex-col justify-between h-40 cursor-pointer hover:border-blue-400/50 hover:bg-slate-800/80 transition-all">
          <div className="bg-blue-400/10 w-fit p-3 rounded-xl"><Building className="text-blue-400" /></div>
          <div>
            <p className="text-3xl font-black text-white">{totalAcademias > 0 ? totalAcademias : "..."}</p>
            <p className="text-xs font-bold text-slate-500 uppercase">Academias Cadastradas</p>
          </div>
        </div>
        <div onClick={() => navigate('/personals')} className="bg-[#151f32] p-6 rounded-3xl border border-slate-800 flex flex-col justify-between h-40 cursor-pointer hover:border-lime-400/50 hover:bg-slate-800/80 transition-all">
          <div className="bg-lime-400/10 w-fit p-3 rounded-xl"><Activity className="text-lime-400" /></div>
          <div>
            <p className="text-3xl font-black text-white">{totalPersonais > 0 ? totalPersonais : "..."}</p>
            <p className="text-xs font-bold text-slate-500 uppercase">Personais Registrados</p>
          </div>
        </div>
        <div onClick={() => navigate('/alunos')} className="bg-[#151f32] p-6 rounded-3xl border border-slate-800 flex flex-col justify-between h-40 cursor-pointer hover:border-purple-400/50 hover:bg-slate-800/80 transition-all">
          <div className="bg-purple-400/10 w-fit p-3 rounded-xl"><Users className="text-purple-400" /></div>
          <div>
            <p className="text-3xl font-black text-white">{totalAlunos > 0 ? totalAlunos : "..."}</p>
            <p className="text-xs font-bold text-slate-500 uppercase">Alunos Vinculados ou não</p>
          </div>
        </div>
      </div>

      {currentUser?.role === 'admin' && (
        <div className="bg-[#151f32] border border-slate-800 rounded-3xl p-6 overflow-hidden mt-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
             <h2 className="text-lg font-black text-white uppercase flex items-center gap-2"><Key className="text-lime-400" size={20}/> Lista de Acessos</h2>
             
             <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 overflow-x-auto">
               <button 
                  onClick={() => { setFilterMode('ACTIVE'); setOpenActionMenuId(null); }}
                  className={`px-4 py-2 text-xs font-black uppercase rounded-lg transition-colors whitespace-nowrap ${filterMode === 'ACTIVE' ? 'bg-lime-400 text-slate-900' : 'text-slate-500 hover:text-white'}`}
               >
                  Acessos Ativos
               </button>
               <button 
                  onClick={() => { setFilterMode('ORPHANS'); setOpenActionMenuId(null); }}
                  className={`px-4 py-2 text-xs font-black uppercase rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${filterMode === 'ORPHANS' ? 'bg-orange-500 text-white' : 'text-slate-500 hover:text-white'}`}
               >
                  Alunos S/ Vínculo
               </button>
               <button 
                  onClick={() => { setFilterMode('ARCHIVED'); setOpenActionMenuId(null); }}
                  className={`px-4 py-2 text-xs font-black uppercase rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${filterMode === 'ARCHIVED' ? 'bg-red-500 text-white' : 'text-slate-500 hover:text-white'}`}
               >
                  <History size={14} /> Backups Excluídos
               </button>
             </div>
          </div>
  
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="pb-3 text-xs font-black text-slate-500 uppercase">Nome</th>
                  <th className="pb-3 text-xs font-black text-slate-500 uppercase">Tipo</th>
                  <th className="pb-3 text-xs font-black text-slate-500 uppercase">Login (Email)</th>
                  <th className="pb-3 text-xs font-black text-slate-500 uppercase">Senha</th>
                  <th className="pb-3 text-xs font-black text-slate-500 uppercase text-center w-24">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {displayedUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="py-4">
                       <p className="font-bold text-white text-sm">{u.name}</p>
                       {u.isArchived && <span className="text-[10px] text-red-400 uppercase font-black bg-red-400/10 px-2 py-0.5 rounded-md mt-1 inline-block">Backup Excluído</span>}
                    </td>
                    <td className="py-4">
                       <RoleLabel role={u.role} />
                    </td>
                    <td className="py-4 text-sm text-slate-300">
                       {u.email}
                    </td>
                    <td className="py-4 text-sm text-slate-400 font-mono">
                       {u.senhaAcesso || '******'}
                    </td>
                    <td className="py-4 text-center relative">
                       <div className="flex justify-center gap-2">
                          {!u.isArchived && (
                            <>
                              <button onClick={() => handleOpenEdit(u)} className="p-2 text-slate-500 hover:text-lime-400 bg-slate-800 rounded-lg transition-colors" title="Editar">
                                <Edit size={16} />
                              </button>
                              <button onClick={() => setShowArchiveConfirm(u)} className="p-2 text-slate-500 hover:text-red-400 bg-slate-800 rounded-lg transition-colors" title="Excluir Acesso (Salvar Backup)">
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                          {u.isArchived && (
                            <>
                              <button onClick={() => handleRestoreUser(u)} className="p-2 text-slate-500 hover:text-lime-400 bg-slate-800 rounded-lg transition-colors" title="Restaurar Acesso do Backup">
                                <CheckCircle2 size={16} />
                              </button>
                              <button onClick={() => setShowDeleteConfirm(u)} className="p-2 text-slate-500 hover:text-red-500 bg-slate-800 rounded-lg transition-colors" title="Exclusão Geral Permanente">
                                <ShieldAlert size={16} />
                              </button>
                            </>
                          )}
                       </div>
                    </td>
                  </tr>
                ))}
                {displayedUsers.length === 0 && (
                  <tr>
                     <td colSpan={5} className="py-8 text-center text-slate-500 text-sm">
                        {showArchivedTab ? "Nenhum backup de acesso excluído encontrado." : "Nenhum usuário ativo encontrado."}
                     </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCreate && (
         <div className="fixed inset-0 bg-black/90 flex justify-center items-center p-4 z-50 animate-fade-in">
           <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-md">
             <h2 className="text-xl font-black text-white mb-6 uppercase">Cadastrar Novo Usuário</h2>
             
             {createError && (
               <div className="mb-4 p-3 bg-red-400/10 border border-red-400 rounded-xl text-red-400 text-sm">
                 {createError}
               </div>
             )}

             <input 
               value={newUserName}
               onChange={e => setNewUserName(e.target.value)}
               className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white outline-none mb-4 focus:border-lime-400 transition-colors" 
               placeholder="Nome Completo" 
             />
             <input 
               type="email"
               value={newUserEmail}
               onChange={e => setNewUserEmail(e.target.value)}
               className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white outline-none mb-4 focus:border-lime-400 transition-colors" 
               placeholder="E-mail de Acesso" 
             />
             <select 
               value={newUserRole}
               onChange={e => setNewUserRole(e.target.value as Role)}
               className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white outline-none mb-6 focus:border-lime-400 transition-colors"
             >
                <option value="aluno">Aluno</option>
                <option value="personal">Personal</option>
                <option value="adm_academia">ADM Academia</option>
                <option value="admin">Admin Global</option>
             </select>
             <div className="flex gap-4">
               <button onClick={() => setShowCreate(false)} className="flex-1 py-3 text-slate-400 hover:text-white font-bold uppercase text-xs border border-slate-700 rounded-xl transition-colors">Cancelar</button>
               <button 
                 onClick={handleCreateUser} 
                 disabled={isCreating || !newUserName || !newUserEmail}
                 className="flex-1 py-3 bg-lime-400 text-slate-900 font-black uppercase text-xs rounded-xl shadow-lg shadow-lime-400/20 hover:bg-lime-500 disabled:opacity-50 transition-colors"
               >
                 {isCreating ? 'Criando...' : 'Gerar Senha e Criar'}
               </button>
             </div>
           </div>
         </div>
      )}

      {showEdit && (
         <div className="fixed inset-0 bg-black/90 flex justify-center items-center p-4 z-50 animate-fade-in">
           <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-md">
             <h2 className="text-xl font-black text-white mb-6 uppercase">Editar Usuário</h2>
             
             {editError && (
               <div className="mb-4 p-3 bg-red-400/10 border border-red-400 rounded-xl text-red-400 text-sm">
                 {editError}
               </div>
             )}

             <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Nome Completo</label>
             <input 
               value={editUserName}
               onChange={e => setEditUserName(e.target.value)}
               className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white outline-none mb-4 focus:border-lime-400 transition-colors" 
             />
             
             <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Tipo de Perfil</label>
             <select 
               value={editUserRole}
               onChange={e => setEditUserRole(e.target.value as Role)}
               className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white outline-none mb-4 focus:border-lime-400 transition-colors"
             >
                <option value="aluno">Aluno</option>
                <option value="personal">Personal</option>
                <option value="adm_academia">ADM Academia</option>
                <option value="admin">Admin Global</option>
             </select>

             <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Senha Registrada</label>
             <input 
               value={editUserSenha}
               onChange={e => setEditUserSenha(e.target.value)}
               className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white outline-none mb-6 focus:border-lime-400 transition-colors" 
             />

             <div className="flex gap-4">
               <button onClick={() => setShowEdit(null)} className="flex-1 py-3 text-slate-400 hover:text-white font-bold uppercase text-xs border border-slate-700 rounded-xl transition-colors">Cancelar</button>
               <button 
                 onClick={handleSaveEdit} 
                 disabled={!editUserName}
                 className="flex-1 py-3 bg-lime-400 text-slate-900 font-black uppercase text-xs rounded-xl shadow-lg shadow-lime-400/20 hover:bg-lime-500 disabled:opacity-50 transition-colors"
               >
                 Salvar
               </button>
             </div>
           </div>
         </div>
      )}

      {showArchiveConfirm && (
         <div className="fixed inset-0 bg-black/90 flex justify-center items-center p-4 z-50 animate-fade-in">
           <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-md text-center">
             <div className="w-16 h-16 bg-red-400/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-400">
               <Trash2 size={32} />
             </div>
             <h2 className="text-xl font-black text-white mb-2 uppercase">Excluir Acesso?</h2>
             <p className="text-slate-400 mb-6 text-sm">
               Deseja realmente excluir o cadastro de <strong>{showArchiveConfirm.name}</strong>?
               <br/><br/>
               <span className="text-red-400 font-bold">Aviso:</span> O usuário perderá todo o acesso ao sistema. O banco de dados relativo ao acesso será salvo como backup.
             </p>
             <div className="flex gap-4">
               <button onClick={() => setShowArchiveConfirm(null)} className="flex-1 py-3 text-slate-400 hover:text-white font-bold uppercase text-xs border border-slate-700 rounded-xl transition-colors">Cancelar</button>
               <button onClick={handleArchiveUser} className="flex-1 py-3 bg-red-500 text-white font-black uppercase text-xs rounded-xl shadow-lg shadow-red-500/20 hover:bg-red-600 transition-colors">Sim, Excluir</button>
             </div>
           </div>
         </div>
      )}

      {showDeleteConfirm && (
         <div className="fixed inset-0 bg-black/90 flex justify-center items-center p-4 z-50 animate-fade-in">
           <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-md text-center border-red-500/50">
             <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 animate-pulse">
               <ShieldAlert size={32} />
             </div>
             <h2 className="text-xl font-black text-white mb-2 uppercase text-red-500">Exclusão Permanente!</h2>
             <p className="text-slate-400 mb-6 text-sm">
               Você está prestes a deletar <strong className="text-white">{showDeleteConfirm.name}</strong> e <strong>todo o seu histórico</strong> permanentemente. 
               <br/><br/>
               Essa ação <strong className="text-red-400">NÃO PODE SER DESFEITA</strong>.
             </p>
             <div className="flex gap-4">
               <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-3 text-slate-400 hover:text-white font-bold uppercase text-xs border border-slate-700 rounded-xl transition-colors">Cancelar</button>
               <button onClick={handleDeleteUser} className="flex-1 py-3 bg-red-600 text-white font-black uppercase text-xs rounded-xl shadow-lg shadow-red-600/20 hover:bg-red-700 transition-colors">DELETAR TUDO</button>
             </div>
           </div>
         </div>
      )}

      {/* GLOBAL PROMPT MODAL */}
      {showPromptModal.active && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 z-[1100]">
          <div className="bg-slate-900 rounded-[2rem] p-8 w-full max-w-sm border border-slate-800 animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">Refinar com IA</h2>
              <button onClick={() => setShowPromptModal({active: false, type: 'GENERAL'})} className="text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
            </div>
            <textarea 
              value={promptInput} onChange={(e) => setPromptInput(e.target.value)} 
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-white text-[13px] outline-none min-h-[120px] mb-6 focus:border-lime-400/50 transition-colors" 
              placeholder="Ex: Criar treino de força para iniciantes" 
            />
            <button onClick={handleGenerate} className="w-full bg-lime-400 hover:bg-lime-500 transition-colors py-4 rounded-2xl font-black text-slate-900 uppercase tracking-widest text-xs">Processar Solicitação</button>
          </div>
        </div>
      )}

      {/* Painel de Configuração Block moved to the bottom */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-[2rem] border border-slate-700 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-10">
        <div>
          <h2 className="text-2xl font-black text-white mb-2">Painel de <span className="text-lime-400">Configuração</span></h2>
          <p className="text-slate-400">Gestão global de acessos avançados.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          {currentUser?.role === 'admin' && (
            <>
              <button onClick={handleWipeDatabase} className="w-full md:w-auto bg-red-500/10 border border-red-500/50 text-red-500 px-6 py-3 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-colors">
                <Trash2 size={18} /> Resetar Base
              </button>
              <button onClick={() => setShowCreate(true)} className="w-full md:w-auto bg-lime-400 text-slate-900 px-6 py-3 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 shadow-lg shadow-lime-400/20 hover:bg-lime-500 transition-colors">
                <PlusCircle size={18} /> Novo Acesso
              </button>
            </>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {generationState.active && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1200] flex items-center justify-center p-4">
          <div className={`bg-slate-900 border-2 ${balloonStyle.border} p-8 rounded-[2rem] shadow-2xl flex flex-col items-center gap-6 text-center animate-scale-in`}>
            <div className="w-24 h-24 md:w-32 md:h-32">
              <img src={balloonStyle.gif} alt="AI is working" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
            </div>
            <h3 className="font-black text-xl uppercase text-white animate-pulse">{generationState.message}</h3>
            <p className={`text-xs font-bold uppercase ${balloonStyle.color} animate-pulse`}>{generationState.subMessage}</p>
          </div>
        </div>
      )}

      {/* Yoga Active Session Overlay */}
      {isYogaSessionActive && generatedYoga && (
        <div className="fixed inset-0 bg-slate-950 z-[1000] flex flex-col p-6 animate-fade-in">
           <div className="flex justify-between items-center mb-10">
              <button onClick={() => setIsYogaSessionActive(false)} className="p-3 bg-slate-900 rounded-2xl text-slate-400"><X size={24} /></button>
              <div className="text-center">
                 <p className="text-[10px] font-black text-purple-400 uppercase">Sessão: {generatedYoga.name}</p>
                 <p className="text-white font-black text-sm">Pose {currentYogaPoseIndex + 1} de {generatedYoga.poses.length}</p>
              </div>
              <div className="w-12 h-12"></div>
           </div>
           <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
              <div className="relative">
                 <div className="w-48 h-48 rounded-full border-4 border-purple-500/20 flex items-center justify-center">
                    <span className="text-7xl font-black text-white">{yogaTimer}</span>
                 </div>
              </div>
              <div>
                 <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">{generatedYoga.poses[currentYogaPoseIndex].name}</h2>
                 <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">{generatedYoga.poses[currentYogaPoseIndex].description}</p>
              </div>
           </div>
           <div className="flex justify-center gap-6 pb-10">
              <button onClick={() => setIsYogaPaused(!isYogaPaused)} className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center text-slate-950 shadow-xl">
                 {isYogaPaused ? <Play size={32} fill="currentColor" /> : <Pause size={32} fill="currentColor" />}
              </button>
           </div>
        </div>
      )}

      {/* SEND MODAL */}
      {showSendModal.active && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 z-[1100]">
          <div className="bg-slate-900 rounded-[2rem] p-8 w-full max-w-md border border-slate-800 animate-scale-in shadow-2xl flex flex-col max-h-[90vh]">
            {sendSuccess ? (
              <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in">
                <div className="w-20 h-20 bg-lime-400/20 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 size={40} className="text-lime-400" />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Enviado!</h3>
                <p className="text-sm text-slate-400">O plano foi distribuído para os alunos selecionados.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6 shrink-0">
                  <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Send size={20} className="text-blue-400" /> Enviar {showSendModal.type}
                  </h2>
                  <button onClick={() => { setShowSendModal({ active: false, type: '' }); setSelectedStudentsForSend([]); }} className="text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
                </div>
                
                <p className="text-sm text-slate-400 mb-4 shrink-0">Selecione os alunos (ou todos) que receberão este plano:</p>
                
                <div className="bg-slate-800/50 rounded-2xl border border-slate-800 overflow-y-auto flex-1 p-2 space-y-1 mb-6">
                  {students && students.map(s => {
                    const isSelected = selectedStudentsForSend.includes(s.id);
                    return (
                      <label key={s.id} className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-xl cursor-pointer transition-colors group"
                             onClick={(e) => {
                               e.preventDefault();
                               if (isSelected) {
                                  setSelectedStudentsForSend(prev => prev.filter(id => id !== s.id));
                               } else {
                                  setSelectedStudentsForSend(prev => [...prev, s.id]);
                               }
                             }}
                      >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-500 border-blue-500' : 'bg-slate-900 border-slate-600 group-hover:border-slate-400'}`}>
                          {isSelected && <CheckCircle2 size={12} className="text-white" />}
                        </div>
                        <img src={s.avatarUrl} className="w-8 h-8 rounded-full border border-slate-700 block bg-slate-700" alt={s.name} />
                        <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors flex-1">{s.name}</span>
                      </label>
                    );
                  })}
                  {(!students || students.length === 0) && (
                    <p className="text-center text-slate-500 text-xs py-4">Nenhum aluno encontrado no sistema.</p>
                  )}
                </div>

                <button 
                   onClick={() => {
                     if(selectedStudentsForSend.length > 0) handleSendPlan();
                   }} 
                   disabled={selectedStudentsForSend.length === 0}
                   className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs flex justify-center items-center gap-2 transition-all mt-auto shrink-0 ${selectedStudentsForSend.length > 0 ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20 active:scale-95' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>
                  Enviar para {selectedStudentsForSend.length} aluno(s)
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
