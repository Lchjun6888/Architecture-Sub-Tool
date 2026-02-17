import { useState, useEffect, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import JSZip from 'jszip';

export const useExcelSplitter = () => {
    const [step, setStep] = useState(1);
    const [rowsPerFile, setRowsPerFile] = useState(28);
    const [keywords, setKeywords] = useState(['Total', 'Subtotal']);
    const [headerRows, setHeaderRows] = useState(4);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [files, setFiles] = useState([]);
    const [previewData, setPreviewData] = useState([]);
    const [namingFormat, setNamingFormat] = useState('{original}_{index}');
    const namingInputRef = useRef(null);

    const handleFileUpload = async (e) => {
        const uploadedFiles = Array.from(e.target.files);
        const newFiles = [];

        for (const file of uploadedFiles) {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const workbook = XLSX.read(arrayBuffer);

                const sheets = workbook.SheetNames.map(name => {
                    const worksheet = workbook.Sheets[name];
                    const range = worksheet['!ref'] ? XLSX.utils.decode_range(worksheet['!ref']) : { s: { r: 0 }, e: { r: 0 } };
                    return {
                        name,
                        rowCount: range.e.r - range.s.r + 1,
                        selected: false
                    };
                });

                // Removed automatic preview setting here, handled by useEffect

                newFiles.push({
                    id: Date.now() + Math.random().toString(36).substr(2, 9),
                    name: file.name,
                    size: (file.size / 1024).toFixed(1) + ' KB',
                    sheets: sheets,
                    selected: true,
                    rawFile: file
                });

            } catch (error) {
                console.error("Error reading file", error);
            }
        }

        if (newFiles.length > 0) {
            setFiles(prev => [...newFiles, ...prev]);
        }
        e.target.value = '';
    };

    const toggleFileSelection = (id) => {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, selected: !f.selected } : f));
    };

    const toggleSheetSelection = (fileId, sheetName) => {
        setFiles(prev => prev.map(f => {
            if (f.id === fileId) {
                const newSheets = f.sheets.map(s =>
                    s.name === sheetName ? { ...s, selected: !s.selected } : s
                );
                return { ...f, sheets: newSheets };
            }
            return f;
        }));
    };

    const removeFile = (e, id) => {
        e.stopPropagation();
        const remaining = files.filter(f => f.id !== id);
        setFiles(remaining);
        if (remaining.length === 0) {
            setPreviewData([]);
        }
    };

    const selectAllFiles = () => {
        setFiles(prev => prev.map(f => ({ ...f, selected: true })));
    };

    const clearAllFiles = () => {
        if (window.confirm('모든 파일을 삭제하시겠습니까?')) {
            setFiles([]);
            setPreviewData([]);
        }
    };

    // Automatically update preview when selection changes
    useEffect(() => {
        const updatePreview = async () => {
            const firstSelectedFile = files.find(f => f.selected);
            if (!firstSelectedFile) {
                setPreviewData([]);
                return;
            }

            const firstSelectedSheet = firstSelectedFile.sheets?.find(s => s.selected);
            if (!firstSelectedSheet) {
                // If no sheet is selected, show the first sheet of the file by default for preview? 
                // Or show empty? The user wants to choose sheets. 
                // Let's show the first sheet as a fallback if nothing selected, OR show message.
                // Actually, if nothing selected, let's just clear preview to be accurate.
                setPreviewData([]);
                return;
            }

            try {
                const arrayBuffer = await firstSelectedFile.rawFile.arrayBuffer();
                const workbook = XLSX.read(arrayBuffer);
                const worksheet = workbook.Sheets[firstSelectedSheet.name];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                setPreviewData(jsonData);
            } catch (err) {
                console.error("Preview update error:", err);
            }
        };

        updatePreview();
    }, [files]);

    const handleAddKeyword = () => {
        setKeywords([...keywords, '']);
    };

    const handleRemoveKeyword = (index) => {
        const newKeywords = keywords.filter((_, i) => i !== index);
        setKeywords(newKeywords);
    };

    const handleCellEdit = (rowIndex, colIndex, newValue) => {
        setPreviewData(prev => {
            const newData = [...prev];
            if (!newData[rowIndex]) newData[rowIndex] = [];
            newData[rowIndex][colIndex] = newValue;
            return newData;
        });
    };

    const estimatedFiles = useMemo(() => {
        if (files.length === 0) return 0;
        let totalRows = 0;
        files.forEach(f => {
            if (f.selected && f.sheets) {
                f.sheets.forEach(s => {
                    if (s.selected) totalRows += Math.max(0, s.rowCount - headerRows);
                });
            }
        });
        return Math.max(1, Math.ceil(totalRows / rowsPerFile));
    }, [files, rowsPerFile, headerRows]);

    const handleExport = async () => {
        if (files.length === 0) return;
        setIsProcessing(true);
        setProgress(0);

        try {
            const selectedFiles = files.filter(f => f.selected);
            const zip = new JSZip();
            let totalChunks = 0;
            let currentChunk = 0;

            // First, calculate total chunks for progress tracking
            selectedFiles.forEach(file => {
                const selectedSheets = file.sheets ? file.sheets.filter(s => s.selected) : [];
                selectedSheets.forEach(sheet => {
                    const bodyRows = Math.max(0, sheet.rowCount - headerRows);
                    totalChunks += Math.ceil(bodyRows / rowsPerFile);
                });
            });

            if (totalChunks === 0) {
                alert("No data to export based on current selections.");
                setIsProcessing(false);
                return;
            }

            for (const file of selectedFiles) {
                const arrayBuffer = await file.rawFile.arrayBuffer();
                const workbook = new ExcelJS.Workbook();
                await workbook.xlsx.load(arrayBuffer);

                const selectedSheetNames = file.sheets
                    ? file.sheets.filter(s => s.selected).map(s => s.name)
                    : [workbook.worksheets[0].name];

                for (const sheetName of selectedSheetNames) {
                    const originalSheet = workbook.getWorksheet(sheetName);
                    if (!originalSheet) continue;

                    const totalRows = originalSheet.rowCount;
                    if (totalRows <= headerRows) continue;

                    const bodyStartRow = headerRows + 1;
                    const bodyRowCount = totalRows - headerRows;

                    for (let i = 0; i < bodyRowCount; i += rowsPerFile) {
                        const chunkStart = bodyStartRow + i;
                        const chunkEnd = Math.min(chunkStart + rowsPerFile - 1, totalRows);

                        // Create a new workbook for this chunk
                        const chunkWorkbook = new ExcelJS.Workbook();
                        // Copy properties if needed
                        chunkWorkbook.creator = workbook.creator;
                        chunkWorkbook.lastModifiedBy = workbook.lastModifiedBy;
                        chunkWorkbook.created = workbook.created;
                        chunkWorkbook.modified = workbook.modified;

                        // Add a sheet with original name
                        const newSheet = chunkWorkbook.addWorksheet(sheetName);

                        // Copy column definitions (widths, styles)
                        newSheet.columns = originalSheet.columns?.map(col => ({
                            header: col.header,
                            key: col.key,
                            width: col.width,
                            style: col.style,
                            hidden: col.hidden,
                            outlineLevel: col.outlineLevel
                        }));

                        // Helper to safely copy cell value and styles, handling Shared Formulas
                        const copyCellValue = (sourceCell, targetCell) => {
                            const val = sourceCell.value;

                            if (val && typeof val === 'object' && val.sharedFormula) {
                                // Handle shared formula: if it's a clone (no direct formula string), 
                                // use the result to avoid exceljs master-lookup crash.
                                if (!val.formula) {
                                    targetCell.value = val.result !== undefined ? val.result : null;
                                } else {
                                    // It's the master, we can copy it as is
                                    targetCell.value = { ...val };
                                }
                            } else {
                                targetCell.value = val;
                            }

                            // Copy style
                            if (sourceCell.style) {
                                try {
                                    targetCell.style = JSON.parse(JSON.stringify(sourceCell.style));
                                } catch (e) {
                                    // Fallback if styling fails
                                }
                            }
                        };

                        // Copy Header Rows
                        for (let r = 1; r <= headerRows; r++) {
                            const sourceRow = originalSheet.getRow(r);
                            const targetRow = newSheet.getRow(r);

                            sourceRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                                const targetCell = targetRow.getCell(colNumber);

                                // Check for overrides in previewData
                                const previewRow = previewData[r - 1];
                                if (previewRow && previewRow[colNumber - 1] !== undefined) {
                                    targetCell.value = previewRow[colNumber - 1];
                                    // Also copy source styling if possible
                                    if (cell.style) {
                                        targetCell.style = JSON.parse(JSON.stringify(cell.style));
                                    }
                                } else {
                                    copyCellValue(cell, targetCell);
                                }
                            });
                            targetRow.height = sourceRow.height;
                        }

                        // Copy Body Rows for this chunk
                        for (let r = chunkStart; r <= chunkEnd; r++) {
                            const targetRowNum = headerRows + 1 + (r - chunkStart);
                            const sourceRow = originalSheet.getRow(r);
                            const targetRow = newSheet.getRow(targetRowNum);

                            sourceRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                                const targetCell = targetRow.getCell(colNumber);

                                // Check for overrides in previewData
                                const previewRow = previewData[r - 1];
                                if (previewRow && previewRow[colNumber - 1] !== undefined) {
                                    targetCell.value = previewRow[colNumber - 1];
                                    if (cell.style) {
                                        targetCell.style = JSON.parse(JSON.stringify(cell.style));
                                    }
                                } else {
                                    copyCellValue(cell, targetCell);
                                }
                            });
                            targetRow.height = sourceRow.height;
                        }

                        // Copy Merged Cells
                        // We use a safe check for model.merges as originalSheet.model.merges might exist
                        const merges = originalSheet.model?.merges || [];
                        merges.forEach(mergeRange => {
                            const [start, end] = mergeRange.split(':');
                            const startCell = originalSheet.getCell(start);
                            const endCell = originalSheet.getCell(end);

                            const startR = startCell.row;
                            const endR = endCell.row;

                            // If merge is entirely in header
                            if (endR <= headerRows) {
                                newSheet.mergeCells(mergeRange);
                            }
                            // If merge is entirely in current chunk body
                            else if (startR >= chunkStart && endR <= chunkEnd) {
                                const offset = chunkStart - (headerRows + 1);
                                const newStartR = startR - offset;
                                const newEndR = endR - offset;
                                const newStartC = startCell.col;
                                const newEndC = endCell.col;
                                newSheet.mergeCells(newStartR, newStartC, newEndR, newEndC);
                            }
                        });

                        const baseName = file.name.replace(/\.(xlsx|xls)$/i, '');
                        const fileName = namingFormat
                            .replace('{original}', baseName)
                            .replace('{index}', String(currentChunk + 1))
                            .replace('{Sheet Name}', sheetName)
                            .replace('{Page Number}', String(currentChunk + 1))
                            .replace('{Date}', new Date().toISOString().slice(0, 10))
                            .replace('{Keyword}', '') + '.xlsx';

                        const buffer = await chunkWorkbook.xlsx.writeBuffer();
                        zip.file(fileName, buffer);

                        currentChunk++;
                        setProgress(Math.round((currentChunk / totalChunks) * 90));
                    }
                }
            }

            setProgress(95);
            const content = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `split_results_${new Date().getTime()}.zip`;
            a.click();
            URL.revokeObjectURL(url);

            setProgress(100);
            setTimeout(() => {
                setIsProcessing(false);
                setIsFinished(true);
                setStep(4);
            }, 500);

        } catch (error) {
            console.error("Export error:", error);
            alert("Export failed: " + error.message);
            setIsProcessing(false);
            setProgress(0);
        }
    };

    const handleAddTag = (tag) => {
        const input = namingInputRef.current;
        if (input) {
            const start = input.selectionStart;
            const end = input.selectionEnd;
            const text = namingFormat;
            const before = text.substring(0, start);
            const after = text.substring(end, text.length);
            const newText = before + tag + after;
            setNamingFormat(newText);
            setTimeout(() => {
                input.focus();
                input.setSelectionRange(start + tag.length, start + tag.length);
            }, 0);
        } else {
            setNamingFormat(prev => prev + tag);
        }
    };

    return {
        step, setStep,
        rowsPerFile, setRowsPerFile,
        keywords, setKeywords,
        headerRows, setHeaderRows,
        isProcessing, progress,
        isFinished, setIsFinished,
        files, setFiles,
        previewData,
        namingFormat, setNamingFormat,
        namingInputRef,
        handleFileUpload,
        toggleFileSelection,
        toggleSheetSelection,
        removeFile,
        selectAllFiles,
        clearAllFiles,
        handleAddKeyword,
        handleRemoveKeyword,
        estimatedFiles,
        handleExport,
        handleAddTag,
        handleCellEdit
    };
};
