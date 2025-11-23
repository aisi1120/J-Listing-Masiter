
import React, { useState } from 'react';
import { ProductInput, Platform } from '../types';
import { extractProductInfo } from '../services/geminiService';

interface InputStepProps {
  platform: Platform;
  data: ProductInput;
  onChange: (data: ProductInput) => void;
  onNext: () => void;
  isLoading: boolean;
}

const InputStep: React.FC<InputStepProps> = ({ platform, data, onChange, onNext, isLoading }) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);

  const handleChange = (field: keyof ProductInput, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleCompetitorUrlChange = (index: number, value: string) => {
    const newUrls = [...data.competitorUrls];
    newUrls[index] = value;
    handleChange('competitorUrls', newUrls);
  };

  const addCompetitorUrl = () => {
    if (data.competitorUrls.length < 3) {
      handleChange('competitorUrls', [...data.competitorUrls, '']);
    }
  };

  const handleExtract = async () => {
    if (!data.productUrl) return;
    setIsExtracting(true);
    setExtractError(null);
    try {
      const info = await extractProductInfo(data.productUrl);
      onChange({
        ...data,
        title: info.title || data.title,
        price: info.price || data.price,
        description: info.description || data.description,
      });
    } catch (err) {
      setExtractError("无法从链接提取信息，请检查链接或手动输入。");
    } finally {
      setIsExtracting(false);
    }
  };

  const isReady = data.title && data.title.length > 0;

  return (
    <div className="space-y-8 animate-fade-in-up">
      
      {/* Step 1: Link Input & Extraction */}
      <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-bl-full -mr-10 -mt-10 z-0"></div>
        <h3 className="relative z-10 text-xl font-bold text-slate-800 mb-6 flex items-center">
          <span className="bg-rose-100 text-rose-600 w-10 h-10 rounded-full flex items-center justify-center mr-4 text-sm font-bold shadow-sm">1</span>
          产品链接 (Product Link)
        </h3>
        
        <div className="relative z-10">
          <label className="block text-sm font-bold text-slate-600 mb-2">输入您要优化的产品页面链接</label>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={data.productUrl}
              onChange={(e) => handleChange('productUrl', e.target.value)}
              placeholder="https://item.rakuten.co.jp/shop/item..."
              className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none transition-all placeholder-slate-400 shadow-inner"
            />
            <button
              onClick={handleExtract}
              disabled={isExtracting || !data.productUrl}
              className={`px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center whitespace-nowrap
                ${isExtracting || !data.productUrl
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-rose-500 to-pink-600 hover:scale-105 active:scale-95'
                }
              `}
            >
              {isExtracting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  读取中...
                </>
              ) : (
                <>✨ 智能提取信息</>
              )}
            </button>
          </div>
          {extractError && <p className="text-rose-500 text-sm mt-2 font-medium">{extractError}</p>}
        </div>

        {/* Extracted Data Preview (Collapsible or visible) */}
        {(data.title || isExtracting) && (
          <div className={`mt-8 p-6 bg-slate-50/80 rounded-2xl border border-slate-100 transition-all duration-500 ${isExtracting ? 'opacity-50 blur-sm' : 'opacity-100'}`}>
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">提取到的产品信息 (可手动修正)</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 mb-1">产品标题</label>
                  <input
                    type="text"
                    value={data.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-rose-300 outline-none"
                    placeholder="等待提取..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">价格</label>
                  <input
                    type="text"
                    value={data.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-rose-300 outline-none"
                    placeholder="等待提取..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">产品详情摘要</label>
                <textarea
                  value={data.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                  className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-rose-300 outline-none resize-y"
                  placeholder="等待提取..."
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Competitors */}
      <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-50">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
          <span className="bg-rose-100 text-rose-600 w-10 h-10 rounded-full flex items-center justify-center mr-4 text-sm font-bold shadow-sm">2</span>
          竞品链接 (Competitor Links)
        </h3>
        <div className="space-y-3">
          {data.competitorUrls.map((url, idx) => (
            <input
              key={idx}
              type="text"
              value={url}
              onChange={(e) => handleCompetitorUrlChange(idx, e.target.value)}
              placeholder={`竞品 URL ${idx + 1}`}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none transition-all placeholder-slate-400"
            />
          ))}
          {data.competitorUrls.length < 3 && (
            <button
              onClick={addCompetitorUrl}
              className="text-rose-500 text-sm font-bold hover:text-rose-600 flex items-center"
            >
              + 添加更多竞品链接
            </button>
          )}
        </div>
      </div>

      {/* Step 3: Core Features (Optional) */}
      <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-50">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
          <span className="bg-rose-100 text-rose-600 w-10 h-10 rounded-full flex items-center justify-center mr-4 text-sm font-bold shadow-sm">3</span>
          核心卖点 (可选 / Optional)
        </h3>
        <textarea
          value={data.coreFeatures}
          onChange={(e) => handleChange('coreFeatures', e.target.value)}
          rows={3}
          placeholder="如果您有特别想强调的卖点（如：材质、专利、赠品等），请在此补充..."
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none transition-all placeholder-slate-400"
        />
      </div>

      {/* Action Button */}
      <div className="flex justify-center pt-6">
        <button
          onClick={onNext}
          disabled={isLoading || !isReady}
          className={`px-16 py-5 rounded-full text-white font-bold text-xl shadow-xl transform transition-all active:scale-95
            ${isLoading || !isReady
              ? 'bg-slate-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 hover:shadow-rose-200'
            }
          `}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              AI 深度诊断中...
            </span>
          ) : '开始诊断 (Start Diagnosis)'}
        </button>
      </div>
      
      {!isReady && !isLoading && (
        <p className="text-center text-slate-400 text-sm">请先输入产品链接并点击“提取信息”</p>
      )}
    </div>
  );
};

export default InputStep;
