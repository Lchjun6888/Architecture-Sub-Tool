import React, { useState, useEffect } from 'react';
import {
    Calendar, Users, HardHat, Activity,
    Target, Save, History,
    TrendingUp, CheckCircle2, AlertTriangle, Clock,
    Plus, Trash2, ChevronDown
} from 'lucide-react';
// Supabase 연동은 나중에 추가 예정
// import { supabase } from '../supabaseClient';

// Country config - safety standards, labels
const COUNTRIES = {
    japan: {
        label: 'Japan',
        flag: '🇯🇵',
        title: 'JAPAN CONSTRUCTION DAILY LOG',
        safetyStd: 'Japanese Law / 5S',
        focus: 'KY (Hazard Pred.) / Discipline'
    },
    korea: {
        label: 'Korea',
        flag: '🇰🇷',
        title: '대한민국 건설 일일 로그',
        safetyStd: '산업안전보건법 / 5S',
        focus: 'TBM (위험예지활동) / 안전수칙'
    },
    usa: {
        label: 'USA',
        flag: '🇺🇸',
        title: 'USA CONSTRUCTION DAILY LOG',
        safetyStd: 'OSHA 29 CFR 1926',
        focus: 'Toolbox Talk / PPE Compliance'
    },
    vietnam: {
        label: 'Vietnam',
        flag: '🇻🇳',
        title: 'VIETNAM CONSTRUCTION DAILY LOG',
        safetyStd: 'Vietnamese OHS Law / 5S',
        focus: 'Safety Briefing / Discipline'
    },
    uae: {
        label: 'UAE',
        flag: '🇦🇪',
        title: 'UAE CONSTRUCTION DAILY LOG',
        safetyStd: 'OSHAD / Abu Dhabi Code',
        focus: 'PTW / Heat Stress Protocol'
    },
    singapore: {
        label: 'Singapore',
        flag: '🇸🇬',
        title: 'SINGAPORE CONSTRUCTION DAILY LOG',
        safetyStd: 'WSH Act / SS 506',
        focus: 'Risk Assessment / Toolbox Talk'
    }
};

