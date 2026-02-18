import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import DashboardLayout from './components/DashboardLayout';
import ExcelSplitter from './ExcelSplitter';
import DashboardOverview from './components/DashboardOverview';
import LogsView from './components/LogsView';
import PDFComparer from './components/PDFComparer';
import SettingsView from './components/SettingsView';
import DailyLogView from './components/DailyLogView';
import PayrollView from './components/PayrollView';
import Auth from './components/Auth';
import { supabase } from './supabaseClient';

function App() {
  const [session, setSession] = useState(null);
  const [view, setView] = useState('landing');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (!supabase) {
      console.warn('Supabase client not initialized. Check environment variables.');
      return;
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) setIsLoggedIn(true);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session) {
        setIsLoggedIn(true);
        // Force view change to dashboard on sign in to prevent getting stuck
        if (event === 'SIGNED_IN') {
          setView('dashboard');
        }
      } else {
        setIsLoggedIn(false);
        setView('landing');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleStart = () => {
    if (isLoggedIn) {
      setView('dashboard');
    } else {
      setView('auth');
    }
  };

  const handleAuthSuccess = () => {
    setView('dashboard');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (view === 'auth' && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <Auth onAuthSuccess={handleAuthSuccess} />
      </div>
    );
  }

  if (isLoggedIn && view !== 'landing') {
    return (
      <DashboardLayout
        onBack={() => setView('landing')}
        activeNav={view === 'dashboard' ? 'overview' : view}
        onNav={setView}
      >
        {view === 'dashboard' || view === 'overview' ? <DashboardOverview onNav={setView} /> : null}
        {view === 'excel' ? <ExcelSplitter /> : null}
        {view === 'pdf' ? <PDFComparer /> : null}
        {view === 'daily' ? <DailyLogView /> : null}
        {view === 'logs' ? <LogsView /> : null}
        {view === 'payroll' ? <PayrollView /> : null}
        {view === 'settings' ? <SettingsView /> : null}
      </DashboardLayout>
    );
  }

  return <LandingPage onStart={handleStart} />;
}

export default App;
