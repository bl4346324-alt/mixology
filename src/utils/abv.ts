import type { CraftMethod, RecipeIngredientItem } from '../types/recipe';
import { INGREDIENTS_MAP } from '../data/ingredients';

/**
 * 调酒融水稀释系数 (Dilution Factors)
 * 摇和法因剧烈撞击冰块融水约 22%-25%
 * 搅拌法融水约 18%-20%
 * 直调法融水约 10%
 */
export const DILUTION_FACTORS: Record<CraftMethod, number> = {
  shake: 0.22,
  stir: 0.18,
  build: 0.10,
  muddle: 0.12,
  blend: 0.30,
};

/**
 * 计算配方的实际饮用酒精度 (考虑冰块稀释度)
 * Formula: ABV = sum(volume_i * abv_i) / (total_volume * (1 + dilution_factor))
 */
export function calculateRecipeABV(
  ingredients: RecipeIngredientItem[],
  method: CraftMethod = 'build'
): number {
  let totalAlcoholVolume = 0;
  let totalLiquidVolume = 0;

  for (const item of ingredients) {
    if (item.amountMl <= 0 || item.isGarnish) continue;
    const ingredient = INGREDIENTS_MAP.get(item.ingredientId);
    if (!ingredient) continue;

    totalLiquidVolume += item.amountMl;
    totalAlcoholVolume += item.amountMl * (ingredient.abv / 100);
  }

  if (totalLiquidVolume <= 0) return 0;

  const dilution = DILUTION_FACTORS[method] ?? 0.15;
  const finalVolume = totalLiquidVolume * (1 + dilution);

  const finalAbv = (totalAlcoholVolume / finalVolume) * 100;
  return Math.round(finalAbv * 10) / 10;
}
