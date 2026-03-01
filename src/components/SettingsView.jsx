import React, { useState, useEffect } from 'react';
import {
    User as UserIcon,
    CreditCard,
    Bell,
    Shield,
    Globe,
    Moon,
    Star,
    Save,
    ExternalLink,
    Key,
    Smartphone
} from 'lucide-react';
const SettingsView = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [fullName, setFullName] = useState(localStorage.getItem('fullName') || '');
    const [company, setCompany] = useState(localStorage.getItem('company') || '');
    const [role, setRole] = useState(localStorage.getItem('role') || '');
    const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
    const [emailEnabled, setEmailEnabled] = useState(localStorage.getItem('emailEnabled') === 'true');
    const [proMode, setProMode] = useState(true);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('darkMode', 'true');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('darkMode', 'false');
        }
        window.dispatchEvent(new Event('themeChanged'));
    }, [darkMode]);

    const handleSave = async () => {
        setLoading(true);
        setMessage('');

        localStorage.setItem('darkMode', darkMode.toString());
        localStorage.setItem('emailEnabled', emailEnabled.toString());
        localStorage.setItem('fullName', fullName);
        localStorage.setItem('company', company);
        localStorage.setItem('role', role);

        window.dispatchEvent(new Event('themeChanged'));
        setMessage('Changes saved locally.');
        setLoading(false);
        setTimeout(() => setMessage(''), 3000);
    };

    const handleDeleteAccount = () => {
        const confirmDelete = window.confirm("Are you sure you want to clear all local data? This action cannot be undone.");
        if (confirmDelete) {
            localStorage.clear();
            window.location.reload();
        }
    };


    return (
        <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-10 flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black dark:text-white tracking-tight">Settings</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage your account, preferences, and workspace settings.</p>
                </div>
                {message && (
                    <div className="bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-xl font-bold text-sm">
                        {message}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {/* Sidebar */}
                <div className="space-y-1">
                    <SettingNav onClick={() => setActiveTab('profile')} icon={<UserIcon size={18} />} label="Profile" active={activeTab === 'profile'} />
                </div>

                {/* Content */}
                <div className="md:col-span-2 space-y-8">
                    {activeTab === 'profile' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            {/* Profile Section */}
                            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
                                <div>
                                    <h3 className="text-lg font-black dark:text-white mb-6 flex items-center gap-2">
                                        Personal Information
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <InputGroup label="Full Name" value={fullName} onChange={setFullName} />
                                        <InputGroup label="Email Address" value="local@archsub.com" onChange={() => { }} disabled={true} />
                                        <InputGroup label="Company" value={company} onChange={setCompany} />
                                        <InputGroup label="Role" value={role} onChange={setRole} />
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                                    <h3 className="text-lg font-black dark:text-white mb-6">Preferences</h3>
                                    <div className="space-y-4">
                                        <ToggleGroup
                                            label="Dark Mode"
                                            desc="Adjust the appearance of the dashboard."
                                            icon={<Moon size={20} className="text-indigo-500" />}
                                            isEnabled={darkMode}
                                            onToggle={() => setDarkMode(!darkMode)}
                                        />
                                        <ToggleGroup
                                            label="Pro Mode Shortcuts"
                                            desc="Enable advanced keyboard shortcuts."
                                            icon={<Star size={20} className="text-yellow-500" />}
                                            isEnabled={proMode}
                                            onToggle={() => setProMode(!proMode)}
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 flex justify-end">
                                    <button
                                        onClick={handleSave}
                                        disabled={loading}
                                        className="px-6 py-3 bg-blue-500 text-white rounded-xl font-black shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition-all flex items-center gap-2 disabled:opacity-50">
                                        <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="bg-red-50/50 dark:bg-red-950/10 rounded-[32px] p-8 border border-red-100 dark:border-red-900/30">
                                <h3 className="text-lg font-black text-red-600 dark:text-red-500 mb-2">Danger Zone</h3>
                                <p className="text-sm text-red-500/70 font-medium mb-6">Reset all local database and preferences.</p>
                                <button
                                    onClick={handleDeleteAccount}
                                    className="px-6 py-3 border-2 border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-500 rounded-xl font-black hover:bg-red-100 dark:hover:bg-red-900/20 transition-all">
                                    Clear All Data
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const SettingNav = ({ icon, label, active = false, onClick }) => (
    <div onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all cursor-pointer ${active ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
        {icon}
        <span>{label}</span>
    </div>
);

const InputGroup = ({ label, value, onChange, disabled }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
    </div>
);

const ToggleGroup = ({ label, desc, icon, isEnabled, onToggle }) => (
    <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                {icon}
            </div>
            <div>
                <p className="text-sm font-black dark:text-white leading-none">{label}</p>
                <p className="text-[11px] text-slate-400 mt-1 font-medium">{desc}</p>
            </div>
        </div>
        <div onClick={onToggle} className={`w-12 h-6 rounded-full p-1 transition-all cursor-pointer ${isEnabled ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-800'}`}>
            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-all ${isEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
        </div>
    </div>
);

export default SettingsView;
