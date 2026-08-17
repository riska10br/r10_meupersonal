import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Lock, Mail } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    
    if (!cleanEmail || !cleanPassword) return;
    
    setError('');
    setLoading(true);
    try {
      await login(cleanEmail, cleanPassword);
      navigate('/');
    } catch (e: any) {
      if (e.message === 'account-archived') {
        setError('Esta conta foi excluída e não possui acesso.');
      } else if (e.code === 'auth/invalid-credential' || e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password') {
        setError('E-mail ou senha incorretos.');
      } else if (e.code === 'auth/operation-not-allowed') {
        setError('Por favor, ative o provedor "E-mail/senha" no Console do Firebase em Authentication > Sign-in method.');
      } else {
        setError('Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-[#0f172a] p-8 rounded-[2rem] border border-slate-800 shadow-2xl">
        <div className="flex justify-center items-center gap-3 mb-8">
          <div className="bg-lime-400 p-3 rounded-2xl shadow-[0_0_20px_rgba(163,230,53,0.3)]"><Dumbbell className="text-slate-900 w-8 h-8" /></div>
          <span className="text-3xl font-black tracking-tighter text-white italic">GYM<span className="text-lime-400">PRO</span></span>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs font-bold p-3 rounded-lg text-center mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
             <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">E-mail</label>
             <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-slate-500" />
                </div>
                <input 
                  type="email" 
                  placeholder="admin@admin.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-white outline-none focus:border-lime-400/50 transition-colors" 
                  required
                />
             </div>
          </div>
          <div>
             <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Senha</label>
             <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-500" />
                </div>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 pr-4 py-4 text-white outline-none focus:border-lime-400/50 transition-colors" 
                  required
                />
             </div>
          </div>
          <button type="submit" disabled={loading} className={`w-full bg-lime-400 py-4 rounded-xl font-black text-slate-900 uppercase tracking-widest text-sm active:scale-95 transition-transform flex justify-center items-center gap-3 mt-4 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-lime-500 transition-colors'}`}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-8 border-t border-slate-800 pt-6">
           <p className="text-center text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Acesso Rápido (Demo)</p>
           <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => { setEmail('admin@admin.com'); setPassword('123456'); }}
                className="bg-slate-800/50 hover:bg-slate-700 text-white text-xs font-bold py-2 px-3 rounded-lg border border-slate-700 transition-colors"
                type="button"
              >
                Admin (Global)
              </button>
              <button 
                onClick={() => { setEmail('gestor@gympro.com'); setPassword('123456'); }}
                className="bg-slate-800/50 hover:bg-slate-700 text-white text-xs font-bold py-2 px-3 rounded-lg border border-slate-700 transition-colors"
                type="button"
              >
                Academia (ADM)
              </button>
              <button 
                onClick={() => { setEmail('personal@gympro.com'); setPassword('123456'); }}
                className="bg-slate-800/50 hover:bg-slate-700 text-white text-xs font-bold py-2 px-3 rounded-lg border border-slate-700 transition-colors"
                type="button"
              >
                Personal
              </button>
              <button 
                onClick={() => { setEmail('alunodemo@gympro.com'); setPassword('123456'); }}
                className="bg-slate-800/50 hover:bg-slate-700 text-white text-xs font-bold py-2 px-3 rounded-lg border border-slate-700 transition-colors"
                type="button"
              >
                Aluno
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};


