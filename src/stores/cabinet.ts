import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { VolumeUnit } from '../utils/unit';
import type { Recipe } from '../types/recipe';
import type { Ingredient } from '../types/ingredient';
import type { RecipeMatchResult, UnlockSuggestion } from '../types/bar';
import { INGREDIENTS, INGREDIENTS_MAP } from '../data/ingredients';
import { RECIPES } from '../data/recipes';

const STORAGE_KEY_CABINET = 'mixocraft_cabinet';
const STORAGE_KEY_UNIT = 'mixocraft_unit';

export const useCabinetStore = defineStore('cabinet', () => {
  // 初始用户酒柜拥有的原料 ID
  // 默认给几个经典好买的入门料，让新手一进来就能看到效果
  const defaultInit = ['gin', 'tonic_water', 'lime_juice', 'bourbon_whiskey', 'suntory_oolong', 'ice_cubes'];
  
  const savedCabinet = uni.getStorageSync(STORAGE_KEY_CABINET);
  const myIngredients = ref<string[]>(
    Array.isArray(savedCabinet) && savedCabinet.length > 0 ? savedCabinet : defaultInit
  );

  const savedUnit = (uni.getStorageSync(STORAGE_KEY_UNIT) as VolumeUnit) || 'ml';
  const unitPreference = ref<VolumeUnit>(savedUnit);

  // 保存到本地持久化
  function saveToStorage() {
    try {
      uni.setStorageSync(STORAGE_KEY_CABINET, myIngredients.value);
    } catch (e) {
      console.error('Failed to save cabinet to storage', e);
    }
  }

  function toggleIngredient(id: string) {
    const idx = myIngredients.value.indexOf(id);
    if (idx >= 0) {
      myIngredients.value.splice(idx, 1);
    } else {
      myIngredients.value.push(id);
    }
    saveToStorage();
  }

  function addIngredients(ids: string[]) {
    for (const id of ids) {
      if (!myIngredients.value.includes(id)) {
        myIngredients.value.push(id);
      }
    }
    saveToStorage();
  }

  function clearCabinet() {
    myIngredients.value = [];
    saveToStorage();
  }

  function setUnit(unit: VolumeUnit) {
    unitPreference.value = unit;
    try {
      uni.setStorageSync(STORAGE_KEY_UNIT, unit);
    } catch (e) {
      console.error(e);
    }
  }

  function hasIngredient(id: string): boolean {
    return myIngredients.value.includes(id);
  }

  /**
   * 检查用户是否拥有该原料，或拥有可替代的原料
   */
  function checkIngredientAvailable(targetId: string): { available: boolean; isSubstitute: boolean; matchedId: string } {
    // 1. 直系拥有
    if (myIngredients.value.includes(targetId)) {
      return { available: true, isSubstitute: false, matchedId: targetId };
    }

    const target = INGREDIENTS_MAP.get(targetId);
    if (!target) return { available: false, isSubstitute: false, matchedId: '' };

    // 2. 检查父级通用类型（例如用户有通用 gin，食谱要求 london_dry_gin）
    if (target.parentId && myIngredients.value.includes(target.parentId)) {
      return { available: true, isSubstitute: true, matchedId: target.parentId };
    }

    // 3. 检查已配置的明确平替品列表
    if (target.substitutes && target.substitutes.length > 0) {
      for (const subId of target.substitutes) {
        if (myIngredients.value.includes(subId)) {
          return { available: true, isSubstitute: true, matchedId: subId };
        }
      }
    }

    return { available: false, isSubstitute: false, matchedId: '' };
  }

  /**
   * 评估单个配方与当前酒柜的匹配结果
   */
  function evaluateRecipe(recipe: Recipe): RecipeMatchResult {
    const requiredItems = recipe.ingredients.filter(item => !item.isOptional);
    const availableIngredients: string[] = [];
    const missingIngredients: Ingredient[] = [];
    const substitutionsUsed: { originalId: string; substituteId: string }[] = [];

    for (const item of requiredItems) {
      const check = checkIngredientAvailable(item.ingredientId);
      if (check.available) {
        availableIngredients.push(item.ingredientId);
        if (check.isSubstitute) {
          substitutionsUsed.push({
            originalId: item.ingredientId,
            substituteId: check.matchedId,
          });
        }
      } else {
        const missingIng = INGREDIENTS_MAP.get(item.ingredientId);
        if (missingIng) {
          missingIngredients.push(missingIng);
        }
      }
    }

    let status: 'perfect' | 'substitute' | 'missing_one' = 'perfect';
    if (missingIngredients.length === 0) {
      status = substitutionsUsed.length > 0 ? 'substitute' : 'perfect';
    } else if (missingIngredients.length === 1) {
      status = 'missing_one';
    } else {
      status = 'missing_one'; // 多于1个也属于未就绪
    }

    const matchScore = requiredItems.length > 0 
      ? Math.round((availableIngredients.length / requiredItems.length) * 100)
      : 100;

    return {
      recipe,
      status,
      matchScore,
      availableIngredients,
      missingIngredients,
      substitutionsUsed,
    };
  }

  // 100% 可做的酒谱列表 (完美匹配或平替可做)
  const canMakeRecipes = computed<RecipeMatchResult[]>(() => {
    return RECIPES.map(r => evaluateRecipe(r))
      .filter(res => res.missingIngredients.length === 0);
  });

  // 仅差 1 种原料即可制作的酒谱列表
  const missingOneRecipes = computed<RecipeMatchResult[]>(() => {
    return RECIPES.map(r => evaluateRecipe(r))
      .filter(res => res.missingIngredients.length === 1);
  });

  // 智能建议：买哪种原料能最大化解锁新酒单（Mixel 式贪心榜）
  const unlockSuggestions = computed<UnlockSuggestion[]>(() => {
    // 统计目前缺少的原料中，每种原料如果被购买，能解锁多少个 missing_one 配方
    const countMap = new Map<string, { ing: Ingredient; recipes: { id: string; nameZh: string; nameEn: string }[] }>();

    for (const res of missingOneRecipes.value) {
      const missing = res.missingIngredients[0];
      if (!missing) continue;

      if (!countMap.has(missing.id)) {
        countMap.set(missing.id, { ing: missing, recipes: [] });
      }
      countMap.get(missing.id)!.recipes.push({
        id: res.recipe.id,
        nameZh: res.recipe.nameZh,
        nameEn: res.recipe.nameEn,
      });
    }

    return Array.from(countMap.values())
      .map(item => ({
        ingredient: item.ing,
        unlockRecipeCount: item.recipes.length,
        unlockedRecipes: item.recipes,
      }))
      .sort((a, b) => b.unlockRecipeCount - a.unlockRecipeCount);
  });

  return {
    myIngredients,
    unitPreference,
    hasIngredient,
    toggleIngredient,
    addIngredients,
    clearCabinet,
    setUnit,
    evaluateRecipe,
    canMakeRecipes,
    missingOneRecipes,
    unlockSuggestions,
  };
});
