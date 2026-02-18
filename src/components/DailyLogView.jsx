import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
    Calendar, Users, HardHat, Activity,
    Target, Save, History, Search,
    TrendingUp, CheckCircle2, AlertTriangle, Clock,
    Plus, Trash2, ChevronDown, Wrench,
    Cloud, Sun, MapPin, Droplets, Wind, Edit3, X
} from 'lucide-react';

const COUNTRIES = {
    japan: { label: 'Japan', flag: '🇯🇵', safetyStd: 'Japanese Law / 5S', focus: 'KY (Hazard Pred.) / Discipline' },
    korea: { label: 'Korea', flag: '🇰🇷', safetyStd: '산업안전보건법 / 5S', focus: 'TBM (위험예지활동) / 안전수칙' },
    usa: { label: 'USA', flag: '🇺🇸', safetyStd: 'OSHA 29 CFR 1926', focus: 'Toolbox Talk / PPE Compliance' },
    vietnam: { label: 'Vietnam', flag: '🇻🇳', safetyStd: 'Vietnamese OHS Law / 5S', focus: 'Safety Briefing / Discipline' },
    uae: { label: 'UAE', flag: '🇦🇪', safetyStd: 'OSHAD / Abu Dhabi Code', focus: 'PTW / Heat Stress Protocol' },
    singapore: { label: 'Singapore', flag: '🇸🇬', safetyStd: 'WSH Act / SS 506', focus: 'Risk Assessment / Toolbox Talk' }
};

const STATUS_OPTIONS = [
    { value: 'not_started', label: 'NOT STARTED', color: 'bg-slate-100 text-slate-500' },
    { value: 'in_progress', label: 'IN PROGRESS', color: 'bg-blue-100 text-blue-600' },
    { value: 'completed', label: 'COMPLETED', color: 'bg-emerald-100 text-emerald-600' },
    { value: 'delayed', label: 'DELAYED', color: 'bg-red-100 text-red-600' }
];

