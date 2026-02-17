import React from 'react';
import { useExcelSplitter } from './hooks/useExcelSplitter';
import FileUploader from './components/FileUploader';
import RuleConfigurator from './components/RuleConfigurator';
import DataPreviewer from './components/DataPreviewer';
import ExportSection from './components/ExportSection';

const ExcelSplitter = () => {
    const {
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
    } = useExcelSplitter();

    return (
        <div className="max-w-6xl mx-auto py-4 px-2 space-y-10">
            {/* Steps Visual Indicator */}
            <div className="flex justify-between max-w-2xl mx-auto relative mb-12">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 -z-10" />
                <StepIndicator num={1} active={step >= 1} label="Upload" />
                <StepIndicator num={2} active={step >= 2} label="Configure" />
                <StepIndicator num={3} active={step >= 3} label="Split" />
                <StepIndicator num={4} active={step >= 4} label="Finished" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                {/* Left Column: Actions */}
                <div className="xl:col-span-5 space-y-8">
                    <FileUploader
                        files={files}
                        onUpload={handleFileUpload}
                        onToggle={toggleFileSelection}
                        onRemove={removeFile}
                        onSelectAll={selectAllFiles}
                        onClearAll={clearAllFiles}
                        onToggleSheet={toggleSheetSelection}
                        onConfirm={() => setStep(2)}
                        step={step}
                    />

                    {step >= 2 && (
                        <RuleConfigurator
                            rowsPerFile={rowsPerFile}
                            setRowsPerFile={setRowsPerFile}
                            keywords={keywords}
                            setKeywords={setKeywords}
                            headerRows={headerRows}
                            setHeaderRows={setHeaderRows}
                            onAddKeyword={handleAddKeyword}
                            onRemoveKeyword={handleRemoveKeyword}
                        />
                    )}
                </div>

                {/* Right Column: Preview & Export */}
                <div className="xl:col-span-7 space-y-8">
                    {files.length > 0 && (
                        <div className="h-full">
                            <DataPreviewer
                                previewData={previewData}
                                headerRows={headerRows}
                                rowsPerFile={rowsPerFile}
                                keywords={keywords}
                                onCellEdit={handleCellEdit}
                            />
                        </div>
                    )}

                    {step >= 2 && (
                        <ExportSection
                            estimatedFiles={estimatedFiles}
                            isProcessing={isProcessing}
                            progress={progress}
                            isFinished={isFinished}
                            onExport={handleExport}
                            filesCount={files.length}
                            namingFormat={namingFormat}
                            setNamingFormat={setNamingFormat}
                            namingInputRef={namingInputRef}
                            files={files}
                            rowsPerFile={rowsPerFile}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

const StepIndicator = ({ num, active, label }) => (
    <div className="flex flex-col items-center gap-2">
        <div className={`
            w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500
            ${active
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'}
        `}>
            {num}
        </div>
        <span className={`text-xs font-bold uppercase tracking-widest ${active ? 'text-blue-500' : 'text-slate-400'}`}>
            {label}
        </span>
    </div>
);

export default ExcelSplitter;
