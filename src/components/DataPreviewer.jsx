import React from 'react';
import { FileText, Scissors } from 'lucide-react';

const DataPreviewer = ({ previewData, headerRows, rowsPerFile, keywords, onCellEdit }) => {
    const handleBlur = (rowIndex, colIndex, e) => {
        const newValue = e.target.innerText;
        if (onCellEdit) {
            onCellEdit(rowIndex, colIndex, newValue);
        }
    };
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 flex flex-col h-full">
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Data Preview</h2>
            <div className="flex-1 overflow-hidden border border-slate-200 dark:border-slate-700 rounded-xl min-h-[300px]">
                <div className="overflow-auto h-full max-h-[500px]">
                    {previewData.length > 0 ? (
                        <table className="w-full text-left text-xs border-collapse">
                            <thead className="sticky top-0 z-20">
                                {previewData.slice(0, headerRows).map((row, rowIndex) => (
                                    <tr key={`h-${rowIndex}`} className="bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                                        <th className="px-3 py-3 font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap bg-slate-100 dark:bg-slate-700 w-10 text-center border-r border-slate-200 dark:border-slate-600">
                                            #
                                        </th>
                                        {Array.isArray(row) && row.map((cell, ci) => (
                                            <th
                                                key={ci}
                                                className="px-3 py-3 font-bold text-slate-800 dark:text-white whitespace-nowrap bg-slate-100 dark:bg-slate-700 outline-none focus:bg-white dark:focus:bg-slate-600 min-w-[50px]"
                                                contentEditable
                                                suppressContentEditableWarning
                                                onBlur={(e) => handleBlur(rowIndex, ci, e)}
                                            >
                                                {cell != null ? String(cell) : ''}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {previewData.slice(headerRows).map((row, rowIndex) => {
                                    const isPageBreak = rowsPerFile > 0 && (rowIndex + 1) % rowsPerFile === 0;
                                    const rowStr = Array.isArray(row) ? row.join(' ').toLowerCase() : '';
                                    const hasKeyword = keywords.some(k => k && rowStr.includes(k.toLowerCase()));

                                    return (
                                        <React.Fragment key={rowIndex}>
                                            <tr className={`${hasKeyword ? 'bg-amber-50 dark:bg-amber-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'} transition-colors`}>
                                                <td className="px-3 py-2 text-slate-400 font-medium text-center border-r border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20">
                                                    {headerRows + rowIndex + 1}
                                                </td>
                                                {Array.isArray(row) && row.map((cell, ci) => (
                                                    <td
                                                        key={ci}
                                                        className="px-3 py-2 text-slate-600 dark:text-slate-300 whitespace-nowrap max-w-[150px] truncate outline-none focus:bg-white dark:focus:bg-slate-700 min-w-[50px] cursor-text"
                                                        contentEditable
                                                        suppressContentEditableWarning
                                                        onBlur={(e) => handleBlur(headerRows + rowIndex, ci, e)}
                                                    >
                                                        {cell != null ? String(cell) : ''}
                                                    </td>
                                                ))}
                                            </tr>
                                            {isPageBreak && (
                                                <tr>
                                                    <td colSpan={(Array.isArray(row) ? row.length : 1) + 1} className="p-0">
                                                        <div className="relative py-3">
                                                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-dashed border-blue-500/50"></div></div>
                                                            <div className="relative flex justify-center">
                                                                <span className="bg-blue-500 px-3 py-0.5 text-[10px] font-bold text-white rounded-full flex items-center gap-1 z-10">
                                                                    <Scissors size={12} /> PAGE BREAK (Row {headerRows + rowIndex + 1})
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 py-16">
                            <FileText size={48} className="mb-3 opacity-30" />
                            <p className="text-sm font-medium px-4 text-center">Upload a file to see preview</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DataPreviewer;
