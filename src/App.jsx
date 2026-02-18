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
  const [loading, setLoading] = useState(true); // Prevent blank screen during session check

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        setIsLoggedIn(true);
        setView('dashboard');
      }
      setLoading(false);
    });

    // Listen for auth state changes (handles email verification callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session) {
        setIsLoggedIn(true);
        // Auto-redirect to dashboard after email verification or sign-in
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

  // Show spinner while checking session to avoid blank screen
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Loading ArchSub...</p>
        </div>
      </div>
    );
  }

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
