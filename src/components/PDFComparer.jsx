import React, { useState, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import {
    Upload, Layers, ZoomIn, ZoomOut, Download, RotateCw,
    FileDown, ChevronLeft, ChevronRight, Eye, Split,
    Maximize2, FileText, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';

// Set worker source for PDF.js - Using .min.mjs for version 5+ compatibility
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const PDFComparer = () => {
    // --- State ---
    const [fileBefore, setFileBefore] = useState(null);
    const [fileAfter, setFileAfter] = useState(null);
    const [isComparing, setIsComparing] = useState(false);
    const [scale, setScale] = useState(1.5);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [progress, setProgress] = useState(0);
    const [progressText, setProgressText] = useState('');
    const [diffResults, setDiffResults] = useState([]);
    const [viewPage, setViewPage] = useState(0);
    const [compareMode, setCompareMode] = useState('overlay'); // 'diff' | 'overlay' | 'side' | 'slider'
    const [sliderPos, setSliderPos] = useState(50);

    const pdfBeforeRef = useRef(null);
    const pdfAfterRef = useRef(null);

    // --- Handlers ---
    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (type === 'before') {
                setFileBefore(file);
                pdfBeforeRef.current = null;
            } else {
                setFileAfter(file);
                pdfAfterRef.current = null;
            }
            setDiffResults([]);
            setOffset({ x: 0, y: 0 });
        }
    };

    const handleScaleChange = (newVal) => {
        const s = Math.max(0.5, Math.min(3, parseFloat(newVal)));
        setScale(s);
        // We don't clear results immediately to allow previewing, 
        // but user will need to re-run "Compare All" if they want updated high-res diffs.
    };

    // --- PDF Logic ---
    const renderPage = async (pdf, pageNum, scaleVal) => {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: scaleVal });
        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        await page.render({ canvasContext: ctx, viewport }).promise;
        return {
            imageData: ctx.getImageData(0, 0, canvas.width, canvas.height),
            dataUrl: canvas.toDataURL('image/png'),
            width: canvas.width,
            height: canvas.height,
        };
    };

    const performDiff = useCallback((beforeData, afterData, off) => {
        const width = beforeData.width;
        const height = beforeData.height;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { alpha: false });
        const diffImg = ctx.createImageData(width, height);

        const data1 = beforeData.data;
        const data2 = afterData.data;
        const offX = Math.round(off.x);
        const offY = Math.round(off.y);
        const d2w = afterData.width;
        const d2h = afterData.height;

        // Pass 1: Build diff mask (lenient threshold)
        const diffMask = new Uint8Array(width * height);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                const x2 = x + offX;
                const y2 = y + offY;
                let r2 = 255, g2 = 255, b2 = 255;
                if (x2 >= 0 && x2 < d2w && y2 >= 0 && y2 < d2h) {
                    const i2 = (y2 * d2w + x2) * 4;
                    r2 = data2[i2]; g2 = data2[i2 + 1]; b2 = data2[i2 + 2];
                }
                const r1 = data1[i], g1 = data1[i + 1], b1 = data1[i + 2];
                const diff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);

                if (diff > 45) { // Lenient threshold
                    diffMask[y * width + x] = 1;
                }
            }
        }

        // Pass 2: Block analysis (more visual breathing room)
        const BLOCK = 6;
        const bCols = Math.ceil(width / BLOCK);
        const bRows = Math.ceil(height / BLOCK);
        const realBlock = new Uint8Array(bCols * bRows);
        let realDiffBlocks = 0;
        for (let by = 0; by < bRows; by++) {
            for (let bx = 0; bx < bCols; bx++) {
                let blockCount = 0;
                const yStart = by * BLOCK, xStart = bx * BLOCK;
                const maxDy = Math.min(BLOCK, height - yStart);
                const maxDx = Math.min(BLOCK, width - xStart);
                for (let dy = 0; dy < maxDy; dy++) {
                    for (let dx = 0; dx < maxDx; dx++) {
                        if (diffMask[(yStart + dy) * width + (xStart + dx)]) blockCount++;
                    }
                }
                if (blockCount >= 5) { // Clusters required
                    realBlock[by * bCols + bx] = 1;
                    realDiffBlocks++;
                }
            }
        }

        // Pass 3: Render
        let visibleDiffCount = 0;
        const out = diffImg.data;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                const bx = Math.floor(x / BLOCK), by = Math.floor(y / BLOCK);
                const isReal = realBlock[by * bCols + bx];

                const r1 = data1[i], g1 = data1[i + 1], b1 = data1[i + 2];
                const x2 = x + offX;
                const y2 = y + offY;
                let r2 = 255, g2 = 255, b2 = 255;
                if (x2 >= 0 && x2 < d2w && y2 >= 0 && y2 < d2h) {
                    const i2 = (y2 * d2w + x2) * 4;
                    r2 = data2[i2]; g2 = data2[i2 + 1]; b2 = data2[i2 + 2];
                }

                const grayBase = (r1 + g1 + b1) / 3;
                const displayGray = 120 + (grayBase * 0.53); // Significant improvement in line visibility (Black becomes #787878)

                if (isReal && diffMask[y * width + x]) {
                    // Difference detected
                    if (r1 < r2 - 20 || g1 < g2 - 20 || b1 < b2 - 20) {
                        // Added (Blue) - Stronger visibility
                        out[i] = 0; out[i + 1] = 70; out[i + 2] = 255; out[i + 3] = 255;
                    } else {
                        // Removed (Red) - Stronger visibility
                        out[i] = 255; out[i + 1] = 0; out[i + 2] = 0; out[i + 3] = 255;
                    }
                    visibleDiffCount++;
                } else {
                    // Clear background lines - much more visible now
                    out[i] = out[i + 1] = out[i + 2] = displayGray;
                    out[i + 3] = 255;
                }
            }
        }

        ctx.putImageData(diffImg, 0, 0);
        const hasDiff = realDiffBlocks > 0 && visibleDiffCount >= 300;
        return {
            diffDataUrl: canvas.toDataURL('image/png'),
            hasDiff,
            diffPixels: visibleDiffCount,
            diffPercent: ((visibleDiffCount / (width * height)) * 100).toFixed(2),
            width, height
        };
    }, []);

    const runAllPagesComparison = async () => {
        setIsComparing(true);
        setProgress(0);
        setProgressText('Initializing PDFs...');

        try {
            const arrayBufferBefore = await fileBefore.arrayBuffer();
            const arrayBufferAfter = await fileAfter.arrayBuffer();

            pdfBeforeRef.current = await pdfjsLib.getDocument(arrayBufferBefore).promise;
            pdfAfterRef.current = await pdfjsLib.getDocument(arrayBufferAfter).promise;

            const numPages = Math.min(pdfBeforeRef.current.numPages, pdfAfterRef.current.numPages);
            const results = [];

            for (let i = 1; i <= numPages; i++) {
                setProgressText(`Processing Page ${i} of ${numPages}...`);
                const beforePage = await renderPage(pdfBeforeRef.current, i, scale);
                const afterPage = await renderPage(pdfAfterRef.current, i, scale);

                const diffResult = performDiff(beforePage.imageData, afterPage.imageData, offset);

                results.push({
                    pageNum: i,
                    beforeDataUrl: beforePage.dataUrl,
                    afterDataUrl: afterPage.dataUrl,
                    ...diffResult
                });

                setProgress(Math.round((i / numPages) * 100));
            }

            setDiffResults(results);
            setViewPage(0);
            setProgressText('Comparison Complete!');
        } catch (err) {
            console.error(err);
            setProgressText('Error comparing PDFs.');
        } finally {
            setIsComparing(false);
        }
    };

    const downloadSingleDiff = (result) => {
        const link = document.createElement('a');
        link.download = `diff_page_${result.pageNum}.png`;
        link.href = result.diffDataUrl;
        link.click();
    };

    const downloadAllAsZip = async () => {
        const zip = new JSZip();
        diffResults.forEach(r => {
            const data = r.diffDataUrl.split(',')[1];
            zip.file(`Page_${r.pageNum}_diff.png`, data, { base64: true });
        });
        const blob = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.download = 'Revision_Diffs.zip';
        link.href = URL.createObjectURL(blob);
        link.click();
    };

    // --- Render Helpers ---
    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500">
            {/* Header / Controls */}
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <Layers className="text-blue-500" /> Drawing Compare
                    </h2>
                    <p className="text-slate-500 font-medium text-sm mt-1">Multi-page professional blueprint revision analysis</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    {/* Zoom / Scale Controls */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Zoom</span>
                        <div className="flex items-center gap-1">
                            <button onClick={() => handleScaleChange(scale - 0.2)} className="p-1 hover:text-blue-500 transition-colors"><ZoomOut size={14} /></button>
                            <span className="text-xs font-black min-w-[35px] text-center">{(scale * 100).toFixed(0)}%</span>
                            <button onClick={() => handleScaleChange(scale + 0.2)} className="p-1 hover:text-blue-500 transition-colors"><ZoomIn size={14} /></button>
                        </div>
                    </div>

                    {/* Offset Controls */}
                    <div className="flex items-center gap-4 px-4 py-1.5 border-l border-slate-100 dark:border-slate-800">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] font-black text-slate-400 uppercase leading-none">Offset X: {offset.x}px</span>
                            <input
                                type="range" min="-30" max="30" value={offset.x}
                                onChange={(e) => setOffset(prev => ({ ...prev, x: parseInt(e.target.value) }))}
                                className="w-20 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] font-black text-slate-400 uppercase leading-none">Offset Y: {offset.y}px</span>
                            <input
                                type="range" min="-30" max="30" value={offset.y}
                                onChange={(e) => setOffset(prev => ({ ...prev, y: parseInt(e.target.value) }))}
                                className="w-20 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>
                        <button
                            onClick={() => setOffset({ x: 0, y: 0 })}
                            className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                            title="Reset Offset"
                        >
                            <RotateCw size={14} />
                        </button>
                    </div>

                    <button
                        onClick={runAllPagesComparison}
                        disabled={!fileBefore || !fileAfter || isComparing}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black shadow-lg shadow-blue-500/30 hover:bg-blue-700 disabled:opacity-50 transition-all ml-1"
                    >
                        {isComparing ? <><RefreshCw className="animate-spin" size={16} /> Comparing...</> : <><Layers size={18} /> Compare All Pages</>}
                    </button>

                    {diffResults.length > 0 && (
                        <button
                            onClick={downloadAllAsZip}
                            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-black shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 transition-all"
                        >
                            <FileDown size={18} /> ZIP All
                        </button>
                    )}
                </div>
            </header>

            {/* File Upload Area (Only if no results) */}
            {diffResults.length === 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="glass p-8 rounded-[32px] border-slate-200 dark:border-slate-800 flex flex-col items-center">
                        <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600 mb-4">
                            <FileText size={24} />
                        </div>
                        <h3 className="text-lg font-black dark:text-white mb-2 underline decoration-red-500/30 underline-offset-4">1. Original Plan (Before)</h3>
                        <p className="text-slate-500 text-sm text-center mb-6">Select the reference document for comparison.</p>

                        {!fileBefore ? (
                            <div className="w-full h-40 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl flex flex-col items-center justify-center relative group hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all">
                                <input type="file" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'before')} />
                                <Upload className="text-slate-300 group-hover:text-blue-500 transition-colors mb-2" size={32} />
                                <span className="text-sm font-bold text-slate-400">Click to upload PDF</span>
                            </div>
                        ) : (
                            <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 flex items-center justify-between border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-500 text-white rounded-lg flex items-center justify-center font-black text-xs">PDF</div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-black dark:text-white truncate max-w-[180px]">{fileBefore.name}</span>
                                        <span className="text-[10px] text-slate-400 font-bold">READY TO COMPARE</span>
                                    </div>
                                </div>
                                <button onClick={() => setFileBefore(null)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">×</button>
                            </div>
                        )}
                    </div>

                    <div className="glass p-8 rounded-[32px] border-slate-200 dark:border-slate-800 flex flex-col items-center">
                        <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 mb-4">
                            <Layers size={24} />
                        </div>
                        <h3 className="text-lg font-black dark:text-white mb-2 underline decoration-blue-500/30 underline-offset-4">2. Modified Plan (After)</h3>
                        <p className="text-slate-500 text-sm text-center mb-6">Select the revised version of the document.</p>

                        {!fileAfter ? (
                            <div className="w-full h-40 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl flex flex-col items-center justify-center relative group hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all">
                                <input type="file" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'after')} />
                                <Upload className="text-slate-300 group-hover:text-blue-500 transition-colors mb-2" size={32} />
                                <span className="text-sm font-bold text-slate-400">Click to upload PDF</span>
                            </div>
                        ) : (
                            <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 flex items-center justify-between border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center font-black text-xs">PDF</div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-black dark:text-white truncate max-w-[180px]">{fileAfter.name}</span>
                                        <span className="text-[10px] text-slate-400 font-bold">READY TO COMPARE</span>
                                    </div>
                                </div>
                                <button onClick={() => setFileAfter(null)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">×</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Progress Bar */}
            {isComparing && (
                <div className="glass p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 h-1 bg-blue-500/20 w-full" />
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <RefreshCw className="text-blue-500 animate-spin" size={20} />
                            <span className="text-sm font-black text-slate-700 dark:text-slate-200">{progressText}</span>
                        </div>
                        <span className="text-lg font-black text-blue-500">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-blue-600 via-blue-400 to-cyan-400 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Comparison Results Area */}
            {diffResults.length > 0 && (
                <div className="flex flex-col gap-6">
                    {/* Results Overview Bar */}
                    <div className="glass p-4 rounded-[24px] border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-sm">
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compared</span>
                                <span className="text-lg font-black dark:text-white leading-none">{diffResults.length} Pages</span>
                            </div>
                            <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revisions Found</span>
                                <span className={`text-lg font-black leading-none ${diffResults.some(r => r.hasDiff) ? 'text-red-500' : 'text-emerald-500'}`}>
                                    {diffResults.filter(r => r.hasDiff).length} Items
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 bg-red-500 rounded-md shadow-sm shadow-red-500/30"></div><span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter">Deletions</span></div>
                            <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 bg-blue-500 rounded-md shadow-sm shadow-blue-500/30"></div><span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter">Additions</span></div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6 items-stretch">
                        {/* LEFT: Thumbnail Sidebar */}
                        <aside className="w-full lg:w-80 flex-shrink-0">
                            <div className="glass rounded-[32px] border border-slate-200 dark:border-slate-800 flex flex-col h-[82vh] shadow-lg sticky top-28">
                                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Document Pages</h3>
                                    <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{diffResults.length}</span>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                    {diffResults.map((result, idx) => (
                                        <button
                                            key={result.pageNum}
                                            className={`
                                                w-full group relative glass rounded-2xl border-2 overflow-hidden cursor-pointer transition-all duration-300
                                                ${viewPage === idx
                                                    ? 'border-blue-500 ring-4 ring-blue-500/10 scale-[0.98]'
                                                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                                                }
                                            `}
                                            onClick={() => setViewPage(idx)}
                                        >
                                            <div className="aspect-[4/3] rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden bg-white group-hover:border-blue-500 transition-all shadow-sm">
                                                <img src={result.beforeDataUrl || result.afterDataUrl} alt="" className="w-full h-full object-contain p-2" />
                                            </div>
                                            <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-md px-1.5 py-0.5 rounded-md text-[9px] text-white font-black shadow-lg">
                                                P. {result.pageNum}
                                            </div>
                                            {result.hasDiff && (
                                                <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-500 text-white px-1.5 py-0.5 rounded-md text-[8px] font-black shadow-lg animate-pulse">
                                                    DIFF detected
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </aside>

                        {/* CENTER: Main Multi-Panel View */}
                        <div className="flex-1 min-w-0">
                            {diffResults[viewPage] && (
                                <div className="glass rounded-[32px] border border-slate-200 dark:border-slate-800 overflow-hidden h-[82vh] flex flex-col shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] dark:bg-slate-900/50">
                                    {/* Sub-Header / Toggles */}
                                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-8 py-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 z-10">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-black text-lg">
                                                {diffResults[viewPage].pageNum}
                                            </div>
                                            <div className="flex flex-col">
                                                <h4 className="text-xl font-black text-slate-800 dark:text-white leading-none mb-1 flex items-center gap-2">
                                                    Revision Analysis
                                                    {diffResults[viewPage].hasDiff ? <AlertCircle size={16} className="text-red-500" /> : <CheckCircle2 size={16} className="text-emerald-500" />}
                                                </h4>
                                                <span className={`text-xs font-bold uppercase tracking-widest ${diffResults[viewPage].hasDiff ? 'text-red-500' : 'text-emerald-500'}`}>
                                                    {diffResults[viewPage].hasDiff ? `${diffResults[viewPage].diffPercent}% change detected in this page` : 'Perfect Match (No changes)'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[22px] shadow-inner">
                                                <button
                                                    onClick={() => setCompareMode('overlay')}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black transition-all ${compareMode === 'overlay' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm scale-110' : 'text-slate-500'}`}
                                                >
                                                    <Maximize2 size={14} /> RESULT
                                                </button>
                                                <button
                                                    onClick={() => setCompareMode('slider')}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black transition-all ${compareMode === 'slider' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm scale-110' : 'text-slate-500'}`}
                                                >
                                                    <Split size={14} /> SLIDER
                                                </button>
                                                <button
                                                    onClick={() => setCompareMode('side')}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black transition-all ${compareMode === 'side' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm scale-110' : 'text-slate-500'}`}
                                                >
                                                    <Eye size={14} /> 2-PANEL
                                                </button>
                                                <button
                                                    onClick={() => setCompareMode('diff')}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black transition-all ${compareMode === 'diff' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm scale-110' : 'text-slate-500'}`}
                                                >
                                                    <Layers size={14} /> 3-PANEL
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => downloadSingleDiff(diffResults[viewPage])}
                                                className="w-11 h-11 flex items-center justify-center bg-blue-600 text-white rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                                                title="Download this page"
                                            >
                                                <Download size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Interactive Scroll Area */}
                                    <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950/80 custom-scrollbar-horizontal p-6">
                                        {compareMode === 'diff' && (
                                            /* --- 3-PANEL VIEW --- */
                                            <div className="flex gap-8 min-h-full items-start justify-center min-w-max px-4">
                                                <div className="flex-1 min-w-[380px] max-w-[550px] flex flex-col gap-3 group">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">01. BEFORE</span>
                                                    <div className="rounded-[24px] overflow-hidden border border-slate-200 dark:border-slate-800 bg-white shadow-xl min-w-[300px]">
                                                        <img src={diffResults[viewPage].beforeDataUrl} alt="" className="w-full h-auto" />
                                                    </div>
                                                </div>
                                                <div className="flex-[1.5] min-w-[500px] max-w-[850px] flex flex-col gap-3 group">
                                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest text-center">ANALYSIS RESULT</span>
                                                    <div className="rounded-[32px] overflow-hidden border-4 border-white dark:border-slate-800 bg-white shadow-2xl scale-[1.02]">
                                                        <img src={diffResults[viewPage].diffDataUrl} alt="" className="w-full h-auto" />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-[380px] max-w-[550px] flex flex-col gap-3 group">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right px-2">02. AFTER</span>
                                                    <div className="rounded-[24px] overflow-hidden border border-slate-200 dark:border-slate-800 bg-white shadow-xl min-w-[300px]">
                                                        <img src={diffResults[viewPage].afterDataUrl} alt="" className="w-full h-auto" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {compareMode === 'overlay' && (
                                            /* --- SINGLE RESULT VIEW --- */
                                            <div className="flex justify-center h-full items-center">
                                                <div className="relative h-full w-full group flex items-center justify-center">
                                                    <div className="absolute inset-0 bg-blue-500/5 rounded-[40px] blur-3xl" />
                                                    <img
                                                        src={diffResults[viewPage].diffDataUrl}
                                                        alt="Comparison Result"
                                                        className="relative max-w-full max-h-full object-contain shadow-2xl bg-white border-2 border-slate-100 dark:border-slate-800 rounded-2xl"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {compareMode === 'side' && (
                                            /* --- SIDE-BY-SIDE (2-PANEL) --- */
                                            <div className="flex gap-6 h-full w-full">
                                                <div className="flex-1 min-w-0 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg flex flex-col">
                                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 text-center font-black text-[9px] uppercase tracking-widest flex-none">Original Before</div>
                                                    <div className="flex-1 overflow-hidden p-4 flex items-center justify-center bg-slate-50/30">
                                                        <img src={diffResults[viewPage].beforeDataUrl} alt="" className="max-w-full max-h-full object-contain shadow-sm" />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg flex flex-col">
                                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 text-center font-black text-[9px] uppercase tracking-widest flex-none">Revised After</div>
                                                    <div className="flex-1 overflow-hidden p-4 flex items-center justify-center bg-slate-50/30">
                                                        <img src={diffResults[viewPage].afterDataUrl} alt="" className="max-w-full max-h-full object-contain shadow-sm" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {compareMode === 'slider' && (
                                            /* --- INTERACTIVE SLIDER VIEW --- */
                                            <div className="flex justify-center h-full items-center">
                                                <div className="relative max-w-full max-h-full aspect-[4/3] bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 select-none">
                                                    <img src={diffResults[viewPage].afterDataUrl} className="absolute inset-0 w-full h-full object-contain" alt="After" />
                                                    <div
                                                        className="absolute inset-0 overflow-hidden border-r-2 border-white/50"
                                                        style={{ width: `${sliderPos}%` }}
                                                    >
                                                        <img src={diffResults[viewPage].beforeDataUrl} className="absolute inset-0 w-full h-full object-contain" alt="Before" style={{ width: `calc(100% * (100 / ${sliderPos}))` }} />
                                                    </div>
                                                    <div
                                                        className="absolute inset-y-0 z-10 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-col-resize group"
                                                        style={{ left: `${sliderPos}%` }}
                                                    >
                                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-blue-500 scale-100 group-hover:scale-110 transition-transform">
                                                            <div className="flex gap-1">
                                                                <div className="w-1 h-3 bg-blue-500 rounded-full" />
                                                                <div className="w-1 h-3 bg-blue-500 rounded-full" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <input
                                                        type="range" min="0" max="100" value={sliderPos}
                                                        onChange={(e) => setSliderPos(e.target.value)}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-col-resize z-20"
                                                    />
                                                    <div className="absolute bottom-6 left-6 px-4 py-2 bg-slate-900/60 backdrop-blur-md rounded-xl text-[10px] font-black text-white uppercase tracking-widest pointer-events-none">BEFORE</div>
                                                    <div className="absolute bottom-6 right-6 px-4 py-2 bg-blue-600/80 backdrop-blur-md rounded-xl text-[10px] font-black text-white uppercase tracking-widest pointer-events-none">AFTER</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!isComparing && diffResults.length === 0 && (
                <div className="glass rounded-[40px] border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 min-h-[400px] flex flex-col items-center justify-center gap-6 p-10 mt-12">
                    <div className="p-8 rounded-[32px] bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-700 animate-pulse">
                        <Layers size={80} strokeWidth={1.5} />
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-2xl font-black text-slate-700 dark:text-slate-300">Ready for Document Comparison</h3>
                        <p className="text-slate-500 font-medium max-w-md mx-auto">Upload two versions of the same blueprint to visualize all modifications, additions, and deletions across all pages automatically.</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-black text-slate-400 uppercase tracking-widest mt-4">
                        <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Pixel-Perfect Accuracy</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                        <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> All-Page Processing</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                        <span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Vector Analysis</span>
                    </div>
                </div>
            )}

            {/* SEO Footnote - Visually subtle */}
            <footer className="pt-20 text-center">
                <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.5em]">Architecture Assistant PDF Engine v5.0 PRO</p>
            </footer>
        </div>
    );
};

export default PDFComparer;
