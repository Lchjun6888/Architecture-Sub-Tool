import React, { useState } from 'react'
import ExcelSplitter from './ExcelSplitter'
import LandingPage from './components/LandingPage'
import DashboardLayout from './components/DashboardLayout'
import PDFComparer from './components/PDFComparer'
import DashboardOverview from './components/DashboardOverview'
import SettingsView from './components/SettingsView'
import LogsView from './components/LogsView'
import DailyLogView from './components/DailyLogView'
import PayrollView from './components/PayrollView'

function App() {
  const [view, setView] = useState('landing'); // 'landing' | 'app'
  const [activeSubView, setActiveSubView] = useState('overview'); // 'excel' | 'pdf' | 'overview' | 'settings' | 'logs' | 'payroll' | 'daily'

  if (view === 'landing') {
    return <LandingPage onStart={() => setView('app')} />
  }

  return (
    <DashboardLayout
      onBack={() => setView('landing')}
      onNav={setActiveSubView}
      activeNav={activeSubView}
    >
      {activeSubView === 'overview' && <DashboardOverview onNav={setActiveSubView} />}
      {activeSubView === 'excel' && <ExcelSplitter />}
      {activeSubView === 'pdf' && <PDFComparer />}
      {activeSubView === 'logs' && <LogsView />}
      {activeSubView === 'payroll' && <PayrollView />}
      {activeSubView === 'daily' && <DailyLogView />}
      {activeSubView === 'settings' && <SettingsView />}
    </DashboardLayout>
  )
}

export default App
