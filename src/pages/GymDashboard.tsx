import React, { useMemo, useState, useEffect } from 'react';
import { useAuth, User } from '../auth/AuthContext';
import { useUsers } from '../hooks/useUsers';
import { Building, Users, Activity, Link as LinkIcon, Edit, ChevronLeft, Unlink, Plus, X, Info } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { StudentDetails } from '../components/StudentDetails';
import { useStudents } from '../hooks/useStudents';

export const GymDashboard = () => {
  const { user: currentUser } = useAuth();
  const { users, loading, updateUserProfile, createUser } = useUsers();
  const { students, updateStudent } = useStudents();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [viewMode, setViewMode] = useState<'overview' | 'personais' | 'alunos' | 'edit_student' | 'edit_personal'>('overview');
  const [selectedStudentUser, setSelectedStudentUser] = useState<User | null>(null);
  const [selectedPersonalUser, setSelectedPersonalUser] = useState<User | null>(null);
  
  const [editPersonalName, setEditPersonalName] = useState('');
  
  // Create Modals
  const [showCreateStudent, setShowCreateStudent] = useState(false);
  const [showCreatePersonal, setShowCreatePersonal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', whatsapp: '' });
  const [createError, setCreateError] = useState('');

  useEffect(() => {
     if (location.pathname === '/personals' && viewMode !== 'edit_personal') setViewMode('personais');
     else if (location.pathname === '/alunos' && viewMode !== 'edit_student') setViewMode('alunos');
     else if (location.pathname === '/' && viewMode !== 'edit_student' && viewMode !== 'edit_personal') setViewMode('overview');
  }, [location.pathname, viewMode]);

  const myPersonals = useMemo(() => {
    return users.filter(u => u.role === 'personal' && u.academiaId === currentUser?.id);
  }, [users, currentUser]);

  const allPersonals = useMemo(() => {
    return users.filter(u => u.role === 'personal');
  }, [users]);

  const myStudents = useMemo(() => {
    return users.filter(u => u.role === 'aluno' && u.academiaId === currentUser?.id);
  }, [users, currentUser]);

  const allStudents = useMemo(() => {
    return users.filter(u => u.role === 'aluno');
  }, [users]);
  
  const handleLinkUserToGym = async (userToLink: User) => {
      try {
          await updateUserProfile(userToLink.id, { academiaId: currentUser?.id });
          alert(`${userToLink.name} vinculado com sucesso à academia!`);
      } catch (e: any) {
          alert('Erro ao vincular: ' + e.message);
      }
  };

  const handleLinkStudentToGymAndPersonal = async (student: User, personalId: string | undefined) => {
      try {
          await updateUserProfile(student.id, { academiaId: currentUser?.id, personalId: personalId || undefined });
          alert(`${student.name} vinculado com sucesso!`);
      } catch (e: any) {
          alert('Erro ao vincular: ' + e.message);
      }
  };

  const handleEditStudent = (user: User) => {
     setSelectedStudentUser(user);
     setViewMode('edit_student');
  };
  
  const handleUnlinkStudent = async (studentId: string) => {
      if (confirm('Tem certeza que deseja desvincular este aluno da sua academia?')) {
          try {
              await updateUserProfile(studentId, { academiaId: null });
              alert('Aluno desvinculado com sucesso!');
          } catch (e: any) {
              alert('Erro ao desvincular: ' + e.message);
          }
      }
  };

  const handleCreatePersonal = async (e: React.FormEvent) => {
      e.preventDefault();
      setCreateError('');
      try {
          await createUser({ 
              name: formData.name, 
              email: formData.email, 
              whatsapp: formData.whatsapp, 
              role: 'personal', 
              academiaId: currentUser?.id 
          }, 'senha123'); // Default pass
          alert('Personal criado e vinculado com sucesso! (Senha padrão: senha123)');
          setShowCreatePersonal(false);
          setFormData({ name: '', email: '', whatsapp: '' });
      } catch (err: any) {
          setCreateError(err.message);
      }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
      e.preventDefault();
      setCreateError('');
      try {
          await createUser({ 
              name: formData.name, 
              email: formData.email, 
              whatsapp: formData.whatsapp, 
              role: 'aluno', 
              academiaId: currentUser?.id 
          }, 'senha123'); // Default pass
          alert('Aluno criado e vinculado com sucesso! (Senha padrão: senha123)');
          setShowCreateStudent(false);
          setFormData({ name: '', email: '', whatsapp: '' });
      } catch (err: any) {
          setCreateError(err.message);
      }
  };
  
  const handleEditPersonal = (user: User) => {
      setSelectedPersonalUser(user);
      setEditPersonalName(user.name);
      setViewMode('edit_personal');
  };
  
  const handleSavePersonal = async () => {
      if(!selectedPersonalUser) return;
      try {
          await updateUserProfile(selectedPersonalUser.id, { name: editPersonalName });
          alert('Personal atualizado com sucesso!');
          setViewMode('personais');
      } catch (e: any) {
          alert('Erro ao salvar: ' + e.message);
      }
  };
  
  const handleUnlinkPersonal = async () => {
      if(!selectedPersonalUser) return;
      if (confirm('Tem certeza que deseja desvincular este personal da sua academia?')) {
          try {
              await updateUserProfile(selectedPersonalUser.id, { academiaId: null });
              alert('Personal desvinculado!');
              setViewMode('personais');
          } catch (e: any) {
              alert('Erro ao desvincular: ' + e.message);
          }
      }
  };

  if (loading) return <div className="p-8 text-white">Carregando painel...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-20">
      
      {viewMode === 'overview' && (
        <>
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-[2rem] border border-slate-700 shadow-xl flex items-center gap-6">
            <div className="p-4 bg-blue-400/10 rounded-2xl"><Building className="text-blue-400" size={32} /></div>
            <div>
              <h1 className="text-3xl font-black text-white mb-2">Painel da <span className="text-blue-400">Academia</span></h1>
              <p className="text-slate-400">Gestão local. Olá, {currentUser?.name}.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div onClick={() => navigate('/personals')} className="bg-[#151f32] p-6 rounded-3xl border border-slate-800 flex flex-col justify-between h-40 cursor-pointer hover:border-lime-400/50 hover:bg-slate-800/80 transition-all">
              <div className="bg-lime-400/10 w-fit p-3 rounded-xl"><Activity className="text-lime-400" /></div>
              <div>
                <p className="text-3xl font-black text-white">{myPersonals.length} <span className="text-sm font-normal text-slate-500">/ {allPersonals.length} total</span></p>
                <p className="text-xs font-bold text-slate-500 uppercase">Personais (Vinculados / Todos)</p>
              </div>
            </div>
            <div onClick={() => navigate('/alunos')} className="bg-[#151f32] p-6 rounded-3xl border border-slate-800 flex flex-col justify-between h-40 cursor-pointer hover:border-purple-400/50 hover:bg-slate-800/80 transition-all">
              <div className="bg-purple-400/10 w-fit p-3 rounded-xl"><Users className="text-purple-400" /></div>
              <div>
                <p className="text-3xl font-black text-white">{myStudents.length} <span className="text-sm font-normal text-slate-500">/ {allStudents.length} total</span></p>
                <p className="text-xs font-bold text-slate-500 uppercase">Alunos (Vinculados / Todos)</p>
              </div>
            </div>
          </div>
        </>
      )}

      {viewMode === 'personais' && (
        <div className="space-y-6">
            <button onClick={() => navigate('/')} className="text-lime-400 hover:text-lime-300 font-bold text-sm uppercase flex items-center gap-2">
                <ChevronLeft size={16} /> Voltar
            </button>
            <div className="bg-[#151f32] p-6 rounded-3xl border border-slate-800">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h2 className="text-xl font-black text-white uppercase flex items-center gap-2"><Activity className="text-lime-400"/> Lista de Personais</h2>
                    <button onClick={() => setShowCreatePersonal(true)} className="bg-lime-400 text-slate-900 px-4 py-2 rounded-xl font-black uppercase text-xs flex items-center gap-2 hover:bg-lime-500 transition-colors shadow-lg shadow-lime-400/20 active:scale-95">
                        <Plus size={16} /> Novo Personal
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-800">
                                <th className="pb-3 text-xs font-black text-slate-500 uppercase">Nome</th>
                                <th className="pb-3 text-xs font-black text-slate-500 uppercase">Status</th>
                                <th className="pb-3 text-xs font-black text-slate-500 uppercase text-center w-32">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {allPersonals.map(p => (
                                <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="py-4 font-bold text-white text-sm">{p.name} {p.email && <span className="block text-xs font-normal text-slate-400">{p.email}</span>}</td>
                                    <td className="py-4">
                                        {p.academiaId === currentUser?.id ? (
                                            <span className="text-[10px] bg-lime-400/10 text-lime-400 px-2 py-1 rounded-md uppercase font-black tracking-wide">Sua Academia</span>
                                        ) : p.academiaId ? (
                                            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded-md uppercase font-black tracking-wide">Outra Academia</span>
                                        ) : (
                                            <span className="text-[10px] bg-orange-400/10 text-orange-400 px-2 py-1 rounded-md uppercase font-black tracking-wide">Sem Vínculo</span>
                                        )}
                                    </td>
                                    <td className="py-4 text-center">
                                       <div className="flex flex-col gap-2 mx-auto justify-center">
                                        {!p.academiaId && (
                                            <button onClick={() => handleLinkUserToGym(p)} className="bg-lime-400 text-slate-900 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 mx-auto hover:bg-lime-500 transition-colors w-full justify-center">
                                                <LinkIcon size={12}/> Vincular
                                            </button>
                                        )}
                                        {p.academiaId === currentUser?.id && (
                                            <button onClick={() => handleEditPersonal(p)} className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 mx-auto hover:bg-slate-700 transition-colors w-full justify-center">
                                                <Edit size={12}/> Editar
                                            </button>
                                        )}
                                       </div>
                                    </td>
                                </tr>
                            ))}
                            {allPersonals.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="py-6 text-center text-slate-500 text-sm">Nenhum personal encontrado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}
      
      {viewMode === 'edit_personal' && selectedPersonalUser && (
        <div className="space-y-6">
            <button onClick={() => setViewMode('personais')} className="text-lime-400 hover:text-lime-300 font-bold text-sm uppercase flex items-center gap-2">
                <ChevronLeft size={16} /> Voltar
            </button>
            <div className="bg-[#151f32] p-8 rounded-3xl border border-slate-800 max-w-xl mx-auto">
                <h2 className="text-xl font-black text-white uppercase mb-6 flex items-center gap-2"><Activity className="text-lime-400"/> Editar Personal</h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase mb-1 block">Nome do Personal</label>
                        <input 
                            value={editPersonalName}
                            onChange={(e) => setEditPersonalName(e.target.value)}
                            className="bg-slate-900 border border-slate-700 text-white p-3 rounded-xl outline-none w-full focus:border-lime-400 transition-colors"
                        />
                    </div>
                </div>
                
                <div className="mt-8 space-y-4">
                    <button 
                        onClick={handleSavePersonal}
                        className="w-full py-4 rounded-xl font-black uppercase tracking-wide text-sm bg-lime-400 text-slate-900 hover:bg-lime-500 transition-colors shadow-lg shadow-lime-400/20"
                    >
                        Salvar Alterações
                    </button>
                    <button 
                        onClick={handleUnlinkPersonal}
                        className="w-full py-4 rounded-xl flex items-center justify-center gap-2 font-black uppercase tracking-wide text-sm bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                    >
                        <Unlink size={16} /> Desvincular da Academia
                    </button>
                </div>
            </div>
        </div>
      )}

      {viewMode === 'alunos' && (
        <div className="space-y-6">
            <button onClick={() => navigate('/')} className="text-lime-400 hover:text-lime-300 font-bold text-sm uppercase flex items-center gap-2">
                <ChevronLeft size={16} /> Voltar
            </button>
            <div className="bg-[#151f32] p-6 rounded-3xl border border-slate-800">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h2 className="text-xl font-black text-white uppercase flex items-center gap-2"><Users className="text-purple-400"/> Lista de Alunos</h2>
                    <button onClick={() => setShowCreateStudent(true)} className="bg-lime-400 text-slate-900 px-4 py-2 rounded-xl font-black uppercase text-xs flex items-center gap-2 hover:bg-lime-500 transition-colors shadow-lg shadow-lime-400/20 active:scale-95">
                        <Plus size={16} /> Novo Aluno
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-800">
                                <th className="pb-3 text-xs font-black text-slate-500 uppercase min-w-[150px]">Nome</th>
                                <th className="pb-3 text-xs font-black text-slate-500 uppercase">Vínculo Academia</th>
                                <th className="pb-3 text-xs font-black text-slate-500 uppercase">Personal Atual</th>
                                <th className="pb-3 text-xs font-black text-slate-500 uppercase min-w-[200px]">Atribuir a Personal</th>
                                <th className="pb-3 text-xs font-black text-slate-500 uppercase text-center w-32">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {allStudents.map(a => {
                                // Default the local select state to their current personalId if any
                                return <StudentTableRow key={a.id} student={a} myPersonals={myPersonals} isMyGym={a.academiaId === currentUser?.id} onLink={(pid) => handleLinkStudentToGymAndPersonal(a, pid)} onEdit={() => handleEditStudent(a)} onUnlink={() => handleUnlinkStudent(a.id)} />;
                            })}
                            {allStudents.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-6 text-center text-slate-500 text-sm">Nenhum aluno encontrado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}
      
      {viewMode === 'edit_student' && selectedStudentUser && (
           <StudentDetails 
               student={{
                   ...(students.find(s => s.id === selectedStudentUser.id) || { id: selectedStudentUser.id, studentId: selectedStudentUser.id, name: selectedStudentUser.name }), 
                   ...selectedStudentUser
               } as any}
               onBack={() => setViewMode('alunos')}
               onUpdateStudent={(updatedStudent: any) => {
                   updateStudent(updatedStudent);
               }}
           />
      )}

      {showCreatePersonal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 z-[500]">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-lg border border-slate-800 shadow-2xl animate-scale-in flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-start mb-6 shrink-0">
              <h2 className="text-xl font-black text-white uppercase tracking-widest">Novo Personal</h2>
              <button onClick={() => setShowCreatePersonal(false)} className="text-slate-500 hover:text-white transition-colors bg-slate-800 p-2 rounded-full"><X size={20} /></button>
            </div>
            <div className="overflow-y-auto no-scrollbar pr-2 flex-1">
              <form onSubmit={handleCreatePersonal} className="space-y-4">
                {createError && <div className="p-3 mb-4 bg-red-400/10 border border-red-400/50 rounded-xl text-red-400 text-sm">{createError}</div>}
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Nome Completo</label>
                  <input required type="text" placeholder="Ex: Carlos Silva" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-lime-400/50 transition-colors" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">E-mail</label>
                    <input required type="email" placeholder="personal@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-lime-400/50 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">WhatsApp</label>
                    <input type="text" placeholder="Ex: (11) 99999-9999" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-lime-400/50 transition-colors" />
                  </div>
                </div>
                <div className="pt-4 shrink-0">
                  <button type="submit" className="w-full bg-lime-400 hover:bg-lime-500 py-4 rounded-xl font-black text-slate-900 uppercase tracking-widest text-xs transition-transform active:scale-95">Criar Personal</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showCreateStudent && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 z-[500]">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-lg border border-slate-800 shadow-2xl animate-scale-in flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-start mb-6 shrink-0">
              <h2 className="text-xl font-black text-white uppercase tracking-widest">Novo Aluno</h2>
              <button onClick={() => setShowCreateStudent(false)} className="text-slate-500 hover:text-white transition-colors bg-slate-800 p-2 rounded-full"><X size={20} /></button>
            </div>
            <div className="overflow-y-auto no-scrollbar pr-2 flex-1">
              <form onSubmit={handleCreateStudent} className="space-y-4">
                {createError && <div className="p-3 mb-4 bg-red-400/10 border border-red-400/50 rounded-xl text-red-400 text-sm">{createError}</div>}
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Nome Completo</label>
                  <input required type="text" placeholder="Ex: Ana Souza" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-lime-400/50 transition-colors" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">E-mail</label>
                    <input required type="email" placeholder="aluno@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-lime-400/50 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">WhatsApp</label>
                    <input type="text" placeholder="Ex: (11) 99999-9999" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-lime-400/50 transition-colors" />
                  </div>
                </div>
                <div className="pt-4 shrink-0">
                  <button type="submit" className="w-full bg-lime-400 hover:bg-lime-500 py-4 rounded-xl font-black text-slate-900 uppercase tracking-widest text-xs transition-transform active:scale-95">Criar Aluno</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const StudentTableRow = ({ student, myPersonals, isMyGym, onLink, onEdit, onUnlink }: { student: User, myPersonals: User[], isMyGym: boolean, onLink: (pid: string) => void, onEdit: () => void, onUnlink: () => void }) => {
    const [selectedPersonal, setSelectedPersonal] = useState(student.personalId || '');
    
    return (
        <tr className="hover:bg-slate-800/30 transition-colors">
            <td className="py-4 font-bold text-white text-sm">{student.name} <span className="block text-xs font-normal text-slate-400">{student.email}</span></td>
            <td className="py-4">
                {isMyGym ? (
                    <span className="text-[10px] bg-lime-400/10 text-lime-400 px-2 py-1 rounded-md uppercase font-black tracking-wide">Sua Academia</span>
                ) : student.academiaId ? (
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded-md uppercase font-black tracking-wide">Outra Academia</span>
                ) : (
                    <span className="text-[10px] bg-orange-400/10 text-orange-400 px-2 py-1 rounded-md uppercase font-black tracking-wide">Sem Vínculo</span>
                )}
            </td>
            <td className="py-4 text-sm text-slate-300">
               {student.personalId ? (myPersonals.find(p => p.id === student.personalId)?.name || 'Outro Personal') : <span className="text-slate-500 italic">Nenhum</span>}
            </td>
            <td className="py-4">
                {(!student.academiaId || isMyGym) && (
                    <select 
                        value={selectedPersonal} 
                        onChange={(e) => setSelectedPersonal(e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2 py-1 outline-none w-full max-w-[180px]"
                    >
                        <option value="">Nenhum Personal</option>
                        {myPersonals.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                )}
            </td>
            <td className="py-4 text-center">
                <div className="flex flex-col gap-2 mx-auto justify-center">
                    {(!student.academiaId || isMyGym) && (
                        <button 
                            onClick={() => onLink(selectedPersonal)} 
                            className="bg-lime-400 text-slate-900 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-1 hover:bg-lime-500 transition-colors"
                        >
                            <LinkIcon size={12}/> {isMyGym ? 'Salvar' : 'Vincular'}
                        </button>
                    )}
                    {isMyGym && (
                        <button onClick={onEdit} className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-1 hover:bg-slate-700 transition-colors">
                            <Edit size={12}/> Detalhes
                        </button>
                    )}
                    {isMyGym && (
                        <button onClick={onUnlink} className="bg-red-500/10 text-red-500 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center justify-center gap-1 hover:bg-red-500/20 transition-colors mt-1">
                            <Unlink size={12}/> Desvincular
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
};