const DailyLogView = ({ user }) => {
    const [activeTab, setActiveTab] = useState('new');
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [countryOpen, setCountryOpen] = useState(false);

    // Weather State
    const [weather, setWeather] = useState({
        temp: '--', condition: 'Sunny', wind: '--', city: 'Seoul', loading: false
    });
    const [weatherSearch, setWeatherSearch] = useState('');
    const [showCitySearch, setShowCitySearch] = useState(false);

    // Main Form Data
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        country: 'japan',
        safetyStd: COUNTRIES.japan.safetyStd,
        safety: { ky_activity: 'Done', morning_exercise: '8:00 AM', vital_signs: 'All staff normal' },

        // Staffing: Array for dynamic addition
        manpower: [
            { id: 1, role: 'Manager', count: 2 },
            { id: 2, role: 'Engineer', count: 4 },
            { id: 3, role: 'Skilled Labor', count: 15 },
            { id: 4, role: 'Unskilled Labor', count: 20 },
        ],

        // Tasks: with Start/End date
        tasks: [
            { id: 1, name: 'Foundation Rebar', startDate: new Date().toISOString().split('T')[0], endDate: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0], percent: 0, status: 'in_progress' }
        ],

        // Equipment: with count
        equipment: [
            { id: 1, name: 'Boom Lift', count: 2, status: 'Active' },
            { id: 2, name: 'Welding Machine', count: 5, status: 'Checked' }
        ],

        targets: {
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0]
        },
        fieldNotes: '',
        signature: ''
    });

    // --- Init & History ---
    useEffect(() => {
        loadHistory();
    }, [user]);

    const loadHistory = async () => {
        try {
            if (user) {
                const { data, error } = await supabase
                    .from('daily_logs')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('date', { ascending: false });

                if (error) throw error;
                setHistory(data || []);
            } else {
                const saved = localStorage.getItem('daily_logs');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    // Filter out invalid entries
                    const validHistory = Array.isArray(parsed) ? parsed.filter(item => item && typeof item === 'object' && item.id) : [];
                    setHistory(validHistory);
                } else {
                    setHistory([]);
                }
            }
        } catch (e) {
            console.error("Failed to load history", e);
            // Fallback to local storage on error? Maybe not to avoid confusion.
            // But let's keep the local storage read just in case of network error ONLY if we want robust offline support.
            // For now, simple error handling.
            if (!user) setHistory([]);
        }
    };

    // Initialize New Log (Cumulative logic)
    const handleNewLog = () => {
        setEditingId(null);
        setActiveTab('new');

        // Load latest log or default
        const latest = history[0];
        if (latest && latest.content) {
            setFormData({
                ...latest.content,
                date: new Date().toISOString().split('T')[0], // Reset date to today
                tasks: Array.isArray(latest.content.tasks) ? latest.content.tasks.map(t => ({ ...t })) : [], // Copy tasks safely
                // Keep project dates
                targets: {
                    startDate: latest.content.targets?.startDate || new Date().toISOString().split('T')[0],
                    endDate: latest.content.targets?.endDate || new Date().toISOString().split('T')[0]
                },
                fieldNotes: '',
                signature: ''
            });
        }
    };

    // --- Weather Logic (Google-style Search) ---
    const searchCity = async (e) => {
        e.preventDefault();
        if (!weatherSearch) return;
        setWeather(prev => ({ ...prev, loading: true }));

        try {
            // 1. Geocoding
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${weatherSearch}&count=1&language=en&format=json`);
            const geoData = await geoRes.json();

            if (!geoData.results || geoData.results.length === 0) {
                alert('City not found');
                setWeather(prev => ({ ...prev, loading: false }));
                return;
            }

            const { latitude, longitude, name, country } = geoData.results[0];

            // 2. Weather
            const wxRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
            const wxData = await wxRes.json();

            setWeather({
                temp: wxData.current_weather.temperature,
                condition: getWxCondition(wxData.current_weather.weathercode),
                wind: wxData.current_weather.windspeed,
                city: `${name}, ${country}`,
                loading: false
            });
            setShowCitySearch(false);
            setWeatherSearch('');
        } catch (err) {
            console.error(err);
            setWeather(prev => ({ ...prev, loading: false }));
        }
    };

    const getWxCondition = (code) => {
        if (code === 0) return 'Sunny';
        if (code < 4) return 'Partly Cloudy';
        if (code < 50) return 'Foggy';
        if (code < 80) return 'Rainy';
        return 'Stormy';
    };

    // --- Task Logic ---
    // Auto-calc tasks when Date changes
    useEffect(() => {
        if (formData.tasks.length > 0) {
            const updatedTasks = formData.tasks.map(t => {
                const newPercent = calculateTaskProgress(t);
                if (t.percent !== newPercent) {
                    return {
                        ...t,
                        percent: newPercent,
                        status: newPercent >= 100 ? 'completed' : (newPercent > 0 ? 'in_progress' : 'not_started')
                    };
                }
                return t;
            });
            if (JSON.stringify(updatedTasks) !== JSON.stringify(formData.tasks)) {
                setFormData(prev => ({ ...prev, tasks: updatedTasks }));
            }
        }
    }, [formData.date]);
    const calculateTaskProgress = (task) => {
        if (!task.startDate || !task.endDate) return task.percent;

        const start = new Date(task.startDate);
        const end = new Date(task.endDate);
        const today = new Date(formData.date);

        const totalDuration = (end - start) / (1000 * 60 * 60 * 24);
        const elapsed = (today - start) / (1000 * 60 * 60 * 24);

        if (totalDuration <= 0) return 100;

        let p = Math.round((elapsed / totalDuration) * 100);
        return Math.max(0, Math.min(100, p));
    };

    const autoFillTaskPercent = () => {
        const updatedTasks = formData.tasks.map(t => {
            const newPercent = calculateTaskProgress(t);
            return {
                ...t,
                percent: newPercent,
                status: newPercent >= 100 ? 'completed' : (newPercent > 0 ? 'in_progress' : 'not_started')
            };
        });
        setFormData(prev => ({ ...prev, tasks: updatedTasks }));
    };

    // --- Action Handlers ---
    const handleSave = () => {
        if (!formData.date) {
            alert('Please select a date');
            return;
        }
        setLoading(true);
        // Small delay to ensure UI loading state is visible
        setTimeout(async () => {
            try {
                // Calc project stats for history
                const pStart = new Date(formData.targets.startDate || formData.date);
                const pEnd = new Date(formData.targets.endDate || formData.date);
                const pToday = new Date(formData.date);

                const totalDays = Math.ceil((pEnd - pStart) / (1000 * 60 * 60 * 24));
                const currentDay = Math.ceil((pToday - pStart) / (1000 * 60 * 60 * 24));

                const entryId = editingId || Date.now();
                const newEntryContent = {
                    id: entryId,
                    date: formData.date,
                    content: { ...formData },
                    total_days: Math.max(1, totalDays),
                    current_day: Math.max(0, currentDay)
                };

                if (user) {
                    const { error } = await supabase.from('daily_logs').upsert({
                        id: entryId,
                        user_id: user.id,
                        date: formData.date,
                        content: { ...formData },
                        total_days: Math.max(1, totalDays),
                        current_day: Math.max(0, currentDay)
                    });
                    if (error) throw error;
                    loadHistory();
                } else {
                    const currentHistory = JSON.parse(localStorage.getItem('daily_logs') || '[]');
                    let updatedHistory;

                    if (editingId) {
                        updatedHistory = currentHistory.map(h => h.id === editingId ? newEntryContent : h);
                    } else {
                        updatedHistory = [newEntryContent, ...currentHistory];
                    }

                    localStorage.setItem('daily_logs', JSON.stringify(updatedHistory));
                    setHistory(updatedHistory);
                }
                setEditingId(null);
                setActiveTab('history');
                alert('Log saved successfully!');
            } catch (e) {
                console.error(e);
                alert('Error saving log');
            } finally {
                setLoading(false);
            }
        }, 100);
    };

    const deleteLog = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Delete this log?")) return;

        if (user) {
            try {
                const { error } = await supabase.from('daily_logs').delete().match({ id, user_id: user.id });
                if (error) throw error;
                setHistory(prev => prev.filter(h => h.id !== id));
            } catch (err) {
                console.error("Error deleting log:", err);
                alert("Failed to delete log");
            }
        } else {
            const filtered = history.filter(h => h.id !== id);
            setHistory(filtered);
            localStorage.setItem('daily_logs', JSON.stringify(filtered));
        }
    };

    const editLog = (item) => {
        setFormData(item.content);
        setEditingId(item.id);
        setActiveTab('new');
    };

    // Helpers for Staffing/Equipment
    const addStaffRow = () => setFormData(prev => ({
        ...prev, manpower: [...prev.manpower, { id: Date.now(), role: '', count: 0 }]
    }));
    const removeStaffRow = (id) => setFormData(prev => ({
        ...prev, manpower: prev.manpower.filter(m => m.id !== id)
    }));

    const addEquipRow = () => setFormData(prev => ({
        ...prev, equipment: [...prev.equipment, { id: Date.now(), name: '', count: 1, status: 'Active' }]
    }));
    const removeEquipRow = (id) => setFormData(prev => ({
        ...prev, equipment: prev.equipment.filter(e => e.id !== id)
    }));

    const totalStaff = formData.manpower.reduce((sum, m) => sum + (parseInt(m.count) || 0), 0);
    const calculatedProgress = formData.targets.total_days > 0
        ? Math.round((formData.targets.current_day / formData.targets.total_days) * 100)
        : 0;

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-end gap-4">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <History className="text-blue-500" /> Daily Technical Log
                    </h2>
                    <p className="text-slate-500 font-bold mt-1 ml-1">{editingId ? 'EDITING MODE' : 'CREATE NEW REPORT'}</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl">
                    <button onClick={handleNewLog} className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'new' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>NEW LOG</button>
                    <button onClick={() => setActiveTab('history')} className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'history' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>HISTORY</button>
                </div>
            </div>

            {activeTab === 'new' ? (
                <>
                    {/* 1. Top Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Date */}
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 shadow-sm">
                            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-500"><Calendar size={20} /></div>
                            <div>
                                <div className="text-[10px] font-black text-slate-400 uppercase">Log Date</div>
                                <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="font-bold text-lg bg-transparent border-none p-0 focus:ring-0 dark:text-white" />
                            </div>
                        </div>

                        {/* Country */}
                        <div className="relative bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm cursor-pointer" onClick={() => setCountryOpen(!countryOpen)}>
                            <div className="text-[10px] font-black text-slate-400 uppercase">Country standard</div>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-2xl">{COUNTRIES[formData.country]?.flag}</span>
                                <span className="font-bold text-lg dark:text-white">{COUNTRIES[formData.country]?.label}</span>
                                <ChevronDown size={16} className="ml-auto text-slate-400" />
                            </div>
                            {countryOpen && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden border border-slate-100">
                                    {Object.entries(COUNTRIES).map(([k, v]) => (
                                        <div key={k} onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, country: k, safetyStd: v.safetyStd }); setCountryOpen(false); }} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 cursor-pointer">
                                            <span className="text-xl">{v.flag}</span>
                                            <span className="text-sm font-bold dark:text-white">{v.label}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Weather Search */}
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative">
                            <div className="absolute top-3 right-3">
                                <button onClick={() => setShowCitySearch(!showCitySearch)} className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 transition-colors">
                                    {showCitySearch ? <X size={14} /> : <Search size={14} />}
                                </button>
                            </div>
                            {showCitySearch ? (
                                <div className="flex gap-2 mt-2">
                                    <input
                                        autoFocus
                                        placeholder="Enter city..."
                                        value={weatherSearch}
                                        onChange={e => setWeatherSearch(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && searchCity(e)}
                                        className="w-full text-sm bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button onClick={searchCity} className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-600 whitespace-nowrap">Check</button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center text-orange-500">
                                        {weather.loading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent" /> : <Sun size={20} />}
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase">{weather.city}</div>
                                        <div className="font-bold text-lg dark:text-white flex items-center gap-2">
                                            {weather.temp}°C
                                            <span className="text-xs font-medium text-slate-400">({weather.condition})</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Total Staff */}
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 shadow-sm">
                            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-500"><Users size={20} /></div>
                            <div>
                                <div className="text-[10px] font-black text-slate-400 uppercase">Total Personnel</div>
                                <div className="font-bold text-lg dark:text-white">{totalStaff} Pax</div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Main Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* LEFT COL: Tasks & Safety */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Task Summary */}
                            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="flex items-center gap-2 font-black text-sm dark:text-white">
                                        <HardHat size={18} className="text-blue-500" /> Today's Task Summary
                                    </h3>
                                    <button onClick={() => setFormData(p => ({ ...p, tasks: [...p.tasks, { id: Date.now(), name: '', startDate: p.date, endDate: p.date, percent: 0, status: 'not_started' }] }))} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 hover:bg-slate-200"><Plus size={12} /> Add</button>
                                </div>

                                <div className="space-y-4">
                                    {formData.tasks.map((task, idx) => {
                                        const totalDays = Math.ceil((new Date(task.endDate) - new Date(task.startDate)) / (1000 * 3600 * 24));
                                        const elapsed = Math.ceil((new Date(formData.date) - new Date(task.startDate)) / (1000 * 3600 * 24));

                                        return (
                                            <div key={task.id} className="group p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl hover:bg-slate-100 transition-colors">
                                                <div className="flex gap-3 mb-3">
                                                    <input
                                                        placeholder="Task Name"
                                                        value={task.name}
                                                        onChange={e => {
                                                            const t = [...formData.tasks];
                                                            t[idx].name = e.target.value;
                                                            setFormData({ ...formData, tasks: t });
                                                        }}
                                                        className="flex-1 bg-transparent border-none p-0 font-bold text-sm focus:ring-0 dark:text-white"
                                                    />
                                                    <button onClick={() => setFormData(p => ({ ...p, tasks: p.tasks.filter(t => t.id !== task.id) }))} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                                                </div>

                                                {/* Date Logic */}
                                                <div className="flex flex-wrap items-center gap-3 text-xs mb-3">
                                                    <div className="bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                                                        <span className="text-[10px] font-black text-slate-400">START</span>
                                                        <input type="date" value={task.startDate} onChange={e => {
                                                            const t = [...formData.tasks];
                                                            t[idx].startDate = e.target.value;

                                                            // Auto Calc
                                                            const newPercent = calculateTaskProgress(t[idx]);
                                                            t[idx].percent = newPercent;
                                                            t[idx].status = newPercent >= 100 ? 'completed' : (newPercent > 0 ? 'in_progress' : 'not_started');

                                                            setFormData({ ...formData, tasks: t });
                                                        }} className="bg-transparent border-none p-0 font-bold w-24" />
                                                    </div>
                                                    <div className="bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                                                        <span className="text-[10px] font-black text-slate-400">DONE</span>
                                                        <input type="date" value={task.endDate} onChange={e => {
                                                            const t = [...formData.tasks];
                                                            t[idx].endDate = e.target.value;

                                                            // Auto Calc
                                                            const newPercent = calculateTaskProgress(t[idx]);
                                                            t[idx].percent = newPercent;
                                                            t[idx].status = newPercent >= 100 ? 'completed' : (newPercent > 0 ? 'in_progress' : 'not_started');

                                                            setFormData({ ...formData, tasks: t });
                                                        }} className="bg-transparent border-none p-0 font-bold w-24" />
                                                    </div>
                                                    <span className="text-[10px] font-medium text-slate-400">
                                                        (Day {elapsed > 0 ? elapsed : 0} of {totalDays > 0 ? totalDays : 1})
                                                    </span>
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative">
                                                        <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${task.percent}%` }} />
                                                    </div>
                                                    <input
                                                        type="number"
                                                        value={task.percent}
                                                        min="0" max="100"
                                                        onChange={e => {
                                                            const t = [...formData.tasks]; t[idx].percent = parseInt(e.target.value) || 0; setFormData({ ...formData, tasks: t });
                                                        }}
                                                        className="w-12 text-right bg-transparent border-none p-0 font-black text-sm"
                                                    />
                                                    <span className="text-xs font-bold text-slate-400">%</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Safety & Notes */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                                    <h3 className="font-black text-sm mb-4 flex gap-2"><AlertTriangle size={16} className="text-amber-500" /> Safety Check</h3>
                                    <div className="space-y-3">
                                        {Object.entries(formData.safety).map(([k, v]) => (
                                            <div key={k} className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-400 uppercase mb-1">{k.replace('_', ' ')}</span>
                                                <input value={v} onChange={e => setFormData({ ...formData, safety: { ...formData.safety, [k]: e.target.value } })} className="bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 text-sm font-medium border-none" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                                    <h3 className="font-black text-sm mb-4 flex gap-2"><Activity size={16} className="text-indigo-500" /> Field Notes</h3>
                                    <textarea
                                        value={formData.fieldNotes}
                                        onChange={e => setFormData({ ...formData, fieldNotes: e.target.value })}
                                        className="w-full h-32 bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-sm resize-none border-none placeholder:text-slate-400"
                                        placeholder="Site conditions, incidents, delays..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COL: Resources & Stats */}
                        <div className="space-y-6">

                            {/* 3. Manpower (Dynamic Array) */}
                            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-black text-sm dark:text-white flex gap-2"><Users size={16} className="text-emerald-500" /> Staffing</h4>
                                    <button onClick={addStaffRow} className="text-[10px] font-black bg-slate-100 p-1.5 rounded text-slate-500 hover:bg-slate-200"><Plus size={14} /></button>
                                </div>
                                <div className="space-y-3">
                                    {formData.manpower.map((person, idx) => (
                                        <div key={person.id} className="flex gap-2 items-center">
                                            <input
                                                value={person.role}
                                                placeholder="Role"
                                                onChange={e => {
                                                    const m = [...formData.manpower]; m[idx].role = e.target.value; setFormData({ ...formData, manpower: m });
                                                }}
                                                className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2 text-xs font-bold border-none"
                                            />
                                            <input
                                                type="number"
                                                value={person.count}
                                                onChange={e => {
                                                    const m = [...formData.manpower]; m[idx].count = parseInt(e.target.value) || 0; setFormData({ ...formData, manpower: m });
                                                }}
                                                className="w-16 bg-slate-50 dark:bg-slate-800 rounded-lg px-2 py-2 text-xs font-black text-center border-none"
                                            />
                                            <button onClick={() => removeStaffRow(person.id)} className="text-slate-300 hover:text-red-400"><X size={14} /></button>
                                        </div>
                                    ))}
                                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between font-black text-sm">
                                        <span>Total</span>
                                        <span>{totalStaff}</span>
                                    </div>
                                </div>
                            </div>

                            {/* 4. Equipment (With Count) */}
                            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-black text-sm dark:text-white flex gap-2"><Wrench size={16} className="text-orange-500" /> Equipment</h4>
                                    <button onClick={addEquipRow} className="text-[10px] font-black bg-slate-100 p-1.5 rounded text-slate-500 hover:bg-slate-200"><Plus size={14} /></button>
                                </div>
                                <div className="space-y-3">
                                    {formData.equipment.map((eq, idx) => (
                                        <div key={eq.id} className="flex gap-2 items-center">
                                            <div className="flex-1">
                                                <input
                                                    value={eq.name}
                                                    placeholder="Item name"
                                                    onChange={e => { const q = [...formData.equipment]; q[idx].name = e.target.value; setFormData({ ...formData, equipment: q }); }}
                                                    className="w-full bg-transparent p-0 text-xs font-bold border-none mb-1"
                                                />
                                                <input
                                                    value={eq.status}
                                                    placeholder="Status"
                                                    onChange={e => { const q = [...formData.equipment]; q[idx].status = e.target.value; setFormData({ ...formData, equipment: q }); }}
                                                    className="w-full bg-transparent p-0 text-[10px] text-emerald-500 font-medium border-none"
                                                />
                                            </div>
                                            <div className="flex items-center gap-1 bg-slate-50 rounded-lg px-2">
                                                <span className="text-[10px] text-slate-400 font-bold">Qty</span>
                                                <input
                                                    type="number"
                                                    value={eq.count}
                                                    onChange={e => { const q = [...formData.equipment]; q[idx].count = parseInt(e.target.value) || 0; setFormData({ ...formData, equipment: q }); }}
                                                    className="w-10 bg-transparent text-center font-black text-xs border-none p-1"
                                                />
                                            </div>
                                            <button onClick={() => removeEquipRow(eq.id)} className="text-slate-300 hover:text-red-400"><X size={14} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Stats Box */}
                            <div className="glass p-6 rounded-[32px] border border-blue-100 bg-blue-50/50 shadow-lg">
                                <h4 className="font-black text-sm uppercase text-blue-900 mb-4 flex gap-2"><TrendingUp size={16} /> Project Stats</h4>

                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="bg-white p-3 rounded-xl shadow-sm">
                                        <div className="text-[10px] font-black text-slate-400 uppercase">Start Date</div>
                                        <input type="date" value={formData.targets.startDate || formData.date} onChange={e => setFormData({ ...formData, targets: { ...formData.targets, startDate: e.target.value } })} className="w-full font-bold text-sm text-blue-600 border-none p-0 bg-transparent" />
                                    </div>
                                    <div className="bg-white p-3 rounded-xl shadow-sm">
                                        <div className="text-[10px] font-black text-slate-400 uppercase">End Date</div>
                                        <input type="date" value={formData.targets.endDate || formData.date} onChange={e => setFormData({ ...formData, targets: { ...formData.targets, endDate: e.target.value } })} className="w-full font-bold text-sm text-slate-700 border-none p-0 bg-transparent" />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                                        <span>Day {Math.max(0, Math.ceil((new Date(formData.date) - new Date(formData.targets.startDate || formData.date)) / (1000 * 60 * 60 * 24)))} / {Math.max(1, Math.ceil((new Date(formData.targets.endDate || formData.date) - new Date(formData.targets.startDate || formData.date)) / (1000 * 60 * 60 * 24)))}</span>
                                        <span>
                                            {(() => {
                                                const total = Math.max(1, Math.ceil((new Date(formData.targets.endDate || formData.date) - new Date(formData.targets.startDate || formData.date)) / (1000 * 60 * 60 * 24)));
                                                const current = Math.max(0, Math.ceil((new Date(formData.date) - new Date(formData.targets.startDate || formData.date)) / (1000 * 60 * 60 * 24)));
                                                return total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
                                            })()}%
                                        </span>
                                    </div>
                                    <div className="h-3 bg-white rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 transition-all duration-1000" style={{
                                            width: `${(() => {
                                                const total = Math.max(1, Math.ceil((new Date(formData.targets.endDate || formData.date) - new Date(formData.targets.startDate || formData.date)) / (1000 * 60 * 60 * 24)));
                                                const current = Math.max(0, Math.ceil((new Date(formData.date) - new Date(formData.targets.startDate || formData.date)) / (1000 * 60 * 60 * 24)));
                                                return total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
                                            })()}%`
                                        }} />
                                    </div>
                                </div>
                            </div>

                            <button onClick={handleSave} disabled={loading} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all flex justify-center gap-2">
                                {loading ? <Clock className="animate-spin" /> : <Save />}
                                {editingId ? 'UPDATE LOG' : 'SAVE LOG'}
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                // 5. History Tab with Edit/Delete
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(!history || history.length === 0) ? <div className="col-span-full py-20 text-center text-slate-400 font-black">No logs found.</div> :
                        history.map((log) => {
                            if (!log || !log.id) return null; // Skip invalid entries
                            return (
                                <div key={log.id} onClick={() => editLog(log)} className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 hover:border-blue-500 shadow-sm hover:shadow-lg transition-all cursor-pointer group relative">
                                    <button onClick={(e) => deleteLog(log.id, e)} className="absolute top-4 right-4 p-2 bg-slate-50 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                                        <Trash2 size={16} />
                                    </button>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500"><Calendar size={20} /></div>
                                        <div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase">Log Date</div>
                                            <div className="font-bold text-lg dark:text-white">{log.date || 'N/A'}</div>
                                        </div>
                                    </div>
                                    <div className="space-y-2 border-t border-slate-100 pt-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500 font-medium">Day Progress</span>
                                            <span className="font-black text-blue-600">{log.current_day || 0} / {log.total_days || 0}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500 font-medium">Manpower</span>
                                            <span className="font-bold dark:text-white">{(log.content?.manpower || []).reduce((s, m) => s + (parseInt(m.count) || 0), 0)} Pax</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            )}
        </div>
    );
};

export default DailyLogView;
