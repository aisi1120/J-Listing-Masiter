import React from 'react';
import { DiagnosisResult, Platform } from '../types';

interface AnalysisStepProps {
  platform: Platform;
  result: DiagnosisResult;
  onNext: () => void;
  isLoading: boolean;
}

const AnalysisStep: React.FC<AnalysisStepProps> = ({ platform, result, onNext, isLoading }) => {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">第四阶段：深度诊断分析</h2>
        <p className="text-slate-500">基于陈勇《超级转化率理论》</p>
      </div>

      {/* Competitor Analysis */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-50 overflow-hidden">
        <div className="bg-slate-50 px-8 py-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-700">竞品优缺点分析</h3>
        </div>
        <div className="p-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-400 tracking-wider">
                <tr>
                  <th className="px-4 py-4 rounded-l-xl">竞品名称</th>
                  <th className="px-4 py-4 text-emerald-600">优势 (Pros)</th>
                  <th className="px-4 py-4 rounded-r-xl text-rose-600">劣势 (Cons)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {result.competitorAnalysis.map((comp, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-6 font-bold text-slate-800 align-top w-1/4">{comp.name || `竞品 ${idx + 1}`}</td>
                    <td className="px-4 py-6 align-top w-1/3">
                      <ul className="space-y-2">
                        {comp.pros.map((p, i) => (
                          <li key={i} className="flex items-start">
                            <span className="text-emerald-400 mr-2 mt-0.5">✓</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-6 align-top w-1/3">
                      <ul className="space-y-2">
                        {comp.cons.map((c, i) => (
                          <li key={i} className="flex items-start">
                            <span className="text-rose-400 mr-2 mt-0.5">✕</span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Self Analysis */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-50 overflow-hidden">
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 px-8 py-5 border-b border-rose-100">
          <h3 className="text-lg font-bold text-rose-800">我方产品自查诊断</h3>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
            <h4 className="font-bold text-emerald-800 mb-4 flex items-center text-lg">
              <span className="mr-2">👍</span> 当前优势
            </h4>
            <ul className="space-y-3 text-sm text-emerald-900 leading-relaxed">
              {result.selfAnalysis.pros.map((p, i) => (
                <li key={i} className="flex items-start"><span className="mr-2 mt-1 w-1.5 h-1.5 bg-emerald-400 rounded-full flex-shrink-0"></span>{p}</li>
              ))}
            </ul>
          </div>
          <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100">
            <h4 className="font-bold text-rose-800 mb-4 flex items-center text-lg">
              <span className="mr-2">⚠️</span> 存在痛点
            </h4>
            <ul className="space-y-3 text-sm text-rose-900 leading-relaxed">
              {result.selfAnalysis.cons.map((c, i) => (
                <li key={i} className="flex items-start"><span className="mr-2 mt-1 w-1.5 h-1.5 bg-rose-400 rounded-full flex-shrink-0"></span>{c}</li>
              ))}
            </ul>
          </div>
          <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
             <h4 className="font-bold text-blue-800 mb-4 flex items-center text-lg">
              <span className="mr-2">🚀</span> 优化方向建议
            </h4>
            <ul className="space-y-3 text-sm text-blue-900 leading-relaxed">
              {result.selfAnalysis.suggestions.map((s, i) => (
                <li key={i} className="flex items-start"><span className="mr-2 mt-1 w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></span>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <button
          onClick={onNext}
          disabled={isLoading}
          className={`px-12 py-4 rounded-full text-white font-bold text-xl shadow-xl transform transition-all hover:scale-105
            ${isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400 hover:shadow-rose-200'}
          `}
        >
          {isLoading ? '方案生成中...' : '生成 3 套优化方案 (A/B/C)'}
        </button>
      </div>
    </div>
  );
};

export default AnalysisStep;