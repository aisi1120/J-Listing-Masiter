
import React, { useState } from 'react';
import { OptimizationResult, OptimizationPlan, Platform } from '../types';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface OptimizationStepProps {
  platform: Platform;
  result: OptimizationResult;
  onNext: (plan: OptimizationPlan) => void;
}

const OptimizationStep: React.FC<OptimizationStepProps> = ({ platform, result, onNext }) => {
  const [activePlanIndex, setActivePlanIndex] = useState(0);

  // Guard: Check if plans exist
  if (!result || !result.plans || result.plans.length === 0) {
    return (
      <div className="text-center py-20 animate-fade-in-up">
        <p className="text-xl text-slate-500">未生成有效的优化方案，请尝试重新生成。</p>
      </div>
    );
  }

  const activePlan = result.plans[activePlanIndex] || result.plans[0];
  
  // Safe access for scores with defaults
  const scores = activePlan.scores || {
    keywords: 0,
    logic: 0,
    visual: 0,
    trust: 0,
    experience: 0
  };

  // Prepare data for Radar Chart
  const chartData = [
    { subject: '关键词', A: scores.keywords || 0, fullMark: 100 },
    { subject: '逻辑性', A: scores.logic || 0, fullMark: 100 },
    { subject: '视觉感', A: scores.visual || 0, fullMark: 100 },
    { subject: '信任度', A: scores.trust || 0, fullMark: 100 },
    { subject: '体验感', A: scores.experience || 0, fullMark: 100 },
  ];

  // Safe access for other properties
  const safeImages = activePlan.images || [];

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      <div className="flex justify-center space-x-4 mb-8">
        {result.plans.map((plan, idx) => (
          <button
            key={idx}
            onClick={() => setActivePlanIndex(idx)}
            className={`px-8 py-3 rounded-full font-bold transition-all
              ${activePlanIndex === idx 
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-200 scale-105' 
                : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
              }
            `}
          >
            {plan.name || `方案 ${idx + 1}`}
          </button>
        ))}
      </div>

      {/* Plan Header & Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-50">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">{activePlan.name}</h2>
            <p className="text-slate-500 font-medium bg-slate-50 inline-block px-3 py-1 rounded-lg border border-slate-100">
              核心策略：{activePlan.strategy || "综合优化"}
            </p>
          </div>
          
          <div className="mt-6 p-6 bg-amber-50 border border-amber-100 rounded-2xl">
            <h3 className="font-bold text-amber-800 mb-3 text-sm uppercase tracking-wide">优化后标题 (Optimized Title)</h3>
            <p className="text-lg font-medium text-slate-800 mb-4 leading-relaxed">{activePlan.title}</p>
            <p className="text-sm text-slate-500 border-t border-amber-200 pt-3">
              <span className="font-bold text-amber-700 mr-2">权重分析:</span>
              {activePlan.titleAnalysis}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-50 flex flex-col items-center justify-center">
          <h3 className="font-bold text-slate-400 mb-4 text-sm uppercase tracking-widest">转化潜力评分</h3>
          <div className="w-full h-64">
             <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false}/>
                  <Radar
                    name="Score"
                    dataKey="A"
                    stroke="#f43f5e"
                    fill="#fb7185"
                    fillOpacity={0.5}
                  />
                </RadarChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Catch Copy / Bullet Points */}
      <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-50">
        <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">
          {platform === Platform.AMAZON ? '五点描述 (Bullet Points)' : 'Catch Copy (キャッチコピー)'}
        </h3>
        <div className="whitespace-pre-line text-slate-700 leading-loose font-medium bg-slate-50 p-6 rounded-2xl border border-slate-100">
          {activePlan.catchCopy}
        </div>
      </div>

      {/* Description */}
      <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-50">
        <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">商品详情文案 (Description / LP)</h3>
        <div 
          className="prose prose-slate max-w-none text-slate-700"
          dangerouslySetInnerHTML={{ __html: (activePlan.description || '').replace(/\n/g, '<br/>') }}
        />
      </div>

      {/* Image Strategy */}
      <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-50">
        <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">视觉图片规划 (Image Strategy)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-400">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">序号</th>
                <th className="px-4 py-3">类别</th>
                <th className="px-4 py-3">画面构成</th>
                <th className="px-4 py-3">文案建议</th>
                <th className="px-4 py-3 rounded-r-lg">拍摄要点</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {safeImages.map((img) => (
                <tr key={img.id || Math.random()} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-4 font-bold text-slate-900">{img.id}</td>
                  <td className="px-4 py-4">
                    <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs whitespace-nowrap font-medium">{img.type}</span>
                  </td>
                  <td className="px-4 py-4 text-xs leading-relaxed">{img.composition}</td>
                  <td className="px-4 py-4">
                    <div className="font-bold text-xs text-slate-800 mb-1">{img.mainCopy}</div>
                    <div className="text-xs text-slate-500">{img.subCopy}</div>
                  </td>
                  <td className="px-4 py-4 text-xs italic text-slate-500">{img.tips}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Q&A */}
      <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-50">
        <h3 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Q&A 策略</h3>
        <div 
           className="prose prose-slate max-w-none text-slate-700"
           dangerouslySetInnerHTML={{ __html: activePlan.qa || '' }}
        />
      </div>

      {/* Next Action */}
      <div className="sticky bottom-4 flex justify-center z-10">
        <button
          onClick={() => onNext(activePlan)}
          className="bg-slate-900 text-white px-10 py-4 rounded-full font-bold text-lg shadow-2xl hover:bg-slate-800 transform transition-all active:scale-95 flex items-center space-x-2 border border-slate-700"
        >
          <span>使用该方案生成图片</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </button>
      </div>

    </div>
  );
};

export default OptimizationStep;
