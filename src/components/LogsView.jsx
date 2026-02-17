import React from 'react';
import {
    Clock,
    Construction,
    Zap,
    Settings
} from 'lucide-react';

const LogsView = () => {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in duration-700">
            {/* Animated Icon Container */}
            <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
                <div className="w-32 h-32 rounded-[40px] bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-2xl shadow-blue-500/40 relative transform hover:rotate-6 transition-transform cursor-pointer">
                    <Construction size={56} strokeWidth={1.5} className="animate-bounce" />
                </div>
                {/* Floaties */}
                <div className="absolute -top-4 -right-4 w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700 flex items-center justify-center text-blue-500 animate-spin-slow">
                    <Clock size={24} />
                </div>
            </div>

            <div className="max-w-md space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-widest">
                    Coming Soon
                </div>
                <h2 className="text-4xl font-black dark:text-white tracking-tighter leading-tight">
                    Daily Logs <br />
                    <span className="text-blue-500">Under Development</span>
                </h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    저희 팀이 더 완벽한 로그 시스템을 구축하고 있습니다. <br />
                    기존 작업 내역 조회 기능이 곧 활성화될 예정입니다.
                </p>
            </div>

            {/* Progress Visualization */}
            <div className="w-full max-w-sm space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Alpha Status</span>
                    <span>75% Complete</span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full shadow-lg shadow-blue-500/30"
                        style={{ width: '75%' }}
                    />
                </div>
            </div>

            <div className="pt-8">
                <button
                    disabled
                    className="px-8 py-3 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl font-bold cursor-not-allowed opacity-50"
                >
                    Notify Me when Finished
                </button>
            </div>
        </div>
    );
};

export default LogsView;
