import React, { useState } from 'react';
import { Star, Shield, Zap, Check, X, Plus } from 'lucide-react';

export const AdminPremium = () => {
    const [editingPlan, setEditingPlan] = useState<any | null>(null);

    const handleEditPlan = (planData: any) => {
        setEditingPlan(planData);
    };

    const handleSavePlan = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock save action
        setEditingPlan(null);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white italic">Vendas Premium (Planos e Cotas)</h1>
                    <p className="text-slate-400 mt-1">Gerencie produtos B2B (Academias, Personais) e B2C (Alunos).</p>
                </div>
                <button 
                  onClick={() => handleEditPlan({ title: '', price: '', type: 'Personal', features: [] })}
                  className="bg-lime-400 text-slate-900 px-6 py-3 rounded-xl font-bold uppercase text-sm tracking-wide hover:bg-lime-500 transition-colors flex items-center gap-2">
                    <Plus size={18} /> Criar Novo Plano
                </button>
            </div>

            <div className="space-y-12 mt-8">
                {/* Personais */}
                <section>
                    <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                        <Zap size={24} className="text-blue-400" />
                        <h2 className="text-2xl font-black text-white uppercase italic">Planos para Personais</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <PlanCard 
                            title="Plano Free"
                            price="R$ 0"
                            features={['Até 3 alunos ativos', '1 Academia parceira', 'Recursos básicos de treino']}
                            color="bg-slate-800"
                            textColor="text-white"
                            onEdit={() => handleEditPlan({ title: 'Plano Free', price: 'R$ 0', type: 'Personal', features: ['Até 3 alunos ativos', '1 Academia parceira', 'Recursos básicos de treino'] })}
                        />
                        <PlanCard 
                            title="Plano Starter"
                            price="R$ 49/mês"
                            features={['Até 15 alunos ativos', '1 Academia vinculada', 'Suporte padrão']}
                            color="bg-slate-700"
                            textColor="text-white"
                            onEdit={() => handleEditPlan({ title: 'Plano Starter', price: 'R$ 49/mês', type: 'Personal', features: ['Até 15 alunos ativos', '1 Academia vinculada', 'Suporte padrão'] })}
                        />
                        <PlanCard 
                            title="Plano Pro"
                            price="R$ 99/mês"
                            features={['Até 50 alunos ativos', 'Até 3 Academias vinculadas', 'Ferramentas de retenção']}
                            color="bg-blue-500"
                            textColor="text-white"
                            isPopular
                            onEdit={() => handleEditPlan({ title: 'Plano Pro', price: 'R$ 99/mês', type: 'Personal', features: ['Até 50 alunos ativos', 'Até 3 Academias vinculadas', 'Ferramentas de retenção'] })}
                        />
                        <PlanCard 
                            title="Plano Elite"
                            price="R$ 199/mês"
                            features={['Alunos ilimitados', 'Academias ilimitadas', 'Dashboard financeiro avançado', 'IA para treinos']}
                            color="bg-slate-800"
                            textColor="text-white"
                            onEdit={() => handleEditPlan({ title: 'Plano Elite', price: 'R$ 199/mês', type: 'Personal', features: ['Alunos ilimitados', 'Academias ilimitadas', 'Dashboard financeiro avançado', 'IA para treinos'] })}
                        />
                    </div>
                </section>

                {/* Academias */}
                <section>
                    <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                        <Shield size={24} className="text-purple-400" />
                        <h2 className="text-2xl font-black text-white uppercase italic">Cotas para Academias</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <PlanCard 
                            title="Plano Free"
                            price="R$ 0"
                            features={['Cadastro da academia', 'Até 3 personais vinculados', 'Dashboard básico', 'Sem recursos avançados']}
                            color="bg-slate-800"
                            textColor="text-white"
                            onEdit={() => handleEditPlan({ title: 'Plano Free', price: 'R$ 0', type: 'Academia', features: ['Cadastro da academia', 'Até 3 personais vinculados', 'Dashboard básico', 'Sem recursos avançados'] })}
                        />
                        <PlanCard 
                            title="Licença Unidade"
                            price="R$ 399/mês"
                            features={['1 Unidade (CNPJ único)', 'Até 10 personais parceiros', 'Dashboard de gestão', 'App branded (Lite)']}
                            color="bg-slate-700"
                            textColor="text-white"
                            onEdit={() => handleEditPlan({ title: 'Licença Unidade', price: 'R$ 399/mês', type: 'Academia', features: ['1 Unidade (CNPJ único)', 'Até 10 personais parceiros', 'Dashboard de gestão', 'App branded (Lite)'] })}
                        />
                        <PlanCard 
                            title="Licença Rede"
                            price="Sob Consulta"
                            features={['Múltiplas unidades', 'Personais ilimitados', 'Integração de pagamento', 'White Label completo']}
                            color="bg-purple-500"
                            textColor="text-white"
                            onEdit={() => handleEditPlan({ title: 'Licença Rede', price: 'Sob Consulta', type: 'Academia', features: ['Múltiplas unidades', 'Personais ilimitados', 'Integração de pagamento', 'White Label completo'] })}
                        />
                    </div>
                </section>

                {/* Alunos */}
                <section>
                    <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                        <Star size={24} className="text-lime-400" />
                        <h2 className="text-2xl font-black text-white uppercase italic">Cotas Básicas (Alunos Avulsos)</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <PlanCard 
                            title="Free"
                            price="R$ 0"
                            features={['Acesso aos treinos do personal', 'Check-in na academia']}
                            color="bg-slate-800"
                            textColor="text-white"
                            onEdit={() => handleEditPlan({ title: 'Free', price: 'R$ 0', type: 'Aluno', features: ['Acesso aos treinos do personal', 'Check-in na academia'] })}
                        />
                        <PlanCard 
                            title="GymPRO Premium"
                            price="R$ 29/mês"
                            features={['Vídeos detalhados de exercícios', 'Histórico completo de evolução', 'Análise de dieta IA (Básico)']}
                            color="bg-lime-400"
                            textColor="text-slate-900"
                            buttonColor="bg-slate-900 text-lime-400"
                            onEdit={() => handleEditPlan({ title: 'GymPRO Premium', price: 'R$ 29/mês', type: 'Aluno', features: ['Vídeos detalhados de exercícios', 'Histórico completo de evolução', 'Análise de dieta IA (Básico)'] })}
                        />
                    </div>
                </section>
            </div>

            {editingPlan && (
                <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
                    <div className="bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-slate-800 shrink-0">
                            <h2 className="text-xl font-black text-white uppercase italic">{editingPlan.title ? `Editar Plano: ${editingPlan.title}` : 'Novo Plano'}</h2>
                            <button onClick={() => setEditingPlan(null)} className="text-slate-400 hover:text-white"><X size={24} /></button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto no-scrollbar">
                            <form id="plan-form" onSubmit={handleSavePlan} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Nome do Plano</label>
                                        <input required type="text" defaultValue={editingPlan.title} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-lime-400" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Preço Mensal</label>
                                        <input required type="text" defaultValue={editingPlan.price} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-lime-400" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Tipo de Cliente (Público)</label>
                                        <select defaultValue={editingPlan.type} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-lime-400 appearance-none">
                                            <option value="Personal">Personal Trainer</option>
                                            <option value="Academia">Academia / Rede</option>
                                            <option value="Aluno">Aluno Avulso</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Limite de Vínculos (Alunos / Personais)</label>
                                        <input type="number" defaultValue="10" className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-lime-400" />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-2">Benefícios (Features)</label>
                                    <div className="space-y-2">
                                        {editingPlan.features.length > 0 ? editingPlan.features.map((feature: string, idx: number) => (
                                            <div key={idx} className="flex gap-2">
                                                <input type="text" defaultValue={feature} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-lime-400" />
                                                <button type="button" className="bg-red-500/10 text-red-500 p-2 rounded-xl hover:bg-red-500/20"><X size={18} /></button>
                                            </div>
                                        )) : (
                                            <div className="flex gap-2">
                                                <input type="text" placeholder="Adicionar benefício..." className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-lime-400" />
                                                <button type="button" className="bg-lime-400/10 text-lime-400 p-2 rounded-xl hover:bg-lime-400/20"><Plus size={18} /></button>
                                            </div>
                                        )}
                                        {editingPlan.features.length > 0 && (
                                            <button type="button" className="text-lime-400 text-xs font-bold uppercase mt-2 flex items-center gap-1 hover:text-lime-300">
                                                <Plus size={14} /> Adicionar Novo Benefício
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-slate-800 shrink-0 flex gap-4">
                            <button onClick={() => setEditingPlan(null)} className="w-1/3 bg-slate-800 text-white font-bold uppercase text-sm tracking-wider py-4 rounded-xl hover:bg-slate-700 transition-colors">
                                Cancelar
                            </button>
                            <button type="submit" form="plan-form" className="w-2/3 bg-lime-400 text-slate-900 font-black uppercase text-sm tracking-wider py-4 rounded-xl hover:bg-lime-500 transition-colors">
                                Salvar Plano
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const PlanCard = ({ title, price, features, color, textColor, buttonColor, isPopular, onEdit }: any) => (
    <div className={`${color} p-8 rounded-3xl relative flex flex-col`}>
        {isPopular && (
            <div className="absolute top-0 right-8 -translate-y-1/2 bg-lime-400 text-slate-900 text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-lg">
                Mais Vendido
            </div>
        )}
        <h3 className={`text-xl font-black uppercase mb-2 ${textColor}`}>{title}</h3>
        <p className={`text-4xl font-black tracking-tighter mb-6 ${textColor}`}>{price}</p>
        
        <ul className="space-y-4 mb-8 flex-1">
            {features.map((feature: string, idx: number) => (
                <li key={idx} className={`flex items-start gap-3 text-sm ${textColor} opacity-90 font-medium`}>
                    <Check size={18} className="mt-0.5 shrink-0" />
                    <span>{feature}</span>
                </li>
            ))}
        </ul>

        <button onClick={onEdit} className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-transform active:scale-95 ${buttonColor ? buttonColor : 'bg-white/10 hover:bg-white/20 text-white'}`}>
            Editar Plano
        </button>
    </div>
);
