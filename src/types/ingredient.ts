export type IngredientCategory = 
  | 'spirit'       // 基酒 (烈酒)
  | 'liqueur'      // 利口酒 / 预调酒
  | 'mixer'        // 软饮 / 苏打水 / 茶
  | 'juice'        // 果汁 / 鲜果
  | 'syrup'        // 糖浆 / 甜味剂
  | 'bitters'      // 苦精
  | 'garnish'      // 装饰物 / 香草
  | 'ice';         // 冰块

export interface Ingredient {
  id: string;
  nameZh: string;               // 中文名 (如: 伦敦干金酒)
  nameEn: string;               // 英文名 (如: London Dry Gin)
  category: IngredientCategory; // 分类
  abv: number;                  // 酒精度数 (0 - 100)
  parentId?: string;            // 父级通用类 (如: gin 表示所有金酒，便于平替匹配)
  substitutes?: string[];       // 推荐平替原料 ID 列表
  isConvenienceStore: boolean;  // 便利店/常见超市是否易购
  description: string;          // 选购与风味介绍
  flavorNotes?: string[];       // 风味关键词 (如: 杜松子、柑橘、烟熏)
  commonVolume?: number;        // 常见瓶装容量 (ml)
  icon?: string;                // 图标 Emoji 或本地图标
}
