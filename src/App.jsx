import React, { useState } from 'react'
import ExcelSplitter from './ExcelSplitter'
import LandingPage from './components/LandingPage'
import DashboardLayout from './components/DashboardLayout'
import PDFComparer from './components/PDFComparer'

function App() {
  const [view, setView] = useState('landing'); // 'landing' | 'app'
  const [activeSubView, setActiveSubView] = useState('excel'); // 'excel' | 'pdf' | 'overview'

  if (view === 'landing') {
    return <LandingPage onStart={() => setView('app')} />
  }

  return (
    <DashboardLayout
      onBack={() => setView('landing')}
      onNav={setActiveSubView}
      activeNav={activeSubView}
    >
      {activeSubView === 'excel' && <ExcelSplitter />}
      {activeSubView === 'pdf' && <PDFComparer />}
      {activeSubView === 'overview' && (
        <div className="p-10 text-center text-slate-400 italic">Dashboard Overview Content Coming Soon</div>
      )}
    </DashboardLayout>
  )
}

export default App
