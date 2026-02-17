import React, { useState, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { Upload, Layers, ZoomIn, ZoomOut, Download, RotateCw, FileDown, ChevronLeft, ChevronRight } from 'lucide-react';

// Set worker source for PDF.js - Using .min.mjs for version 5+ compatibility
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const PDFComparer = () => {
    const [fileBefore, setFileBefore] = useState(null);
    const [fileAfter, setFileAfter] = useState(null);
    const [isComparing, setIsComparing] = useState(false);
    const [scale, setScale] = useState(1.5);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [progress, setProgress] = useState(0); // 0~100
    const [progressText, setProgressText] = useState('');
    // All-page results: array of { pageNum, diffDataUrl, beforeDataUrl, afterDataUrl, width, height, hasDiff }
    const [diffResults, setDiffResults] = useState([]);
    const [viewPage, setViewPage] = useState(0); // index into diffResults for detail view

    const pdfBeforeRef = useRef(null);
    const pdfAfterRef = useRef(null);

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

    // Render a single page of a PDF to an offscreen canvas, return ImageData
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

    // Perform pixel diff between two ImageData objects, return { diffCanvas, hasDiff }
    // 3-pass approach: only pixels inside real-change clusters get colored markings.
    // If no colored marking appears → Identical. If markings appear → Changes Detected.
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

        // Pass 1: Build diff mask only (no rendering yet)
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
                if (diff > 30) {
                    diffMask[y * width + x] = 1;
                }
            }
        }

        // Pass 2: Block analysis — mark which 4x4 blocks contain real changes (not noise)
        const BLOCK = 4;
        const bCols = Math.ceil(width / BLOCK);
        const bRows = Math.ceil(height / BLOCK);
        const realBlock = new Uint8Array(bCols * bRows); // 1 = real change block
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
                if (blockCount >= 3) {
                    realBlock[by * bCols + bx] = 1;
                    realDiffBlocks++;
                }
            }
        }

        // Pass 3: Render — only color diff pixels that belong to real-change blocks
        let visibleDiffCount = 0;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                const r1 = data1[i], g1 = data1[i + 1], b1 = data1[i + 2];
                const bx = Math.floor(x / BLOCK);
                const by = Math.floor(y / BLOCK);
                const isRealBlock = realBlock[by * bCols + bx];

                if (diffMask[y * width + x] && isRealBlock) {
                    // This pixel is in a real-change cluster → show colored marking
                    visibleDiffCount++;
                    const x2 = x + offX;
                    const y2 = y + offY;
                    let r2 = 255, g2 = 255, b2 = 255;
                    if (x2 >= 0 && x2 < d2w && y2 >= 0 && y2 < d2h) {
                        const i2 = (y2 * d2w + x2) * 4;
                        r2 = data2[i2]; g2 = data2[i2 + 1]; b2 = data2[i2 + 2];
                    }
                    const isInkBefore = (r1 + g1 + b1) < 700;
                    const isInkAfter = (r2 + g2 + b2) < 700;
                    if (isInkBefore && !isInkAfter) {
                        // Removed in After → Red
                        diffImg.data[i] = 239; diffImg.data[i + 1] = 68; diffImg.data[i + 2] = 68; diffImg.data[i + 3] = 255;
                    } else if (!isInkBefore && isInkAfter) {
                        // Added in After → Blue
                        diffImg.data[i] = 59; diffImg.data[i + 1] = 130; diffImg.data[i + 2] = 246; diffImg.data[i + 3] = 255;
                    } else {
                        // Changed → Gray
                        diffImg.data[i] = 160; diffImg.data[i + 1] = 160; diffImg.data[i + 2] = 160; diffImg.data[i + 3] = 255;
                    }
                } else {
                    // Clean background (no marking)
                    const avg = (r1 + g1 + b1) / 3;
                    const brightness = 235 + (avg / 255) * 20;
                    diffImg.data[i] = brightness; diffImg.data[i + 1] = brightness; diffImg.data[i + 2] = brightness; diffImg.data[i + 3] = 255;
                }
            }
        }

        ctx.putImageData(diffImg, 0, 0);
        const totalPixels = width * height;
        const diffRatio = visibleDiffCount / totalPixels;
        // hasDiff = true only if there are enough visible colored pixels to actually see
        // A single character change produces 300+ pixels; line-heavy drawings produce noise up to ~100
        const hasDiff = realDiffBlocks > 0 && visibleDiffCount >= 200;
        return { dataUrl: canvas.toDataURL('image/png'), hasDiff, diffPixels: visibleDiffCount, diffPercent: (diffRatio * 100).toFixed(2), realDiffBlocks, width, height };
    }, []);

    // Main: compare ALL pages
    const runAllPagesComparison = async () => {
        if (!fileBefore || !fileAfter) return;
        setIsComparing(true);
        setDiffResults([]);
        setProgress(0);
        setProgressText('Loading PDFs...');

        try {
            // Load both PDFs
            const [abBefore, abAfter] = await Promise.all([fileBefore.arrayBuffer(), fileAfter.arrayBuffer()]);
            const pdfBefore = await pdfjsLib.getDocument({ data: abBefore, disableRange: true, disableAutoFetch: true }).promise;
            const pdfAfter = await pdfjsLib.getDocument({ data: abAfter, disableRange: true, disableAutoFetch: true }).promise;
            pdfBeforeRef.current = pdfBefore;
            pdfAfterRef.current = pdfAfter;

            const totalPages = Math.min(pdfBefore.numPages, pdfAfter.numPages);
            const results = [];

            for (let p = 1; p <= totalPages; p++) {
                setProgressText(`Comparing page ${p} / ${totalPages}...`);
                setProgress(Math.round(((p - 1) / totalPages) * 100));

                const [before, after] = await Promise.all([
                    renderPage(pdfBefore, p, scale),
                    renderPage(pdfAfter, p, scale),
                ]);

                const diffResult = performDiff(before.imageData, after.imageData, offset);

                results.push({
                    pageNum: p,
                    // If identical (below noise threshold), show clean original instead of noisy diff
                    diffDataUrl: diffResult.hasDiff ? diffResult.dataUrl : before.dataUrl,
                    beforeDataUrl: before.dataUrl,
                    afterDataUrl: after.dataUrl,
                    width: diffResult.width,
                    height: diffResult.height,
                    hasDiff: diffResult.hasDiff,
                    diffPixels: diffResult.diffPixels,
                    diffPercent: diffResult.diffPercent,
                });
            }

            setDiffResults(results);
            setProgress(100);
            setProgressText(`Done! ${totalPages} page(s) compared.`);
        } catch (error) {
            console.error("PDF Processing Error:", error);
            alert(`Error: ${error.message || "Failed to process PDFs"}. Please check if files are valid.`);
        } finally {
            setIsComparing(false);
        }
    };

    // Download single diff image
    const downloadSingleDiff = (result) => {
        const a = document.createElement('a');
        a.href = result.diffDataUrl;
        a.download = `diff_page_${result.pageNum}.png`;
        a.click();
    };

    // Download ALL diff images as ZIP
    const downloadAllAsZip = async () => {
        if (diffResults.length === 0) return;
        setProgressText('Creating ZIP...');
        const zip = new JSZip();
        const folder = zip.folder('pdf_diff_results');

        for (const result of diffResults) {
            // Convert data URL to blob
            const response = await fetch(result.diffDataUrl);
            const blob = await response.blob();
            folder.file(`diff_page_${result.pageNum}.png`, blob);
        }

        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pdf_comparison_results.zip';
        a.click();
        URL.revokeObjectURL(url);
        setProgressText(`Done! ${diffResults.length} page(s) compared.`);
    };

    const handleScaleChange = (val) => {
        const n = parseFloat(val);
        if (!isNaN(n) && n > 0.05 && n < 10) {
            setScale(n);
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white">Drawing Compare</h2>
                    <p className="text-slate-500 font-medium text-sm">Analyze visual revisions between two PDF blueprints — all pages at once</p>
                </div>

                <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    {/* Scale */}
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Zoom</span>
                        <button onClick={() => handleScaleChange(scale - 0.1)} className="p-1 hover:text-blue-500 transition-colors"><ZoomOut size={14} /></button>
                        <input
                            type="number"
                            step="0.1"
                            style={{ width: '50px' }}
                            value={scale}
                            onChange={(e) => handleScaleChange(e.target.value)}
                            className="bg-transparent text-sm font-bold outline-none text-center"
                        />
                        <button onClick={() => handleScaleChange(scale + 0.1)} className="p-1 hover:text-blue-500 transition-colors"><ZoomIn size={14} /></button>
                    </div>

                    {/* Offset Controls */}
                    <div className="flex items-center gap-4 px-4 py-1 border-l border-slate-100 dark:border-slate-800">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase">Offset X: {offset.x}px</span>
                            <input
                                type="range" min="-50" max="50" value={offset.x}
                                onChange={(e) => setOffset(prev => ({ ...prev, x: parseInt(e.target.value) }))}
                                className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase">Offset Y: {offset.y}px</span>
                            <input
                                type="range" min="-50" max="50" value={offset.y}
                                onChange={(e) => setOffset(prev => ({ ...prev, y: parseInt(e.target.value) }))}
                                className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>
                        <button
                            onClick={() => setOffset({ x: 0, y: 0 })}
                            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                            title="Reset Offset"
                        >
                            <RotateCw size={16} />
                        </button>
                    </div>

                    <button
                        onClick={runAllPagesComparison}
                        disabled={!fileBefore || !fileAfter || isComparing}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-black shadow-lg shadow-blue-500/30 hover:bg-blue-600 disabled:opacity-50 transition-all ml-2"
                    >
                        {isComparing ? "Processing..." : <><Layers size={18} /> Compare All Pages</>}
                    </button>

                    {diffResults.length > 0 && (
                        <button
                            onClick={downloadAllAsZip}
                            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-black shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-all"
                        >
                            <FileDown size={18} /> Download ZIP
                        </button>
                    )}
                </div>
            </header>

            {/* File Upload Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Before Upload */}
                <div className="glass p-6 rounded-2xl border-slate-200 dark:border-slate-800">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Before (Original)</h3>
                    {!fileBefore ? (
                        <div className="w-full border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-12 text-center relative hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                            <input type="file" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'before')} />
                            <Upload className="mx-auto text-slate-300 mb-2" size={32} />
                            <p className="text-sm font-bold text-slate-500">Upload Original Plan</p>
                        </div>
                    ) : (
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-500 text-white rounded flex items-center justify-center font-bold text-xs">PDF</div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold truncate max-w-[250px]">{fileBefore.name}</span>
                                    {pdfBeforeRef.current && <span className="text-[10px] text-slate-400">{pdfBeforeRef.current.numPages} pages</span>}
                                </div>
                            </div>
                            <button onClick={() => { setFileBefore(null); pdfBeforeRef.current = null; setDiffResults([]); }} className="text-slate-400 hover:text-red-500 text-xl">×</button>
                        </div>
                    )}
                </div>

                {/* After Upload */}
                <div className="glass p-6 rounded-2xl border-slate-200 dark:border-slate-800">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">After (Modified)</h3>
                    {!fileAfter ? (
                        <div className="w-full border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-12 text-center relative hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                            <input type="file" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, 'after')} />
                            <Upload className="mx-auto text-slate-300 mb-2" size={32} />
                            <p className="text-sm font-bold text-slate-500">Upload Modified Plan</p>
                        </div>
                    ) : (
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500 text-white rounded flex items-center justify-center font-bold text-xs">PDF</div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold truncate max-w-[250px]">{fileAfter.name}</span>
                                    {pdfAfterRef.current && <span className="text-[10px] text-slate-400">{pdfAfterRef.current.numPages} pages</span>}
                                </div>
                            </div>
                            <button onClick={() => { setFileAfter(null); pdfAfterRef.current = null; setDiffResults([]); }} className="text-slate-400 hover:text-red-500 text-xl">×</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            {isComparing && (
                <div className="glass p-4 rounded-2xl border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{progressText}</span>
                        <span className="text-sm font-black text-blue-500">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Results Grid — Thumbnail Gallery */}
            {diffResults.length > 0 && (
                <div className="space-y-6">
                    {/* Summary */}
                    <div className="glass p-4 rounded-2xl border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                                {diffResults.length} page(s) compared
                            </span>
                            <span className="text-xs px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full font-bold">
                                {diffResults.filter(r => r.hasDiff).length} with changes
                            </span>
                            <span className="text-xs px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full font-bold">
                                {diffResults.filter(r => !r.hasDiff).length} identical
                            </span>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <span className="text-[10px] font-bold text-slate-500">Removed</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span className="text-[10px] font-bold text-slate-500">Added</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
                                <span className="text-[10px] font-bold text-slate-500">Unchanged</span>
                            </div>
                        </div>
                    </div>

                    {/* Thumbnail Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {diffResults.map((result, idx) => (
                            <div
                                key={result.pageNum}
                                className={`group relative glass rounded-xl border-2 overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${result.hasDiff
                                    ? 'border-red-300 dark:border-red-700'
                                    : 'border-green-300 dark:border-green-700'
                                    } ${viewPage === idx ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                                onClick={() => setViewPage(idx)}
                            >
                                <img
                                    src={result.diffDataUrl}
                                    alt={`Page ${result.pageNum} diff`}
                                    className="w-full h-auto bg-white"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-white text-xs font-black">Page {result.pageNum}</span>
                                        {result.hasDiff ? (
                                            <span className="text-[9px] px-2 py-0.5 bg-red-500 text-white rounded-full font-bold">CHANGED</span>
                                        ) : (
                                            <span className="text-[9px] px-2 py-0.5 bg-green-500 text-white rounded-full font-bold">SAME</span>
                                        )}
                                    </div>
                                </div>
                                {/* Download button on hover */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); downloadSingleDiff(result); }}
                                    className="absolute top-2 right-2 p-1.5 bg-white/90 dark:bg-slate-800/90 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-500 hover:text-white"
                                    title={`Download Page ${result.pageNum}`}
                                >
                                    <Download size={14} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Detail View — Enlarged selected page */}
                    {diffResults[viewPage] && (
                        <div className="glass rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="bg-slate-50 dark:bg-slate-900 px-6 py-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-3">
                                    <button
                                        disabled={viewPage <= 0}
                                        onClick={() => setViewPage(p => p - 1)}
                                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg disabled:opacity-30 transition-colors"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <span className="text-sm font-black">
                                        Page {diffResults[viewPage].pageNum} / {diffResults.length}
                                    </span>
                                    <button
                                        disabled={viewPage >= diffResults.length - 1}
                                        onClick={() => setViewPage(p => p + 1)}
                                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg disabled:opacity-30 transition-colors"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                    {diffResults[viewPage].hasDiff ? (
                                        <span className="text-xs px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full font-bold ml-2">
                                            Changes Detected
                                        </span>
                                    ) : (
                                        <span className="text-xs px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full font-bold ml-2">
                                            Identical
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => downloadSingleDiff(diffResults[viewPage])}
                                    className="flex items-center gap-2 px-4 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors"
                                >
                                    <Download size={14} /> Download PNG
                                </button>
                            </div>
                            <div className="overflow-auto bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-6" style={{ maxHeight: '70vh' }}>
                                <img
                                    src={diffResults[viewPage].diffDataUrl}
                                    alt={`Page ${diffResults[viewPage].pageNum} detail`}
                                    className="shadow-2xl bg-white max-w-full"
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Empty state */}
            {!isComparing && diffResults.length === 0 && (
                <div className="glass rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 min-h-[300px] flex items-center justify-center">
                    <div className="text-slate-400 italic flex flex-col items-center gap-4">
                        <Layers size={48} className="opacity-20" />
                        <span>Upload two PDFs and click <strong>Compare All Pages</strong></span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PDFComparer;
