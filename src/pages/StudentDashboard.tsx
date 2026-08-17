import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../auth/AuthContext';
import { db } from '../auth/firebase';
import { doc, updateDoc, collection, query, where, getDocs, setDoc } from 'firebase/firestore';
import { Dumbbell, FilePlus, ClipboardList, ClipboardCheck, DollarSign, Folder, Edit2, Camera, X, Play, Square, ChevronRight, Users, Apple, Activity, Heart, Search, Video } from 'lucide-react';
import { startOfWeek, addDays, format, isBefore, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Routine {
  id: string;
  dayOfWeek: number;
  title: string;
  exercises: { id: string, name: string, sets: string, reps: string }[];
}

interface WorkoutLog {
  id?: string;
  date: string;
  status: 'completed' | 'partial' | 'missed';
  routineId: string;
}

const MenuAccordion = ({ title, icon, isOpen, onToggle, children }: any) => {
  return (
    <div className="bg-[#2f3e5f] rounded-lg shadow overflow-hidden transition-all duration-300 mb-3 border border-slate-700/50">
      <button 
        onClick={onToggle}
        className="w-full bg-[#2f3e5f] hover:bg-[#384a72] transition-colors p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-4">
          <div className="bg-[#3b82f6] p-2 rounded-lg shrink-0 text-white shadow-lg shadow-blue-500/20">
            {icon}
          </div>
          <span className="font-bold text-sm">{title}</span>
        </div>
        <div className={`transition-transform duration-300 text-slate-400 ${isOpen ? 'rotate-90 text-[#3b82f6]' : ''}`}>
          <ChevronRight size={20} />
        </div>
      </button>
      
      {isOpen && (
        <div className="p-4 bg-[#1e293b] border-t border-[#384a72] animate-in slide-in-from-top-2 fade-in duration-200">
          {children}
        </div>
      )}
    </div>
  );
};

export const StudentDashboard = () => {
  const { user, updateUserContext } = useAuth();
  
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editDesc, setEditDesc] = useState(user?.description || '');
  const [editWeight, setEditWeight] = useState(user?.weight || '');
  const [editHeight, setEditHeight] = useState(user?.height || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [workoutModalOpen, setWorkoutModalOpen] = useState(false);
  const [activeWorkoutTimer, setActiveWorkoutTimer] = useState<{ id: string, seconds: number } | null>(null);
  const [expandedExerciseIds, setExpandedExerciseIds] = useState<string[]>([]);

  const toggleExerciseExpansion = (id: string) => {
    setExpandedExerciseIds(prev => prev.includes(id) ? prev.filter(eid => eid !== id) : [...prev, id]);
  };
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.id) {
       setEditName(user.name || '');
       setEditDesc(user.description || '');
       setEditWeight(user.weight || '');
       setEditHeight(user.height || '');
       fetchWorkouts();
    }
  }, [user]);

  useEffect(() => {
    let interval: any;
    if (activeWorkoutTimer) {
      interval = setInterval(() => {
        setActiveWorkoutTimer(prev => prev ? { ...prev, seconds: prev.seconds + 1 } : null);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeWorkoutTimer]);

  const fetchWorkouts = async () => {
    if (!user?.id) return;
    
    // In a real app we fetch routines from a "routines" collection
    // For this example, we'll mock some routines if they don't exist to show functionality
    const mockRoutines: Routine[] = [
      { id: '1', dayOfWeek: 1, title: 'Peito e Tríceps', exercises: [{ id: 'e1', name: 'Supino', sets: '4', reps: '12' }, { id: 'e2', name: 'Tríceps Polia', sets: '4', reps: '15' }] },
      { id: '2', dayOfWeek: 2, title: 'Costas e Bíceps', exercises: [{ id: 'e3', name: 'Puxada', sets: '4', reps: '12' }] },
      { id: '3', dayOfWeek: 3, title: 'Cardio', exercises: [{ id: 'e4', name: 'Esteira', sets: '1', reps: '30 min' }] },
      { id: '4', dayOfWeek: 4, title: 'Ombro e Pernas', exercises: [{ id: 'e5', name: 'Agachamento', sets: '4', reps: '10' }] },
      { id: '5', dayOfWeek: 5, title: 'Full Body', exercises: [{ id: 'e6', name: 'Levantamento Terra', sets: '4', reps: '8' }] },
    ];
    setRoutines(mockRoutines); // Replace with real fetch later if needed
    
    // Fetch logs (history) for this user
    const logsRef = collection(db, 'workoutLogs');
    const q = query(logsRef, where('studentId', '==', user.id));
    const querySnapshot = await getDocs(q);
    const fetchedLogs: WorkoutLog[] = [];
    querySnapshot.forEach(doc => {
      fetchedLogs.push({ id: doc.id, ...doc.data() } as WorkoutLog);
    });
    setLogs(fetchedLogs);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    
    setUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300;
        const MAX_HEIGHT = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Use jpeg instead of png to save space, 0.7 quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        
        try {
          await updateDoc(doc(db, 'users', user.id), { photoUrl: dataUrl });
          updateUserContext({ photoUrl: dataUrl });
        } catch (err) {
          console.error("Error uploading photo:", err);
          alert("Erro ao salvar foto: " + (err as any).message);
        } finally {
          setUploadingPhoto(false);
        }
      };
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.onerror = () => {
      setUploadingPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    if (!user?.id) return;
    setSavingProfile(true);
    try {
      const updates = {
        name: editName,
        description: editDesc,
        weight: Number(editWeight),
        height: Number(editHeight)
      };
      await updateDoc(doc(db, 'users', user.id), updates);
      updateUserContext(updates);
      setProfileModalOpen(false);
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Erro ao salvar perfil");
    } finally {
      setSavingProfile(false);
    }
  };

  const getDaysArray = () => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const days = [];
    const dayLabels = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
    for (let i = 0; i < 7; i++) {
       const d = addDays(start, i);
       days.push({ date: d, label: dayLabels[i], dayOfWeek: d.getDay() === 0 ? 7 : d.getDay() });
    }
    return days;
  };

  const daysThisWeek = getDaysArray();
  const today = startOfDay(new Date());

  const toggleMenu = (id: string) => {
    setExpandedMenu(prev => prev === id ? null : id);
  };

  const mockProgressData = [
    { name: 'Jan', peso: 82 },
    { name: 'Fev', peso: 80.5 },
    { name: 'Mar', peso: 79 },
    { name: 'Abr', peso: 78.2 },
    { name: 'Mai', peso: 77 },
  ];

  const getStatusColor = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const logsForDate = logs.filter(l => l.date === dateStr);
    
    if (logsForDate.length > 0) {
       if (logsForDate.some(l => l.status === 'completed')) return 'bg-green-500 border-green-500 text-white';
       if (logsForDate.some(l => l.status === 'partial')) return 'bg-orange-500 border-orange-500 text-white';
    }
    
    if (isBefore(date, today)) {
       // missed
       // use original getDay() format where 0 is Sunday, 1 is Monday ... etc. Or we mapped it?
       // Above I mapped 'D' as weekStartsOn 1 to be index 6. The standard getDay() is 0 for Sun.
       const stdDayOfWeek = date.getDay() === 0 ? 7 : date.getDay(); 
       let routineDayOfWeek = date.getDay(); // wait, my routines have Day 1 = Sunday? Usually getDay() 0=Sun. 
       // Let's assume routines use 1=Monday...7=Sunday.
       let rDay = date.getDay() === 0 ? 7 : date.getDay();
       const hasRoutine = routines.some(r => r.dayOfWeek === rDay);
       if (hasRoutine) return 'bg-red-500 border-red-500 text-white';
    }
    
    return 'border-[#3b82f6] text-[#3b82f6] bg-white';
  };

  const calculateIMC = () => {
    if (!user?.weight || !user?.height) return null;
    return (user.weight / (user.height * user.height)).toFixed(1);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setWorkoutModalOpen(true);
  };

  const handleFinishWorkout = async (status: 'completed' | 'partial', routineId: string) => {
     if (!user?.id || !selectedDate) return;
     const dateStr = format(selectedDate, 'yyyy-MM-dd');
     setActiveWorkoutTimer(null);
     
     const logRef = doc(collection(db, 'workoutLogs'));
     const newLog = {
       studentId: user.id,
       date: dateStr,
       status,
       routineId
     };
     await setDoc(logRef, newLog);
     setLogs([...logs, newLog as WorkoutLog]);
     setWorkoutModalOpen(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 min-h-full -m-4 md:-m-10 p-4 md:p-10 bg-gradient-to-b from-[#2c3b5a] to-[#151f32] text-white flex flex-col items-center pb-20">
      
      {/* Avatar Space */}
      <div className="mt-8 flex flex-col items-center relative gap-2">
        <div className={`w-28 h-28 rounded-full bg-gray-400 border-4 border-[#3b82f6] flex items-center justify-center overflow-hidden relative group cursor-pointer ${uploadingPhoto ? 'opacity-50' : ''}`} onClick={() => !uploadingPhoto && fileInputRef.current?.click()}>
           {uploadingPhoto ? (
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
           ) : user?.photoUrl ? (
             <img src={user.photoUrl} alt="User avatar" className="w-full h-full object-cover" />
           ) : (
             <div className="w-16 h-16 bg-gray-300 rounded-full flex-shrink-0 mb-[-30px]"></div>
           )}
           {!uploadingPhoto && (
             <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center">
               <Camera size={24} className="text-white" />
             </div>
           )}
        </div>
        <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={handlePhotoUpload} />

        <div className="flex items-center gap-2">
            <h2 className="text-xl font-normal tracking-wide">{user?.name || 'Aluno'}</h2>
            <button onClick={() => setProfileModalOpen(true)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <Edit2 size={16} className="text-slate-300"/>
            </button>
        </div>
        
        {/* Descrição e IMC */}
        <div className="text-center mt-1 max-w-xs">
           <p className="text-sm text-slate-300 italic">{user?.description || "Adicione uma descrição em seu perfil."}</p>
           {user?.weight && user?.height && (
              <p className="text-xs text-[#3b82f6] font-bold mt-2 bg-[#3b82f6]/10 px-3 py-1 rounded-full inline-block">
                IMC: {calculateIMC()} | Peso: {user.weight}kg | Alt: {user.height}m
              </p>
           )}
        </div>
      </div>

      <div className="w-full max-w-md mt-6">
        <h1 className="text-2xl mb-4 font-light">Bom dia, {user?.name?.split(' ')[0] || 'Aluno'}!</h1>
        
        {/* Frequência de Treinos Card */}
        <div className="bg-white text-slate-800 rounded-lg p-5 mb-6 shadow-lg">
          <h3 className="font-semibold text-lg mb-4 text-[#2c3b5a]">Frequência de Treinos</h3>
          <div className="flex justify-between items-center">
            {daysThisWeek.map((item, index) => {
              const bgClass = getStatusColor(item.date);
              return (
              <div key={index} className="flex flex-col items-center gap-2" >
                <button 
                  onClick={() => handleDayClick(item.date)}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm transition-all hover:opacity-80 shadow-sm ${bgClass}`}
                >
                  {bgClass.includes('border-[#3b82f6]') && isBefore(item.date, today) ? '' : ''}
                </button>
                <span className="text-xs font-bold text-gray-500 uppercase">{item.label}</span>
              </div>
            )})}
          </div>
        </div>

        {/* Horizontal Expandable Menus */}
        <div className="w-full flex flex-col mt-6">
          <MenuAccordion 
             id="treinos" title="Treinos da Semana" icon={<Dumbbell size={20} />} 
             isOpen={expandedMenu === 'treinos'} onToggle={() => toggleMenu('treinos')}
          >
             <div className="space-y-3">
               {routines.map(r => (
                 <div key={r.id} className="bg-[#2c3b5a] p-3 rounded-lg flex justify-between items-center text-sm border border-slate-700">
                   <div>
                     <p className="font-bold text-[#3b82f6]">{r.title}</p>
                     <p className="text-xs text-slate-300 uppercase font-bold tracking-wider mt-1">{['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][r.dayOfWeek === 7 ? 0 : r.dayOfWeek]}</p>
                   </div>
                   <span className="text-xs bg-slate-800 border border-slate-700 px-2 py-1 rounded text-slate-300 font-bold">{r.exercises.length} Ex.</span>
                 </div>
               ))}
               {routines.length === 0 && <p className="text-sm text-slate-400 text-center py-2">Nenhum treino programado.</p>}
             </div>
          </MenuAccordion>

          <MenuAccordion 
             id="treinos_extra" title="Treinos Extra" icon={<FilePlus size={20} />} 
             isOpen={expandedMenu === 'treinos_extra'} onToggle={() => toggleMenu('treinos_extra')}
          >
             <div className="space-y-3">
               <p className="text-sm text-slate-400 text-center py-4 bg-slate-800/50 rounded-lg">Você não possui treinos extras disponíveis no momento.</p>
             </div>
          </MenuAccordion>

          <MenuAccordion 
             id="avaliacoes" title="Avaliações" icon={<ClipboardList size={20} />} 
             isOpen={expandedMenu === 'avaliacoes'} onToggle={() => toggleMenu('avaliacoes')}
          >
             <div className="space-y-3">
               <p className="text-sm text-slate-400 text-center py-4 bg-slate-800/50 rounded-lg">Nenhuma avaliação encontrada.</p>
             </div>
          </MenuAccordion>

          <MenuAccordion 
             id="progresso" title="Meu Progresso" icon={<ClipboardCheck size={20} />} 
             isOpen={expandedMenu === 'progresso'} onToggle={() => toggleMenu('progresso')}
          >
             <div className="space-y-4">
               <div className="h-48 w-full bg-[#2c3b5a] rounded-lg p-3 flex flex-col justify-center items-center border border-slate-700">
                 <p className="text-sm text-slate-300 font-bold mb-2">Evolução de Peso</p>
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockProgressData}>
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#151f32', borderColor: '#3b82f6', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#3b82f6' }} />
                      <Line type="monotone" dataKey="peso" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#151f32' }} />
                    </LineChart>
                 </ResponsiveContainer>
               </div>
               <div>
                  <h4 className="font-bold text-sm mb-2 text-[#3b82f6]">Evolução Detalhada</h4>
                  <div className="bg-[#2c3b5a] p-3 rounded-lg text-xs space-y-2 border border-slate-700">
                    <div className="flex justify-between border-b border-slate-700 pb-2">
                      <span className="text-slate-300">Última avaliação (10/05):</span>
                      <span className="font-bold text-lime-400">-1.2 kg</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-700 pb-2 pt-1">
                      <span className="text-slate-300">Medida de braço:</span>
                      <span className="font-bold text-lime-400">+0.5 cm</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-300">Medida de cintura:</span>
                      <span className="font-bold text-lime-400">-2.0 cm</span>
                    </div>
                  </div>
               </div>
             </div>
          </MenuAccordion>

          <MenuAccordion 
             id="faturas" title="Faturas" icon={<DollarSign size={20} />} 
             isOpen={expandedMenu === 'faturas'} onToggle={() => toggleMenu('faturas')}
          >
             <div className="space-y-3">
               <h4 className="font-bold text-sm text-slate-300 text-center mb-2">Plano Atual: <span className="text-white">Free</span></h4>
               <p className="text-xs text-slate-400 text-center mb-4 leading-relaxed">Escolha um plano premium para liberar todos os benefícios e acompanhamento do personal.</p>
               <div className="bg-gradient-to-br from-[#2c3b5a] to-[#1e293b] p-5 rounded-xl border border-[#3b82f6] shadow-lg shadow-blue-500/10">
                 <div className="flex justify-between items-center mb-3">
                   <h5 className="font-black text-lg text-white">Plano Pro</h5>
                   <span className="bg-[#3b82f6] text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Recomendado</span>
                 </div>
                 <ul className="text-sm text-slate-300 list-none mt-2 space-y-2">
                   <li className="flex items-center gap-2"><ClipboardCheck size={14} className="text-[#3b82f6]"/> Treinos personalizados ilimitados</li>
                   <li className="flex items-center gap-2"><ClipboardCheck size={14} className="text-[#3b82f6]"/> Acesso a Dieta e Avaliações</li>
                   <li className="flex items-center gap-2"><ClipboardCheck size={14} className="text-[#3b82f6]"/> Contato direto com Personal</li>
                 </ul>
                 <button className="w-full mt-5 bg-[#3b82f6] hover:bg-blue-600 transition-colors text-white py-3 rounded-xl font-bold uppercase text-xs tracking-wider shadow-lg shadow-blue-500/20">
                    Assinar Agora
                 </button>
               </div>
             </div>
          </MenuAccordion>

          <MenuAccordion 
             id="personal" title="Personal" icon={<Users size={20} />} 
             isOpen={expandedMenu === 'personal'} onToggle={() => toggleMenu('personal')}
          >
             <div className="space-y-3">
               <p className="text-sm text-slate-300 text-center mb-4">Treinadores disponíveis na sua região:</p>
               <div className="bg-[#2c3b5a] p-3 rounded-xl border border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center text-slate-400 font-bold text-lg border border-slate-500 pt-0.5">P</div>
                    <div>
                      <p className="font-bold text-sm text-white">Pedro Silva</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">Resistência, Hipertrofia</p>
                    </div>
                  </div>
                  <button className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-600 px-3 py-1.5 rounded-lg text-white font-bold transition-colors">Perfil</button>
               </div>
             </div>
          </MenuAccordion>

          <div className="flex items-center gap-4 my-6 opacity-30">
             <div className="h-px bg-slate-500 flex-1"></div>
             <h3 className="font-bold text-sm uppercase tracking-widest text-slate-300">Outros Programas</h3>
             <div className="h-px bg-slate-500 flex-1"></div>
          </div>

          <MenuAccordion 
             id="dieta" title="Dieta" icon={<Apple size={20} />} 
             isOpen={expandedMenu === 'dieta'} onToggle={() => toggleMenu('dieta')}
          >
             <div className="space-y-3">
               <p className="text-sm text-slate-400 text-center py-4 bg-slate-800/50 rounded-lg">Nenhuma dieta cadastrada no momento.</p>
             </div>
          </MenuAccordion>

          <MenuAccordion 
             id="yoga" title="Yoga" icon={<Activity size={20} />} 
             isOpen={expandedMenu === 'yoga'} onToggle={() => toggleMenu('yoga')}
          >
             <div className="space-y-3">
               <p className="text-sm text-slate-400 text-center py-4 bg-slate-800/50 rounded-lg">Nenhum programa de Yoga disponível.</p>
             </div>
          </MenuAccordion>

          <MenuAccordion 
             id="esportes" title="Esportes" icon={<Dumbbell size={20} />} 
             isOpen={expandedMenu === 'esportes'} onToggle={() => toggleMenu('esportes')}
          >
             <div className="space-y-3">
               <p className="text-sm text-slate-400 text-center py-4 bg-slate-800/50 rounded-lg">Nenhum esporte suplementar programado.</p>
             </div>
          </MenuAccordion>

          <MenuAccordion 
             id="meditacao" title="Meditação" icon={<Heart size={20} />} 
             isOpen={expandedMenu === 'meditacao'} onToggle={() => toggleMenu('meditacao')}
          >
             <div className="space-y-3">
               <p className="text-sm text-slate-400 text-center py-4 bg-slate-800/50 rounded-lg">Nenhum programa de meditação disponível.</p>
             </div>
          </MenuAccordion>

        </div>
      </div>

      {/* Modal Perfil */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#151f32] border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Editar Perfil</h2>
                    <button onClick={() => setProfileModalOpen(false)} className="text-slate-400 hover:text-white"><X size={24}/></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Nome</label>
                        <input type="text" className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-[#3b82f6] outline-none" value={editName} onChange={e => setEditName(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Descrição</label>
                        <textarea className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-[#3b82f6] outline-none" rows={2} value={editDesc} onChange={e => setEditDesc(e.target.value)}></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Peso (kg)</label>
                            <input type="number" step="0.1" className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-[#3b82f6] outline-none" value={editWeight} onChange={e => setEditWeight(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Altura (m)</label>
                            <input type="number" step="0.01" className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:border-[#3b82f6] outline-none" value={editHeight} onChange={e => setEditHeight(e.target.value)} />
                        </div>
                    </div>
                    <button onClick={saveProfile} disabled={savingProfile} className="w-full mt-6 bg-[#3b82f6] hover:bg-blue-600 disabled:opacity-50 transition-colors text-white py-3 rounded-xl font-bold uppercase tracking-wider text-sm shadow-lg shadow-blue-500/20">
                      {savingProfile ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Modal Workout */}
      {workoutModalOpen && selectedDate && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#151f32]">
            <div className="p-4 bg-[#2c3b5a] flex items-center justify-between shadow-md">
                <div>
                   <h2 className="text-lg font-bold">Treino do Dia</h2>
                   <p className="text-xs text-slate-300">{format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}</p>
                </div>
                <button onClick={() => setWorkoutModalOpen(false)} className="p-2 bg-slate-800/50 rounded-full hover:bg-slate-700 transition-colors"><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
               {(() => {
                   const rDay = selectedDate.getDay() === 0 ? 7 : selectedDate.getDay();
                   const rots = routines.filter(r => r.dayOfWeek === rDay);
                   if (rots.length === 0) return (
                       <div className="text-center text-slate-400 mt-10">
                           <Dumbbell size={48} className="mx-auto mb-4 opacity-20" />
                           Nenhum treino programado para este dia.
                       </div>
                   );
                   return rots.map(r => (
                       <div key={r.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
                           <div className="flex justify-between items-center p-4 bg-slate-800/50 border-b border-slate-700">
                              <h3 className="font-bold text-lg text-[#3b82f6]">{r.title}</h3>
                              {activeWorkoutTimer?.id === r.id ? (
                                  <div className="flex items-center gap-3">
                                      <span className="font-mono text-lime-400 font-bold tracking-widest">{formatTime(activeWorkoutTimer.seconds)}</span>
                                      <button onClick={() => handleFinishWorkout('completed', r.id)} className="p-2 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/20"><Square size={16} className="text-white fill-current"/></button>
                                  </div>
                              ) : (
                                  <button onClick={() => setActiveWorkoutTimer({ id: r.id, seconds: 0 })} className="flex items-center gap-2 bg-lime-500 hover:bg-lime-600 transition-colors text-[#151f32] px-3 py-1.5 rounded-lg font-bold text-xs shadow-lg shadow-lime-500/20"><Play size={14} className="fill-current"/> Iniciar</button>
                              )}
                           </div>
                           <div className="p-4 space-y-3">
                               {r.exercises.map((ex, i) => (
                                   <div key={ex.id} className="border-b border-slate-700/50 last:border-0 hover:bg-slate-800/50 transition-colors">
                                      <div 
                                         className="flex justify-between items-center py-3 px-2 cursor-pointer" 
                                         onClick={() => toggleExerciseExpansion(ex.id)}
                                      >
                                         <div className="flex gap-3 items-center">
                                            <div className="w-8 h-8 rounded-full bg-[#2c3b5a] flex items-center justify-center text-xs font-bold text-slate-300 border border-[#3b82f6]/30 shrink-0">{i+1}</div>
                                            <span className="font-medium text-sm text-slate-200 hover:text-blue-400 transition-colors">{ex.name}</span>
                                         </div>
                                         <div className="flex items-center gap-3">
                                            <p className="text-xs text-slate-400 font-bold bg-slate-900 px-2 py-1 rounded-md">{ex.sets}x {ex.reps}</p>
                                            <div className="flex gap-1">
                                              <a 
                                                href={`https://www.google.com/search?q=${encodeURIComponent('Como executar o exercício ' + ex.name)}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="p-1.5 bg-slate-900 rounded-md text-slate-500 hover:text-blue-400 transition-colors"
                                                onClick={(e) => e.stopPropagation()}
                                              >
                                                <Search size={14} />
                                              </a>
                                              {ex.videoUrl && (
                                                <a 
                                                  href={ex.videoUrl} 
                                                  target="_blank" 
                                                  rel="noopener noreferrer" 
                                                  className="p-1.5 bg-slate-900 rounded-md text-slate-500 hover:text-red-400 transition-colors"
                                                  onClick={(e) => e.stopPropagation()}
                                                >
                                                  <Video size={14} />
                                                </a>
                                              )}
                                            </div>
                                         </div>
                                      </div>
                                      {expandedExerciseIds.includes(ex.id) && (
                                         <div className="px-4 pb-3 animate-fade-in">
                                            <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                                              <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Instruções de Execução</h5>
                                              <p className="text-xs text-slate-300 leading-relaxed">
                                                {ex.notes || 'Siga as instruções padrão para este exercício. Mantenha a postura correta e contraia a musculatura alvo durante o movimento. Caso tenha dúvidas, consulte a demonstração em vídeo ou realize uma pesquisa rápida.'}
                                              </p>
                                            </div>
                                         </div>
                                      )}
                                   </div>
                               ))}
                           </div>
                           {activeWorkoutTimer?.id === r.id && (
                               <div className="p-4 grid grid-cols-2 gap-3 pt-4 border-t border-slate-700 bg-slate-900/50">
                                   <button onClick={() => handleFinishWorkout('partial', r.id)} className="w-full py-3 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-xl text-sm font-bold border border-orange-500/30 transition-colors">Treino Incompleto</button>
                                   <button onClick={() => handleFinishWorkout('completed', r.id)} className="w-full py-3 bg-lime-500 hover:bg-lime-600 text-[#151f32] rounded-xl text-sm font-bold transition-colors shadow-lg shadow-lime-500/20">Treino Concluído</button>
                               </div>
                           )}
                       </div>
                   ));
               })()}
            </div>
        </div>
      )}

    </div>
  );
};

