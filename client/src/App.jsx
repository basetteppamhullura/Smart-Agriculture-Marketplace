import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
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
import LogisticsHub from './pages/LogisticsHub';
import FinancialTools from './pages/FinancialTools';
import InfoHub from './pages/InfoHub';
import AiValuationPage from './pages/AiValuationPage';
import ReputationDashboard from './pages/ReputationDashboard';
import BuyerFeaturesPage from './pages/BuyerFeaturesPage';
import FarmerFeaturesPage from './pages/FarmerFeaturesPage';
import BuyerAuthPage from './pages/BuyerAuthPage';
import FarmerAuthPage from './pages/FarmerAuthPage';

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
    // Auth redirect helper for protected routes
    const renderProtected = (Component, roleRequirement = null) => {
      if (!user) {
        return (
          <LoginRegister 
            initialTab={authInitialTab}
            initialRole={authInitialRole}
            onAuthSuccess={() => setCurrentTab('dashboard')} 
          />
        );
      }
      if (roleRequirement && user.role !== roleRequirement && user.role !== 'admin') {
        return (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <h2>Access Restricted</h2>
            <p>This page is intended for {roleRequirement} accounts.</p>
            <button className="btn btn-3d-primary" onClick={() => setCurrentTab('dashboard')}>
              Return to My Dashboard
            </button>
          </div>
        );
      }
      return Component;
    };

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
        if (user) return renderProtected(user.role === 'farmer' ? <FarmerDashboard /> : <BuyerDashboard />);
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
        if (user.role === 'farmer') return <FarmerDashboard onChangeTab={setCurrentTab} />;
        if (user.role === 'buyer') return (
          <BuyerDashboard 
            actionPayload={buyerDashboardAction} 
            clearActionPayload={() => setBuyerDashboardAction(null)} 
            onChangeTab={setCurrentTab}
          />
        );
        if (user.role === 'admin') return <AdminDashboard />;
        return <div style={{ padding: '20px' }}>Dashboard type not supported.</div>;
      case 'logistics':
        return renderProtected(<LogisticsHub />);
      case 'finance':
        return renderProtected(<FinancialTools />);
      case 'infohub':
        return renderProtected(<InfoHub />);
      case 'aivaluation':
        return renderProtected(<AiValuationPage />);
      case 'reputation':
        return renderProtected(<ReputationDashboard />);
      case 'buyer-auth':
        if (user) return renderProtected(<BuyerDashboard actionPayload={buyerDashboardAction} clearActionPayload={() => setBuyerDashboardAction(null)} onChangeTab={setCurrentTab} />);
        return (
          <BuyerAuthPage 
            onChangeTab={setCurrentTab}
            onAuthSuccess={() => setCurrentTab('dashboard')} 
          />
        );
      case 'farmer-auth':
        if (user) return renderProtected(<FarmerDashboard onChangeTab={setCurrentTab} />);
        return (
          <FarmerAuthPage 
            onChangeTab={setCurrentTab}
            onAuthSuccess={() => setCurrentTab('dashboard')} 
          />
        );
      case 'buyer-features':
        return renderProtected(
          <BuyerFeaturesPage 
            onChangeTab={(tab, payload) => {
              if (tab === 'login' && payload) {
                setAuthInitialTab(payload.tab || 'login');
                setAuthInitialRole(payload.role || 'buyer');
              }
              setCurrentTab(tab);
            }} 
          />
        );
      case 'farmer-features':
        return renderProtected(
          <FarmerFeaturesPage 
            onChangeTab={(tab, payload) => {
              if (tab === 'login' && payload) {
                setAuthInitialTab(payload.tab || 'login');
                setAuthInitialRole(payload.role || 'farmer');
              }
              setCurrentTab(tab);
            }} 
          />
        );
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

      {/* Main Layout containing central content wrapper */}
      <div className="main-layout">
        {/* Dynamic page container */}
        <main className="content-container" style={{ padding: 0 }}>
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
      <SocketProvider>
        <ThemeLanguageProvider>
          <MainAppContent />
        </ThemeLanguageProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
