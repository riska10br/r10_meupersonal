
import React, { useState, useEffect, useMemo } from 'react';
import { Student, WeeklyPlan, DayPlan, Exercise, MuscleGroup, ProgressEntry, Measurements, YogaPlan, NutriPlan, YogaPose, SportsPlan, CalisthenicsPlan } from '../types';
import { generateWorkoutPlan, generateYogaPlan, generateProgressInsights, generateMeditationAudio, generateNutriPlan, generateMeditationTips, generateExerciseNote, generateSportsPlan, generateCalisthenicsPlan, generateAssessmentReport } from '../services/geminiService';
import { 
  ArrowLeft, BrainCircuit, Plus, Dumbbell, Video, 
  LineChart as LineChartIcon, Calendar, Scale, ChevronRight, X, 
  Apple, Utensils, ShoppingCart, Activity, Clock, Edit2, 
  Sparkles, Flower2, Wind, Play, Pause, RotateCcw, CheckCircle2, Circle, Volume2, Flame, Search, User, Brain, Wand2, Download, FileText, Wand, History, TrendingUp, ChevronDown, Eye, Pencil, AlertTriangle, FileDown, Trophy, Medal, ClipboardList, Save, Send
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StudentDetailsProps {
  student: Student;
  allStudents?: Student[];
  onBack: () => void;
  onUpdateStudent: (updatedStudent: Student) => void;
  initialAction?: 'WORKOUT_IA' | 'WORKOUT_MANUAL';
}

const MEASUREMENT_LABELS: Record<string, string> = {
  chest: 'Peitoral', waist: 'Cintura', hips: 'Quadril', bicepsR: 'Bíceps (D)', bicepsL: 'Bíceps (E)',
  thighR: 'Coxa (D)', thighL: 'Coxa (E)', calf: 'Panturrilha', neck: 'Pescoço', forearm: 'Antebraço'
};

const CALISTHENICS_SKILLS = ['Fundamentos', 'Muscle Up', 'Front Lever', 'Planche', 'Handstand', 'Pistol Squat'];
const SPORTS_LIST = ['Futebol', 'Futsal', 'Vôlei', 'Basquete', 'Corrida', 'Natação', 'Tênis', 'Crossfit'];

type GenerationType = 'WORKOUT' | 'NUTRI' | 'YOGA' | 'MEDITATION' | 'PROGRESS' | 'SPORTS' | 'CALISTHENICS' | 'ASSESSMENT' | 'GENERAL';

interface GenerationState {
  active: boolean;
  message: string;
  subMessage: string;
  type: GenerationType;
}

export const StudentDetails: React.FC<StudentDetailsProps> = ({ student, allStudents = [], onBack, onUpdateStudent, initialAction }) => {
  const [activeTab, setActiveTab] = useState<'WORKOUT' | 'PROGRESS' | 'NUTRI' | 'YOGA' | 'MEDITATION' | 'ASSESSMENT' | 'SPORTS' | 'CALISTHENICS'>('WORKOUT');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [selectedNutriDayIndex, setSelectedNutriDayIndex] = useState<number>(0);
  const [selectedCaliSkill, setSelectedCaliSkill] = useState(CALISTHENICS_SKILLS[0]);
  const [selectedSport, setSelectedSport] = useState(SPORTS_LIST[0]);
  
  // Yoga Player States
  const [isYogaSessionActive, setIsYogaSessionActive] = useState(false);
  const [currentYogaPoseIndex, setCurrentYogaPoseIndex] = useState(0);
  const [yogaTimer, setYogaTimer] = useState(60);
  const [isYogaPaused, setIsYogaPaused] = useState(true);

  // IA Generation State
  const [generationState, setGenerationState] = useState<GenerationState>({ active: false, message: '', subMessage: '', type: 'GENERAL' });
  const [assessmentReport, setAssessmentReport] = useState<string | null>(null);

  // Modals
  const [showPromptModal, setShowPromptModal] = useState<{ active: boolean, type: GenerationType }>({ active: false, type: 'GENERAL' });
  const [promptInput, setPromptInput] = useState("");
  const [showAddProgress, setShowAddProgress] = useState(false);
  const [expandedExerciseIds, setExpandedExerciseIds] = useState<string[]>([]);

  const toggleExerciseExpansion = (id: string) => {
    setExpandedExerciseIds(prev => prev.includes(id) ? prev.filter(eid => eid !== id) : [...prev, id]);
  };
  
  // Send Plan States
  const [showSendModal, setShowSendModal] = useState<{ active: boolean, type: string }>({ active: false, type: '' });
  const [selectedStudentsForSend, setSelectedStudentsForSend] = useState<string[]>([]);
  const [sendSuccess, setSendSuccess] = useState(false);

  const handleSendPlan = () => {
    // Simulates sending the plan to multiple students
    setSendSuccess(true);
    setTimeout(() => {
      setSendSuccess(false);
      setShowSendModal({ active: false, type: '' });
      setSelectedStudentsForSend([]);
    }, 2000);
  };
  const [progressForm, setProgressForm] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: student.weight || 0,
    chest: 0,
    waist: 0,
    hips: 0
  });

  // Handle Initial Action Navigation
  useEffect(() => {
    if (initialAction === 'WORKOUT_IA') {
      setActiveTab('WORKOUT');
      setShowPromptModal({ active: true, type: 'WORKOUT' });
    } else if (initialAction === 'WORKOUT_MANUAL') {
      setActiveTab('WORKOUT');
      setShowManualWorkoutModal(true);
    }
  }, [initialAction]);

  const handleAddProgress = () => {
    const newEntry: ProgressEntry = {
      id: Date.now().toString(),
      date: progressForm.date,
      weight: progressForm.weight,
      measurements: {
        chest: progressForm.chest,
        waist: progressForm.waist,
        hips: progressForm.hips
      },
      photos: []
    };
    onUpdateStudent({
      ...student,
      weight: progressForm.weight,
      progress: [...student.progress, newEntry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    });
    setShowAddProgress(false);
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
      if (student.yogaPlan && currentYogaPoseIndex < student.yogaPlan.poses.length - 1) {
        setCurrentYogaPoseIndex(prev => prev + 1);
        setYogaTimer(60);
      } else {
        setIsYogaSessionActive(false);
      }
    }
    return () => clearInterval(interval);
  }, [isYogaSessionActive, isYogaPaused, yogaTimer]);

  // Handlers de IA Unificados
  const handleGenerate = async () => {
    const { type } = showPromptModal;
    setShowPromptModal({ active: false, type: 'GENERAL' }); // Close modal right away
    
    if (type === 'WORKOUT') {
      startGeneration("Personal IA", "Construindo periodização...", 'WORKOUT');
      const plan = await generateWorkoutPlan(student, promptInput);
      if (plan) onUpdateStudent({ ...student, weeklyPlan: plan });
    } else if (type === 'NUTRI') {
      startGeneration("Nutri IA", "Balanceando macros...", 'NUTRI');
      const plan = await generateNutriPlan(student, promptInput);
      if (plan) onUpdateStudent({ ...student, nutriPlan: plan });
    } else if (type === 'YOGA') {
      startGeneration("Yoga IA", "Desenhando fluxo zen...", 'YOGA');
      const plan = await generateYogaPlan(student, promptInput, 30);
      if (plan) onUpdateStudent({ ...student, yogaPlan: plan });
    } else if (type === 'SPORTS') {
      startGeneration("Sport IA", `Treino para ${selectedSport}...`, 'SPORTS');
      const plan = await generateSportsPlan(student, selectedSport, promptInput);
      if (plan) onUpdateStudent({ ...student, sportsPlan: plan });
    } else if (type === 'CALISTHENICS') {
      startGeneration("Cali IA", `Skill: ${selectedCaliSkill}...`, 'CALISTHENICS');
      const plan = await generateCalisthenicsPlan(student, selectedCaliSkill, promptInput);
      if (plan) onUpdateStudent({ ...student, calisthenicsPlan: plan });
    } else if (type === 'ASSESSMENT') {
      startGeneration("Bio IA", "Analisando dados antropométricos...", 'ASSESSMENT');
      const report = await generateAssessmentReport(student);
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

  return (
    <div className="animate-fade-in space-y-4 md:space-y-8 pb-32 relative overflow-x-hidden">
      {/* Yoga Active Session Overlay */}
      {isYogaSessionActive && student.yogaPlan && (
        <div className="fixed inset-0 bg-slate-950 z-[1000] flex flex-col p-6 animate-fade-in">
           <div className="flex justify-between items-center mb-10">
              <button onClick={() => setIsYogaSessionActive(false)} className="p-3 bg-slate-900 rounded-2xl text-slate-400"><X size={24} /></button>
              <div className="text-center">
                 <p className="text-[10px] font-black text-purple-400 uppercase">Sessão: {student.yogaPlan.name}</p>
                 <p className="text-white font-black text-sm">Pose {currentYogaPoseIndex + 1} de {student.yogaPlan.poses.length}</p>
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
                 <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">{student.yogaPlan.poses[currentYogaPoseIndex].name}</h2>
                 <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">{student.yogaPlan.poses[currentYogaPoseIndex].description}</p>
              </div>
           </div>
           <div className="flex justify-center gap-6 pb-10">
              <button onClick={() => setIsYogaPaused(!isYogaPaused)} className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center text-slate-950 shadow-xl">
                 {isYogaPaused ? <Play size={32} fill="currentColor" /> : <Pause size={32} fill="currentColor" />}
              </button>
           </div>
        </div>
      )}

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

      {/* Main UI Header */}
      <div className="bg-slate-800/50 p-4 md:p-6 rounded-3xl border border-slate-700/50 shadow-xl">
        <div className="flex items-center gap-3 md:gap-4 mb-6">
          <button onClick={onBack} className="p-2 bg-slate-700/50 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors shrink-0"><ArrowLeft size={20} /></button>
          <img src={student.avatarUrl} className="w-12 h-12 rounded-2xl border-2 border-lime-400 object-cover shadow-lg shadow-lime-400/10 shrink-0" />
          <div className="flex-1 min-w-0">
            <h1 className="text-lg md:text-xl font-black text-white truncate">{student.name}</h1>
            <div className="flex flex-wrap gap-2 mt-0.5">
              <span className="text-[9px] font-black uppercase text-lime-400 truncate max-w-full">{student.goal}</span>
              <span className="text-[9px] font-black uppercase text-slate-400 shrink-0">{student.level}</span>
            </div>
          </div>
        </div>

        {/* Tab Selector - 8 Categories */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-2 px-2 scroll-smooth snap-x">
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
              className={`snap-start flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all whitespace-nowrap border ${activeTab === tab.id ? `bg-slate-700 border-${tab.color}/50 text-${tab.color}` : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              <tab.icon size={14} />{tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Rendering */}
      <div className="space-y-6">
        {/* TREINO */}
        {activeTab === 'WORKOUT' && (
          <div className="animate-fade-in space-y-6">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button onClick={() => setShowPromptModal({active: true, type: 'WORKOUT'})} className="bg-lime-400 text-slate-900 p-4 rounded-2xl font-black flex flex-col items-center gap-2"><BrainCircuit size={20} /><span className="text-[9px] uppercase">IA Treino</span></button>
                <button className="bg-slate-800 border border-slate-700 p-4 rounded-2xl text-white font-black flex flex-col items-center gap-2"><Edit2 size={18} /><span className="text-[9px] uppercase">Manual</span></button>
                <button className="bg-slate-800 border border-slate-700 p-4 rounded-2xl text-slate-400 font-black flex flex-col items-center gap-2"><Calendar size={18} /><span className="text-[9px] uppercase">Agenda</span></button>
                <button className="bg-slate-800 border border-slate-700 p-4 rounded-2xl text-blue-400 font-black flex flex-col items-center gap-2"><FileDown size={18} /><span className="text-[9px] uppercase">PDF</span></button>
             </div>
             {student.weeklyPlan?.days?.map((day, dIdx) => (
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
                                 <Video size={14} />
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
             {student.weeklyPlan && (
               <button onClick={() => setShowSendModal({ active: true, type: 'Treino' })} className="w-full bg-blue-500 hover:bg-blue-600 transition-colors text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex justify-center items-center gap-2 mt-6 shadow-lg shadow-blue-500/20"><Send size={18} /> Enviar plano para Aluno(s)</button>
             )}
          </div>
        )}

        {/* DIETA */}
        {activeTab === 'NUTRI' && (
          <div className="animate-fade-in space-y-6">
             <button onClick={() => setShowPromptModal({active: true, type: 'NUTRI'})} className="w-full bg-emerald-500 text-slate-950 p-4 rounded-2xl font-black flex items-center justify-center gap-2"><Apple size={20} />Gerar Dieta IA</button>
             {student.nutriPlan ? (
               <div className="space-y-6">
                  <div className="flex gap-2 overflow-x-auto no-scrollbar snap-x pb-2">
                    {student.nutriPlan.weeklyMeals.map((day, idx) => (
                      <button key={idx} onClick={() => setSelectedNutriDayIndex(idx)} className={`snap-start px-6 py-3 rounded-2xl border shrink-0 transition-colors ${selectedNutriDayIndex === idx ? 'bg-emerald-500 border-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'}`}>
                        <span className="text-[10px] font-black uppercase whitespace-nowrap">{day.dayOfWeek}</span>
                      </button>
                    ))}
                  </div>
                  <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
                     <h3 className="text-xs font-black text-white uppercase mb-4">Cardápio Diário</h3>
                     {student.nutriPlan.weeklyMeals[selectedNutriDayIndex]?.meals.map((meal, mIdx) => (
                       <div key={mIdx} className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 mb-2">
                          <div className="flex justify-between items-center mb-1">
                             <span className="text-[10px] font-black text-emerald-400">{meal.time}</span>
                             <span className="text-[9px] font-black text-white uppercase">{meal.label}</span>
                          </div>
                          <p className="text-[11px] text-slate-400">{meal.description}</p>
                       </div>
                     ))}
                  </div>
                  <button onClick={() => setShowSendModal({ active: true, type: 'Dieta' })} className="w-full bg-blue-500 hover:bg-blue-600 transition-colors text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex justify-center items-center gap-2 mt-6 shadow-lg shadow-blue-500/20"><Send size={18} /> Enviar plano para Aluno(s)</button>
               </div>
             ) : <div className="text-center py-20 text-slate-600 italic text-sm">Nenhum plano nutricional gerado.</div>}
          </div>
        )}

        {/* YOGA */}
        {activeTab === 'YOGA' && (
          <div className="animate-fade-in space-y-6">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
               <button onClick={() => setShowPromptModal({active: true, type: 'YOGA'})} className="bg-purple-500 text-white p-4 rounded-2xl font-black flex items-center justify-center gap-2"><Flower2 size={20} />Gerar Fluxo IA</button>
               {student.yogaPlan && <button onClick={() => { setIsYogaSessionActive(true); setIsYogaPaused(false); setCurrentYogaPoseIndex(0); setYogaTimer(60); }} className="bg-slate-800 border border-purple-500/30 text-purple-400 p-4 rounded-2xl font-black flex items-center justify-center gap-2"><Play size={20} />Iniciar Prática</button>}
             </div>
             {student.yogaPlan ? (
               <div className="space-y-4">
                  {student.yogaPlan.poses.map((pose, idx) => (
                    <div key={idx} className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800">
                       <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-black text-white">{pose.name}</h4>
                          <span className="text-[9px] font-bold text-purple-400">{pose.duration}</span>
                       </div>
                       <p className="text-[11px] text-slate-400 leading-relaxed">{pose.description}</p>
                       <p className="text-[10px] text-purple-300 italic mt-2">✨ {pose.benefits}</p>
                    </div>
                  ))}
                  <button onClick={() => setShowSendModal({ active: true, type: 'Yoga' })} className="w-full bg-blue-500 hover:bg-blue-600 transition-colors text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex justify-center items-center gap-2 mt-6 shadow-lg shadow-blue-500/20"><Send size={18} /> Enviar plano para Aluno(s)</button>
               </div>
             ) : <div className="text-center py-20 text-slate-600 italic text-sm">Nenhuma rotina de Yoga definida.</div>}
          </div>
        )}

        {/* ESPORTES */}
        {activeTab === 'SPORTS' && (
           <div className="animate-fade-in space-y-6">
              <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-orange-500/20">
                 <h2 className="text-lg font-black text-white mb-4 uppercase">Drills Atléticos</h2>
                 <div className="grid grid-cols-1 gap-3">
                    <select value={selectedSport} onChange={e => setSelectedSport(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl font-bold text-xs appearance-none">
                       {SPORTS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button onClick={() => setShowPromptModal({active: true, type: 'SPORTS'})} className="bg-orange-500 text-slate-950 py-3 rounded-xl font-black text-[10px] uppercase">Gerar Treino IA</button>
                 </div>
              </div>
              {student.sportsPlan && (
                <div className="space-y-4">
                  {student.sportsPlan.weeklySchedule.map((day, idx) => (
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
                  <button onClick={() => setShowSendModal({ active: true, type: 'Treino de Esporte' })} className="w-full bg-blue-500 hover:bg-blue-600 transition-colors text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex justify-center items-center gap-2 mt-6 shadow-lg shadow-blue-500/20"><Send size={18} /> Enviar plano para Aluno(s)</button>
                </div>
              )}
           </div>
        )}

        {/* CALISTENIA */}
        {activeTab === 'CALISTHENICS' && (
           <div className="animate-fade-in space-y-6">
              <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-yellow-500/20">
                 <h2 className="text-lg font-black text-white mb-4 uppercase">Bodyweight Skills</h2>
                 <div className="grid grid-cols-1 gap-3">
                    <select value={selectedCaliSkill} onChange={e => setSelectedCaliSkill(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl font-bold text-xs appearance-none">
                       {CALISTHENICS_SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button onClick={() => setShowPromptModal({active: true, type: 'CALISTHENICS'})} className="bg-yellow-400 text-slate-950 py-3 rounded-xl font-black text-[10px] uppercase">Planejar Skill IA</button>
                 </div>
              </div>
              {student.calisthenicsPlan && (
                <div className="space-y-4">
                  {student.calisthenicsPlan.routine.map((day, idx) => (
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
                  <button onClick={() => setShowSendModal({ active: true, type: 'Treino de Calistenia' })} className="w-full bg-blue-500 hover:bg-blue-600 transition-colors text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex justify-center items-center gap-2 mt-6 shadow-lg shadow-blue-500/20"><Send size={18} /> Enviar plano para Aluno(s)</button>
                </div>
              )}
           </div>
        )}

        {/* ZEN / MEDITAÇÃO */}
        {activeTab === 'MEDITATION' && (
           <div className="animate-fade-in space-y-6">
              <div className="bg-gradient-to-br from-sky-900/20 to-slate-900 p-8 rounded-[2rem] border border-sky-500/20 text-center">
                 <Wind size={40} className="mx-auto text-sky-400 mb-4" />
                 <h2 className="text-xl font-black text-white mb-2 uppercase">Recuperação Mental</h2>
                 <p className="text-slate-500 text-[11px] mb-8">Áudios guiados para foco e controle de cortisol.</p>
                 <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => {}} className="bg-slate-800 p-4 rounded-2xl flex flex-col items-center gap-2"><Play size={20} className="text-sky-400" /><span className="text-[9px] uppercase font-black">Foco Ativo</span></button>
                    <button onClick={() => {}} className="bg-slate-800 p-4 rounded-2xl flex flex-col items-center gap-2"><Play size={20} className="text-sky-400" /><span className="text-[9px] uppercase font-black">Relax Profundo</span></button>
                 </div>
              </div>
              <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
                 <h3 className="text-xs font-black text-white uppercase mb-4">Desafios Semanais</h3>
                 {student.meditationChallenges.map((challenge, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl border border-slate-800 mb-2">
                       {challenge.completed ? <CheckCircle2 size={16} className="text-sky-400" /> : <Circle size={16} className="text-slate-600" />}
                       <div>
                          <p className={`text-[11px] font-bold ${challenge.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{challenge.title}</p>
                          <p className="text-[9px] text-slate-500">{challenge.description}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {/* EVOLUÇÃO */}
        {activeTab === 'PROGRESS' && (
           <div className="animate-fade-in space-y-6">
              <div className="grid grid-cols-2 gap-3">
                 <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Peso Atual</span>
                    <p className="text-3xl font-black text-white mt-2">{student.weight}kg</p>
                 </div>
                 <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">IMC</span>
                    <p className="text-3xl font-black text-white mt-2">{(student.weight / Math.pow(student.height/100, 2)).toFixed(1)}</p>
                 </div>
              </div>

              <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">Desempenho & Medidas</h3>
                  </div>
                  {student.progress && student.progress.length > 0 ? (
                    <div className="h-64 w-full text-xs">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={student.progress.map(p => ({ date: p.date, weight: p.weight, chest: p.measurements?.chest || null, waist: p.measurements?.waist || null, hips: p.measurements?.hips || null }))} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                          <XAxis dataKey="date" stroke="#94a3b8" tickFormatter={(val) => { const date = new Date(val); return `${date.getDate()+1}/${date.getMonth()+1}`; }} />
                          <YAxis stroke="#94a3b8" domain={['auto', 'auto']} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '16px' }} itemStyle={{ fontWeight: 800 }} />
                          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '10px', fontWeight: 'bold' }} />
                          <Line type="monotone" dataKey="weight" name="Peso (kg)" stroke="#a3e635" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
                          <Line type="monotone" dataKey="waist" name="Cintura (cm)" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                          <Line type="monotone" dataKey="chest" name="Peitoral (cm)" stroke="#f472b6" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                          <Line type="monotone" dataKey="hips" name="Quadril (cm)" stroke="#fbbf24" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : <p className="text-center text-slate-600 italic py-10 text-sm font-medium">Adicione registros para gerar o gráfico.</p>}
              </div>

              <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl flex justify-between items-center group cursor-pointer hover:border-indigo-500/50 transition-colors" onClick={() => setShowAddProgress(true)}>
                 <h3 className="text-sm font-black text-white uppercase tracking-widest">Atualizar Check-in</h3>
                 <button className="bg-indigo-500/20 text-indigo-400 p-3 rounded-xl transition-colors group-hover:bg-indigo-500 group-hover:text-white">
                    <Plus size={20} />
                 </button>
              </div>

              <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl">
                 <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4">Histórico de Check-ins</h3>
                 {student.progress && student.progress.length > 0 ? student.progress.map(entry => (
                    <div key={entry.id} className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 mb-2 flex justify-between items-center group">
                       <div>
                          <p className="text-white font-black text-sm">{(() => { const d = new Date(entry.date); d.setMinutes(d.getMinutes() + d.getTimezoneOffset()); return d.toLocaleDateString('pt-BR'); })()}</p>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <span className="text-[10px] font-black text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded-full border border-lime-400/20">{entry.weight}kg</span>
                            {entry.measurements?.waist ? <span className="text-[10px] font-black text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded-full border border-sky-400/20">Cintura: {entry.measurements.waist}cm</span> : null}
                            {entry.measurements?.hips ? <span className="text-[10px] font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">Quadril: {entry.measurements.hips}cm</span> : null}
                          </div>
                       </div>
                       <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                         <TrendingUp size={18} />
                       </div>
                    </div>
                 )).slice().reverse() : <p className="text-center text-slate-600 italic py-10">Nenhum check-in registrado.</p>}
              </div>
           </div>
        )}

        {/* AVALIAÇÃO TÉCNICA */}
        {activeTab === 'ASSESSMENT' && (
           <div className="animate-fade-in space-y-6">
              <button onClick={() => setShowPromptModal({active: true, type: 'ASSESSMENT'})} className="w-full bg-pink-500 text-white p-4 rounded-2xl font-black flex items-center justify-center gap-2"><ClipboardList size={20} />Gerar Relatório Técnico IA</button>
              {assessmentReport ? (
                 <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-pink-500/20">
                    <h3 className="text-lg font-black text-white mb-6 uppercase flex items-center gap-2"><Medal size={20} className="text-pink-400" /> Diagnóstico do Atleta</h3>
                    <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                       {assessmentReport}
                    </div>
                 </div>
              ) : <div className="text-center py-20 text-slate-600 italic text-sm">Realize a avaliação técnica para gerar insights biomecânicos.</div>}
           </div>
        )}
      </div>

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
              placeholder="Ex: Focar em glúteo, dieta low carb, alongamento lombar..." 
            />
            <button onClick={handleGenerate} className="w-full bg-lime-400 hover:bg-lime-500 transition-colors py-4 rounded-2xl font-black text-slate-900 uppercase tracking-widest text-xs">Processar Solicitação</button>
          </div>
        </div>
      )}

      {/* ADD PROGRESS MODAL */}
      {showAddProgress && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 z-[1100]">
          <div className="bg-slate-900 rounded-[2rem] p-8 w-full max-w-md border border-slate-800 animate-scale-in shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2 text-indigo-400">Novo Check-in</h2>
              <button onClick={() => setShowAddProgress(false)} className="text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Data do Registro</label>
                <input type="date" value={progressForm.date} onChange={e => setProgressForm({...progressForm, date: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-indigo-500/50 transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Peso (kg)</label>
                   <input type="number" step="0.1" value={progressForm.weight} onChange={e => setProgressForm({...progressForm, weight: parseFloat(e.target.value) || 0})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-indigo-500/50 transition-colors" />
                 </div>
                 <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Cintura (cm)</label>
                   <input type="number" step="0.1" value={progressForm.waist} onChange={e => setProgressForm({...progressForm, waist: parseFloat(e.target.value) || 0})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-indigo-500/50 transition-colors" />
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Peitoral (cm)</label>
                   <input type="number" step="0.1" value={progressForm.chest} onChange={e => setProgressForm({...progressForm, chest: parseFloat(e.target.value) || 0})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-indigo-500/50 transition-colors" />
                 </div>
                 <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Quadril (cm)</label>
                   <input type="number" step="0.1" value={progressForm.hips} onChange={e => setProgressForm({...progressForm, hips: parseFloat(e.target.value) || 0})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-indigo-500/50 transition-colors" />
                 </div>
              </div>
            </div>
            
            <button onClick={handleAddProgress} className="w-full bg-indigo-500 hover:bg-indigo-600 transition-colors py-4 rounded-xl font-black text-white uppercase tracking-widest text-xs mt-8 shadow-lg shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2">
               <Save size={18} /> Salvar Check-in
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
                <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Plano Enviado!</h3>
                <p className="text-sm text-slate-400">Os alunos selecionados já têm acesso no app deles.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6 shrink-0">
                  <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Send size={20} className="text-blue-400" /> Enviar {showSendModal.type}
                  </h2>
                  <button onClick={() => { setShowSendModal({ active: false, type: '' }); setSelectedStudentsForSend([]); }} className="text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
                </div>
                
                <p className="text-sm text-slate-400 mb-4 shrink-0">Selecione os alunos que receberão este plano em seus aplicativos:</p>
                
                <div className="bg-slate-800/50 rounded-2xl border border-slate-800 overflow-y-auto flex-1 p-2 space-y-1 mb-6">
                  {allStudents.map(s => {
                    const isSelected = selectedStudentsForSend.includes(s.id);
                    return (
                      <label key={s.id} className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-xl cursor-pointer transition-colors group"
                             onClick={(e) => {
                               e.preventDefault(); // Prevent default label click behavior
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
                        <img src={s.avatarUrl} className="w-8 h-8 rounded-full border border-slate-700 block" alt={s.name} />
                        <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors flex-1">{s.name}</span>
                      </label>
                    );
                  })}
                  {allStudents.length === 0 && (
                    <p className="text-center text-slate-500 text-xs py-4">Nenhum aluno encontrado na sua turma.</p>
                  )}
                </div>

                <button 
                   onClick={() => {
                     // toggle logic is handled by inputs, but here we submit
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
