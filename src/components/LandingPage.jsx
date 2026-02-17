import React from 'react';
import {
    FileSpreadsheet,
    TableProperties,
    Lock,
    Zap,
    ArrowRight,
    CheckCircle,
    Star,
    ShieldCheck,
    Cpu,
    CreditCard,
    Layers
} from 'lucide-react';

const LandingPage = ({ onStart }) => {
    const scrollToPricing = () => {
        const element = document.getElementById('pricing-section');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
            {/* Nav */}
            <nav className="fixed top-0 w-full z-50 glass px-6 py-4 flex justify-between items-center">
                <div
                    className="flex items-center gap-2 cursor-pointer group"
                    onClick={scrollToTop}
                >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:rotate-6 transition-transform">
                        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M5 21V7L12 3L19 7V21" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                            <path d="M9 21V11H15V21" stroke="currentColor" strokeWidth="2" />
                            <path d="M5 11H19" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
                        </svg>
                    </div>
                    <span className="text-xl font-black tracking-tight dark:text-white group-hover:text-blue-500 transition-colors">ArchSub</span>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={scrollToPricing}
                        className="text-sm font-semibold text-slate-500 hover:text-blue-500 transition-colors"
                    >
                        Pricing
                    </button>
                    <button onClick={onStart} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-500/30 active:scale-95">
                        Get Started
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-6xl mx-auto text-center space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-bold animate-pulse">
                        <Zap size={14} /> New: Architecture Split Engine v2.0
                    </div>
                    <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white leading-[1.1]">
                        Splitting Archive Files <br />
                        <span className="text-gradient">Made for Builders.</span>
                    </h1>
                    <p className="text-xl text-slate-500 dark:text-slate-200 max-w-2xl mx-auto leading-relaxed">
                        A dedicated suite for architects and engineers. Split complex bill of materials, preserve styles, and automate your workflow with professional precision.
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
                    <div className="mt-16 relative transform perspective-1000 rotate-x-2 lg:rotate-x-1">
                        <div className="absolute inset-0 bg-blue-500/20 blur-[100px] -z-10 rounded-full scale-75" />
                        <div className="glass rounded-2xl premium-shadow border border-white/20 p-2 max-w-5xl mx-auto overflow-hidden animate-float">
                            <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg h-[400px] md:h-[500px] flex items-center justify-center overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop"
                                    alt="Dashboard Mockup"
                                    className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-700"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-24 bg-white dark:bg-slate-800/50">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="space-y-4 group p-6 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                        <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <TableProperties size={28} />
                        </div>
                        <h3 className="text-xl font-black dark:text-white">Smart Splitting</h3>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Split by rows or trigger on specific keywords. Fully adjustable header persistence for complex workbooks.</p>
                    </div>
                    <div className="space-y-4 group p-6 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                        <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                            <Lock size={28} />
                        </div>
                        <h3 className="text-xl font-black dark:text-white">Enterprise Privacy</h3>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Your files never leave your browser. All processing is encrypted and done locally on your machine.</p>
                    </div>
                    <div className="space-y-4 group p-6 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                        <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <Cpu size={28} />
                        </div>
                        <h3 className="text-xl font-black dark:text-white">V3 Processing Engine</h3>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Handle 1,000,000+ rows instantly with our proprietary streaming data architecture.</p>
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing-section" className="py-20 px-6">
                <div className="max-w-4xl mx-auto text-center space-y-12">
                    <h2 className="text-4xl font-black dark:text-white">Transparent Pricing</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="glass p-8 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-6 text-left flex flex-col h-full transform hover:scale-[1.02] transition-all">
                            <div className="flex-1">
                                <h4 className="text-lg font-bold dark:text-white">Free Plan</h4>
                                <div className="text-3xl font-black dark:text-white mt-2">$0 <span className="text-sm font-normal text-slate-500">/ forever</span></div>
                                <p className="text-sm text-slate-500 mt-4 leading-relaxed">Perfect for simple tasks and individual users exploring the platform.</p>
                                <ul className="space-y-4 mt-8">
                                    <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                                        <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                                        <span>Split up to **500 rows** per file</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                                        <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                                        <span>Standard Header persistence (4 rows)</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                                        <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                                        <span>Basic Row-based splitting</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-slate-400">
                                        <CheckCircle size={18} className="text-slate-300 shrink-0 mt-0.5" />
                                        <span>Local browser processing only</span>
                                    </li>
                                </ul>
                            </div>
                            <button onClick={onStart} className="w-full py-4 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                                Current Plan
                            </button>
                        </div>

                        <div className="bg-slate-900 border-4 border-blue-500 p-8 rounded-2xl space-y-6 text-left relative overflow-hidden flex flex-col h-full transform hover:scale-[1.02] transition-all shadow-2xl shadow-blue-500/20">
                            <div className="absolute top-0 right-0">
                                <div className="bg-blue-500 text-white text-[10px] font-black px-8 py-2 rotate-45 translate-x-[25px] translate-y-[-5px] shadow-lg">POPULAR</div>
                            </div>

                            <div className="flex-1">
                                <div className="text-white">
                                    <h4 className="text-lg font-bold flex items-center gap-2">
                                        Pro Plan <Star size={16} className="text-yellow-400 fill-yellow-400" />
                                    </h4>
                                    <div className="text-4xl font-black mt-2">$9.9 <span className="text-sm font-normal text-blue-300">/ month</span></div>
                                    <p className="text-sm text-slate-400 mt-4 leading-relaxed">For architects, engineers, and data professionals who need efficiency.</p>
                                </div>
                                <ul className="space-y-4 mt-8">
                                    <li className="flex items-start gap-3 text-sm text-blue-100">
                                        <CheckCircle size={18} className="text-blue-400 shrink-0 mt-0.5" />
                                        <span>**Unlimited** rows & sheets processing</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-blue-100">
                                        <CheckCircle size={18} className="text-blue-400 shrink-0 mt-0.5" />
                                        <span>**Smart Logic**: Keyword-based splitting (Total/Subtotal)</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-blue-100">
                                        <CheckCircle size={18} className="text-blue-400 shrink-0 mt-0.5" />
                                        <span>**Real-time Full Editing**: Edit directly in preview</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-blue-100">
                                        <CheckCircle size={18} className="text-blue-400 shrink-0 mt-0.5" />
                                        <span>**Custom Naming**: Use cell data for filenames</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-blue-100">
                                        <CheckCircle size={18} className="text-blue-400 shrink-0 mt-0.5" />
                                        <span>Multi-page **PDF Comparison** Tool</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-emerald-400 font-bold">
                                        <CheckCircle size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                                        <span>24/7 Priority VIP Support</span>
                                    </li>
                                </ul>
                            </div>
                            <button
                                onClick={() => window.open('https://archisubtool.lemonsqueezy.com/checkout/buy/72c39d38-bbc2-427f-a48a-7c5ee4d9388d', '_blank')}
                                className="w-full py-4 bg-blue-500 text-white font-black rounded-xl hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/40 active:scale-95 flex items-center justify-center gap-2 group"
                            >
                                Upgrade to Pro <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
