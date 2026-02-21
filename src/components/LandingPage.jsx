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
    const [legalModal, setLegalModal] = React.useState(null); // 'privacy' | 'tos' | null

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
                        <Zap size={14} /> New: ArchSub Core Engine v2.0
                    </div>
                    <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white leading-[1.1]">
                        Master Construction Data <br />
                        <span className="text-gradient">With ArchSub.</span>
                    </h1>
                    <p className="text-xl text-slate-500 dark:text-slate-200 max-w-2xl mx-auto leading-relaxed">
                        The ultimate productivity suite for architecture and construction management. Automate your daily logs, analyze costs, and split complex datasets with ease.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
                        <button onClick={onStart} className="w-full sm:w-auto px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-lg font-black transition-all shadow-xl shadow-blue-500/40 flex items-center justify-center gap-2 group active:scale-95">
                            Start Your Journey <ArrowRight className="group-hover:translate-x-1 transition-transform" />
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

            {/* Pricing Section */}
            <section id="pricing-section" className="py-20 px-6">
                <div className="max-w-4xl mx-auto text-center space-y-12">
                    <h2 className="text-4xl font-black dark:text-white">Transparent Pricing</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Free Plan */}
                        <div className="glass p-8 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-6 text-left flex flex-col h-full transform hover:scale-[1.02] transition-all">
                            <div className="flex-1">
                                <h4 className="text-lg font-bold dark:text-white">Free Plan</h4>
                                <div className="text-3xl font-black dark:text-white mt-2">$0 <span className="text-sm font-normal text-slate-500">/ forever</span></div>
                                <p className="text-sm text-slate-500 mt-4 leading-relaxed">Perfect for simple tasks and individual users exploring the platform.</p>
                                <ul className="space-y-4 mt-8">
                                    <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                                        <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                                        <span>Split up to 500 rows per file</span>
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

                        {/* Pro Plan */}
                        <div className="bg-slate-900 border-4 border-blue-500 p-8 rounded-2xl space-y-6 text-left relative overflow-hidden flex flex-col h-full transform hover:scale-[1.02] transition-all shadow-2xl shadow-blue-500/20">
                            <div className="absolute top-0 right-0 overflow-hidden w-32 h-32 pointer-events-none">
                                <div className="absolute top-6 -right-8 w-32 bg-blue-500 text-white text-[10px] font-black py-1.5 text-center rotate-45 shadow-lg uppercase tracking-widest">POPULAR</div>
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
                                        <span>Unlimited rows & sheets processing</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-blue-100">
                                        <CheckCircle size={18} className="text-blue-400 shrink-0 mt-0.5" />
                                        <span>Smart Logic: Keyword-based splitting (Total/Subtotal)</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-blue-100">
                                        <CheckCircle size={18} className="text-blue-400 shrink-0 mt-0.5" />
                                        <span>Real-time Full Editing: Edit directly in preview</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-blue-100">
                                        <CheckCircle size={18} className="text-blue-400 shrink-0 mt-0.5" />
                                        <span>Custom Naming: Use cell data for filenames</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-blue-100">
                                        <CheckCircle size={18} className="text-blue-400 shrink-0 mt-0.5" />
                                        <span>Multi-page PDF Comparison Tool</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-emerald-400 font-bold">
                                        <CheckCircle size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                                        <span>24/7 Priority VIP Support</span>
                                    </li>
                                </ul>
                            </div>
                            <button
                                onClick={() => window.open('https://gumroad.com/', '_blank')}
                                className="w-full py-4 bg-blue-500 text-white font-black rounded-xl hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/40 active:scale-95 flex items-center justify-center gap-2 group"
                            >
                                Get Started with ArchSub Pro <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
                    <div className="space-y-4 max-w-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                                <FileSpreadsheet size={18} />
                            </div>
                            <span className="text-lg font-black dark:text-white">ArchSub</span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                            The ultimate construction data suite. Split, compare, and master your BIM & Schedule data with AI precision.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-12 w-full md:w-auto">
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Company</h4>
                            <ul className="space-y-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                                <li>ArchSub Construction Management</li>
                                <li className="text-slate-400 dark:text-slate-500 font-medium">ArchSub HQ, Seoul, South Korea</li>
                                <li><a href="mailto:lsmith5695@gmail.com" className="hover:text-blue-500 transition-colors">lsmith5695@gmail.com</a></li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Legal</h4>
                            <ul className="space-y-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                                <li><button onClick={() => setLegalModal('privacy')} className="hover:text-blue-500 transition-colors">Privacy Policy</button></li>
                                <li><button onClick={() => setLegalModal('tos')} className="hover:text-blue-500 transition-colors">Terms of Service</button></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="max-w-6xl mx-auto mt-20 pt-8 border-t border-slate-100 dark:border-slate-900 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <div>© 2026 ARCHSUB TOOL. ALL RIGHTS RESERVED.</div>
                    <div className="flex gap-4">
                        <span className="flex items-center gap-1"><ShieldCheck size={12} /> SECURE CLOUD</span>
                        <span className="flex items-center gap-1"><Zap size={12} /> ENTERPRISE CORE</span>
                    </div>
                </div>
            </footer>

            {/* Legal Modal */}
            {legalModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-3xl max-h-[80vh] overflow-hidden rounded-[32px] flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="text-2xl font-black dark:text-white capitalize">
                                {legalModal === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
                            </h3>
                            <button onClick={() => setLegalModal(null)} className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-all">
                                <ArrowRight className="rotate-45" size={24} />
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-6 font-medium">
                            {legalModal === 'privacy' ? (
                                <div className="space-y-4">
                                    <p className="font-bold">Last Updated: February 18, 2026</p>
                                    <h5 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs">1. Information We Collect</h5>
                                    <p>We collect minimal information required to provide our services, including email for account management and payment processing data via Gumroad.</p>
                                    <h5 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs">2. Local Processing</h5>
                                    <p>Importantly, your Excel and PDF files are processed locally in your browser. We do NOT store or upload your sensitive construction data to our servers.</p>
                                    <h5 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs">3. Use of Data</h5>
                                    <p>We use your email only for authentication and critical service updates. We do not sell your personal information to third parties.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="font-bold">Last Updated: February 18, 2026</p>
                                    <h5 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs">1. Acceptance of Terms</h5>
                                    <p>By using ArchSub, you agree to these terms. Our tools are provided "as is" for professional productivity enhancement in construction management.</p>
                                    <h5 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs">2. Subscriptions & Payments</h5>
                                    <p>ArchSub Pro is a paid subscription. Billing is handled by Gumroad. You can cancel at any time, but refunds are subject to Gumroad's refund policy.</p>
                                    <h5 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs">3. Intellectual Property</h5>
                                    <p>The ArchSub brand, code, and logos are property of ArchSub Construction Management. You may not reverse engineer or scrape our services.</p>
                                </div>
                            )}
                        </div>
                        <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
                            <button onClick={() => setLegalModal(null)} className="px-6 py-2 bg-blue-500 text-white font-black rounded-lg hover:bg-blue-600 transition-all">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandingPage;
