import type { Recipe, FlavorProfile, CraftMethod, RecipeIngredientItem } from '../types/recipe';
import { INGREDIENTS_MAP } from '../data/ingredients';
import { calculateRecipeABV } from './abv';

export interface CustomizedIngredientState {
  originalId: string;
  selectedId: string;
  isEnabled: boolean;
}

/**
 * 根据用户当前自定义选择或替换的原料，动态推演实时的五维风味平衡与酒精度
 */
export function calculateDynamicFlavorAndABV(
  recipe: Recipe,
  customStates: Record<string, CustomizedIngredientState>,
  method: CraftMethod = 'build'
): { dynamicFlavor: FlavorProfile; dynamicAbv: number; isModified: boolean } {
  // 复制基准风味
  let sweetness = recipe.flavor.sweetness;
  let sourness = recipe.flavor.sourness;
  let strength = recipe.flavor.strength;
  let bitterness = recipe.flavor.bitterness;
  let refreshment = recipe.flavor.refreshment;

  let isModified = false;
  const activeItemsForAbv: RecipeIngredientItem[] = [];

  for (const origItem of recipe.ingredients) {
    const state = customStates[origItem.ingredientId] || {
      originalId: origItem.ingredientId,
      selectedId: origItem.ingredientId,
      isEnabled: true,
    };

    // 1. 如果该原料被用户取消勾选/排除
    if (!state.isEnabled) {
      isModified = true;
      const origIng = INGREDIENTS_MAP.get(origItem.ingredientId);
      if (origIng) {
        if (origIng.category === 'spirit') {
          strength = Math.max(1, strength - 3.0);
        } else if (origIng.category === 'syrup') {
          sweetness = Math.max(1, sweetness - 2.5);
          sourness = Math.min(5, sourness + 0.8); // 失去糖分遮盖，酸感更加突出
        } else if (origIng.category === 'juice') {
          sourness = Math.max(1, sourness - 3.0);
          sweetness = Math.min(5, sweetness + 0.8);
        } else if (origIng.category === 'bitters' || origIng.id === 'campari') {
          bitterness = Math.max(1, bitterness - 2.5);
        } else if (origIng.category === 'mixer') {
          refreshment = Math.max(1, refreshment - 2.0);
        }
      }
      continue;
    }

    // 2. 如果原料依然启用，加入 ABV 测算
    activeItemsForAbv.push({
      ...origItem,
      ingredientId: state.selectedId,
    });

    // 3. 如果用户进行了平替换料 (originalId !== selectedId)
    if (state.originalId !== state.selectedId) {
      isModified = true;
      const oldId = state.originalId;
      const newId = state.selectedId;

      // 青柠汁 <-> 黄柠檬汁
      if (oldId === 'lime_juice' && newId === 'lemon_juice') {
        sourness = Math.max(1, sourness - 0.5);
        sweetness = Math.min(5, sweetness + 0.3);
      } else if (oldId === 'lemon_juice' && newId === 'lime_juice') {
        sourness = Math.min(5, sourness + 0.5);
      }

      // 苏打水 <-> 汤力水 (汤力水微苦且带糖)
      if (oldId === 'soda_water' && newId === 'tonic_water') {
        bitterness = Math.min(5, bitterness + 1.8);
        sweetness = Math.min(5, sweetness + 0.8);
      } else if (oldId === 'tonic_water' && newId === 'soda_water') {
        bitterness = Math.max(1, bitterness - 1.8);
        sweetness = Math.max(1, sweetness - 0.8);
      }

      // 苏打水 <-> 雪碧 (雪碧甜度大增)
      if (newId === 'sprite') {
        sweetness = Math.min(5, sweetness + 1.8);
        refreshment = Math.min(5, refreshment + 0.5);
      }

      // 软饮 <-> 三得利乌龙茶 / 东方树叶 (茶多酚苦感与回甘)
      if (newId === 'suntory_oolong' || newId === 'dongfang_shuye_green') {
        bitterness = Math.min(5, bitterness + 1.2);
        sweetness = Math.max(1, sweetness - 0.6);
        refreshment = Math.max(1, refreshment - 0.5);
      }

      // 糖浆 <-> 蜂蜜水
      if (oldId === 'simple_syrup' && newId === 'honey_syrup') {
        sweetness = Math.min(5, sweetness + 0.4);
      }

      // 白朗姆 <-> 黑朗姆 / 威士忌 (深色烈酒橡木风味)
      if (oldId === 'white_rum' && (newId === 'dark_rum' || newId.includes('whiskey'))) {
        bitterness = Math.min(5, bitterness + 0.8);
        strength = Math.min(5, strength + 0.5);
      }
    }
  }

  // 科学归一化到 1-5 范围
  const dynamicFlavor: FlavorProfile = {
    sweetness: Math.round(Math.max(1, Math.min(5, sweetness))),
    sourness: Math.round(Math.max(1, Math.min(5, sourness))),
    strength: Math.round(Math.max(1, Math.min(5, strength))),
    bitterness: Math.round(Math.max(1, Math.min(5, bitterness))),
    refreshment: Math.round(Math.max(1, Math.min(5, refreshment))),
  };

  const dynamicAbv = calculateRecipeABV(activeItemsForAbv, method);

  return {
    dynamicFlavor,
    dynamicAbv,
    isModified,
  };
}
