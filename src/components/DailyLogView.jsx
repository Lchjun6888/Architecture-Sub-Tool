import React, { useState, useEffect } from 'react';
import {
    Calendar, Users, HardHat, Activity,
    Tool, Target, Save, History,
    TrendingUp, CheckCircle2, AlertTriangle, Clock
} from 'lucide-react';
import { supabase } from '../supabaseClient';

const DailyLogView = () => {
    const [activeTab, setActiveTab] = useState('new');
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        units: 'Metric',
        safetyStd: 'Japanese Law / 5S',
        focus: 'KY (Hazard Pred.) / Discipline',
        safety: {
            ky_activity: 'Done',
            morning_exercise: '8:00 AM',
            vital_signs: 'All staff normal'
        },
        manpower: {
            local_staff: 45,
            managers: 4,
            total: 49
        },
        progress: {
            main_work: 'Structural steel welding',
            cleaning: '4:30 - 5:00 PM (5S Activity)'
        },
        equipment: {
            list: [
                { name: 'Boom Lift', status: 'Pre-op check OK' },
                { name: 'Welding Machine', status: 'Safety tag valid' }
            ]
        },
        targets: {
            total_days: 120,
            current_day: 65,
            target_desc: 'Floor 2 welding 80%',
            actual_desc: '85% Completed (Ahead)'
        },
        signature: ''
    });

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const { data, error } = await supabase
                .from('daily_logs')
                .select('*')
                .order('date', { ascending: false });

            if (data) setHistory(data);
            if (error && error.code !== 'PGRST116') {
                console.log('Supabase check:', error.message);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('daily_logs')
                .insert([{
                    date: formData.date,
                    content: formData, // Store full object for flexibility
                    total_days: formData.targets.total_days,
                    current_day: formData.targets.current_day
                }]);

            if (error) throw error;

            alert('Daily Log Saved to Supabase!');
            fetchHistory();
            setActiveTab('history');
        } catch (err) {
            console.error(err);
            alert('Error saving to Supabase. Make sure the table "daily_logs" exists.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white flex items-center gap-4">
                        <History className="text-blue-500" /> Daily Technical Log
                    </h2>
                    <p className="text-slate-500 font-medium mt-2">Professional construction recording system</p>
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl shadow-inner">
                    <button
                        onClick={() => setActiveTab('new')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'new' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-md scale-105' : 'text-slate-500'}`}
                    >
                        NEW LOG
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'history' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-md scale-105' : 'text-slate-500'}`}
                    >
                        HISTORY
                    </button>
                </div>
            </div>

            {activeTab === 'new' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="glass p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900 overflow-hidden relative">
                            {/* Watermark/Decoration */}
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                                <HardHat size={200} />
                            </div>

                            <div className="relative z-10 space-y-10">
                                {/* Top Banner */}
                                <div className="text-center border-b-2 border-slate-900 dark:border-slate-100 pb-4">
                                    <h1 className="text-2xl font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Japan CONSTRUCTION DAILY LOG</h1>
                                </div>

                                {/* Header Info Grid */}
                                <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-sm">
                                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                                        <label className="font-black text-slate-400 uppercase text-[10px]">Units</label>
                                        <input
                                            value={formData.units}
                                            onChange={e => setFormData({ ...formData, units: e.target.value })}
                                            className="text-right font-bold bg-transparent border-none focus:ring-0 w-1/2 p-0"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                                        <label className="font-black text-slate-400 uppercase text-[10px]">Date</label>
                                        <input
                                            type="date"
                                            value={formData.date}
                                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                                            className="text-right font-bold bg-transparent border-none focus:ring-0 p-0"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 col-span-2">
                                        <label className="font-black text-slate-400 uppercase text-[10px]">Safety Std</label>
                                        <input
                                            value={formData.safetyStd}
                                            onChange={e => setFormData({ ...formData, safetyStd: e.target.value })}
                                            className="text-right font-bold bg-transparent border-none focus:ring-0 w-3/4 p-0"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 col-span-2">
                                        <label className="font-black text-slate-400 uppercase text-[10px]">Focus</label>
                                        <input
                                            value={formData.focus}
                                            onChange={e => setFormData({ ...formData, focus: e.target.value })}
                                            className="text-right font-bold bg-transparent border-none focus:ring-0 w-3/4 p-0"
                                        />
                                    </div>
                                </div>

                                {/* Section 1: Safety */}
                                <div className="space-y-4">
                                    <h3 className="bg-slate-100 dark:bg-slate-800 px-4 py-1.5 font-black text-xs uppercase tracking-tighter">1. SAFETY (KY/TBM)</h3>
                                    <div className="pl-4 space-y-2">
                                        {Object.entries(formData.safety).map(([key, val]) => (
                                            <div key={key} className="flex gap-2 text-sm items-center">
                                                <span className="text-slate-300">•</span>
                                                <span className="font-bold text-slate-600 dark:text-slate-400 min-w-[140px]">{key.replace('_', ' ').toUpperCase()}:</span>
                                                <input
                                                    value={val}
                                                    onChange={e => {
                                                        const newS = { ...formData.safety, [key]: e.target.value };
                                                        setFormData({ ...formData, safety: newS });
                                                    }}
                                                    className="flex-1 bg-transparent border-none focus:ring-0 p-0 font-medium italic"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Section 2: Manpower */}
                                <div className="space-y-4">
                                    <h3 className="bg-slate-100 dark:bg-slate-800 px-4 py-1.5 font-black text-xs uppercase tracking-tighter">2. MANPOWER (MAN-DAYS)</h3>
                                    <div className="pl-4 space-y-2">
                                        {Object.entries(formData.manpower).map(([key, val]) => (
                                            <div key={key} className="flex gap-2 text-sm items-center">
                                                <span className="text-slate-300">•</span>
                                                <span className="font-bold text-slate-600 dark:text-slate-400 min-w-[140px]">{key.replace('_', ' ').toUpperCase()}:</span>
                                                <input
                                                    type="number"
                                                    value={val}
                                                    onChange={e => {
                                                        const nm = { ...formData.manpower, [key]: parseInt(e.target.value) || 0 };
                                                        if (key !== 'total') {
                                                            nm.total = nm.local_staff + nm.managers;
                                                        }
                                                        setFormData({ ...formData, manpower: nm });
                                                    }}
                                                    className="flex-1 bg-transparent border-none focus:ring-0 p-0 font-medium italic"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Section 3: Work Progress */}
                                <div className="space-y-4">
                                    <h3 className="bg-slate-100 dark:bg-slate-800 px-4 py-1.5 font-black text-xs uppercase tracking-tighter">3. WORK PROGRESS</h3>
                                    <div className="pl-4 space-y-3">
                                        <div className="flex gap-2 text-sm">
                                            <span className="text-slate-300">•</span>
                                            <textarea
                                                value={formData.progress.main_work}
                                                onChange={e => setFormData({ ...formData, progress: { ...formData.progress, main_work: e.target.value } })}
                                                className="flex-1 bg-transparent border-none focus:ring-0 p-0 font-medium min-h-[50px] resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Signature and Date Footer */}
                                <div className="pt-10 border-t border-slate-100 dark:border-slate-800 flex justify-between items-end">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase">Project Manager Signature</label>
                                        <input
                                            placeholder="Sign here..."
                                            className="border-b border-slate-300 dark:border-slate-700 bg-transparent py-1 font-signature text-xl focus:outline-none focus:border-blue-500 w-64"
                                        />
                                    </div>
                                    <div className="text-right">
                                        <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Date Signed</label>
                                        <span className="font-bold text-lg">{formData.date}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Progress & Controls */}
                    <div className="space-y-6">
                        {/* Progress Tracker Card */}
                        <div className="glass p-6 rounded-[32px] border border-blue-100 dark:border-blue-900 shadow-xl bg-blue-50/30 dark:bg-blue-900/10">
                            <div className="flex items-center gap-3 mb-6">
                                <TrendingUp className="text-blue-500" />
                                <h4 className="font-black text-sm uppercase tracking-widest text-blue-900 dark:text-blue-300">Construction Stats</h4>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-blue-50 dark:border-blue-900/30">
                                        <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Period</div>
                                        <div className="flex items-baseline gap-1">
                                            <input
                                                type="number"
                                                value={formData.targets.total_days}
                                                onChange={e => setFormData({
                                                    ...formData,
                                                    targets: { ...formData.targets, total_days: parseInt(e.target.value) || 0 }
                                                })}
                                                className="text-2xl font-black bg-transparent w-full focus:outline-none"
                                            />
                                            <span className="text-xs font-bold text-slate-400">days</span>
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-blue-50 dark:border-blue-900/30">
                                        <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Current Day</div>
                                        <div className="flex items-baseline gap-1">
                                            <input
                                                type="number"
                                                value={formData.targets.current_day}
                                                onChange={e => setFormData({
                                                    ...formData,
                                                    targets: { ...formData.targets, current_day: parseInt(e.target.value) || 0 }
                                                })}
                                                className="text-2xl font-black text-blue-600 w-full focus:outline-none"
                                            />
                                            <span className="text-xs font-bold text-slate-400">days</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Visual Progress Bar */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                                        <span>Completion Rate</span>
                                        <span className="text-blue-600 font-black">{Math.round((formData.targets.current_day / formData.targets.total_days) * 100)}%</span>
                                    </div>
                                    <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden p-1 shadow-inner">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full shadow-lg transition-all duration-1000 ease-out"
                                            style={{ width: `${(formData.targets.current_day / formData.targets.total_days) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="bg-slate-900 text-white p-5 rounded-3xl space-y-3">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auto Summary</div>
                                    <p className="text-sm font-medium leading-relaxed opacity-90">
                                        {formData.targets.current_day >= formData.targets.total_days * 0.8
                                            ? "Project is in final stages. Conduct pre-completion inspection."
                                            : "Ongoing progress. Manpower allocation within expected bounds."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Save Action */}
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="w-full py-5 bg-blue-600 text-white rounded-[32px] font-black text-lg shadow-2xl shadow-blue-500/40 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? <Clock className="animate-spin" /> : <Save />}
                            {loading ? 'STORING LOG...' : 'SAVE DAILY LOG'}
                        </button>

                        <div className="flex gap-4">
                            <button className="flex-1 py-4 glass text-slate-600 dark:text-slate-300 rounded-3xl font-black text-xs uppercase flex items-center justify-center gap-2 hover:bg-white dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-800 shadow-sm">
                                <Target size={16} /> PRINT PDF
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {history.length > 0 ? (
                        history.map((item, idx) => (
                            <div key={item.id || idx} className="glass group p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 hover:border-blue-500 transition-all cursor-pointer shadow-lg bg-white dark:bg-slate-900">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                                        <Calendar size={22} />
                                    </div>
                                    <span className="text-[10px] font-black px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400">#LOG-{item.date.split('-')[1]}-{idx}</span>
                                </div>
                                <h4 className="text-lg font-black dark:text-white group-hover:text-blue-500 transition-colors">{item.date}</h4>
                                <p className="text-slate-500 text-xs font-medium mt-1 mb-6 truncate">
                                    {item.content?.progress?.main_work || 'No description available'}
                                </p>

                                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase">Manpower</div>
                                        <div className="text-sm font-bold">{item.content?.manpower?.total || 0} Total</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase">Progress</div>
                                        <div className="text-sm font-bold text-blue-600">Day {item.current_day} / {item.total_days}</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center glass rounded-[40px]">
                            <p className="text-slate-400 font-bold uppercase tracking-widest">No logs found in Supabase</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DailyLogView;
