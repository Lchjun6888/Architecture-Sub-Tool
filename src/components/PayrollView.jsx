import React, { useState } from 'react';
import {
    Users, Plus, Trash2, Download,
    Globe, Calendar, CheckCircle2, TrendingUp,
    Briefcase, CreditCard
} from 'lucide-react';
import { useTaxCalculator } from '../hooks/useTaxCalculator';

const PayrollView = () => {
    const { region, setRegion, calculateTax } = useTaxCalculator();
    const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);

    const [entries, setEntries] = useState([
        { id: 1, name: 'Kim Junior', role: 'Masonry', rate: 250000, isRegistered: true },
        { id: 2, name: 'Lee Senior', role: 'Plumbing', rate: 300000, isRegistered: true }
    ]);

    const addEntry = () => {
        const newId = entries.length > 0 ? Math.max(...entries.map(e => e.id)) + 1 : 1;
        setEntries([...entries, { id: newId, name: '', role: '', rate: 0, isRegistered: true }]);
    };

    const removeEntry = (id) => {
        setEntries(entries.filter(e => e.id !== id));
    };

    const updateEntry = (id, field, value) => {
        setEntries(entries.map(e => e.id === id ? { ...e, [field]: value } : e));
    };

    const totals = entries.reduce((acc, curr) => {
        const calc = calculateTax(curr.rate, { isRegistered: curr.isRegistered });
        return {
            gross: acc.gross + calc.gross,
            tax: acc.tax + calc.tax,
            net: acc.net + calc.net
        };
    }, { gross: 0, tax: 0, net: 0 });

    const currency = region === 'KR' ? '₩' : region === 'UK' ? '£' : '$';

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <CreditCard className="text-emerald-500" size={32} />
                        Attendance & Payroll
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage attendance and automated tax deductions for your site team.</p>
                </div>

                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-750 transition-all">
                        <Download size={18} /> Export CSV
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-all">
                        <CheckCircle2 size={18} /> Process Payments
                    </button>
                </div>
            </div>

            {/* Config Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                        <Calendar size={20} />
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Payroll Date</p>
                        <input
                            type="date"
                            value={logDate}
                            onChange={(e) => setLogDate(e.target.value)}
                            className="bg-transparent border-none p-0 font-bold text-slate-700 dark:text-white focus:ring-0 w-full outline-none"
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500">
                        <Globe size={20} />
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Tax Jurisdiction</p>
                        <select
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                            className="bg-transparent border-none p-0 font-bold text-slate-700 dark:text-white focus:ring-0 w-full outline-none"
                        >
                            <option value="KR">South Korea (3.3%)</option>
                            <option value="UK">United Kingdom (CIS)</option>
                            <option value="US">United States (Est. 10%)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Briefcase size={120} />
                    </div>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Total Labor Cost</p>
                    <h3 className="text-3xl font-black">{currency}{totals.gross.toLocaleString()}</h3>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Total Tax Withheld</p>
                    <h3 className="text-3xl font-black text-rose-500">{currency}{totals.tax.toLocaleString()}</h3>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm border-b-4 border-b-emerald-500">
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Total Net Payable</p>
                    <h3 className="text-3xl font-black text-emerald-500">{currency}{totals.net.toLocaleString()}</h3>
                </div>
            </div>

            {/* Labor Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Users size={18} className="text-blue-500" />
                        Staff Attendance List
                    </h3>
                    <button
                        onClick={addEntry}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition-all"
                    >
                        <Plus size={14} /> Add Staff
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-850/50 text-[10px] uppercase tracking-widest font-black text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Daily Rate</th>
                                <th className="px-6 py-4 text-right">Tax Deduction</th>
                                <th className="px-6 py-4 text-right">Net Pay</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {entries.map(entry => {
                                const taxInfo = calculateTax(entry.rate, { isRegistered: entry.isRegistered });
                                return (
                                    <tr key={entry.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <input
                                                type="text"
                                                value={entry.name}
                                                placeholder="..."
                                                onChange={(e) => updateEntry(entry.id, 'name', e.target.value)}
                                                className="bg-transparent border-none p-0 font-bold text-slate-700 dark:text-white focus:ring-0 w-full outline-none"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="text"
                                                value={entry.role}
                                                placeholder="..."
                                                onChange={(e) => updateEntry(entry.id, 'role', e.target.value)}
                                                className="bg-transparent border-none p-0 text-slate-600 dark:text-slate-400 focus:ring-0 w-full outline-none"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            {region === 'UK' ? (
                                                <button
                                                    onClick={() => updateEntry(entry.id, 'isRegistered', !entry.isRegistered)}
                                                    className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tight transition-colors ${entry.isRegistered ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30'}`}
                                                >
                                                    {entry.isRegistered ? 'Registered' : 'Unregistered'}
                                                </button>
                                            ) : (
                                                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">ACTIVE</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm">
                                            <div className="flex items-center justify-end gap-1">
                                                <span className="text-slate-400 font-bold">{currency}</span>
                                                <input
                                                    type="number"
                                                    value={entry.rate}
                                                    onChange={(e) => updateEntry(entry.id, 'rate', parseInt(e.target.value) || 0)}
                                                    className="bg-transparent border-none p-0 font-black text-slate-700 dark:text-white focus:ring-0 w-24 text-right outline-none"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-bold text-rose-500 text-sm">
                                                -{currency}{taxInfo.tax.toLocaleString()}
                                            </span>
                                            <p className="text-[9px] text-slate-400 truncate max-w-[100px] ml-auto">{taxInfo.detail}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-black text-slate-900 dark:text-white">
                                                {currency}{taxInfo.net.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => removeEntry(entry.id)}
                                                className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {entries.length === 0 && (
                    <div className="p-12 text-center text-slate-400 text-sm italic">
                        No team members added yet. Add workers to calculate payroll.
                    </div>
                )}
            </div>

            {/* Summary Tooltip */}
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-2xl p-4 flex items-start gap-3">
                <TrendingUp className="text-blue-500 mt-1" size={20} />
                <div>
                    <h5 className="font-bold text-blue-900 dark:text-blue-300 text-sm">Payroll Efficiency</h5>
                    <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                        Total daily payout including taxes is {currency}{(totals.gross).toLocaleString()}.
                        This matches the estimated budget for {logDate}.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PayrollView;
