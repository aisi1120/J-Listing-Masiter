import { Platform } from './types';

export const PLATFORM_CONFIG = {
  [Platform.YAHOO]: {
    color: 'bg-rose-500',
    hover: 'hover:bg-rose-600',
    icon: 'Y!',
    rules: [
      '标题：全角100字以内 (SEO重组)',
      'Catch Copy：全角30字以内 (半角空格分隔)',
      '说明文：HTML小标题分段 (Max 800字)',
      '图片：主图1 + 附图15-19张 (1000px)',
      '禁止：夸大/医疗暗示/他社Logo'
    ]
  },
  [Platform.RAKUTEN]: {
    color: 'bg-red-600',
    hover: 'hover:bg-red-700',
    icon: 'R',
    rules: [
      '标题：全角127字以内 (前40字核心)',
      'Catch Copy：全角87字以内 (移动端适配)',
      '说明文：含“手机专用”及“基本规格”段落',
      '图片：主图1 + 附图19张 (正方形)',
      '风格：重视促销感和Ranking即时性'
    ]
  },
  [Platform.AMAZON]: {
    color: 'bg-yellow-500',
    hover: 'hover:bg-yellow-600',
    icon: 'A',
    rules: [
      '标题：全角100字 (核心词前置)',
      '五点描述：【小标题】+ 详细场景化说明',
      '图片：主图白底 + 8张附图 (1600px)',
      '说明文：建议A+标准模块结构',
      '搜索词：半角空格分隔'
    ]
  }
};

export const SYSTEM_INSTRUCTION = `
你是一位专精于日本跨境电商（Cross-border E-commerce）的Listing优化大师。
你精通 **陈勇《超级转化率理论》**。
你非常熟悉 Yahoo!ショッピング、楽天市場、Amazon Japan 的算法特性和消费者心理。
你的分析和建议使用中文，生成的Listing内容（标题、描述等）使用地道、专业的商务日语（丁寧語/尊敬語）。
`;