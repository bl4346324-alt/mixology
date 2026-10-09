export type RecipeCategory = 
  | 'iba'          // IBA 官方经典
  | 'convenience'  // 便利店神仙特调
  | 'tea_cocktail' // 新中式茶酒
  | 'modern'       // 现代流行特调
  | 'mocktail';    // 无酒精特调

export type CraftMethod = 
  | 'shake'   // 摇和法
  | 'stir'    // 搅拌法
  | 'build'   // 直调法
  | 'muddle'  // 捣碎法
  | 'blend';  // 搅拌机/冰沙

export type GlasswareType = 
  | 'martini'      // 鸡尾酒/马天尼杯
  | 'highball'     // 高球杯
  | 'old_fashioned'// 古典杯 (Rock杯)
  | 'coupe'        // 浅碟香槟杯
  | 'collins'      // 柯林杯
  | 'mule_mug'     // 莫斯科骡子铜杯
  | 'shot';        // 烈酒杯 (一口杯)

export interface FlavorProfile {
  sweetness: number;   // 甜度 1-5
  sourness: number;    // 酸度 1-5
  strength: number;    // 烈度 1-5
  bitterness: number;  // 苦度 1-5
  refreshment: number; // 清爽/气泡感 1-5
}

export interface RecipeIngredientItem {
  ingredientId: string;       // 对应 Ingredient ID
  amountMl: number;           // 标准单人份毫升数 (若非液体，填0或单位数量)
  customUnit?: string;        // 自定义单位 (如: '片', '滴', '适量', '枚')
  isOptional?: boolean;       // 是否可选
  isGarnish?: boolean;        // 是否为表面装饰
  substituteNote?: string;    // 平替调配建议
}

export interface CraftStep {
  step: number;
  title: string;
  description: string;
  actionType: 'prep' | 'measure' | 'shake' | 'stir' | 'pour' | 'garnish';
  timerSeconds?: number;     // 倒计时秒数 (如摇酒 12 秒，搅拌 30 秒)
  tip?: string;              // 调酒师心得技巧
}

export interface Recipe {
  id: string;
  nameZh: string;               // 中文名 (如: 莫吉托)
  nameEn: string;               // 英文名 (如: Mojito)
  category: RecipeCategory;     // 分类
  coverColor: string;           // 主题渐变色背景
  coverImage?: string;          // 封面图片 URL (可选)
  description: string;          // 一句话简介
  story: string;                // 经典起源与微醺故事
  method: CraftMethod;          // 调酒手法
  glass: GlasswareType;         // 建议杯型
  iceType: string;              // 建议用冰 (方冰/老冰球/碎冰/无冰)
  difficulty: 'easy' | 'medium' | 'hard'; // 难度
  prepTimeMinutes: number;      // 预计耗时 (分钟)
  calculatedAbv: number;        // 标准稀释后实际酒精度 (Vol %)
  flavor: FlavorProfile;        // 五维风味雷达数据
  tags: string[];               // 搜索/筛选标签 (如: '微醺', '果香', '聚会', '女生喜好')
  ingredients: RecipeIngredientItem[]; // 原料清单
  steps: CraftStep[];           // 调酒步骤
  bartenderNote?: string;       // 调酒师专业秘诀
}
