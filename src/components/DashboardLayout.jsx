import React, { useState } from 'react';
import {
    LayoutDashboard,
    Scissors,
    Layers,
    Settings,
    History,
    LogOut,
    Bell,
    User,
    Search,
    Moon,
    Sun,
    Menu,
    X,
    Users,
    Construction
} from 'lucide-react';
import HelpGuide from './HelpGuide';

const DashboardLayout = ({ children, onBack, onNav, activeNav, onLogout }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleNavClick = (view) => {
        onNav(view);
        setIsSidebarOpen(false);
    };

    const handleLogoutClick = async () => {
        if (onLogout) {
            await onLogout();
        } else if (onBack) {
            onBack();
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans overflow-x-hidden">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 lg:hidden transition-all duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 w-72 h-full glass z-50 border-r border-white/20 dark:border-slate-800/50 flex flex-col p-6 transition-all duration-500 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Logo Section */}
                <div className="flex items-center gap-4 mb-10 px-2 group cursor-pointer" onClick={() => handleNavClick('overview')}>
                    <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                        <Construction size={28} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black dark:text-white tracking-tighter leading-none">ArchSub</h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Architecture Assistant</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1">
                    <NavItem icon={<LayoutDashboard size={20} />} label="Overview" onClick={() => handleNavClick('overview')} active={activeNav === 'overview'} />
                    <NavItem icon={<Scissors size={20} />} label="ArchSub Split" onClick={() => handleNavClick('excel')} active={activeNav === 'excel'} />
                    <NavItem icon={<Layers size={20} />} label="PDF Compare" onClick={() => handleNavClick('pdf')} active={activeNav === 'pdf'} />
                    <NavItem icon={<History size={20} />} label="Daily Technical Log" onClick={() => handleNavClick('daily')} active={activeNav === 'daily'} />
                    <NavItem icon={<Bell size={20} />} label="Activity History" onClick={() => handleNavClick('logs')} active={activeNav === 'logs'} />
                    <NavItem icon={<Users size={20} />} label="Attendance & Payroll" onClick={() => handleNavClick('payroll')} active={activeNav === 'payroll'} />
                    <NavItem icon={<Settings size={20} />} label="Settings" onClick={() => handleNavClick('settings')} active={activeNav === 'settings'} />
                </nav>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/50">
                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Current Plan</p>
                        <p className="text-sm font-black dark:text-white">ArchSub Pro</p>
                        <button
                            onClick={() => window.open('https://archisubtool.lemonsqueezy.com/checkout/buy/72c39d38-bbc2-427f-a48a-7c5ee4d9388d', '_blank')}
                            className="mt-3 w-full py-2 bg-blue-500 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-500/20 hover:bg-blue-600 transition-all"
                        >
                            Manage Plan
                        </button>
                    </div>

                    <button
                        onClick={handleLogoutClick}
                        className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl font-bold transition-all"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-72 min-w-0">
                {/* Top header */}
                <header className="h-20 glass sticky top-0 z-40 px-4 lg:px-10 flex justify-between items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        >
                            <Menu size={24} />
                        </button>
                        <div className="relative group max-w-md w-full hidden sm:block">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search functions..."
                                className="w-full pl-12 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-900 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 lg:gap-4">
                        <button className="w-10 h-10 hidden xs:flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-500 transition-all">
                            <Bell size={20} />
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-500 transition-all">
                            <Sun size={20} />
                        </button>
                        <div className="h-10 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1 lg:mx-2" />
                        <div className="flex items-center gap-3 pl-2 group cursor-pointer">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-black dark:text-white group-hover:text-blue-500 transition-colors">Jay Admin</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest whitespace-nowrap">Admin</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 group-hover:border-blue-500 transition-all">
                                <User size={24} className="text-slate-400" />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
                    {children}
                </div>
                <HelpGuide />
            </main>
        </div>
    );
};

const NavItem = ({ icon, label, active = false, onClick }) => (
    <div
        onClick={onClick}
        className={`
        flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all cursor-pointer group
        ${active
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                : 'text-slate-500 hover:text-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800'}
    `}>
        <div className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'} transition-all shrink-0`}>
            {icon}
        </div>
        <span className="truncate">{label}</span>
    </div>
);

export default DashboardLayout;

