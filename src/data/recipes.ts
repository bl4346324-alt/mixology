import type { Recipe } from '../types/recipe';
import { IBA_RECIPES } from './recipes/iba';
import { CONVENIENCE_RECIPES } from './recipes/convenience';
import { TEA_RECIPES } from './recipes/tea';
import { MOCKTAIL_RECIPES } from './recipes/mocktail';

export const AI_CUSTOM_RECIPES: Recipe[] = [
  {
    id: 'ai_custom_special',
    nameZh: '琥珀月影 · 乌龙微醺特调',
    nameEn: 'Amber Moonlight Oolong',
    category: 'tea_cocktail',
    coverColor: 'linear-gradient(135deg, #F59E0B, #78350F)',
    coverImage: '/static/recipes/suntory_oolong_highball.png',
    description: '炭焙茶香收敛了波旁威士忌的辛辣，青柠酸度唤醒了夜晚的灵感。',
    story: '根据您“放松解乏”的需求专门定制。美式威士忌的木质香气与无糖乌龙的茶多酚在冰块中达到完美平衡，回甘绵长。',
    method: 'build',
    glass: 'highball',
    iceType: '老冰块',
    difficulty: 'easy',
    prepTimeMinutes: 2,
    calculatedAbv: 8.5,
    flavor: {
      sweetness: 2,
      sourness: 3,
      strength: 2,
      bitterness: 2,
      refreshment: 4,
    },
    tags: ['AI定制', '茶酒新中式', '回甘悠长', '极速解乏'],
    ingredients: [
      { ingredientId: 'bourbon_whiskey', amountMl: 40 },
      { ingredientId: 'suntory_oolong', amountMl: 110 },
      { ingredientId: 'lime_juice', amountMl: 10 },
      { ingredientId: 'simple_syrup', amountMl: 8 },
      { ingredientId: 'ice_cubes', amountMl: 0, customUnit: '满杯' },
    ],
    steps: [
      {
        step: 1,
        title: '冰杯注酒',
        description: '在高球杯中放入冰块，倒入 40ml 威士忌。',
        actionType: 'prep',
      },
      {
        step: 2,
        title: '酸甜平衡',
        description: '加入 10ml 青柠汁与 8ml 糖浆，搅拌两圈唤醒风味。',
        actionType: 'measure',
      },
      {
        step: 3,
        title: '注满冷萃乌龙',
        description: '倒满冰镇三得利乌龙茶，垂直提拉吧勺一次融合。',
        actionType: 'pour',
      }
    ],
  },
  {
    id: 'ai_custom_mocktail',
    nameZh: '暮色晚风 · 茉莉冷萃',
    nameEn: 'Sunset Breeze Jasmine',
    category: 'mocktail',
    coverColor: 'linear-gradient(135deg, #10B981, #065F46)',
    coverImage: '/static/recipes/dongfang_shuye_highball.png',
    description: '无酒精的淡雅花香与清脆青柠酸度碰撞，带来如晚风拂面般的轻盈治愈。',
    story: '专为您量身调制的无酒精灵感特调。冷萃茉莉的清幽香气与细密气泡水融为一体，不给身体增添任何酒精负担。',
    method: 'build',
    glass: 'highball',
    iceType: '满杯方冰',
    difficulty: 'easy',
    prepTimeMinutes: 2,
    calculatedAbv: 0.0,
    flavor: {
      sweetness: 2,
      sourness: 3,
      strength: 1,
      bitterness: 1,
      refreshment: 5,
    },
    tags: ['AI定制', '无酒精', '东方茶香', '低卡轻盈'],
    ingredients: [
      { ingredientId: 'dongfang_shuye_green', amountMl: 120 },
      { ingredientId: 'lime_juice', amountMl: 15 },
      { ingredientId: 'simple_syrup', amountMl: 10 },
      { ingredientId: 'soda_water', amountMl: 60 },
      { ingredientId: 'mint_leaves', amountMl: 0, customUnit: '3-4片' },
    ],
    steps: [
      {
        step: 1,
        title: '冰镇杯身',
        description: '在高球杯中装满大块冰块，倒入青柠汁与糖浆。',
        actionType: 'prep',
      },
      {
        step: 2,
        title: '注入纯茶',
        description: '缓缓倒入冰镇东方树叶茉莉花茶。',
        actionType: 'pour',
      },
      {
        step: 3,
        title: '补足气泡',
        description: '顶层注满苏打水，轻提吧勺一次，饰以薄荷叶。',
        actionType: 'garnish',
      }
    ],
  }
];

export const RECIPES: Recipe[] = [
  ...IBA_RECIPES,
  ...CONVENIENCE_RECIPES,
  ...TEA_RECIPES,
  ...MOCKTAIL_RECIPES,
];

export const RECIPES_MAP = new Map<string, Recipe>(
  [...RECIPES, ...AI_CUSTOM_RECIPES].map(item => [item.id, item])
);

export function getRecipeById(id: string): Recipe | undefined {
  if (RECIPES_MAP.has(id)) {
    return RECIPES_MAP.get(id);
  }
  // 检查是否有本地私房卡盒或当前缓存的 AI 侍酒师特调
  try {
    const deck = uni.getStorageSync('mixocraft_custom_deck');
    if (Array.isArray(deck)) {
      const found = deck.find((item: Recipe) => item.id === id);
      if (found) {
        if (!found.coverImage) {
          found.coverImage = found.category === 'mocktail'
            ? '/static/recipes/dongfang_shuye_highball.png'
            : '/static/recipes/suntory_oolong_highball.png';
        }
        return found;
      }
    }
    const cached = uni.getStorageSync('mixocraft_custom_recipe');
    if (cached && (cached.id === id || id.startsWith('ai_'))) {
      if (!cached.coverImage) {
        cached.coverImage = cached.category === 'mocktail'
          ? '/static/recipes/dongfang_shuye_highball.png'
          : '/static/recipes/suntory_oolong_highball.png';
      }
      return cached;
    }
  } catch (_) {}
  return undefined;
}
