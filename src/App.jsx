import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import DashboardLayout from './components/DashboardLayout';
import ExcelSplitter from './ExcelSplitter';
import DashboardOverview from './components/DashboardOverview';

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

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial dark mode setup
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (!supabase) {
      console.warn('Supabase client not initialized. Check environment variables.');
      setLoading(false);
      return;
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) setIsLoggedIn(true);
      setLoading(false);
    }).catch(err => {
      console.error('Session check error:', err);
      setLoading(false);
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
      setLoading(false);
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
    setView('landing');
    setIsLoggedIn(false);
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
        onLogout={handleLogout}
        user={session?.user}
      >
        {view === 'dashboard' || view === 'overview' ? <DashboardOverview onNav={setView} user={session?.user} /> : null}
        {view === 'excel' ? <ExcelSplitter /> : null}
        {view === 'pdf' ? <PDFComparer /> : null}
        {view === 'daily' ? <DailyLogView user={session?.user} /> : null}

        {view === 'payroll' ? <PayrollView /> : null}
        {view === 'settings' ? <SettingsView user={session?.user} /> : null}
      </DashboardLayout>
    );
  }

  return <LandingPage onStart={handleStart} />;
}

export default App;
