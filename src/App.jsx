import React from 'react';
import { CaseProvider, useCaseContext } from './context/CaseContext';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { CasesPage } from './pages/CasesPage';
import { EvidencePage } from './pages/EvidencePage';
import { NetworkExplorerPage } from './pages/NetworkExplorerPage';
import { ConnectionFinderPage } from './pages/ConnectionFinderPage';
import { AiAssistantPage } from './pages/AiAssistantPage';

const AppContent = () => {
  const { activeTab } = useCaseContext();

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'cases':
        return <CasesPage />;
      case 'evidence':
        return <EvidencePage />;
      case 'network':
        return <NetworkExplorerPage />;
      case 'finder':
        return <ConnectionFinderPage />;
      case 'assistant':
        return <AiAssistantPage />;
      case 'dashboard':
      default:
        return <DashboardPage />;
    }
  };

  return <Layout>{renderActiveTab()}</Layout>;
};

export default function App() {
  return (
    <CaseProvider>
      <AppContent />
    </CaseProvider>
  );
}
