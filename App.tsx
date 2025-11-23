
import React, { useState } from 'react';
import { Platform, Step, ProductInput, DiagnosisResult, OptimizationResult, OptimizationPlan } from './types';
import PlatformCard from './components/PlatformCard';
import InputStep from './components/InputStep';
import AnalysisStep from './components/AnalysisStep';
import OptimizationStep from './components/OptimizationStep';
import ImageGenerationStep from './components/ImageGenerationStep';
import { performDiagnosis, generateOptimizations } from './services/geminiService';

const App: React.FC = () => {
  const [step, setStep] = useState<Step>('PLATFORM');
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [inputData, setInputData] = useState<ProductInput>({
    productUrl: '',
    title: '',
    price: '',
    description: '',
    competitorUrls: [''],
    competitorInfo: '',
    coreFeatures: ''
  });
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<OptimizationPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stepsList = [
    { id: 'PLATFORM', label: '平台选择' },
    { id: 'INPUT', label: '信息录入' },
    { id: 'DIAGNOSIS', label: '深度诊断' },
    { id: 'OPTIMIZATION', label: '方案生成' },
    { id: 'IMAGE_GENERATION', label: '视觉生成' },
  ];

  const currentStepIndex = stepsList.findIndex(s => s.id === step);

  const handlePlatformSelect = (p: Platform) => {
    setPlatform(p);
    setStep('INPUT');
  };

  const handleStartDiagnosis = async () => {
    if (!platform) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await performDiagnosis(platform, inputData);
      setDiagnosisResult(result);
      setStep('DIAGNOSIS');
    } catch (err) {
      setError("生成诊断失败，请检查您的输入或稍后重试。");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePlans = async () => {
    if (!platform || !diagnosisResult) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateOptimizations(platform, inputData, diagnosisResult);
      setOptimizationResult(result);
      setStep('OPTIMIZATION');
    } catch (err) {
      setError("生成优化方案失败。");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedToImageGeneration = (plan: OptimizationPlan) => {
    setSelectedPlan(plan);
    setStep('IMAGE_GENERATION');
  };

  const renderStep = () => {
    switch (step) {
      case 'PLATFORM':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in-up px-4">
            {(Object.values(Platform) as Platform[]).map((p) => (
              <PlatformCard
                key={p}
                platform={p}
                selected={platform === p}
                onClick={() => handlePlatformSelect(p)}
              />
            ))}
          </div>
        );
      case 'INPUT':
        return platform ? (
          <InputStep
            platform={platform}
            data={inputData}
            onChange={setInputData}
            onNext={handleStartDiagnosis}
            isLoading={isLoading}
          />
        ) : null;
      case 'DIAGNOSIS':
        return platform && diagnosisResult ? (
          <AnalysisStep
            platform={platform}
            result={diagnosisResult}
            onNext={handleGeneratePlans}
            isLoading={isLoading}
          />
        ) : null;
      case 'OPTIMIZATION':
        return platform && optimizationResult ? (
          <OptimizationStep
            platform={platform}
            result={optimizationResult}
            onNext={handleProceedToImageGeneration}
          />
        ) : null;
      case 'IMAGE_GENERATION':
        return selectedPlan ? (
          <ImageGenerationStep
            plan={selectedPlan}
            productDescription={inputData.description}
          />
        ) : null;
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'PLATFORM': return "Step 1: 选择电商平台";
      case 'INPUT': return "Step 2: 输入产品与竞品链接";
      case 'DIAGNOSIS': return "Step 3: AI 深度诊断";
      case 'OPTIMIZATION': return "Step 4: 制定优化方案";
      case 'IMAGE_GENERATION': return "Step 5: AI 视觉生成";
      default: return "";
    }
  };

  const reset = () => {
    setStep('PLATFORM');
    setPlatform(null);
    setInputData({ 
      productUrl: '',
      title: '', 
      price: '', 
      description: '', 
      competitorUrls: [''], 
      competitorInfo: '', 
      coreFeatures: '' 
    });
    setDiagnosisResult(null);
    setOptimizationResult(null);
    setSelectedPlan(null);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800 bg-[#fff1f2] selection:bg-rose-200">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-rose-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={reset}>
            <div className="bg-gradient-to-br from-rose-500 to-orange-400 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-rose-200 group-hover:scale-105 transition-transform">
              J
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-orange-500 leading-none mb-0.5">J-Ecom Master</h1>
              <p className="text-[10px] text-rose-400 font-medium tracking-wider">LISTING OPTIMIZER AI</p>
            </div>
          </div>
          <div className="text-sm font-medium">
            {platform && (
              <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full border border-rose-100 shadow-sm text-xs font-bold">
                {platform}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Stepper Indicator */}
      <div className="bg-white border-b border-rose-50 py-6 mb-8 shadow-sm">
        <div className="max-w-4xl mx-auto px-4">
          <div className="relative flex items-center justify-between w-full">
              {/* Background Line */}
              <div className="absolute left-0 top-5 w-full h-1 bg-slate-100 -z-10 rounded-full"></div>
              
              {/* Active Progress Line */}
              <div 
                  className="absolute left-0 top-5 h-1 bg-gradient-to-r from-rose-400 to-orange-400 -z-10 rounded-full transition-all duration-700 ease-in-out"
                  style={{ width: `${(currentStepIndex / (stepsList.length - 1)) * 100}%` }}
              ></div>

              {/* Steps */}
              {stepsList.map((s, index) => {
                  const isCompleted = index < currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  
                  return (
                      <div key={s.id} className="flex flex-col items-center group cursor-default relative">
                          <div 
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-4 transition-all duration-500 z-10 bg-white
                                  ${isCompleted 
                                      ? 'border-rose-500 text-rose-500 scale-100' 
                                      : isCurrent 
                                          ? 'border-rose-500 bg-rose-500 text-white scale-125 shadow-lg shadow-rose-300' 
                                          : 'border-slate-200 text-slate-300'
                                  }
                              `}
                          >
                              {isCompleted ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                              ) : (
                                index + 1
                              )}
                          </div>
                          <span 
                              className={`absolute top-12 text-xs font-bold whitespace-nowrap transition-all duration-300
                                  ${isCurrent ? 'text-rose-600 translate-y-0 opacity-100' : isCompleted ? 'text-slate-500 translate-y-0 opacity-100' : 'text-slate-300 translate-y-1 opacity-0 md:opacity-100 md:translate-y-0'}
                              `}
                          >
                              {s.label}
                          </span>
                      </div>
                  );
              })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 pb-12">
        {/* Only show Title for specific steps if needed, but Stepper covers most context. 
            Keeping a subtle title for context. */}
        <div className="mb-10 text-center animate-fade-in-up">
           <h2 className="text-2xl font-bold text-slate-800">{getStepTitle()}</h2>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-6 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl shadow-sm flex items-start animate-fade-in-up">
            <span className="text-2xl mr-4">⚠️</span>
            <div>
              <p className="font-bold">Error Occurred</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {renderStep()}
      </main>

      <footer className="mt-auto py-8 border-t border-rose-100 bg-white/50">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-rose-300 text-sm font-medium">&copy; 2024 J-Ecom Master AI. Designed for Professional Cross-Border Sellers.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
