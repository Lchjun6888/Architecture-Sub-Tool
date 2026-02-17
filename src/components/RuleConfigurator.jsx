import React from 'react';
import { Scissors, Plus, X, List } from 'lucide-react';

const RuleConfigurator = ({ rowsPerFile, setRowsPerFile, keywords, setKeywords, headerRows, setHeaderRows, onAddKeyword, onRemoveKeyword }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">Split Rules</h2>
            <div className="space-y-6">
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <label className="font-bold text-lg dark:text-white">Rows per file</label>
                        <input
                            type="number"
                            min="1"
                            value={rowsPerFile}
                            onChange={(e) => setRowsPerFile(parseInt(e.target.value) || 1)}
                            className="w-24 px-3 py-1.5 bg-blue-500 text-white font-bold rounded-lg text-lg text-center outline-none focus:ring-2 focus:ring-blue-300"
                        />
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Scissors className="text-blue-500" size={24} />
                            <div>
                                <p className="font-bold text-lg leading-tight dark:text-white">Keywords</p>
                                <p className="text-xs text-slate-500">Break on specific words</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                            {keywords.map((keyword, index) => (
                                <div key={index} className="relative group">
                                    <input
                                        type="text"
                                        value={keyword}
                                        onChange={(e) => {
                                            const newKeywords = [...keywords];
                                            newKeywords[index] = e.target.value;
                                            setKeywords(newKeywords);
                                        }}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm pl-3 pr-8 py-2 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                                    />
                                    <button onClick={() => onRemoveKeyword(index)} className="absolute right-1.5 top-1.5 text-slate-400"><X size={16} /></button>
                                </div>
                            ))}
                        </div>
                        <button onClick={onAddKeyword} className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300"><Plus size={24} /></button>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                        <div className="flex items-center gap-3">
                            <List className="text-blue-500" size={24} />
                            <div>
                                <p className="font-bold text-lg leading-tight dark:text-white">Header Rows</p>
                                <p className="text-xs text-slate-500">Repeat top rows</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded uppercase">Fixed</span>
                            <input
                                type="number"
                                value={headerRows}
                                onChange={(e) => setHeaderRows(Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-10 h-8 text-center font-bold text-blue-500 bg-white dark:bg-slate-900 rounded-lg border border-blue-200 dark:border-blue-800 outline-none focus:ring-2 focus:ring-blue-500"
                                min="0"
                            />
                            <span className="text-sm font-bold text-slate-400">Rows</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RuleConfigurator;
