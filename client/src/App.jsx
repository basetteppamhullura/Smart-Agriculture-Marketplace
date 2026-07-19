import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeLanguageProvider, useThemeLanguage } from './context/ThemeLanguageContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import WalletManager from './components/WalletManager';
import Chatbot from './components/Chatbot';

// Pages
import Home from './pages/Home';
import LoginRegister from './pages/LoginRegister';
import FarmerDashboard from './pages/FarmerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CommunityForum from './pages/CommunityForum';
import LogisticsHub from './pages/LogisticsHub';
import FinancialTools from './pages/FinancialTools';
import InfoHub from './pages/InfoHub';
import AiValuationPage from './pages/AiValuationPage';
import ReputationDashboard from './pages/ReputationDashboard';

function MainAppContent() {
  const { user } = useAuth();
  const { t } = useThemeLanguage();
  const [currentTab, setCurrentTab] = useState('home');
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [buyerDashboardAction, setBuyerDashboardAction] = useState(null);
  const [authInitialTab, setAuthInitialTab] = useState('login');
  const [authInitialRole, setAuthInitialRole] = useState('buyer');

  // Router matching active tab to page component
  const renderActivePage = () => {
    switch (currentTab) {
      case 'home':
        return (
          <Home 
            onChangeTab={(tab, payload) => {
              if (tab === 'dashboard' && payload) {
                setBuyerDashboardAction(payload);
              }
              if (tab === 'login' && payload) {
                setAuthInitialTab(payload.tab || 'login');
                setAuthInitialRole(payload.role || 'buyer');
              }
              setCurrentTab(tab);
            }} 
          />
        );
      case 'login':
        return (
          <LoginRegister 
            initialTab={authInitialTab}
            initialRole={authInitialRole}
            onAuthSuccess={() => setCurrentTab('dashboard')} 
          />
        );
      case 'dashboard':
        if (!user) return (
          <LoginRegister 
            initialTab={authInitialTab}
            initialRole={authInitialRole}
            onAuthSuccess={() => setCurrentTab('dashboard')} 
          />
        );
        if (user.role === 'farmer') return <FarmerDashboard />;
        if (user.role === 'buyer') return (
          <BuyerDashboard 
            actionPayload={buyerDashboardAction} 
            clearActionPayload={() => setBuyerDashboardAction(null)} 
          />
        );
        if (user.role === 'admin') return <AdminDashboard />;
        return <div style={{ padding: '20px' }}>Dashboard type not supported.</div>;
      case 'forum':
        return <CommunityForum />;
      case 'logistics':
        return <LogisticsHub />;
      case 'finance':
        return <FinancialTools />;
      case 'infohub':
        return <InfoHub />;
      case 'aivaluation':
        return <AiValuationPage />;
      case 'reputation':
        return <ReputationDashboard />;
      default:
        return <Home onChangeTab={setCurrentTab} />;
    }
  };

  return (
    <div className="app-container">
      {/* Top Navbar Header */}
      <Navbar 
        onOpenWallet={() => setIsWalletOpen(true)} 
        currentTab={currentTab} 
        onChangeTab={setCurrentTab} 
      />

      {/* Main Layout containing Sidebar and central content wrapper */}
      <div className="main-layout">
        {/* Render Sidebar only if user is logged in or checks features */}
        <Sidebar currentTab={currentTab} onChangeTab={setCurrentTab} />
        
        {/* Side space padding so absolute sidebar does not overlap contents */}
        <div className="sidebar-spacer"></div>

        {/* Dynamic page container */}
        <main className="content-container">
          {renderActivePage()}
        </main>
      </div>

      {/* Floating Chatbot */}
      <Chatbot />

      {/* Wallet Deposit/Withdraw Modal */}
      <WalletManager isOpen={isWalletOpen} onClose={() => setIsWalletOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeLanguageProvider>
        <MainAppContent />
      </ThemeLanguageProvider>
    </AuthProvider>
  );
}
