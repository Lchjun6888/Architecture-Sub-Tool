import React, { useState } from 'react';
import {
    HelpCircle,
    ChevronRight,
    ChevronLeft,
    X,
    Scissors,
    Layers,
    Settings,
    Play,
    Info,
    CheckCircle2
} from 'lucide-react';

const HelpGuide = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        {
            title: "Welcome to ArchSub",
            desc: "건축가를 위한 데이터 관리 및 블루프린트 비교 도구입니다. 복잡한 엑셀 작업과 도면 검토 시간을 90% 이상 단축해 드립니다.",
            icon: <Info className="text-blue-500" size={40} />,
            color: "blue"
        },
        {
            title: "Smart Excel Splitting",
            desc: "단순한 행 분할을 넘어, '소계/합계'와 같은 특정 키워드를 인식하여 논리적으로 파일을 자동 분배합니다. 4행 헤더 고정 기능도 잊지 마세요!",
            icon: <Scissors className="text-emerald-500" size={40} />,
            color: "emerald"
        },
        {
            title: "Blueprint (PDF) Compare",
            desc: "두 개의 PDF 도면을 픽셀 단위로 비교합니다. 수정된 부분(Added/Removed)이 각각 파랑/빨강으로 표시되어 오차 없는 검토가 가능합니다.",
            icon: <Layers className="text-indigo-500" size={40} />,
            color: "indigo"
        },
        {
            title: "Plan Management",
            desc: "무료 버전은 파일당 500줄 제한이 있습니다. 무제한 처리와 모든 Pro 기능(Smart Logic, PDF 비교 등)을 이용하시려면 $9.9 구독을 이용하세요.",
            icon: <Settings className="text-amber-500" size={40} />,
            color: "amber"
        }
    ];

    const nextStep = () => setCurrentStep(prev => (prev + 1) % steps.length);
    const prevStep = () => setCurrentStep(prev => (prev - 1 + steps.length) % steps.length);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 w-14 h-14 bg-white dark:bg-slate-800 rounded-full shadow-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-blue-500 hover:scale-110 active:scale-95 transition-all z-50 group"
            >
                <HelpCircle size={28} />
                <span className="absolute right-full mr-4 px-3 py-1.5 bg-blue-500 text-white text-xs font-black rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
                    Need Help?
                </span>
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-10 pt-10 pb-6 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <Play size={16} fill="currentColor" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quick Guide</span>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="p-2 text-slate-300 hover:text-slate-600 dark:hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-10 pb-10 text-center">
                    <div className={`mx-auto w-24 h-24 rounded-3xl bg-${steps[currentStep].color}-500/10 flex items-center justify-center mb-8 animate-in zoom-in-75 duration-500`}>
                        {steps[currentStep].icon}
                    </div>
                    <h3 className="text-2xl font-black dark:text-white mb-4 tracking-tight tracking-tight">
                        {steps[currentStep].title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        {steps[currentStep].desc}
                    </p>
                </div>

                {/* Footer / Navigation */}
                <div className="px-10 py-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex gap-1.5">
                        {steps.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-8 bg-blue-500' : 'w-2 bg-slate-200 dark:bg-slate-700'}`}
                            />
                        ))}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={prevStep}
                            className="p-3 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 transition-all"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={currentStep === steps.length - 1 ? () => setIsOpen(false) : nextStep}
                            className="bg-blue-500 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-blue-600 shadow-lg shadow-blue-500/30 transition-all"
                        >
                            {currentStep === steps.length - 1 ? 'Start Using' : 'Next Step'}
                            {currentStep !== steps.length - 1 && <ChevronRight size={18} />}
                            {currentStep === steps.length - 1 && <CheckCircle2 size={18} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpGuide;
