import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import DashboardLayout from './components/DashboardLayout';
import ExcelSplitter from './ExcelSplitter';
import DashboardOverview from './components/DashboardOverview';

import PDFComparer from './components/PDFComparer';
import SettingsView from './components/SettingsView';
import DailyLogView from './components/DailyLogView';
import PayrollView from './components/PayrollView';

function App() {
  const [view, setView] = useState('landing');
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initial dark mode setup
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleStart = () => {
    setView('dashboard');
  };

  const handleLogout = () => {
    setView('landing');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-bold text-sm">Loading ArchSub...</p>
        </div>
      </div>
    );
  }

  if (view !== 'landing') {
    return (
      <DashboardLayout
        onBack={() => setView('landing')}
        activeNav={view === 'dashboard' ? 'overview' : view}
        onNav={setView}
        onLogout={handleLogout}
      >
        {view === 'dashboard' || view === 'overview' ? <DashboardOverview onNav={setView} /> : null}
        {view === 'excel' ? <ExcelSplitter /> : null}
        {view === 'pdf' ? <PDFComparer /> : null}
        {view === 'daily' ? <DailyLogView /> : null}
        {view === 'payroll' ? <PayrollView /> : null}
        {view === 'settings' ? <SettingsView /> : null}
      </DashboardLayout>
    );
  }

  return <LandingPage onStart={handleStart} />;
}

export default App;