const STATUS_OPTIONS = [
    { value: 'not_started', label: 'NOT STARTED', color: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' },
    { value: 'in_progress', label: 'IN PROGRESS', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' },
    { value: 'completed', label: 'COMPLETED', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' },
    { value: 'delayed', label: 'DELAYED', color: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' }
];

const DailyLogView = () => {
    const [activeTab, setActiveTab] = useState('new');
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [countryOpen, setCountryOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        country: 'japan',
        units: 'Metric',
        safetyStd: COUNTRIES.japan.safetyStd,
        focus: COUNTRIES.japan.focus,
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
        tasks: [
            { id: 1, name: 'Foundation Rebar Installation', percent: 65, status: 'in_progress' },
            { id: 2, name: 'Concrete Pouring - Block A', percent: 100, status: 'completed' }
        ],
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
        fieldNotes: '',
        signature: ''
    });

    useEffect(() => {
        fetchHistory();
    }, []);

    // Auto-calculate task % based on day ratio when current_day changes
    const autoFillPercent = () => {
        const { total_days, current_day } = formData.targets;
        if (total_days <= 0) return;
        const ratio = Math.min((current_day / total_days) * 100, 100);
        const updatedTasks = formData.tasks.map(t => {
            if (t.status === 'completed') return t;
            const newPercent = Math.min(Math.round(ratio), 100);
            return {
                ...t,
                percent: newPercent,
                status: newPercent >= 100 ? 'completed' : t.status === 'not_started' && newPercent > 0 ? 'in_progress' : t.status
            };
        });
        setFormData(prev => ({ ...prev, tasks: updatedTasks }));
    };

    const handleCountryChange = (code) => {
        const c = COUNTRIES[code];
        setFormData(prev => ({
            ...prev,
            country: code,
            safetyStd: c.safetyStd,
            focus: c.focus
        }));
        setCountryOpen(false);
    };

    const addTask = () => {
        const newId = Date.now();
        setFormData(prev => ({
            ...prev,
            tasks: [...prev.tasks, { id: newId, name: '', percent: 0, status: 'not_started' }]
        }));
    };

    const removeTask = (id) => {
        setFormData(prev => ({
            ...prev,
            tasks: prev.tasks.filter(t => t.id !== id)
        }));
    };

    const updateTask = (id, field, value) => {
        setFormData(prev => ({
            ...prev,
            tasks: prev.tasks.map(t => {
                if (t.id !== id) return t;
                const updated = { ...t, [field]: value };
                // Auto-set status based on percent
                if (field === 'percent') {
                    const p = parseInt(value) || 0;
                    updated.percent = Math.max(0, Math.min(100, p));
                    if (updated.percent >= 100) updated.status = 'completed';
                    else if (updated.percent > 0 && updated.status === 'not_started') updated.status = 'in_progress';
                }
                if (field === 'status' && value === 'completed') updated.percent = 100;
                return updated;
            })
        }));
    };

    const fetchHistory = () => {
        try {
            const saved = localStorage.getItem('daily_logs');
            if (saved) setHistory(JSON.parse(saved));
        } catch (err) {
            console.error(err);
        }
    };

    const handleSave = () => {
        setLoading(true);
        try {
            const newEntry = {
                id: Date.now(),
                date: formData.date,
                content: formData,
                total_days: formData.targets.total_days,
                current_day: formData.targets.current_day
            };
            const existing = JSON.parse(localStorage.getItem('daily_logs') || '[]');
            const updated = [newEntry, ...existing];
            localStorage.setItem('daily_logs', JSON.stringify(updated));

            alert('Daily Log Saved!');
            setHistory(updated);
            setActiveTab('history');
        } catch (err) {
            console.error(err);
            alert('Error saving log.');
        } finally {
            setLoading(false);
        }
    };

    const currentCountry = COUNTRIES[formData.country] || COUNTRIES.japan;
    const completionRate = formData.targets.total_days > 0 ? Math.round((formData.targets.current_day / formData.targets.total_days) * 100) : 0;
    const avgTaskPercent = formData.tasks.length > 0 ? Math.round(formData.tasks.reduce((sum, t) => sum + t.percent, 0) / formData.tasks.length) : 0;

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white flex items-center gap-4">
                        <History className="text-blue-500" /> Daily Technical Log
                    </h2>
                    <p className="text-slate-500 font-medium mt-2">Record on-site activities, equipment usage, and progress.</p>
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
                <>
                    {/* ═══════ TOP INFO BAR ═══════ */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Date */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 shrink-0">
                                <Calendar size={22} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Log Date</div>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    className="font-bold text-lg bg-transparent border-none focus:ring-0 p-0 w-full dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Country Selector */}
                        <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Country / Standard</div>
                            <button
                                onClick={() => setCountryOpen(!countryOpen)}
                                className="flex items-center gap-3 w-full text-left group"
                            >
                                <span className="text-3xl leading-none">{currentCountry.flag}</span>
                                <span className="font-bold text-lg dark:text-white flex-1">{currentCountry.label}</span>
                                <ChevronDown size={18} className={`text-slate-400 transition-transform ${countryOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown */}
                            {countryOpen && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    {Object.entries(COUNTRIES).map(([code, c]) => (
                                        <button
                                            key={code}
                                            onClick={() => handleCountryChange(code)}
                                            className={`flex items-center gap-3 w-full px-5 py-3.5 text-left hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors ${formData.country === code ? 'bg-blue-50 dark:bg-slate-700' : ''}`}
                                        >
                                            <span className="text-2xl">{c.flag}</span>
                                            <div className="flex-1">
                                                <div className="font-bold dark:text-white">{c.label}</div>
                                                <div className="text-[10px] text-slate-400 font-medium">{c.safetyStd}</div>
                                            </div>
                                            {formData.country === code && <CheckCircle2 size={18} className="text-blue-500" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Total Personnel */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500 shrink-0">
                                <Users size={22} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Personnel</div>
                                <div className="font-bold text-lg dark:text-white">{formData.manpower.total} Pax</div>
                            </div>
                        </div>
                    </div>

                    {/* ═══════ MAIN CONTENT GRID ═══════ */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* LEFT: Main Form Area (2 cols) */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* ── TASK SUMMARY with progress bars ── */}
                            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                                <div className="flex justify-between items-center px-7 py-5 border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <HardHat size={20} className="text-blue-500" />
                                        <h3 className="font-black text-sm dark:text-white">Today's Task Summary</h3>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={autoFillPercent}
                                            title="Auto-fill % based on days elapsed"
                                            className="text-[10px] font-black text-slate-400 uppercase px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-blue-900/30 transition-colors"
                                        >
                                            Auto %
                                        </button>
                                        <button
                                            onClick={addTask}
                                            className="text-xs font-black text-blue-500 hover:text-blue-700 flex items-center gap-1 transition-colors"
                                        >
                                            <Plus size={16} /> New Task
                                        </button>
                                    </div>
                                </div>

                                <div className="p-7 space-y-5">
                                    {formData.tasks.length === 0 && (
                                        <div className="py-10 text-center text-slate-400 font-medium text-sm">
                                            No tasks yet. Click "+ New Task" to add one.
                                        </div>
                                    )}

                                    {formData.tasks.map((task) => {
                                        const statusObj = STATUS_OPTIONS.find(s => s.value === task.status) || STATUS_OPTIONS[0];
                                        const barColor = task.status === 'completed'
                                            ? 'bg-emerald-500'
                                            : task.status === 'delayed'
                                                ? 'bg-red-500'
                                                : 'bg-blue-500';
                                        return (
                                            <div key={task.id} className="group">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <input
                                                        value={task.name}
                                                        onChange={e => updateTask(task.id, 'name', e.target.value)}
                                                        placeholder="Task name..."
                                                        className="flex-1 font-bold text-sm bg-transparent border-none focus:ring-0 p-0 dark:text-white placeholder:text-slate-300"
                                                    />
                                                    <button
                                                        onClick={() => removeTask(task.id)}
                                                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all p-1"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    {/* Progress Bar */}
                                                    <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                                        <div
                                                            className={`h-full ${barColor} rounded-full transition-all duration-500 ease-out`}
                                                            style={{ width: `${task.percent}%` }}
                                                        />
                                                    </div>

                                                    {/* Percent Input */}
                                                    <div className="flex items-center gap-0.5 min-w-[60px]">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={task.percent}
                                                            onChange={e => updateTask(task.id, 'percent', e.target.value)}
                                                            className="w-10 text-right text-xs font-black bg-transparent border-none focus:ring-0 p-0 dark:text-white"
                                                        />
                                                        <span className="text-xs text-slate-400 font-bold">%</span>
                                                    </div>

                                                    {/* Status Dropdown */}
                                                    <select
                                                        value={task.status}
                                                        onChange={e => updateTask(task.id, 'status', e.target.value)}
                                                        className={`text-[10px] font-black uppercase rounded-full px-3 py-1.5 border-none cursor-pointer focus:ring-2 focus:ring-blue-300 ${statusObj.color}`}
                                                    >
                                                        {STATUS_OPTIONS.map(s => (
                                                            <option key={s.value} value={s.value}>{s.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ── SAFETY & DAILY FIELD NOTES (side by side) ── */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Safety Section */}
                                <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                                    <div className="flex items-center gap-3 px-7 py-5 border-b border-slate-100 dark:border-slate-800">
                                        <AlertTriangle size={18} className="text-amber-500" />
                                        <h3 className="font-black text-sm dark:text-white">Safety (KY/TBM)</h3>
                                    </div>
                                    <div className="p-7 space-y-3">
                                        {Object.entries(formData.safety).map(([key, val]) => (
                                            <div key={key} className="flex gap-2 text-sm items-center">
                                                <span className="text-slate-300">•</span>
                                                <span className="font-bold text-slate-500 dark:text-slate-400 min-w-[110px] text-xs uppercase">{key.replace(/_/g, ' ')}:</span>
                                                <input
                                                    value={val}
                                                    onChange={e => {
                                                        const newS = { ...formData.safety, [key]: e.target.value };
                                                        setFormData({ ...formData, safety: newS });
                                                    }}
                                                    className="flex-1 bg-transparent border-none focus:ring-0 p-0 font-medium text-sm italic dark:text-white"
                                                />
                                            </div>
                                        ))}
                                        <div className="pt-3 mt-3 border-t border-slate-50 dark:border-slate-800">
                                            <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Standard</div>
                                            <div className="text-xs font-bold text-blue-600 dark:text-blue-400">{formData.safetyStd}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Daily Field Notes */}
                                <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                                    <div className="flex items-center gap-3 px-7 py-5 border-b border-slate-100 dark:border-slate-800">
                                        <Activity size={18} className="text-indigo-500" />
                                        <h3 className="font-black text-sm dark:text-white">Daily Field Notes</h3>
                                    </div>
                                    <div className="p-7">
                                        <textarea
                                            value={formData.fieldNotes}
                                            onChange={e => setFormData({ ...formData, fieldNotes: e.target.value })}
                                            placeholder="Describe special issues, accidents, or weather delays here..."
                                            className="w-full min-h-[140px] bg-transparent border-none focus:ring-0 p-0 text-sm font-medium resize-none dark:text-white placeholder:text-slate-300"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* ── SIGNATURE ── */}
                            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm p-7 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase">Project Manager Signature</label>
                                    <input
                                        value={formData.signature}
                                        onChange={e => setFormData({ ...formData, signature: e.target.value })}
                                        placeholder="Sign here..."
                                        className="border-b-2 border-slate-200 dark:border-slate-700 bg-transparent py-1 font-signature text-xl focus:outline-none focus:border-blue-500 w-64 dark:text-white"
                                    />
                                </div>
                                <div className="text-right">
                                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Date Signed</label>
                                    <span className="font-bold text-lg dark:text-white">{formData.date}</span>
                                </div>
                            </div>
                        </div>

                        {/* ═══════ RIGHT SIDEBAR ═══════ */}
                        <div className="space-y-6">
                            {/* Staffing Overview */}
                            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                                <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                                    <Users size={18} className="text-blue-500" />
                                    <h4 className="font-black text-sm dark:text-white">Staffing Overview</h4>
                                </div>
                                <div className="p-6 space-y-4">
                                    {Object.entries(formData.manpower).filter(([k]) => k !== 'total').map(([key, val]) => (
                                        <div key={key} className="flex items-center justify-between">
                                            <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => {
                                                        const nm = { ...formData.manpower, [key]: Math.max(0, val - 1) };
                                                        nm.total = nm.local_staff + nm.managers;
                                                        setFormData({ ...formData, manpower: nm });
                                                    }}
                                                    className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors text-lg font-bold"
                                                >−</button>
                                                <span className="w-10 text-center font-black dark:text-white">{val}</span>
                                                <button
                                                    onClick={() => {
                                                        const nm = { ...formData.manpower, [key]: val + 1 };
                                                        nm.total = nm.local_staff + nm.managers;
                                                        setFormData({ ...formData, manpower: nm });
                                                    }}
                                                    className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors text-lg font-bold"
                                                >+</button>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                        <span className="text-sm font-black text-slate-900 dark:text-white">Total</span>
                                        <span className="text-lg font-black text-blue-600">{formData.manpower.total}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Equipment Log */}
                            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <Tool size={18} className="text-orange-500" />
                                        <h4 className="font-black text-sm dark:text-white">Equipment Log</h4>
                                    </div>
                                    <button
                                        onClick={() => setFormData(prev => ({
                                            ...prev,
                                            equipment: {
                                                ...prev.equipment,
                                                list: [...prev.equipment.list, { name: '', status: 'Active' }]
                                            }
                                        }))}
                                        className="text-[10px] font-black text-orange-500 uppercase hover:text-orange-700 transition-colors"
                                    >
                                        ADD
                                    </button>
                                </div>
                                <div className="p-6 space-y-3">
                                    {formData.equipment.list.map((eq, idx) => (
                                        <div key={idx} className="flex items-center justify-between group">
                                            <div className="flex-1 min-w-0">
                                                <input
                                                    value={eq.name}
                                                    onChange={e => {
                                                        const list = [...formData.equipment.list];
                                                        list[idx] = { ...eq, name: e.target.value };
                                                        setFormData({ ...formData, equipment: { ...formData.equipment, list } });
                                                    }}
                                                    placeholder="Equipment name..."
                                                    className="font-bold text-sm bg-transparent border-none focus:ring-0 p-0 w-full dark:text-white placeholder:text-slate-300"
                                                />
                                                <input
                                                    value={eq.status}
                                                    onChange={e => {
                                                        const list = [...formData.equipment.list];
                                                        list[idx] = { ...eq, status: e.target.value };
                                                        setFormData({ ...formData, equipment: { ...formData.equipment, list } });
                                                    }}
                                                    className="text-xs text-emerald-500 font-medium bg-transparent border-none focus:ring-0 p-0 w-full"
                                                />
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const list = formData.equipment.list.filter((_, i) => i !== idx);
                                                    setFormData({ ...formData, equipment: { ...formData.equipment, list } });
                                                }}
                                                className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all p-1 ml-2"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Construction Progress Stats */}
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
                                                    className="text-2xl font-black bg-transparent w-full focus:outline-none dark:text-white"
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

                                    {/* Day Progress Bar */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                                            <span>Day Progress</span>
                                            <span className="text-blue-600 font-black">{completionRate}%</span>
                                        </div>
                                        <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden p-1 shadow-inner">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full shadow-lg transition-all duration-1000 ease-out"
                                                style={{ width: `${Math.min(completionRate, 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Task Progress Bar */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                                            <span>Avg Task Progress</span>
                                            <span className="text-emerald-600 font-black">{avgTaskPercent}%</span>
                                        </div>
                                        <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden p-1 shadow-inner">
                                            <div
                                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full shadow-lg transition-all duration-1000 ease-out"
                                                style={{ width: `${Math.min(avgTaskPercent, 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-slate-900 text-white p-5 rounded-3xl space-y-3">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auto Summary</div>
                                        <p className="text-sm font-medium leading-relaxed opacity-90">
                                            {completionRate >= 80
                                                ? "Project is in final stages. Conduct pre-completion inspection."
                                                : completionRate >= 50
                                                    ? "Project is past midpoint. Verify milestones and workforce scheduling."
                                                    : "Early-stage progress. Monitor ramp-up and resource allocation."}
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
                </>
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
                                    {item.content?.tasks?.[0]?.name || item.content?.progress?.main_work || 'No description available'}
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
