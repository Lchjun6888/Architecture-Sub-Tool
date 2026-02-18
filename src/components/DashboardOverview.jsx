import React from 'react';
import {
    FileSpreadsheet,
    Layers,
    MousePointer2,
    TrendingUp,
    Zap,
    Clock,
    ArrowUpRight,
    Users,
    History
} from 'lucide-react';

const DashboardOverview = ({ onNav, user }) => {
    const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Architect';

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Greeting */}
            <div>
                <h2 className="text-3xl font-black dark:text-white tracking-tight">Welcome, {firstName} 👋</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Here's what's happening with your architecture sub-tools today.</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    icon={<FileSpreadsheet className="text-blue-500" />}
                    label="Files Processed"
                    value="0"
                    trend="-"
                />
                <StatCard
                    icon={<TrendingUp className="text-emerald-500" />}
                    label="Lines Split"
                    value="0"
                    trend="-"
                />
                <StatCard
                    icon={<Layers className="text-indigo-500" />}
                    label="PDF Comps"
                    value="0"
                    trend="-"
                />
                <StatCard
                    icon={<Zap className="text-amber-500" />}
                    label="Time Saved"
                    value="0h"
                    trend="-"
                />
            </div>

            {/* Content Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Tools */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-end">
                        <h3 className="text-xl font-black dark:text-white">Active Tools</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <ToolCard
                            title="ArchSub Split"
                            desc="Professional BOM & Schedule splitting."
                            icon={<FileSpreadsheet size={32} />}
                            color="blue"
                            onClick={() => onNav('excel')}
                        />
                        <ToolCard
                            title="PDF Compare"
                            desc="Blueprint revision analysis."
                            icon={<Layers size={32} />}
                            color="indigo"
                            onClick={() => onNav('pdf')}
                        />
                        <ToolCard
                            title="Daily Log"
                            desc="Professional site daily reporting."
                            icon={<History size={32} />}
                            color="orange"
                            onClick={() => onNav('daily')}
                        />
                        <ToolCard
                            title="Payroll & Tax"
                            desc="Attendance & automated taxes."
                            icon={<Users size={32} />}
                            color="emerald"
                            onClick={() => onNav('payroll')}
                        />
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="space-y-6">
                    <h3 className="text-xl font-black dark:text-white">Recent Activity</h3>
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center">
                        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <History className="text-slate-300 dark:text-slate-600" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-bold mb-1">No recent activity</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Start your first task to see logs here.</p>

                        <button onClick={() => onNav('excel')} className="text-sm font-black text-blue-500 hover:text-blue-600 transition-colors">
                            Start First Task &rarr;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, trend }) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
        <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <span className="text-[10px] font-black px-2 py-1 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                {trend}
            </span>
        </div>
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-2xl font-black dark:text-white mt-1 uppercase leading-none">{value}</p>
    </div>
);

const ToolCard = ({ title, desc, icon, color, onClick }) => {
    const colorClasses = {
        blue: 'bg-blue-500/10 text-blue-500 hover:border-blue-500/50',
        indigo: 'bg-indigo-500/10 text-indigo-500 hover:border-indigo-500/50',
        emerald: 'bg-emerald-500/10 text-emerald-500 hover:border-emerald-500/50',
        orange: 'bg-orange-500/10 text-orange-500 hover:border-orange-500/50',
        amber: 'bg-amber-500/10 text-amber-500 hover:border-amber-500/50'
    };

    const currentClasses = colorClasses[color] || colorClasses.blue;

    return (
        <div
            onClick={onClick}
            className={`group relative bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 transition-all cursor-pointer overflow-hidden h-full flex flex-col items-start ${currentClasses.split(' ').pop()}`}
        >
            <div className={`p-4 rounded-2xl ${currentClasses.split(' ').slice(0, 2).join(' ')} mb-6 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <h4 className="text-xl font-black dark:text-white mb-2">{title}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">{desc}</p>
            <div className="mt-auto flex items-center gap-2 text-sm font-black text-blue-500">
                Open Tool <ArrowUpRight size={16} />
            </div>
        </div>
    );
};

const ActivityItem = ({ title, time, type }) => (
    <div className="flex items-start gap-4">
        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
        <div className="flex-1 min-w-0">
            <p className="text-sm font-bold dark:text-white truncate">{title}</p>
            <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">{type}</span>
                <span className="text-[10px] text-slate-300">•</span>
                <span className="text-[10px] text-slate-400 font-bold">{time}</span>
            </div>
        </div>
    </div>
);

export default DashboardOverview;
