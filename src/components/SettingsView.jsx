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
import { supabase } from '../supabaseClient';

const SettingsView = ({ user }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [fullName, setFullName] = useState('');
    const [company, setCompany] = useState('');
    const [role, setRole] = useState('');
    const [darkMode, setDarkMode] = useState(false);
    const [emailEnabled, setEmailEnabled] = useState(false);
    const [proMode, setProMode] = useState(true);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFullName(user.user_metadata?.full_name || '');
            setCompany(user.user_metadata?.company || '');
            setRole(user.user_metadata?.role || '');

            const localDarkMode = localStorage.getItem('darkMode');
            if (localDarkMode !== null) {
                setDarkMode(localDarkMode === 'true');
            } else {
                setDarkMode(user.user_metadata?.preferences?.darkMode ?? true);
            }

            setEmailEnabled(user.user_metadata?.preferences?.emailEnabled ?? false);
            setProMode(user.user_metadata?.preferences?.proMode ?? true);
        } else {
            const localDarkMode = localStorage.getItem('darkMode') === 'true';
            setDarkMode(localDarkMode);
        }
    }, [user]);

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
        window.dispatchEvent(new Event('themeChanged'));

        if (user) {
            const updates = {
                data: {
                    full_name: fullName,
                    company: company,
                    role: role,
                    preferences: {
                        darkMode,
                        emailEnabled,
                        proMode
                    }
                }
            };
            const { error } = await supabase.auth.updateUser(updates);
            if (error) {
                setMessage('Error saving preferences: ' + error.message);
            } else {
                setMessage('Changes saved successfully!');
            }
        } else {
            setMessage('Changes saved locally.');
        }
        setLoading(false);
        setTimeout(() => setMessage(''), 3000);
    };

    const handleDeleteAccount = () => {
        const confirmDelete = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
        if (confirmDelete) {
            alert("Account deletion requested. Please contact support to finalize.");
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
                    <SettingNav onClick={() => setActiveTab('billing')} icon={<CreditCard size={18} />} label="Billing & Plan" active={activeTab === 'billing'} />
                    <SettingNav onClick={() => setActiveTab('notifications')} icon={<Bell size={18} />} label="Notifications" active={activeTab === 'notifications'} />
                    <SettingNav onClick={() => setActiveTab('security')} icon={<Shield size={18} />} label="Security" active={activeTab === 'security'} />
                    <SettingNav onClick={() => setActiveTab('integrations')} icon={<Globe size={18} />} label="Integrations" active={activeTab === 'integrations'} />
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
                                        <InputGroup label="Email Address" value={user?.email || ''} onChange={() => { }} disabled={true} />
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
                                <p className="text-sm text-red-500/70 font-medium mb-6">Permanently delete your account and all associated data.</p>
                                <button
                                    onClick={handleDeleteAccount}
                                    className="px-6 py-3 border-2 border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-500 rounded-xl font-black hover:bg-red-100 dark:hover:bg-red-900/20 transition-all">
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'billing' && (
                        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in duration-300">
                            <h3 className="text-lg font-black dark:text-white flex items-center gap-2 mb-6">
                                <CreditCard className="text-blue-500" /> Billing & Plan
                            </h3>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 sm:p-8 rounded-3xl border border-blue-100 dark:border-blue-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                                <div>
                                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">Current Plan</p>
                                    <p className="text-3xl font-black text-slate-900 dark:text-white">{user?.user_metadata?.plan === 'pro' ? 'ArchSub Pro' : 'Free Plan'}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
                                        {user?.user_metadata?.plan === 'pro'
                                            ? 'You currently have access to all premium features including unlimited PDF pages.'
                                            : 'Upgrade to the Pro plan to unlock unlimited PDF page comparisons and more.'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => window.open('https://gumroad.com/', '_blank')}
                                    className="w-full sm:w-auto px-8 py-4 bg-blue-500 text-white rounded-2xl font-black shadow-xl shadow-blue-500/30 hover:bg-blue-600 transition-all flex items-center justify-center gap-2 whitespace-nowrap active:scale-95"
                                >
                                    Manage Subscription <ExternalLink size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8 animate-in fade-in duration-300">
                            <div>
                                <h3 className="text-lg font-black dark:text-white flex items-center gap-2 mb-6">
                                    <Bell className="text-amber-500" /> Notifications
                                </h3>
                                <div className="space-y-4">
                                    <ToggleGroup
                                        label="Email Notifications"
                                        desc="Receive updates about your file processing results and system alerts."
                                        icon={<Bell size={20} className="text-amber-500" />}
                                        isEnabled={emailEnabled}
                                        onToggle={() => setEmailEnabled(!emailEnabled)}
                                    />
                                    <ToggleGroup
                                        label="Marketing Emails"
                                        desc="Receive tips, feature updates, and offers."
                                        icon={<Globe size={20} className="text-emerald-500" />}
                                        isEnabled={false}
                                        onToggle={() => alert("Marketing emails preferences updated.")}
                                    />
                                </div>
                            </div>
                            <div className="pt-6 flex justify-end border-t border-slate-100 dark:border-slate-800">
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="px-6 py-3 bg-blue-500 text-white rounded-xl font-black shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition-all flex items-center gap-2 disabled:opacity-50">
                                    <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in duration-300">
                            <h3 className="text-lg font-black dark:text-white flex items-center gap-2 mb-6">
                                <Shield className="text-emerald-500" /> Security
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm text-slate-500">
                                            <Key size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black dark:text-white">Password</p>
                                            <p className="text-[11px] text-slate-400 mt-1 font-medium">Last changed a while ago</p>
                                        </div>
                                    </div>
                                    <button className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-500 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all">Change</button>
                                </div>
                                <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm text-slate-500">
                                            <Smartphone size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black dark:text-white">Two-Factor Authentication</p>
                                            <p className="text-[11px] text-slate-400 mt-1 font-medium">Add an extra layer of security.</p>
                                        </div>
                                    </div>
                                    <button className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-black shadow-md shadow-emerald-500/20 hover:bg-emerald-600 transition-all">Enable</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'integrations' && (
                        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in duration-300">
                            <h3 className="text-lg font-black dark:text-white flex items-center gap-2 mb-2">
                                <Globe className="text-indigo-500" /> Integrations
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-8">Connect ArchSub with your favorite tools for seamless workflow.</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all flex items-center justify-between group cursor-pointer bg-slate-50/50 dark:bg-slate-950/20">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm">
                                            <div className="w-6 h-6 bg-[#0061FF] rounded text-white flex items-center justify-center font-bold text-[10px]">DB</div>
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm dark:text-white group-hover:text-blue-500 transition-colors">Dropbox</p>
                                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Cloud Storage</p>
                                        </div>
                                    </div>
                                    <button className="text-xs font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/40 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all">Connect</button>
                                </div>

                                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all flex items-center justify-between group cursor-pointer bg-slate-50/50 dark:bg-slate-950/20">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm">
                                            <div className="w-6 h-6 bg-[#0F9D58] rounded text-white flex items-center justify-center font-bold text-[10px]">GD</div>
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm dark:text-white group-hover:text-emerald-500 transition-colors">Google Drive</p>
                                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Cloud Storage</p>
                                        </div>
                                    </div>
                                    <button className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/40 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all">Connect</button>
                                </div>
                                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-slate-500 dark:hover:border-slate-500 transition-all flex items-center justify-between group cursor-pointer bg-slate-50/50 dark:bg-slate-950/20">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm">
                                            <div className="w-6 h-6 bg-[#000000] rounded text-white flex items-center justify-center font-bold text-[10px] dark:bg-slate-700 dark:border dark:border-slate-600">N</div>
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm dark:text-white group-hover:text-amber-500 transition-colors">Notion</p>
                                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Workspace</p>
                                        </div>
                                    </div>
                                    <button className="text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/40 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all">Connect</button>
                                </div>
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
