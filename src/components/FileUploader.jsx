import React from 'react';
import { CloudUpload, FileText, CheckCircle, X, ChevronDown, ChevronUp, Layers } from 'lucide-react';

const FileUploader = ({ files, onUpload, onToggle, onRemove, onSelectAll, onClearAll, onToggleSheet, onConfirm, step }) => {
    const [expandedFiles, setExpandedFiles] = React.useState({});

    const toggleExpand = (e, id) => {
        e.stopPropagation();
        setExpandedFiles(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Auto-expand newly uploaded files
    React.useEffect(() => {
        if (files.length > 0) {
            const newFileIds = files.map(f => f.id);
            setExpandedFiles(prev => {
                const updated = { ...prev };
                newFileIds.forEach(id => {
                    if (updated[id] === undefined) {
                        updated[id] = true;
                    }
                });
                return updated;
            });
        }
    }, [files]);
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold dark:text-white">Select Sheets</h2>
                <div className="flex gap-4">
                    <button onClick={onSelectAll} className="text-sm font-semibold text-blue-500 hover:text-blue-600 transition-colors">Select All</button>
                    <button onClick={onClearAll} className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors">Clear All</button>
                </div>
            </div>

            <div className="mb-4 relative group">
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all cursor-pointer">
                    <input
                        type="file"
                        multiple
                        accept=".xlsx, .xls"
                        onChange={onUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <CloudUpload className="text-blue-500" size={24} />
                        </div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            <span className="text-blue-500">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-slate-400">XLSX, XLS files supported</p>
                    </div>
                </div>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {files.map((file) => (
                    <React.Fragment key={file.id}>
                        <div
                            onClick={() => onToggle(file.id)}
                            className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all group ${file.selected
                                ? 'bg-slate-50 dark:bg-slate-900 border-blue-500 shadow-sm'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                                }`}
                        >
                            <FileText className={`mr-3 ${file.selected ? 'text-blue-500' : 'text-slate-400'}`} size={24} />
                            <div className="flex-1 min-w-0 pr-8">
                                <p className="font-bold text-base leading-tight truncate dark:text-white">{file.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-slate-500">
                                        {file.size}
                                        {file.sheets && ` · ${file.sheets.length} sheet${file.sheets.length > 1 ? 's' : ''}`}
                                    </p>
                                    {file.sheets && file.sheets.length > 0 && (
                                        <button
                                            onClick={(e) => toggleExpand(e, file.id)}
                                            className="flex items-center gap-1 text-[10px] font-bold text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-1.5 py-0.5 rounded transition-colors"
                                        >
                                            {expandedFiles[file.id] ? <><ChevronUp size={12} /> Hide Sheets</> : <><ChevronDown size={12} /> View Sheets</>}
                                        </button>
                                    )}
                                </div>
                            </div>
                            {file.selected ? (
                                <CheckCircle className="text-blue-500 flex-shrink-0" size={24} />
                            ) : (
                                <div className="w-6 h-6 border-2 border-slate-200 rounded-full flex-shrink-0"></div>
                            )}
                            <button
                                onClick={(e) => onRemove(e, file.id)}
                                className="absolute right-2 top-2 p-1 rounded-md bg-white dark:bg-slate-800 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm opacity-0 group-hover:opacity-100 transition-all z-20"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        {/* Sheet List Expansion */}
                        {expandedFiles[file.id] && file.sheets && (
                            <div className="mx-4 mb-4 mt-1 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                    <Layers size={10} /> Choose sheets to process:
                                </p>
                                <div className="grid grid-cols-1 gap-1">
                                    {file.sheets.map((sheet, sIdx) => (
                                        <div
                                            key={sIdx}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onToggleSheet(file.id, sheet.name);
                                            }}
                                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${sheet.selected
                                                ? 'bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400'
                                                : 'hover:bg-white dark:hover:bg-slate-800 text-slate-500'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <div className={`w-3.5 h-3.5 rounded border transition-colors flex items-center justify-center ${sheet.selected ? 'bg-blue-500 border-blue-500' : 'border-slate-300 dark:border-slate-600'}`}>
                                                    {sheet.selected && <CheckCircle className="text-white" size={10} />}
                                                </div>
                                                <span className="text-xs font-medium truncate">{sheet.name}</span>
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400 capitalize bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                                {sheet.rowCount.toLocaleString()} rows
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>

            {files.length > 0 && step === 1 && (
                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-center">
                    <button
                        onClick={onConfirm}
                        className="px-10 py-3 bg-blue-500 text-white rounded-xl font-black text-lg shadow-xl shadow-blue-500/30 hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all animate-in fade-in zoom-in duration-300"
                    >
                        Confirm Selection & Continue
                    </button>
                </div>
            )}
        </div>
    );
};

export default FileUploader;
