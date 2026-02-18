import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Mail, Lock, User, ArrowRight, Loader2, CheckCircle } from 'lucide-react';

const Auth = ({ onAuthSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState(null);
    const [emailSent, setEmailSent] = useState(false);

    const handleAuth = async (e) => {
        e.preventDefault();

        if (!supabase) {
            setError('Auth system not configured. Please add Supabase environment variables.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { full_name: fullName },
                    },
                });
                if (signUpError) throw signUpError;
                setEmailSent(true);
            } else {
                const { data, error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (signInError) throw signInError;
                if (data.user) onAuthSuccess(data.user);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Email sent success screen
    if (emailSent) {
        return (
            <div className="min-h-[500px] w-full max-w-md mx-auto p-10 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col items-center justify-center text-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30">
                    <CheckCircle size={40} className="text-white" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-black dark:text-white">Check Your Email!</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed">
                        We sent a confirmation link to<br />
                        <span className="font-black text-blue-500">{email}</span>
                    </p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300 font-medium w-full">
                    Click the link in the email to activate your account, then come back and sign in.
                </div>
                <button
                    onClick={() => { setEmailSent(false); setIsSignUp(false); }}
                    className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-black rounded-xl shadow-xl shadow-blue-500/30 transition-all flex items-center justify-center gap-2 group active:scale-95"
                >
                    Go to Sign In <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-[500px] w-full max-w-md mx-auto p-8 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center mb-10">
                <div className="w-16 h-16 bg-blue-500 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                    <Lock size={32} />
                </div>
                <h2 className="text-3xl font-black dark:text-white tracking-tight">
                    {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                    {isSignUp ? 'Start your journey with ArchSub' : 'Sign in to access your tools'}
                </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
                {isSignUp && (
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Your Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                                required
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                            required
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold rounded-lg">
                        ⚠️ {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-black rounded-xl shadow-xl shadow-blue-500/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 active:scale-95"
                >
                    {loading ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : (
                        <>
                            {isSignUp ? 'Create Account' : 'Sign In'} <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-8 text-center">
                <button
                    onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                    className="text-sm font-bold text-slate-500 hover:text-blue-500 transition-colors"
                >
                    {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </button>
            </div>
        </div>
    );
};

export default Auth;
