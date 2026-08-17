import React from 'react';
import { DollarSign, TrendingUp, Building, Activity, Users, ArrowUpRight } from 'lucide-react';

export const AdminFinanceiro = () => {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white italic">Financeiro Geral</h1>
                    <p className="text-slate-400 mt-1">Acompanhamento de pagamentos, plano e receitas.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-lime-400 p-6 rounded-3xl border border-lime-500 text-slate-900 flex flex-col justify-between">
                    <div className="bg-slate-900/10 w-fit p-3 rounded-xl mb-4"><DollarSign /></div>
                    <div>
                        <p className="text-5xl font-black tracking-tighter">R$ 0,00</p>
                        <p className="text-xs font-bold uppercase tracking-widest mt-2 opacity-80">Receita Bruta - Mês Atual</p>
                    </div>
                </div>
                
                <div className="bg-[#151f32] p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
                    <div className="bg-blue-400/10 w-fit p-3 rounded-xl mb-4"><TrendingUp className="text-blue-400" /></div>
                    <div>
                        <p className="text-3xl font-black text-white">0</p>
                        <p className="text-xs font-bold text-slate-500 uppercase">Assinaturas Ativas</p>
                    </div>
                </div>

                <div className="bg-[#151f32] p-6 rounded-3xl border border-slate-800 flex flex-col justify-between">
                    <div className="bg-purple-400/10 w-fit p-3 rounded-xl mb-4"><Users className="text-purple-400" /></div>
                    <div>
                        <p className="text-3xl font-black text-white">0</p>
                        <p className="text-xs font-bold text-slate-500 uppercase">Inadimplentes</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-[#151f32] p-6 rounded-3xl border border-slate-800">
                    <div className="flex items-center gap-3 mb-6">
                        <Building className="text-slate-400" />
                        <h2 className="text-lg font-black text-white uppercase">Academias</h2>
                    </div>
                    <p className="text-slate-500 text-sm">Resumo de royalties, mensalidades de rede e repasses.</p>
                    <div className="mt-6 flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-800 rounded-2xl">
                        <span className="text-slate-600 font-bold uppercase text-xs">Sem dados no período</span>
                    </div>
                </div>

                <div className="bg-[#151f32] p-6 rounded-3xl border border-slate-800">
                    <div className="flex items-center gap-3 mb-6">
                        <Activity className="text-slate-400" />
                        <h2 className="text-lg font-black text-white uppercase">Personais</h2>
                    </div>
                    <p className="text-slate-500 text-sm">Controle de cotas de alunos, taxas e comissionamentos.</p>
                    <div className="mt-6 flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-800 rounded-2xl">
                        <span className="text-slate-600 font-bold uppercase text-xs">Sem dados no período</span>
                    </div>
                </div>

                <div className="bg-[#151f32] p-6 rounded-3xl border border-slate-800">
                    <div className="flex items-center gap-3 mb-6">
                        <Users className="text-slate-400" />
                        <h2 className="text-lg font-black text-white uppercase">Alunos</h2>
                    </div>
                    <p className="text-slate-500 text-sm">Recebimentos direto B2C, mensalidades avulsas.</p>
                    <div className="mt-6 flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-800 rounded-2xl">
                        <span className="text-slate-600 font-bold uppercase text-xs">Sem dados no período</span>
                    </div>
                </div>
            </div>
            
            <div className="bg-[#151f32] p-6 rounded-3xl border border-slate-800">
               <div className="flex justify-between items-center mb-6">
                   <h2 className="text-lg font-black text-white uppercase">Últimas Transações</h2>
                   <button className="text-lime-400 text-xs font-bold uppercase hover:underline">Ver tudo</button>
               </div>
               <div className="overflow-x-auto">
                   <table className="w-full text-left text-sm text-slate-400">
                       <thead className="text-xs uppercase bg-slate-900/50 text-slate-500 border-b border-slate-800">
                           <tr>
                               <th className="px-4 py-3 font-bold rounded-tl-xl">Data</th>
                               <th className="px-4 py-3 font-bold">Descrição</th>
                               <th className="px-4 py-3 font-bold">Categoria</th>
                               <th className="px-4 py-3 font-bold">Valor</th>
                               <th className="px-4 py-3 font-bold rounded-tr-xl">Status</th>
                           </tr>
                       </thead>
                       <tbody>
                           <tr>
                               <td colSpan={5} className="text-center py-8 text-slate-600">Nenhuma transação recente.</td>
                           </tr>
                       </tbody>
                   </table>
               </div>
            </div>
        </div>
    );
};
