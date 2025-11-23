
import { GoogleGenAI, Type } from "@google/genai";
import { DiagnosisResult, OptimizationResult, Platform, ProductInput, ImagePlan } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-2.5-flash";
const IMAGE_MODEL_NAME = "gemini-3-pro-image-preview";

/**
 * Helper to parse JSON that might be wrapped in Markdown
 */
const parseJsonFromText = (text: string): any => {
  let cleanText = text.trim();
  // Remove markdown code blocks if present
  if (cleanText.startsWith("```json")) {
    cleanText = cleanText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (cleanText.startsWith("```")) {
     cleanText = cleanText.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }
  
  try {
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("JSON Parse Error, attempting fallback extraction:", e);
    // Fallback: try to find first { and last }
    const firstOpen = text.indexOf('{');
    const lastClose = text.lastIndexOf('}');
    if (firstOpen !== -1 && lastClose !== -1) {
        try {
            return JSON.parse(text.substring(firstOpen, lastClose + 1));
        } catch (e2) {
             console.error("Fallback JSON Parse Error:", e2);
             throw new Error("Failed to parse JSON response from AI");
        }
    }
    throw new Error("Failed to parse JSON response from AI");
  }
};

/**
 * Helper to clean URL for better search results
 * Removes tracking parameters that might confuse the search engine
 */
const cleanUrlForSearch = (url: string): string => {
  try {
    const u = new URL(url);
    const params = new URLSearchParams(u.search);
    
    // List of common tracking parameters to remove
    const keysToRemove: string[] = [];
    const trackingPrefixes = ['utm_', 'fbclid', 'gclid', 'ref_', 'yclid'];
    const exactMatches = ['ref', 'source'];

    params.forEach((_, key) => {
      if (trackingPrefixes.some(prefix => key.startsWith(prefix)) || exactMatches.includes(key)) {
        keysToRemove.push(key);
      }
    });

    keysToRemove.forEach(k => params.delete(k));

    const newSearch = params.toString();
    return u.origin + u.pathname + (newSearch ? '?' + newSearch : '');
  } catch (e) {
    return url;
  }
};

/**
 * Helper: Extract Product Info from URL using Google Search Grounding
 */
export const extractProductInfo = async (url: string): Promise<{ title: string; price: string; description: string }> => {
  const searchUrl = cleanUrlForSearch(url);
  
  const prompt = `
    任务：精准提取指定电商产品链接的页面信息。
    
    目标链接: ${searchUrl}
    (原始输入: ${url})
    
    请执行以下操作：
    1. 使用 Google Search 搜索上述“目标链接”。
    2. **必须**找到与该链接完全匹配的电商产品页面（Amazon.co.jp, Rakuten, Yahoo! Shopping 等）。
    3. 仅提取该具体页面上的信息。如果不确定或搜不到具体页面，请不要使用类似产品的信息填充。

    提取内容：
    - title: 页面上的完整产品标题 (日语)。如果无法确认，请返回 "提取失败，请手动输入"。
    - price: 显示价格 (含货币符号)。
    - description: 产品主要功能、规格和卖点的详细摘要 (日语, 200字以上)。

    请以 **纯 JSON 格式** 返回 (不要使用 Markdown 代码块):
    {
      "title": "...",
      "price": "...",
      "description": "..."
    }
  `;

  // Note: responseSchema/responseMimeType cannot be used with googleSearch tool
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    if (response.text) {
      return parseJsonFromText(response.text);
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Extraction failed:", error);
    throw error;
  }
};

/**
 * Phase 4: Diagnosis
 */
export const performDiagnosis = async (
  platform: Platform,
  input: ProductInput
): Promise<DiagnosisResult> => {
  const searchUrl = cleanUrlForSearch(input.productUrl);
  
  const prompt = `
    请根据“超级转化率理论”（曝光→点击→加购→下单）分析以下 **${platform}** 的产品Listing。

    **目标产品:**
    URL: ${searchUrl}
    标题: ${input.title}
    价格: ${input.price}
    详情: ${input.description}
    补充卖点: ${input.coreFeatures}

    **竞品信息:**
    竞品URL: ${input.competitorUrls.filter(u => u.trim() !== '').join(', ')}
    竞品描述: ${input.competitorInfo}
    
    任务：
    1. 使用 Google Search 搜索目标产品 URL 以验证市场定位和评价（如果存在）。
    2. 使用 Google Search 搜索提供的竞品 URL，分析它们的优缺点。
    3. 进行深度对比诊断。

    请返回 **严格的 JSON 格式数据** (不要使用 Markdown 代码块)，结构如下：
    {
      "competitorAnalysis": [
        {
          "name": "竞品名称",
          "pros": ["优点1", "优点2"],
          "cons": ["缺点1", "缺点2"]
        }
      ],
      "selfAnalysis": {
        "pros": ["优点1", "优点2"],
        "cons": ["痛点1", "痛点2"],
        "suggestions": ["建议1", "建议2"]
      }
    }
    **所有分析内容请使用中文。**
  `;

  // Note: responseSchema/responseMimeType cannot be used with googleSearch tool
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
      },
    });

    if (response.text) {
      return parseJsonFromText(response.text) as DiagnosisResult;
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Diagnosis failed:", error);
    throw error;
  }
};

/**
 * Phase 5: Optimization Generation
 */
