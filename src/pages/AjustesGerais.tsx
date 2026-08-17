import React, { useState } from 'react';
import { Settings, Bell, Lock, Globe, RotateCcw } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useUsers } from '../hooks/useUsers';
import { auth } from '../auth/firebase';
import { updatePassword, signOut } from 'firebase/auth';

export const AjustesGerais = () => {
   const { user, switchRole } = useAuth();
   const { updateUserProfile } = useUsers();
   
   const [showPasswordChange, setShowPasswordChange] = useState(false);
   const [newPassword, setNewPassword] = useState('');
   const [passwordMsg, setPasswordMsg] = useState('');

   const handleChangePassword = async () => {
     if (!auth.currentUser || !user) return;
     if (newPassword.length < 6) {
        setPasswordMsg('A senha precisa ter pelo menos 6 caracteres.');
        return;
     }
     try {
        await updatePassword(auth.currentUser, newPassword);
        await updateUserProfile(user.id, { senhaAcesso: newPassword });
        setPasswordMsg('Senha atualizada! Redirecionando para login...');
        setTimeout(async () => {
           setShowPasswordChange(false);
           await signOut(auth);
        }, 2000);
     } catch (error: any) {
        if (error.code === 'auth/requires-recent-login') {
           setPasswordMsg('Por segurança, faça login novamente para mudar a senha.');
        } else {
           setPasswordMsg('Erro ao atualizar senha.');
        }
     }
   };
   
   return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-20">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-[2rem] border border-slate-700 shadow-xl flex items-center gap-4">
        <div className="p-4 bg-lime-400/10 rounded-full"><Settings className="text-lime-400" size={32} /></div>
        <div>
          <h1 className="text-3xl font-black text-white">Configurações e <span className="text-lime-400">Ajustes</span></h1>
          <p className="text-slate-400 text-sm">Personalize sua experiência no aplicativo.</p>
        </div>
      </div>

      <div className="bg-[#151f32] p-6 rounded-3xl border border-slate-800 space-y-6">
         <div className="flex items-center justify-between py-4 border-b border-slate-800">
             <div className="flex items-center gap-4">
                 <Bell className="text-slate-400" size={24} />
                 <div>
                     <h3 className="font-bold text-white">Notificações Push</h3>
                     <p className="text-xs text-slate-500">Receba alertas sobre seus treinos e alunos.</p>
                 </div>
             </div>
             <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-400"></div>
             </label>
         </div>

         <div className="py-4 border-b border-slate-800">
             <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
                     <Lock className="text-slate-400" size={24} />
                     <div>
                         <h3 className="font-bold text-white">Privacidade e Segurança</h3>
                         <p className="text-xs text-slate-500">Gerencie sua senha e autenticação em dois passos.</p>
                     </div>
                 </div>
                 <button onClick={() => setShowPasswordChange(!showPasswordChange)} className="text-xs font-bold bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors">Modificar Senha</button>
             </div>
             {showPasswordChange && (
               <div className="mt-4 p-4 bg-slate-900 border border-slate-700 rounded-xl space-y-3 animate-fade-in">
                  <label className="text-[10px] font-black text-slate-500 uppercase block">Nova Senha</label>
                  <input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-slate-800 p-3 rounded-lg text-white border border-slate-700 outline-none focus:border-lime-400" />
                  {passwordMsg && <p className="text-xs text-lime-400">{passwordMsg}</p>}
                  <button onClick={handleChangePassword} className="bg-lime-400 text-slate-900 px-4 py-2 font-bold uppercase text-xs rounded-lg hover:bg-lime-500">Salvar Nova Senha</button>
               </div>
             )}
         </div>

         <div className="flex items-center justify-between py-4 border-b border-slate-800">
             <div className="flex items-center gap-4">
                 <Globe className="text-slate-400" size={24} />
                 <div>
                     <h3 className="font-bold text-white">Idioma do Aplicativo</h3>
                     <p className="text-xs text-slate-500">Selecione seu idioma preferido.</p>
                 </div>
             </div>
             <select className="bg-slate-800 text-white text-xs p-2 rounded-lg border-none outline-none">
                 <option>Português (BR)</option>
                 <option>English</option>
                 <option>Español</option>
             </select>
         </div>
         
         {user?.role === 'admin' && (
             <div className="flex items-center justify-between py-4">
                 <div className="flex items-center gap-4">
                     <RotateCcw className="text-slate-400" size={24} />
                     <div>
                         <h3 className="font-bold text-white">Modo Demonstrativo (Dev)</h3>
                         <p className="text-xs text-slate-500">Alterne sua visualização de perfil para testar o app.</p>
                     </div>
                 </div>
                 <div className="flex flex-wrap gap-2">
                     <button onClick={() => switchRole('admin')} className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg ${user?.role === 'admin' ? 'bg-lime-400 text-slate-900' : 'bg-slate-800 text-slate-400'}`}>Admin</button>
                     <button onClick={() => switchRole('adm_academia')} className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg ${(user?.role as string) === 'adm_academia' ? 'bg-lime-400 text-slate-900' : 'bg-slate-800 text-slate-400'}`}>ADM Acad.</button>
                     <button onClick={() => switchRole('personal')} className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg ${(user?.role as string) === 'personal' ? 'bg-lime-400 text-slate-900' : 'bg-slate-800 text-slate-400'}`}>Personal</button>
                     <button onClick={() => switchRole('aluno')} className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg ${(user?.role as string) === 'aluno' ? 'bg-lime-400 text-slate-900' : 'bg-slate-800 text-slate-400'}`}>Aluno</button>
                 </div>
             </div>
         )}
      </div>
    </div>
   );
};
