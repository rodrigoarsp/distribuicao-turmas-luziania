import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import { Login } from './pages/Login';

// Componentes do Gestor
import { TeacherList } from './components/gestor/TeacherList';
import { ClassList } from './components/gestor/ClassList';
import { PontuationReview } from './components/gestor/PontuationReview';
import { ChoiceSession } from './components/gestor/ChoiceSession';
import { AtaGeneratorView } from './components/gestor/AtaGeneratorView';

// Componentes do Admin
import { SchoolManagement } from './components/admin/SchoolManagement';
import { RealTimeMonitor } from './components/admin/RealTimeMonitor';

// Componentes do Técnico
import { AuditLogs } from './components/tecnico/AuditLogs';
import { SystemOverview } from './components/tecnico/SystemOverview';

function MainLayout() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('professores');

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    // ------------------------------------------------------------------------
    // PERFIL GESTOR ESCOLAR
    // ------------------------------------------------------------------------
    if (user.perfil === 'gestor') {
      switch (activeTab) {
        case 'professores':
          return <TeacherList />;
        case 'turmas':
          return <ClassList />;
        case 'validacao':
          return <PontuationReview />;
        case 'escolha':
          return <ChoiceSession />;
        case 'ata':
          return <AtaGeneratorView />;
        default:
          return <TeacherList />;
      }
    }

    // ------------------------------------------------------------------------
    // PERFIL ADMINISTRADOR SME
    // ------------------------------------------------------------------------
    if (user.perfil === 'administrador') {
      switch (activeTab) {
        case 'escolas':
          return <SchoolManagement />;
        case 'monitoramento':
          return <RealTimeMonitor />;
        case 'todas_turmas':
          return <ClassList />;
        case 'todas_atas':
          return <AtaGeneratorView />;
        default:
          return <SchoolManagement />;
      }
    }

    // ------------------------------------------------------------------------
    // PERFIL TÉCNICO SME
    // ------------------------------------------------------------------------
    if (user.perfil === 'tecnico') {
      switch (activeTab) {
        case 'painel_geral':
          return <SystemOverview />;
        case 'gestao_completa':
          return <SchoolManagement />;
        case 'logs':
          return <AuditLogs />;
        default:
          return <SystemOverview />;
      }
    }

    return <TeacherList />;
  };

  return (
    <div className="min-h-screen bg-theme-main flex flex-col theme-transition">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-6 overflow-y-auto">{renderContent()}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <MainLayout />
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
