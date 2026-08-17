import React, { useState } from 'react';
import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Dumbbell, LayoutDashboard, Users, UserPlus, Settings, LogOut, ChevronRight, Activity, Building, Menu, X, DollarSign, Star } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export const Layout = () => {
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  if (!user) {
    return <Navigate to="/login" />;
  }

  const role = user.role;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = {
    admin: [
      { label: 'Visão Geral', icon: LayoutDashboard, path: '/' },
      { label: 'Academias', icon: Building, path: '/academias' },
      { label: 'Personals', icon: Activity, path: '/personals' },
      { label: 'Todos Alunos', icon: Users, path: '/alunos' },
      { label: 'Financeiro', icon: DollarSign, path: '/financeiro' },
      { label: 'Estatísticas', icon: Activity, path: '/estatisticas' },
      { label: 'Perfis & Acessos', icon: Users, path: '/perfil' },
      { label: 'Ajustes', icon: Settings, path: '/ajustes' },
    ],
    adm_academia: [
      { label: 'Visão Geral', icon: LayoutDashboard, path: '/' },
      { label: 'Meus Personais', icon: Activity, path: '/personals' },
      { label: 'Meus Alunos', icon: Users, path: '/alunos' },
      { label: 'Estatísticas', icon: Activity, path: '/estatisticas' },
      { label: 'Ajustes', icon: Settings, path: '/ajustes' },
    ],
    personal: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { label: 'Meus Alunos', icon: Users, path: '/meus-alunos' },
      { label: 'Estatísticas', icon: Activity, path: '/estatisticas' },
      { label: 'Ajustes', icon: Settings, path: '/ajustes' },
    ],
    aluno: [
      { label: 'Meu Treino', icon: Activity, path: '/' },
      { label: 'Perfil', icon: Users, path: '/perfil' },
      { label: 'Ajustes', icon: Settings, path: '/ajustes' },
    ]
  };

  const links = navItems[role] || navItems['aluno'];

  return (
    <div className="h-[100dvh] w-full flex bg-[#0a0f1c] text-slate-100 font-sans overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {mobileMenu && (
        <div 
          className="fixed inset-0 bg-black/60 z-[45] lg:hidden transition-opacity animate-fade-in" 
          onClick={() => setMobileMenu(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`fixed lg:static top-0 left-0 h-[100dvh] w-72 bg-[#0f172a] border-r border-slate-800 p-6 flex flex-col z-[50] transition-transform ${mobileMenu ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} pb-[calc(90px+env(safe-area-inset-bottom))] lg:pb-[max(1.5rem,env(safe-area-inset-bottom))]`}>
        <div className="flex items-center justify-between mb-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-lime-400 p-2.5 rounded-2xl shadow-[0_0_20px_rgba(163,230,53,0.3)]"><Dumbbell className="text-slate-900 w-6 h-6" /></div>
            <span className="text-xl font-black tracking-tighter text-white italic">GYM<span className="text-lime-400">PRO</span></span>
          </div>
          <button className="lg:hidden text-slate-400" onClick={() => setMobileMenu(false)}><X size={24} /></button>
        </div>

        {/* User Info */}
        <div className="mb-8 p-4 bg-slate-800/50 rounded-2xl border border-slate-700 shrink-0">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-black mb-1">{role}</p>
          <p className="font-bold text-white truncate">{user.name}</p>
        </div>

        <nav className="flex-1 min-h-0 space-y-2 overflow-y-auto no-scrollbar pr-2 pb-2">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <button
                key={link.path}
                onClick={() => { navigate(link.path); setMobileMenu(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${
                  isActive ? 'bg-slate-800 text-lime-400 border border-slate-700 shadow-xl' : 'text-slate-500 hover:bg-slate-800/40 hover:text-white'
                }`}
              >
                <Icon size={20} /> {link.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 shrink-0">
          <button 
            onClick={() => {
              if (mobileMenu) setMobileMenu(false);
              setShowLogoutModal(true);
            }}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-red-500 hover:bg-red-500/10 font-bold transition-all"
          >
            <LogOut size={20} /> Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-hidden pb-[calc(70px+env(safe-area-inset-bottom))] lg:pb-0">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-slate-800 shrink-0 bg-[#0f172a] z-40">
          <div className="flex items-center gap-2">
            <div className="bg-lime-400 p-1.5 rounded-xl"><Dumbbell className="text-slate-900 w-5 h-5" /></div>
            <span className="text-lg font-black tracking-tighter text-white italic">GYM<span className="text-lime-400">PRO</span></span>
          </div>
          <button onClick={() => setMobileMenu(true)} className="p-2 text-slate-400 bg-slate-800 rounded-xl"><Menu size={24} /></button>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 md:p-10 no-scrollbar">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Bar */}
      <nav className="fixed lg:hidden bottom-0 left-0 w-full bg-[#0f172a] border-t border-slate-800 flex justify-between items-center px-6 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] z-50">
        <button onClick={() => navigate('/')} className={`flex flex-col items-center gap-1 ${location.pathname === '/' ? 'text-lime-400' : 'text-slate-500'}`}>
          <LayoutDashboard size={20} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Início</span>
        </button>
        <button onClick={() => navigate('/perfil')} className={`flex flex-col items-center gap-1 ${location.pathname === '/perfil' ? 'text-lime-400' : 'text-slate-500'}`}>
          <Users size={20} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Perfil</span>
        </button>
        <button onClick={() => navigate('/estatisticas')} className={`flex flex-col items-center gap-1 ${location.pathname === '/estatisticas' ? 'text-lime-400' : 'text-slate-500'}`}>
          <Activity size={20} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Stats</span>
        </button>
        <button onClick={() => navigate('/ajustes')} className={`flex flex-col items-center gap-1 ${location.pathname === '/ajustes' ? 'text-lime-400' : 'text-slate-500'}`}>
          <Settings size={20} />
          <span className="text-[9px] font-bold uppercase tracking-widest">Ajustes</span>
        </button>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowLogoutModal(false)}
          />
          <div className="bg-[#151f32] border border-slate-800 rounded-3xl p-6 md:p-8 max-w-sm w-full relative z-10 animate-scale-in shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <LogOut className="text-red-500 w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-white text-center mb-2">Sair do Aplicativo?</h3>
            <p className="text-slate-400 text-center text-sm mb-8 leading-relaxed">
              Deseja realmente deslogar do aplicativo?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3.5 rounded-xl font-bold uppercase tracking-wide text-xs bg-slate-800 text-white hover:bg-slate-700 transition-colors"
              >
                Não
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3.5 rounded-xl font-bold uppercase tracking-wide text-xs bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
              >
                Sim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
