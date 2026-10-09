import type { Recipe } from './recipe';
import type { Ingredient } from './ingredient';

export type MatchStatus = 'perfect' | 'substitute' | 'missing_one';

export interface RecipeMatchResult {
  recipe: Recipe;
  status: MatchStatus;
  matchScore: number;                 // 匹配度 0 - 100%
  availableIngredients: string[];     // 已拥有的原料 ID
  missingIngredients: Ingredient[];   // 缺失的原料对象
  substitutionsUsed?: {               // 采用的平替关系
    originalId: string;
    substituteId: string;
  }[];
}

export interface UnlockSuggestion {
  ingredient: Ingredient;
  unlockRecipeCount: number;         // 只要买这一瓶，能新增解锁多少款可做鸡尾酒
  unlockedRecipes: {
    id: string;
    nameZh: string;
    nameEn: string;
  }[];
}
