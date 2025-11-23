
export enum Platform {
  YAHOO = 'Yahoo!ショッピング',
  RAKUTEN = '楽天市場',
  AMAZON = 'Amazon Japan',
}

export interface ProductInput {
  productUrl: string;
  title: string;
  price: string;
  description: string;
  competitorUrls: string[];
  competitorInfo: string; // Manual input or extracted summary
  coreFeatures: string;
}

export interface DiagnosisResult {
  competitorAnalysis: Array<{
    name: string;
    pros: string[];
    cons: string[];
  }>;
  selfAnalysis: {
    pros: string[];
    cons: string[];
    suggestions: string[];
  };
}

export interface ImagePlan {
  id: number;
  type: string;
  composition: string;
  mainCopy: string;
  subCopy: string;
  tips: string;
}

export interface OptimizationPlan {
  name: string; // Plan A, B, C
  scores: {
    keywords: number;
    logic: number;
    visual: number;
    trust: number;
    experience: number;
  };
  title: string;
  titleAnalysis: string;
  catchCopy: string; // or bullet points for Amazon
  description: string; // HTML or Text
  images: ImagePlan[];
  qa: string;
  strategy: string;
}

export interface OptimizationResult {
  plans: OptimizationPlan[];
}

export type Step = 'PLATFORM' | 'INPUT' | 'DIAGNOSIS' | 'OPTIMIZATION' | 'IMAGE_GENERATION';