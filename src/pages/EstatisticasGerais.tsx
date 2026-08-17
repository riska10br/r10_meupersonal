import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Users, DollarSign, Dumbbell } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { MOCK_ALUNOS, MOCK_ACADEMIAS, MOCK_PERSONAIS } from '../data/mockData';

const data = [
  { name: 'Jan', vendas: 0, alunos: 0 },
  { name: 'Fev', vendas: 0, alunos: 0 },
  { name: 'Mar', vendas: 0, alunos: 0 },
  { name: 'Abr', vendas: 0, alunos: 0 },
  { name: 'Mai', vendas: 0, alunos: 0 },
  { name: 'Jun', vendas: 0, alunos: 0 },
];

export const EstatisticasGerais = () => {
   const { user } = useAuth();
   const navigate = useNavigate();
   
   return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-20">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-[2rem] border border-slate-700 shadow-xl">
        <h1 className="text-3xl font-black text-white mb-2">Estatísticas <span className="text-lime-400">Gerais</span></h1>
        <p className="text-slate-400">Visão analítica de performance do seu negócio.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <div onClick={() => navigate('/financeiro')} className="bg-[#151f32] p-6 rounded-3xl border border-slate-800 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-800/80 transition-all hover:border-emerald-400/50">
             <DollarSign className="text-emerald-400 mb-2" size={32} />
             <p className="text-2xl font-black text-white">R$ 0</p>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Vendas Totais</p>
         </div>
         <div onClick={() => navigate('/alunos')} className="bg-[#151f32] p-6 rounded-3xl border border-slate-800 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-800/80 transition-all hover:border-blue-400/50">
             <Users className="text-blue-400 mb-2" size={32} />
             <p className="text-2xl font-black text-white">{MOCK_ALUNOS.length}</p>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Alunos Ativos</p>
         </div>
         <div onClick={() => navigate('/personals')} className="bg-[#151f32] p-6 rounded-3xl border border-slate-800 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-800/80 transition-all hover:border-lime-400/50">
             <Activity className="text-lime-400 mb-2" size={32} />
             <p className="text-2xl font-black text-white">{MOCK_PERSONAIS.length}</p>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Personais</p>
         </div>
         <div onClick={() => navigate('/academias')} className="bg-[#151f32] p-6 rounded-3xl border border-slate-800 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-800/80 transition-all hover:border-purple-400/50">
             <Dumbbell className="text-purple-400 mb-2" size={32} />
             <p className="text-2xl font-black text-white">{MOCK_ACADEMIAS.length}</p>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Academias</p>
         </div>
      </div>

      <div className="bg-[#151f32] p-6 rounded-3xl border border-slate-800 h-96">
         <h2 className="text-lg font-black text-white mb-6 uppercase">Evolução Mensal</h2>
         <ResponsiveContainer width="100%" height="80%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="vendas" fill="#a3e635" radius={[4, 4, 0, 0]} name="Vendas (R$)" />
              <Bar dataKey="alunos" fill="#60a5fa" radius={[4, 4, 0, 0]} name="Alunos" />
            </BarChart>
         </ResponsiveContainer>
      </div>
    </div>
   );
};
