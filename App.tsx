
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './src/auth/AuthContext';
import { Layout } from './src/components/Layout';
import { Login } from './src/pages/Login';
import { AdminDashboard } from './src/pages/AdminDashboard';
import { AdminAcademias } from './src/pages/admin/AdminAcademias';
import { AdminPersonals } from './src/pages/admin/AdminPersonals';
import { AdminAlunos } from './src/pages/admin/AdminAlunos';
import { AdminFinanceiro } from './src/pages/admin/AdminFinanceiro';
import { AdminPremium } from './src/pages/admin/AdminPremium';
import { PersonalDashboard } from './src/pages/PersonalDashboard';
import { StudentDashboard } from './src/pages/StudentDashboard';
import { ConfigPerfil } from './src/pages/ConfigPerfil';
import { EstatisticasGerais } from './src/pages/EstatisticasGerais';
import { AjustesGerais } from './src/pages/AjustesGerais';

import { GymDashboard } from './src/pages/GymDashboard';

const RoleBasedDashboard = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  
  switch (user.role) {
    case 'admin': return <AdminDashboard />;
    case 'adm_academia': return <GymDashboard />;
    case 'personal': return <PersonalDashboard />;
    case 'aluno': return <StudentDashboard />;
    default: return <Navigate to="/login" />;
  }
};

const AdminGlobalRoute = ({ component: Component }: { component: React.ElementType }) => {
  const { user } = useAuth();
  if (user?.role === 'admin') {
    return <Component />;
  }
  return <Navigate to="/" />;
};

const AdmAcademiaRoute = ({ component: Component }: { component: React.ElementType }) => {
  const { user } = useAuth();
  if (user?.role === 'admin' || user?.role === 'adm_academia') {
    return <Component />;
  }
  return <Navigate to="/" />;
};

const PersonalRoute = ({ component: Component }: { component: React.ElementType }) => {
  const { user } = useAuth();
  if (user?.role === 'admin' || user?.role === 'adm_academia' || user?.role === 'personal') {
    return <Component />;
  }
  return <Navigate to="/" />;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const RoleBasedAlunos = () => {
  const { user } = useAuth();
  if (user?.role === 'admin') return <AdminAlunos />;
  if (user?.role === 'adm_academia') return <GymDashboard />;
  return <Navigate to="/" />;
};

const RoleBasedPersonais = () => {
  const { user } = useAuth();
  if (user?.role === 'admin') return <AdminPersonals />;
  if (user?.role === 'adm_academia') return <GymDashboard />;
  return <Navigate to="/" />;
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<RoleBasedDashboard />} />
            {/* Specific Admin Routes (Global only) */}
            <Route path="/academias" element={<AdminGlobalRoute component={AdminAcademias} />} />
            <Route path="/premium" element={<AdminGlobalRoute component={AdminPremium} />} />

            {/* Admin Academia & Global Admin Routes */}
            <Route path="/personals" element={<RoleBasedPersonais />} />
            <Route path="/alunos" element={<RoleBasedAlunos />} />
            <Route path="/financeiro" element={<AdmAcademiaRoute component={AdminFinanceiro} />} />

            {/* General Routes */}
            <Route path="/meus-alunos" element={<PersonalRoute component={RoleBasedDashboard} />} />
            <Route path="/treinos" element={<RoleBasedDashboard />} />
            <Route path="/perfil" element={<ConfigPerfil />} />
            <Route path="/estatisticas" element={<AdmAcademiaRoute component={EstatisticasGerais} />} />
            <Route path="/ajustes" element={<AjustesGerais />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;