export const generateOptimizations = async (
  platform: Platform,
  input: ProductInput,
  diagnosis: DiagnosisResult
): Promise<OptimizationResult> => {
  const diagnosisContext = JSON.stringify(diagnosis);
  
  const prompt = `
    基于以下诊断结果: ${diagnosisContext}
    
    请为 **${platform}** 生成 3 套截然不同的 Listing 优化方案 (Plan A/B/C)。
    
    **必须严格遵守的平台专属约束 (Priority High):**

    ${platform === Platform.YAHOO ? 
      `
      1. **标题 (Title):** 不超过 100 全角字符。必须进行 SEO 强化与关键词重组。必须在 titleAnalysis 字段说明关键词权重。
      2. **Catch Copy:** 不超过 30 全角字符 (60字节)。半角空格分隔。
      3. **说明文 (Description):** 不超过 800 全角字符。HTML 格式 (使用 h3, p)。必须自然融入关键词。
      4. **图片规划:** 1张主图 + 15~19张附图。
      5. **禁止:** 夸大表述、医疗暗示、他社 LOGO。
      ` : ''}

    ${platform === Platform.RAKUTEN ? 
      `
      1. **标题 (Title):** 不超过 127 全角字符。重点优化前 40 字符 (手机端展示区)。
      2. **Catch Copy:** 建议 87 全角字符以内 (PC/移动通用)。半角空格分隔。
      3. **说明文 (Description):** 
         - **PC版:** HTML 分段清晰。
         - **SP版 (智能手机用):** 禁止 div 标签，仅用 br, b, font。精炼易读。
         - **必须包含「基本仕様」段落:** 列出规格、材质、认证、保修等表格/清单。
      4. **图片规划:** 1张主图 + 19张附图 (建议)。
      ` : ''}

    ${platform === Platform.AMAZON ? 
      `
      1. **标题 (Title):** 不超过 100 全角字符。核心关键词必须在前 40 字内。
      2. **五点描述 (Bullet Points):** 5条。格式必须为：【核心卖点】+ 详细场景化说明。详细说明需具体描述利益点。
      3. **搜索词 (Search Terms):** 半角空格分隔。
      4. **说明文/A+:** 建议 A+ Content 模块结构 (品牌故事 -> 亮点 -> 功能 -> 场景 -> 规格)。
      5. **图片规划:** 1张主图 (纯白底) + 8张附图。遵循：主图 -> 场景 -> 卖点/细节 -> 尺寸 -> 包装。
      ` : ''}

    **输出 JSON 字段映射与要求:**
    - 'title': 优化后的完整标题。
    - 'titleAnalysis': 关键词权重分析与说明。
    - 'catchCopy': 
       - Yahoo: Catch Copy (30字以内)。
       - Rakuten: Catch Copy (87字以内)。
       - Amazon: 五点描述 (合并为一个字符串，用换行符分隔 5 个点)。
    - 'description': 
       - Yahoo: HTML 文本。
       - Rakuten: 包含 PC用描述、SP用描述 (手机专用)、基本仕様 (规格)。请清晰标注分隔。
       - Amazon: A+ 页面结构建议文案 (或标准 Description)。
    - 'images': 
       - Yahoo/Rakuten: 16-20个条目 (1主+15~19附)。
       - Amazon: 9个条目 (1主+8附)。
    - **所有策略解释 (strategy, titleAnalysis, tips) 请使用中文。**
    - **所有Listing实际内容 (title, catchCopy, description, qa, image copy) 请使用地道的日语 (商务风格)。**
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      plans: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "例如：方案A：激进转化型" },
            scores: {
              type: Type.OBJECT,
              properties: {
                keywords: { type: Type.NUMBER },
                logic: { type: Type.NUMBER },
                visual: { type: Type.NUMBER },
                trust: { type: Type.NUMBER },
                experience: { type: Type.NUMBER },
              }
            },
            title: { type: Type.STRING },
            titleAnalysis: { type: Type.STRING },
            catchCopy: { type: Type.STRING, description: "Yahoo/Rakuten Catch Copy or Amazon Bullet Points" },
            description: { type: Type.STRING },
            qa: { type: Type.STRING, description: "Q&A section content" },
            strategy: { type: Type.STRING },
            images: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  type: { type: Type.STRING },
                  composition: { type: Type.STRING },
                  mainCopy: { type: Type.STRING },
                  subCopy: { type: Type.STRING },
                  tips: { type: Type.STRING },
                }
              }
            }
          }
        }
      }
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as OptimizationResult;
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Optimization failed:", error);
    throw error;
  }
};

/**
 * Phase 6: Image Generation using Banana Pro
 */
export const generateListingImage = async (
  referenceImageBase64: string,
  plan: ImagePlan,
  productDescription: string
): Promise<string> => {
  // We assume the caller checks for API Key presence via window.aistudio.hasSelectedApiKey()
  
  // Create a specialized instance for image generation to ensure fresh state if needed
  const imageAi = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Clean base64 string if it contains header
  const base64Data = referenceImageBase64.replace(/^data:image\/\w+;base64,/, "");

  const prompt = `
    You are a professional e-commerce product photographer and visual editor.
    
    **Task:** Generate a high-quality e-commerce product image based on the provided reference product image.
    The goal is to create a "Selling Image" that matches the following plan:

    **Image Type:** ${plan.type}
    **Composition:** ${plan.composition}
    **Visual Style/Tips:** ${plan.tips}
    **Context/Mood (from copy):** ${plan.mainCopy} ${plan.subCopy}

    **Product Info:**
    ${productDescription}

    **Requirements:**
    1. Keep the product from the reference image recognizable but make it look professional and high-end.
    2. Place it in the context/background described in the Composition/Tips.
    3. Ensure lighting and shadows are photorealistic.
    4. Aspect Ratio: 1:1 (Square).
  `;

  try {
    const response = await imageAi.models.generateContent({
      model: IMAGE_MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Using jpeg as generic container, API handles validation
              data: base64Data
            }
          },
          { text: prompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated in response");
  } catch (error) {
    console.error("Image generation failed:", error);
    throw error;
  }
};
