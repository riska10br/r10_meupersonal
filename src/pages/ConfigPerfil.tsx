import React, { useMemo, useState } from 'react';
import { useAuth, Role, User } from '../auth/AuthContext';
import { useUsers } from '../hooks/useUsers';
import { Shield, User as UserIcon, X, Edit, Save } from 'lucide-react';

export const ConfigPerfil = () => {
  const { user } = useAuth();
  const { users, loading, updateUserProfile, updateUserPasswordAsAdmin } = useUsers();

  const [showEdit, setShowEdit] = useState<User | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserRole, setEditUserRole] = useState<Role>('aluno');
  const [editUserSenha, setEditUserSenha] = useState('');
  const [editError, setEditError] = useState('');

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
      
      if (isPasswordChanged && editUserSenha.trim().length >= 6 && user?.role === 'admin') {
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

  const accessibleUsers = useMemo(() => {
    if (!user) return [];
    if (user.role === 'admin') {
      return [...users].sort((a, b) => a.name.localeCompare(b.name));
    }
    if (user.role === 'adm_academia') {
      // Show personals linked to this gym, and students linked to those personals
      const myPersonals = users.filter(u => u.role === 'personal' && u.academiaId === user.id);
      const myPersonalIds = myPersonals.map(p => p.id);
      const myStudents = users.filter(u => u.role === 'aluno' && u.personalId && myPersonalIds.includes(u.personalId));
      return [...myPersonals, ...myStudents, user].sort((a, b) => a.name.localeCompare(b.name));
    }
    if (user.role === 'personal') {
      // Show this personal and their students
      const myStudents = users.filter(u => u.role === 'aluno' && u.personalId === user.id);
      return [user, ...myStudents].sort((a, b) => a.name.localeCompare(b.name));
    }
    // Aluno shows only themselves
    return [user];
  }, [users, user]);

  if (loading) return <div className="p-8 text-white">Carregando perfis...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-20">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-[2rem] border border-slate-700 shadow-xl flex items-center gap-4">
        <div className="p-4 bg-lime-400/10 rounded-full"><Shield className="text-lime-400" size={32} /></div>
        <div>
          <h1 className="text-3xl font-black text-white">Gestão de <span className="text-lime-400">Perfis</span></h1>
          <p className="text-slate-400 text-sm">Visualize e edite perfis com base no seu nível de acesso.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {accessibleUsers.map(u => (
          <div 
            key={u.id} 
            onClick={() => handleOpenEdit(u)}
            className="bg-[#151f32] p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row gap-6 items-start sm:items-center cursor-pointer hover:border-lime-400/50 hover:bg-slate-800/80 transition-all group"
          >
             <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-700 shrink-0 group-hover:border-lime-400 transition-colors">
               <UserIcon className="text-slate-500 group-hover:text-lime-400" size={24} />
             </div>
             <div className="flex-1 w-full">
                <div className="flex justify-between items-start mb-2">
                   <h3 className="font-bold text-white text-lg group-hover:text-lime-400 transition-colors">{u.name}</h3>
                   <span className="text-[10px] font-black text-lime-400 uppercase bg-lime-400/10 px-2 py-1 rounded-md">{u.role}</span>
                </div>
                <p className="text-sm text-slate-400">Email: {u.email}</p>
                {user?.role === 'admin' && (
                  <p className="text-xs text-slate-500 font-mono mt-1">Senha: {u.senhaAcesso || '******'}</p>
                )}
             </div>
          </div>
        ))}
        {accessibleUsers.length === 0 && (
          <div className="col-span-full text-center text-slate-500 p-8">Nenhum perfil disponível.</div>
        )}
      </div>

      {/* Edit User Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#151f32] rounded-[2rem] p-8 w-full max-w-lg border border-slate-800 shadow-2xl animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Edit className="text-lime-400" size={20} />
                Editar Perfil
              </h2>
              <button onClick={() => setShowEdit(null)} className="text-slate-500 hover:text-white transition-colors bg-slate-800 p-2 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {editError && (
                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm font-bold">
                  {editError}
                </div>
              )}

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Nome</label>
                <input 
                  type="text" 
                  value={editUserName} 
                  onChange={e => setEditUserName(e.target.value)} 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-lime-400/50 transition-colors"
                />
              </div>

              {user?.role === 'admin' && (
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Função (Role)</label>
                  <select 
                    value={editUserRole} 
                    onChange={e => setEditUserRole(e.target.value as Role)} 
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-lime-400/50 transition-colors appearance-none"
                  >
                    <option value="aluno">Aluno</option>
                    <option value="personal">Personal</option>
                    <option value="adm_academia">Admin Academia</option>
                    <option value="admin">Admin Global</option>
                  </select>
                </div>
              )}

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Senha de Acesso</label>
                <input 
                  type="text" 
                  value={editUserSenha} 
                  onChange={e => setEditUserSenha(e.target.value)} 
                  placeholder="Deixe em branco para não alterar"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-lime-400/50 transition-colors font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1">Mínimo de 6 caracteres.</p>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => setShowEdit(null)} 
                  className="flex-1 py-4 rounded-xl font-black uppercase tracking-widest text-xs bg-slate-800 text-white hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveEdit} 
                  className="flex-1 py-4 rounded-xl font-black uppercase tracking-widest text-xs bg-lime-400 text-slate-900 hover:bg-lime-500 transition-colors shadow-lg shadow-lime-400/20 flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
