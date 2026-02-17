import React from 'react';
import { Bolt, CheckCircle, Shield, Scissors, ArrowRight, Zap, Star } from 'lucide-react';

const LandingPage = ({ onStart }) => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
            {/* Nav */}
            <nav className="fixed top-0 w-full z-50 glass px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold">
                        E
                    </div>
                    <span className="text-xl font-black tracking-tight dark:text-white">ExcelFlow</span>
                </div>
                <div className="flex gap-4">
                    <button className="text-sm font-semibold text-slate-500 hover:text-blue-500 transition-colors">Pricing</button>
                    <button onClick={onStart} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-500/30 active:scale-95">
                        Get Started
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-6xl mx-auto text-center space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-bold animate-pulse">
                        <Zap size={14} /> New: AI Split Engine v2.0
                    </div>
                    <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white leading-[1.1]">
                        Splitting Excel Files <br />
                        <span className="text-gradient">Shouldn't Be Hard.</span>
                    </h1>
                    <p className="text-xl text-slate-500 dark:text-slate-200 max-w-2xl mx-auto leading-relaxed">
                        Split large workbooks into multiple files in seconds. Preserve headers, apply smart keyword logic, and automate your workflow with one click.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
                        <button onClick={onStart} className="w-full sm:w-auto px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-lg font-black transition-all shadow-xl shadow-blue-500/40 flex items-center justify-center gap-2 group active:scale-95">
                            Start Splitting Now <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
                            Watch Demo
                        </button>
                    </div>

                    {/* Preview Mockup */}
                    <div className="mt-16 relative transform perspective-1000 rotate-x-2">
                        <div className="absolute inset-0 bg-blue-500/20 blur-[100px] -z-10 rounded-full scale-75" />
                        <div className="glass rounded-2xl premium-shadow border border-white/20 p-2 max-w-5xl mx-auto overflow-hidden animate-float">
                            <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg h-[400px] flex items-center justify-center text-slate-400 font-mono text-sm">
                                [ Interactive Dashboard Preview Mockup ]
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 bg-white dark:bg-slate-800/50">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="space-y-4">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                            <Scissors size={24} />
                        </div>
                        <h3 className="text-xl font-bold dark:text-white">Smart Splitting</h3>
                        <p className="text-slate-500 dark:text-slate-400">Split by rows or trigger on specific keywords. Fully adjustable header persistence.</p>
                    </div>
                    <div className="space-y-4">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                            <Shield size={24} />
                        </div>
                        <h3 className="text-xl font-bold dark:text-white">100% Private</h3>
                        <p className="text-slate-500 dark:text-slate-400">Your files never leave your browser. All processing is done locally on your machine.</p>
                    </div>
                    <div className="space-y-4">
                        <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                            <Bolt size={24} />
                        </div>
                        <h3 className="text-xl font-bold dark:text-white">Lightning Fast</h3>
                        <p className="text-slate-500 dark:text-slate-400">Handle 1,000,000+ rows instantly. No more waiting for Excel to respond.</p>
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto text-center space-y-12">
                    <h2 className="text-4xl font-black dark:text-white">Transparent Pricing</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="glass p-8 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-6 text-left">
                            <div>
                                <h4 className="text-lg font-bold dark:text-white">Free Plan</h4>
                                <div className="text-3xl font-black dark:text-white mt-2">$0 <span className="text-sm font-normal text-slate-500">/ forever</span></div>
                            </div>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><CheckCircle size={16} className="text-emerald-500" /> Up to 500 rows per file</li>
                                <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><CheckCircle size={16} className="text-emerald-500" /> Basic naming rules</li>
                                <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><CheckCircle size={16} className="text-emerald-500" /> Locally processed</li>
                            </ul>
                            <button onClick={onStart} className="w-full py-3 border border-blue-500 text-blue-500 font-bold rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">Get Started</button>
                        </div>
                        <div className="bg-slate-900 dark:bg-blue-600 p-8 rounded-2xl border-4 border-blue-500 space-y-6 text-left relative overflow-hidden">
                            <div className="absolute top-4 right-4 bg-white text-blue-600 text-[10px] font-black px-2 py-0.5 rounded shadow-sm">BEST VALUE</div>
                            <div className="text-white">
                                <h4 className="text-lg font-bold">Pro Plan</h4>
                                <div className="text-3xl font-black mt-2">$9 <span className="text-sm font-normal text-blue-200">/ month</span></div>
                            </div>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-2 text-sm text-blue-100"><CheckCircle size={16} className="text-emerald-400" /> Unlimited rows</li>
                                <li className="flex items-center gap-2 text-sm text-blue-100"><CheckCircle size={16} className="text-emerald-400" /> Advanced AI naming</li>
                                <li className="flex items-center gap-2 text-sm text-blue-100"><CheckCircle size={16} className="text-emerald-400" /> Multi-file batching</li>
                                <li className="flex items-center gap-2 text-sm text-blue-100"><CheckCircle size={16} className="text-emerald-400" /> Priority Support</li>
                            </ul>
                            <button className="w-full py-3 bg-white text-blue-600 font-black rounded-lg hover:bg-blue-50 transition-all shadow-xl">Upgrade Now</button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
