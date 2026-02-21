import React from 'react';
import { Bolt, CheckCircle, Lock, Timer, Download, FileText } from 'lucide-react';

const ExportSection = ({
    estimatedFiles,
    isProcessing,
    progress,
    isFinished,
    onExport,
    filesCount,
    namingFormat,
    setNamingFormat,
    namingInputRef,
    onAddTag,
    files,
    rowsPerFile,
    isProPlan
}) => {
    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-8">
                <div className="text-center space-y-4 lg:space-y-6">
                    <div>
                        <p className="text-slate-500 font-medium uppercase tracking-widest text-[10px] sm:text-sm mb-1 px-4">Ready to export</p>
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                            ~{estimatedFiles.toLocaleString()} Files
                        </h2>
                        <div className="mt-2 text-blue-500 font-bold text-sm bg-blue-50 dark:bg-blue-900/30 inline-block px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800">
                            {rowsPerFile.toLocaleString()} rows per page
                        </div>
                    </div>

                    <div className="relative">
                        {isProcessing ? (
                            <div className="w-full h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 overflow-hidden relative shadow-inner">
                                <div
                                    className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-300 ease-linear"
                                    style={{ width: `${progress}%` }}
                                />
                                <div className={`relative z-10 flex items-center justify-center h-full w-full font-bold text-lg ${progress > 55 ? 'text-white' : 'text-slate-500 dark:text-slate-300'}`}>
                                    Processing... {Math.round(progress)}%
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={onExport}
                                disabled={isFinished || filesCount === 0}
                                className={`w-full py-6 rounded-2xl font-black text-2xl shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 group active:scale-95
                                    ${isFinished ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                                        : filesCount === 0 ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                                            : 'bg-gradient-to-br from-blue-500 to-cyan-400 shadow-blue-500/40 hover:brightness-110 text-white'}`}
                            >
                                {isFinished ? <><CheckCircle size={32} /> Done!</> : <><Bolt size={32} /> Split Now</>}
                            </button>
                        )}
                    </div>

                    <div className="flex items-center justify-center gap-6 text-sm text-slate-400 font-medium">
                        <span className="flex items-center gap-1"><Lock size={16} /> Secure</span>
                        <span className="flex items-center gap-1"><Timer size={16} /> Fast</span>
                    </div>
                </div>
            </div>

            {isFinished && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border-2 border-emerald-100 dark:border-emerald-900/30 p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="text-emerald-500" size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">Process Complete!</h2>
                        <p className="text-emerald-600 dark:text-emerald-400 font-bold text-xl">{estimatedFiles.toLocaleString()} Files Generated</p>
                    </div>

                    <div className="text-left bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/50 rounded-xl p-5 space-y-4 relative">
                        {!isProPlan && (
                            <div className="absolute inset-0 z-10 bg-white/50 dark:bg-slate-800/50 backdrop-blur-[1px] rounded-xl flex flex-col items-center justify-center cursor-not-allowed">
                                <span className="bg-yellow-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded-md shadow-md mb-1">PRO FEATURE</span>
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 text-center">Custom Naming Rules</span>
                            </div>
                        )}
                        <h3 className="font-bold text-slate-700 dark:text-slate-200 uppercase tracking-tight text-xs">File Naming Rule</h3>
                        <input
                            ref={namingInputRef}
                            value={namingFormat}
                            onChange={(e) => isProPlan && setNamingFormat(e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-base py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-blue-500 shadow-sm disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-900"
                            type="text"
                            disabled={!isProPlan}
                        />
                        <div className={`flex flex-wrap gap-2 ${!isProPlan ? 'opacity-50' : ''}`}>
                            {['{Sheet Name}', '{Page Number}', '{Date}', '{Keyword}'].map((tag) => (
                                <button key={tag} onClick={() => isProPlan && onAddTag(tag)} className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-[10px] font-bold text-slate-500 hover:border-blue-500 transition-colors disabled:cursor-not-allowed" disabled={!isProPlan}>
                                    [{tag.replace(/[{}]/g, '')}]
                                </button>
                            ))}
                        </div>
                    </div>

                    <button onClick={onExport} className="w-full py-5 bg-gradient-to-br from-emerald-400 to-green-500 text-white rounded-2xl font-black text-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-3">
                        <Download size={28} /> Download Results
                    </button>

                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 text-left">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Live Output Preview</p>
                        <div className="space-y-2">
                            {files.filter(f => f.selected).slice(0, 2).map((file, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                                    <FileText className="text-emerald-500" size={18} />
                                    <span className="flex-1 truncate font-medium">{file.name.replace(/\.(xlsx|xls)$/i, '')}_Part1.xlsx</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExportSection;
