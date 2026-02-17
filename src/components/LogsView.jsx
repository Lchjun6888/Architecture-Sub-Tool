import React, { useState } from 'react';
import {
    Plus, Trash2, Download,
    Calendar, CloudSun, FileText, CheckCircle2,
    HardHat, UserCheck, Truck, Construction,
    Clock, MessageSquare
} from 'lucide-react';

const LogsView = () => {
    const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
    const [weather, setWeather] = useState('Sunny');

    // Core report sections
    const [tasks, setTasks] = useState([
        { id: 1, title: 'Foundation Rebar Installation', status: 'In Progress', progress: 65 },
        { id: 2, title: 'Concrete Pouring - Block A', status: 'Completed', progress: 100 }
    ]);

    const [equipment, setEquipment] = useState([
        { id: 1, name: 'Excavator PC200', count: 2, status: 'Active' },
        { id: 2, name: 'Concrete Mixer Truck', count: 5, status: 'Active' }
    ]);

    const [siteCounts, setSiteCounts] = useState({
        general: 12,
        subcontractors: 45,
        visitors: 3
    });

    const [notes, setNotes] = useState('');

    const addTask = () => {
        const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
        setTasks([...tasks, { id: newId, title: '', status: 'Planned', progress: 0 }]);
    };

    const addEquipment = () => {
        const newId = equipment.length > 0 ? Math.max(...equipment.map(e => e.id)) + 1 : 1;
        setEquipment([...equipment, { id: newId, name: '', count: 1, status: 'Active' }]);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <Construction className="text-blue-500" size={32} />
                        Daily Technical Report
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Record on-site activities, equipment usage, and progress.</p>
                </div>

                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-750 transition-all text-sm">
                        <Download size={18} /> Daily PDF
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition-all text-sm">
                        <CheckCircle2 size={18} /> Archive Log
                    </button>
                </div>
            </div>

            {/* Site Meta */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                        <Calendar size={20} />
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Log Date</p>
                        <input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} className="bg-transparent border-none p-0 font-bold text-slate-700 dark:text-white focus:ring-0 w-full outline-none" />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-500">
                        <CloudSun size={20} />
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Site Weather</p>
                        <select value={weather} onChange={(e) => setWeather(e.target.value)} className="bg-transparent border-none p-0 font-bold text-slate-700 dark:text-white focus:ring-0 w-full outline-none">
                            <option value="Sunny">Sunny / Clear</option>
                            <option value="Rainy">Rainy</option>
                            <option value="Cloudy">Cloudy</option>
                            <option value="Snowing">Snowing</option>
                        </select>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 shadow-sm md:col-span-2 lg:col-span-1">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500">
                        <UserCheck size={20} />
                    </div>
                    <div className="flex-1 flex gap-4">
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400">Total Personnel</p>
                            <p className="font-bold text-slate-700 dark:text-white">{siteCounts.general + siteCounts.subcontractors} Pax</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Work Progress */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
                        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <HardHat size={18} className="text-blue-500" />
                                Today's Task Summary
                            </h3>
                            <button onClick={addTask} className="text-blue-500 hover:text-blue-600 font-bold text-xs flex items-center gap-1">
                                <Plus size={14} /> New Task
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {tasks.map(task => (
                                <div key={task.id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl group transition-all">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={task.title}
                                            placeholder="What happened today?"
                                            onChange={(e) => setTasks(tasks.map(t => t.id === task.id ? { ...t, title: e.target.value } : t))}
                                            className="bg-transparent border-none p-0 font-bold text-slate-700 dark:text-white focus:ring-0 w-full outline-none mb-1"
                                        />
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${task.progress}%` }} />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{task.progress}%</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={task.status}
                                            onChange={(e) => setTasks(tasks.map(t => t.id === task.id ? { ...t, status: e.target.value } : t))}
                                            className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg border-none focus:ring-0 
                                            ${task.status === 'Completed' ? 'bg-emerald-500 text-white' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'}`}
                                        >
                                            <option value="Planned">Planned</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                        <button onClick={() => setTasks(tasks.filter(t => t.id !== task.id))} className="text-slate-300 hover:text-rose-500 p-1 opacity-0 group-hover:opacity-100 transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl p-6">
                        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                            <MessageSquare size={18} className="text-blue-500" />
                            Daily Field Notes
                        </h3>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Describe special issues, accidents, or weather delays here..."
                            className="w-full h-32 bg-slate-50 dark:bg-slate-850 rounded-2xl border-none p-4 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none resize-none"
                        />
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                    {/* Headcount Breakdown */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl p-6">
                        <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-6">Staffing Overview</h3>
                        <div className="space-y-4">
                            <CountInput label="Management / General Staff" value={siteCounts.general} onUpdate={(v) => setSiteCounts({ ...siteCounts, general: v })} />
                            <CountInput label="Subcontracting Labor" value={siteCounts.subcontractors} onUpdate={(v) => setSiteCounts({ ...siteCounts, subcontractors: v })} />
                            <CountInput label="Visitors / Inspections" value={siteCounts.visitors} onUpdate={(v) => setSiteCounts({ ...siteCounts, visitors: v })} />
                        </div>
                    </div>

                    {/* Equipment Section */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
                        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                            <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                                <Truck size={16} className="text-orange-500" />
                                Equipment Log
                            </h3>
                            <button onClick={addEquipment} className="text-orange-500 hover:text-orange-600 font-bold text-[10px] uppercase">
                                <Plus size={12} /> Add
                            </button>
                        </div>
                        <div className="p-4 space-y-3">
                            {equipment.map(eq => (
                                <div key={eq.id} className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl flex items-center justify-between group">
                                    <div className="flex-1">
                                        <input
                                            type="text" value={eq.name}
                                            onChange={(e) => setEquipment(equipment.map(item => item.id === eq.id ? { ...item, name: e.target.value } : item))}
                                            className="bg-transparent border-none p-0 text-xs font-bold text-slate-700 dark:text-white focus:ring-0 w-full outline-none"
                                        />
                                        <p className="text-[10px] text-slate-400 mt-0.5">{eq.status}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number" value={eq.count}
                                            onChange={(e) => setEquipment(equipment.map(item => item.id === eq.id ? { ...item, count: parseInt(e.target.value) || 0 } : item))}
                                            className="bg-slate-200 dark:bg-slate-800 w-8 h-8 rounded-lg text-center text-xs font-black border-none focus:ring-0 outline-none"
                                        />
                                        <button onClick={() => setEquipment(equipment.filter(item => item.id !== eq.id))} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CountInput = ({ label, value, onUpdate }) => (
    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl">
        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{label}</span>
        <div className="flex items-center gap-3">
            <button onClick={() => onUpdate(Math.max(0, value - 1))} className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 text-slate-400 hover:text-blue-500 transition-colors shadow-sm">-</button>
            <span className="text-sm font-black dark:text-white min-w-[20px] text-center">{value}</span>
            <button onClick={() => onUpdate(value + 1)} className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 text-slate-400 hover:text-blue-500 transition-colors shadow-sm">+</button>
        </div>
    </div>
);

export default LogsView;
