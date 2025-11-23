
import React, { useState } from 'react';
import { OptimizationPlan, ImagePlan } from '../types';
import { generateListingImage } from '../services/geminiService';

interface ImageGenerationStepProps {
  plan: OptimizationPlan;
  productDescription: string;
}

const ImageGenerationStep: React.FC<ImageGenerationStepProps> = ({ plan, productDescription }) => {
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<{[key: number]: string}>({});
  const [loadingIds, setLoadingIds] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async (imgPlan: ImagePlan) => {
    if (!referenceImage) return;

    // API Key Check
    try {
      // Use type assertion to avoid conflicts with existing global declarations of aistudio
      const win = window as any;
      if (win.aistudio) {
        const hasKey = await win.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await win.aistudio.openSelectKey();
          // Check again after modal closes (though race condition exists, we assume user selected)
          const hasKeyAfter = await win.aistudio.hasSelectedApiKey();
          if (!hasKeyAfter) {
              setError("请先选择 API Key (Paid Project) 以使用图片生成功能。");
              return;
          }
        }
      }
    } catch (e) {
      // Fallback if window.aistudio is not available (e.g. not in AI Studio env), 
      // we assume process.env.API_KEY is sufficient or let it fail gracefully.
      console.warn("AI Studio key check skipped:", e);
    }

    setLoadingIds(prev => [...prev, imgPlan.id]);
    setError(null);

    try {
      const generatedBase64 = await generateListingImage(referenceImage, imgPlan, productDescription);
      setGeneratedImages(prev => ({ ...prev, [imgPlan.id]: generatedBase64 }));
    } catch (err) {
      console.error(err);
      setError(`图片 ${imgPlan.id} 生成失败，请重试。`);
    } finally {
      setLoadingIds(prev => prev.filter(id => id !== imgPlan.id));
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">第五阶段：AI 视觉工坊</h2>
        <p className="text-slate-500">Model: Gemini 3.1 Pro Image (Banana Pro)</p>
      </div>

      {/* Reference Image Upload */}
      <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-50">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
          <span className="bg-rose-100 text-rose-600 w-10 h-10 rounded-full flex items-center justify-center mr-4 text-sm font-bold shadow-sm">A</span>
          上传产品原图 (Reference Image)
        </h3>
        
        <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="w-full md:w-1/3">
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-300 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-rose-50 hover:border-rose-300 transition-colors">
                    {referenceImage ? (
                        <img src={referenceImage} alt="Reference" className="w-full h-full object-contain rounded-2xl" />
                    ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-10 h-10 mb-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                            <p className="mb-2 text-sm text-slate-500"><span className="font-bold">点击上传</span> 产品白底图或实拍图</p>
                            <p className="text-xs text-slate-400">支持 PNG, JPG</p>
                        </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
            </div>
            <div className="flex-1 text-sm text-slate-600">
                <p className="mb-4 font-bold text-lg">👉 说明：</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>请上传一张清晰的**产品原图**作为参考。</li>
                    <li>AI 将根据左侧选定的“优化方案”中的视觉规划，结合您上传的原图，生成高质量的场景图或卖点图。</li>
                    <li>生成的图片将保留产品的核心特征，但会根据文案进行艺术化处理。</li>
                </ul>
            </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 px-6 py-4 rounded-xl flex items-center">
            <span className="mr-2 text-xl">⚠️</span> {error}
        </div>
      )}

      {/* Generation List */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-slate-800 pl-4 border-l-4 border-rose-500">
            生成列表 ({plan.name})
        </h3>
        
        {plan.images.map((imgPlan) => (
            <div key={imgPlan.id} className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex flex-col lg:flex-row gap-6">
                {/* Plan Info */}
                <div className="lg:w-1/3 space-y-3">
                    <div className="flex items-center gap-3">
                        <span className="bg-slate-800 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">{imgPlan.id}</span>
                        <span className="font-bold text-lg text-slate-700">{imgPlan.type}</span>
                    </div>
                    <div className="text-sm bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="font-bold text-slate-500 text-xs uppercase mb-1">画面构成</p>
                        <p className="text-slate-700">{imgPlan.composition}</p>
                    </div>
                    <div className="text-sm bg-rose-50 p-3 rounded-xl border border-rose-100">
                        <p className="font-bold text-rose-400 text-xs uppercase mb-1">文案建议</p>
                        <p className="text-rose-800 font-medium">{imgPlan.mainCopy}</p>
                        <p className="text-rose-600 text-xs mt-1">{imgPlan.subCopy}</p>
                    </div>
                </div>

                {/* Action & Result */}
                <div className="lg:w-2/3 flex flex-col md:flex-row gap-4 items-center justify-center bg-slate-50/50 rounded-2xl p-4 border border-dashed border-slate-200">
                    {generatedImages[imgPlan.id] ? (
                        <div className="relative group w-full h-full min-h-[300px] flex items-center justify-center">
                             <img 
                                src={generatedImages[imgPlan.id]} 
                                alt={`Generated ${imgPlan.id}`} 
                                className="max-w-full max-h-[400px] rounded-xl shadow-md"
                             />
                             <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                                <a 
                                    href={generatedImages[imgPlan.id]} 
                                    download={`listing_image_${imgPlan.id}.png`}
                                    className="bg-white text-slate-800 px-6 py-2 rounded-full font-bold hover:bg-rose-50 transition-colors"
                                >
                                    下载图片
                                </a>
                             </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full min-h-[200px] w-full">
                            <button 
                                onClick={() => handleGenerate(imgPlan)}
                                disabled={!referenceImage || loadingIds.includes(imgPlan.id)}
                                className={`px-8 py-3 rounded-full font-bold shadow-lg transition-all transform active:scale-95 flex items-center
                                    ${!referenceImage 
                                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                                        : loadingIds.includes(imgPlan.id)
                                            ? 'bg-slate-100 text-slate-500 cursor-wait'
                                            : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:shadow-indigo-200'
                                    }
                                `}
                            >
                                {loadingIds.includes(imgPlan.id) ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        AI 生成中...
                                    </>
                                ) : (
                                    <>
                                        <span>⚡ 生成此图片</span>
                                    </>
                                )}
                            </button>
                            {!referenceImage && <p className="text-xs text-slate-400 mt-2">请先在上方上传原图</p>}
                        </div>
                    )}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGenerationStep;
