<template>
  <view v-if="recipe" class="container">
    <!-- 顶部展开手册卡片 (Opened Recipe Journal Card) -->
    <view class="detail-journal-card" :style="{ '--theme-color': recipe.coverColor || '#D97706' }">
      <!-- 活页抽卡收回栏 -->
      <view class="retract-tab-bar">
        <view class="retract-tab" @tap="retractCard">
          <text class="retract-arrow">‹</text>
          <text class="retract-text">收回卡片</text>
        </view>
        <view class="card-category-pill">
          <text class="cat-num">{{ recipeIndexStr }}</text>
          <text class="cat-slash">/</text>
          <text class="cat-name">{{ getCategoryName(recipe.category) }}</text>
        </view>
      </view>

      <!-- 居中高清手绘插画 (与首页卡包完全对齐) -->
      <view class="detail-illustration-wrap">
        <image
          class="detail-cocktail-img"
          :src="detailImageSrc"
          mode="aspectFit"
          @error="handleDetailImageError"
        />
      </view>

      <!-- 优雅衬线双语标题与微醺短语 -->
      <view class="detail-title-block">
        <text class="detail-name-en">{{ recipe.nameEn }}</text>
        <text class="detail-name-zh">{{ recipe.nameZh }}</text>
        <text class="detail-quote">“{{ recipe.description }}”</text>

        <!-- 核心属性胶囊 -->
        <view class="detail-pills-row">
          <view class="detail-pill pill-abv">
            <text>{{ displayAbv }}% ABV</text>
          </view>
          <view class="detail-pill pill-method">
            <text>{{ methodName }}</text>
          </view>
          <view class="detail-pill pill-glass">
            <text>{{ glassName }}</text>
          </view>
          <view v-if="cabinetEval" class="detail-pill" :class="cabinetEvalClass">
            <text>{{ cabinetEvalText }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 主体区域 -->
    <view class="content-body">
      <!-- 抖音同款黄金比例条 (Parts Ratio Card) -->
      <view v-if="ratioSegments.length > 0" class="ratio-card glass-card">
        <view class="ratio-header">
          <view class="ratio-title-wrap">
            <text class="ratio-icon">⚖️</text>
            <text class="ratio-title">黄金调饮比例</text>
            <text class="ratio-subtitle">PARTS RATIO</text>
          </view>
          <text class="ratio-total">总液量 {{ formatIngredientVolume(totalLiquidVolume) }}</text>
        </view>

        <!-- 彩色分层长条 -->
        <view class="ratio-bar-track">
          <view
            v-for="seg in ratioSegments"
            :key="seg.id"
            class="ratio-bar-segment"
            :style="{ width: seg.percent + '%', backgroundColor: seg.color }"
          >
            <text v-if="seg.percent >= 12" class="seg-name">{{ seg.shortName }}</text>
            <text v-if="seg.percent >= 12" class="seg-part">{{ seg.partStr }}份</text>
          </view>
        </view>

        <!-- 比例图例与份额徽章 -->
        <view class="ratio-legend-list">
          <view
            v-for="seg in ratioSegments"
            :key="seg.id"
            class="legend-item"
          >
            <view class="legend-color-dot" :style="{ backgroundColor: seg.color }"></view>
            <text class="legend-name">{{ seg.shortName }}</text>
            <text class="legend-part-badge">{{ seg.partStr }} 份</text>
            <text class="legend-ml">({{ formatIngredientVolume(seg.amountMl) }})</text>
          </view>
        </view>
      </view>

      <!-- 起源故事与微醺背景 -->
      <view v-if="recipe.story" class="story-card glass-card">
        <view class="story-header">
          <text class="story-icon">📖</text>
          <text class="story-title">起源与品饮风味</text>
        </view>
        <text class="story-text">“{{ recipe.story }}”</text>
      </view>

      <!-- 规格与人份调节器 -->
      <view class="portion-card glass-card">
        <view class="portion-header">
          <text class="section-label">调配人份</text>
          <view class="portion-stepper">
            <view
              v-for="p in [1, 2, 4]"
              :key="p"
              class="portion-chip"
              :class="{ active: portions === p }"
              @tap="portions = p"
            >
              <text>{{ p }}人份</text>
            </view>
          </view>
        </view>

        <!-- 单位选择器 -->
        <view class="unit-box">
          <text class="section-label">计量单位</text>
          <UnitSelector
            :model-value="cabinetStore.unitPreference"
            @update:model-value="cabinetStore.setUnit"
          />
        </view>
      </view>

      <!-- 原料清单与酒柜匹配情况 -->
      <view class="ingredients-card glass-card">
        <view class="ing-header">
          <view class="ing-header-left">
            <text class="section-title">所需原料 ({{ portions }}人份)</text>
            <text class="ing-hint">💡 点击勾选入库，或在下方自由平替换料</text>
          </view>
          <view class="ing-header-right">
            <text v-if="isReadyToMake" class="ready-badge-pill">✨ 核心已备齐</text>
            <text class="ing-ready-count">
              {{ availableCount }}/{{ recipe.ingredients.length }} 样已就绪
            </text>
          </view>
        </view>

        <view class="ing-list">
          <view
            v-for="(item, idx) in recipe.ingredients"
            :key="idx"
            class="ing-item-card"
          >
            <!-- 主行：勾选拥有/禁用 + 原料名称 + 容量 -->
            <view
              class="ing-item"
              :class="{ 
                owned: isItemOwned(getActiveIngredientId(item.ingredientId)),
                disabled: isItemDisabled(item.ingredientId)
              }"
              @tap="toggleItem(getActiveIngredientId(item.ingredientId))"
            >
              <view class="ing-left">
                <view 
                  class="ing-check-circle" 
                  :class="{ checked: isItemOwned(getActiveIngredientId(item.ingredientId)) }"
                >
                  <text v-if="isItemOwned(getActiveIngredientId(item.ingredientId))">✓</text>
                </view>
                <text class="ing-emoji">{{ getIngredientIcon(getActiveIngredientId(item.ingredientId)) }}</text>
                <view class="ing-texts">
                  <view class="ing-title-row">
                    <text class="ing-name" :class="{ 'strike-through': isItemDisabled(item.ingredientId) }">
                      {{ getIngredientName(getActiveIngredientId(item.ingredientId)) }}
                    </text>
                    <text :class="getItemRoleBadge(item).isEssential ? 'status-tag-essential' : 'status-tag-optional'">
                      {{ getItemRoleBadge(item).label }}
                    </text>
                    <text v-if="customStates[item.ingredientId]?.selectedId !== item.ingredientId" class="status-tag-sub">
                      已平替
                    </text>
                    <text v-else-if="isItemOwned(item.ingredientId)" class="status-tag-owned">已备齐</text>
                    <text v-else class="status-tag-missing">缺货·点我入库</text>
                  </view>
                  <text v-if="item.substituteNote" class="ing-sub-note">{{ item.substituteNote }}</text>
                </view>
              </view>
              <view class="ing-right">
                <text class="ing-vol">
                  {{ formatIngredientVolume(item.amountMl, item.customUnit) }}
                </text>
              </view>
            </view>

            <!-- 辅助操作栏：平替切换 + 不放此料开关 -->
            <view class="ing-sub-bar">
              <!-- 平替选择胶囊 -->
              <view v-if="getSubstitutes(item.ingredientId).length > 0" class="sub-chips">
                <text class="sub-label">🔄 换平替：</text>
                <view
                  v-for="subId in getSubstitutes(item.ingredientId)"
                  :key="subId"
                  class="sub-chip"
                  :class="{ active: customStates[item.ingredientId]?.selectedId === subId }"
                  @tap="switchSubstitute(item.ingredientId, subId)"
                >
                  <text>{{ getIngredientIcon(subId) }} {{ getIngredientName(subId) }}</text>
                </view>
              </view>

              <!-- 不放此料微调按钮 -->
              <view 
                class="exclude-chip" 
                :class="{ active: isItemDisabled(item.ingredientId) }"
                @tap="toggleItemEnabled(item.ingredientId)"
              >
                <text>{{ isItemDisabled(item.ingredientId) ? '✕ 已排除此料' : '不加此料' }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 风味平衡雷达图 (实时动态绑定当前自选原料) -->
      <view class="flavor-card glass-card">
        <view class="flavor-header">
          <text class="section-title">五维风味平衡图</text>
          <text v-if="dynamicResult.isModified" class="dynamic-badge">✨ 已按自选原料实时推演</text>
          <text v-else class="baseline-badge">标准经典风味</text>
        </view>
        <FlavorRadar :flavor="displayFlavor" :size="200" />
      </view>

      <!-- 分步制作指南 -->
      <view class="steps-card glass-card">
        <text class="section-title">分步调制指南</text>
        <view class="steps-timeline">
          <view
            v-for="step in recipe.steps"
            :key="step.step"
            class="step-item"
          >
            <view class="step-badge">{{ String(step.step).padStart(2, '0') }}</view>
            <view class="step-content">
              <text class="step-title">{{ step.title }}</text>
              <text class="step-desc">{{ step.description }}</text>
              <view v-if="step.tip" class="step-tip">
                <text class="tip-icon">💡</text>
                <text class="tip-text">{{ step.tip }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 调酒师私房备忘 -->
      <view v-if="recipe.bartenderNote" class="note-card glass-card-amber">
        <text class="note-tag">🍸 调酒师秘诀：</text>
        <text class="note-content">{{ recipe.bartenderNote }}</text>
      </view>
    </view>

    <!-- 底部固定操作栏 -->
    <view class="bottom-bar glass-card">
      <view class="bar-left">
        <!-- 收藏按钮 -->
        <view class="icon-btn" @tap="toggleFav">
          <text class="fav-icon" :class="{ isFav: isFavorite }">
            {{ isFavorite ? '❤️' : '🤍' }}
          </text>
          <text class="icon-label">{{ isFavorite ? '已收藏' : '收藏' }}</text>
        </view>
        <!-- 海报卡片 -->
        <view class="icon-btn" @tap="goToPoster">
          <text class="poster-icon">🎴</text>
          <text class="icon-label">酒卡海报</text>
        </view>
      </view>

      <view class="bar-right">
        <button class="btn-gold craft-start-btn" @tap="startCrafting">
          进入调酒工作台
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { RECIPES, RECIPES_MAP } from '../../data/recipes';
import { INGREDIENTS_MAP } from '../../data/ingredients';
import type { Recipe } from '../../types/recipe';
import { useCabinetStore } from '../../stores/cabinet';
import { useFavoritesStore } from '../../stores/favorites';
import { formatVolume } from '../../utils/unit';
import { calculateDynamicFlavorAndABV, type CustomizedIngredientState } from '../../utils/flavor';
import FlavorRadar from '../../components/FlavorRadar.vue';
import UnitSelector from '../../components/UnitSelector.vue';

const cabinetStore = useCabinetStore();
const favoritesStore = useFavoritesStore();

const recipeId = ref('');
const portions = ref(1);
const customStates = ref<Record<string, CustomizedIngredientState>>({});
const customRecipe = ref<Recipe | null>(null);
const isImageError = ref(false);

function handleDetailImageError() {
  isImageError.value = true;
}

const detailImageSrc = computed(() => {
  if (!recipe.value) return '/static/recipes/long_island_iced_tea.png';
  if (isImageError.value) return '/static/recipes/long_island_iced_tea.png';
  if (recipe.value.coverImage && recipe.value.coverImage.trim()) {
    return recipe.value.coverImage;
  }
  if (recipe.value.id.startsWith('ai_')) {
    return recipe.value.category === 'mocktail'
      ? '/static/recipes/dongfang_shuye_highball.png'
      : '/static/recipes/suntory_oolong_highball.png';
  }
  return `/static/recipes/${recipe.value.id}.png`;
});

const recipeIndexStr = computed(() => {
  if (!recipe.value) return '01';
  const idx = RECIPES.findIndex(r => r.id === recipe.value?.id);
  if (idx >= 0) {
    return String(idx + 1).padStart(2, '0');
  }
  return '01';
});

function retractCard() {
  try {
    uni.vibrateShort({ type: 'light' });
  } catch (e) {}
  uni.navigateBack({
    fail: () => {
      uni.switchTab({ url: '/pages/index/index' });
    }
  });
}

function getCategoryName(cat?: string): string {
  switch (cat) {
    case 'iba': return 'IBA 官方经典';
    case 'convenience': return '便利店特调';
    case 'tea_cocktail': return '新中式茶酒';
    case 'mocktail': return '无酒精特调';
    default: return '精选调饮';
  }
}

const cabinetEval = computed(() => {
  if (!recipe.value) return null;
  return cabinetStore.evaluateRecipe(recipe.value);
});

const cabinetEvalText = computed(() => {
  if (!cabinetEval.value) return '';
  if (cabinetEval.value.status === 'perfect') return '✨ 现成可做';
  if (cabinetEval.value.status === 'substitute') return '🔄 平替可做';
  if (cabinetEval.value.status === 'missing_one') return '仅缺 1 样';
  return '';
});

const cabinetEvalClass = computed(() => {
  if (!cabinetEval.value) return '';
  if (cabinetEval.value.status === 'perfect') return 'pill-ready';
  if (cabinetEval.value.status === 'substitute') return 'pill-sub';
  return 'pill-missing';
});

interface RatioSegment {
  id: string;
  name: string;
  shortName: string;
  amountMl: number;
  percent: number;
  partStr: string;
  color: string;
}

const INGREDIENT_COLORS: Record<string, string> = {
  gin: '#6EE7B7',
  london_dry_gin: '#6EE7B7',
  vodka: '#93C5FD',
  white_rum: '#FDE68A',
  dark_rum: '#D97706',
  tequila: '#FBBF24',
  bourbon_whiskey: '#EA580C',
  rye_whiskey: '#C2410C',
  scotch_whiskey: '#B45309',
  whiskey: '#B45309',
  cognac: '#9A3412',
  brandy: '#9A3412',
  cointreau: '#F97316',
  triple_sec: '#FB923C',
  kahlua: '#78350F',
  baileys: '#F59E0B',
  campari: '#EF4444',
  aperol: '#F97316',
  sweet_vermouth: '#DC2626',
  dry_vermouth: '#A3E635',
  lemon_juice: '#FACC15',
  lime_juice: '#84CC16',
  orange_juice: '#FB923C',
  grapefruit_juice: '#F43F5E',
  pineapple_juice: '#FDE047',
  cranberry_juice: '#E11D48',
  simple_syrup: '#E2E8F0',
  honey: '#F59E0B',
  grenadine: '#E11D48',
  soda_water: '#BAE6FD',
  tonic_water: '#7DD3FC',
  cola: '#78350F',
  ginger_beer: '#FDE68A',
  ginger_ale: '#FDE68A',
  iced_tea: '#B45309',
  green_tea: '#86EFAC',
  oolong_tea: '#B45309',
  jasmine_tea: '#A7F3D0',
  redbull: '#3B82F6',
  yakult: '#FECDD3',
  coconut_milk: '#F1F5F9',
  angostura_bitters: '#991B1B',
};

const defaultColorPalette = [
  '#F59E0B', '#3B82F6', '#10B981', '#EC4899', '#8B5CF6', '#14B8A6', '#F97316', '#6366F1'
];

const totalLiquidVolume = computed(() => {
  if (!recipe.value) return 0;
  return recipe.value.ingredients.reduce((acc, cur) => acc + (cur.amountMl || 0), 0);
});

const ratioSegments = computed<RatioSegment[]>(() => {
  if (!recipe.value) return [];
  const liquids = recipe.value.ingredients.filter(item => item.amountMl && item.amountMl > 0);
  if (liquids.length === 0) return [];

  const totalMl = liquids.reduce((acc, cur) => acc + cur.amountMl, 0);
  if (totalMl <= 0) return [];

  const minMl = Math.min(...liquids.map(l => l.amountMl));
  const baseUnit = minMl > 0 ? minMl : 15;

  return liquids.map((item, idx) => {
    const activeId = getActiveIngredientId(item.ingredientId);
    const fullName = getIngredientName(activeId);
    const shortName = fullName.split('/')[0].trim().slice(0, 5);
    const percent = Math.round((item.amountMl / totalMl) * 100);
    const rawPart = +(item.amountMl / baseUnit).toFixed(1);
    const partStr = Number.isInteger(rawPart) ? `${rawPart}` : `${rawPart}`;
    const color = INGREDIENT_COLORS[activeId] || INGREDIENT_COLORS[item.ingredientId] || defaultColorPalette[idx % defaultColorPalette.length];

    return {
      id: item.ingredientId,
      name: fullName,
      shortName,
      amountMl: item.amountMl,
      percent,
      partStr,
      color,
    };
  });
});

onLoad((query) => {
  if (query && query.id) {
    recipeId.value = query.id;
  }
  // 尝试读取 AI 侍酒定制或临时特调配方
  if (!RECIPES_MAP.get(recipeId.value) || recipeId.value.startsWith('ai_')) {
    try {
      const cached = uni.getStorageSync('mixocraft_custom_recipe');
      if (cached && (cached.id === recipeId.value || recipeId.value.startsWith('ai_'))) {
        customRecipe.value = cached;
        recipeId.value = cached.id;
      }
    } catch (e) {
      console.error('Failed to load custom recipe in detail', e);
    }
  }
});

const recipe = computed<Recipe | undefined>(() => {
  if (customRecipe.value && customRecipe.value.id === recipeId.value) {
    return customRecipe.value;
  }
  return RECIPES_MAP.get(recipeId.value);
});

// 初始化自选原料状态
watch(recipe, (r) => {
  if (r) {
    const states: Record<string, CustomizedIngredientState> = {};
    for (const item of r.ingredients) {
      states[item.ingredientId] = {
        originalId: item.ingredientId,
        selectedId: item.ingredientId,
        isEnabled: true,
      };
    }
    customStates.value = states;
  }
}, { immediate: true });

// 实时动态风味与 ABV 计算
const dynamicResult = computed(() => {
  if (!recipe.value) {
    return {
      dynamicFlavor: { sweetness: 3, sourness: 3, strength: 3, bitterness: 1, refreshment: 3 },
      dynamicAbv: 0,
      isModified: false,
    };
  }
  return calculateDynamicFlavorAndABV(recipe.value, customStates.value, recipe.value.method);
});

const displayAbv = computed(() => {
  return dynamicResult.value.dynamicAbv;
});

const displayFlavor = computed(() => {
  return dynamicResult.value.dynamicFlavor;
});

const isFavorite = computed(() => {
  return recipe.value ? favoritesStore.isFavorite(recipe.value.id) : false;
});

function toggleFav() {
  if (recipe.value) {
    favoritesStore.toggleFavorite(recipe.value.id);
  }
}

function isItemOwned(id: string): boolean {
  return cabinetStore.hasIngredient(id);
}

const availableCount = computed(() => {
  if (!recipe.value) return 0;
  return recipe.value.ingredients.filter(item => cabinetStore.hasIngredient(item.ingredientId)).length;
});

function getItemRoleBadge(item: any): { label: string; isEssential: boolean } {
  if (item.isOptional || item.isGarnish) {
    return { label: '装饰/可选', isEssential: false };
  }
  const ing = INGREDIENTS_MAP.get(item.ingredientId);
  if (!ing || ing.category === 'garnish' || ing.category === 'ice') {
    return { label: '装饰/可选', isEssential: false };
  }
  if (ing.category === 'spirit' || ing.category === 'liqueur') {
    return { label: '必需基酒', isEssential: true };
  }
  return { label: '必需配液', isEssential: true };
}

const isReadyToMake = computed(() => {
  if (!recipe.value) return false;
  return recipe.value.ingredients.every(item => {
    const role = getItemRoleBadge(item);
    if (!role.isEssential) return true;
    return isItemOwned(item.ingredientId);
  });
});

function getIngredientName(id: string): string {
  return INGREDIENTS_MAP.get(id)?.nameZh || id;
}

function getIngredientIcon(id: string): string {
  return INGREDIENTS_MAP.get(id)?.icon || '🍾';
}

function toggleItem(id: string) {
  cabinetStore.toggleIngredient(id);
  uni.vibrateShort({ type: 'light' });
  const isNowOwned = cabinetStore.hasIngredient(id);
  uni.showToast({
    title: isNowOwned ? '✓ 已标记为已备齐' : '已从酒柜移除',
    icon: 'none',
    duration: 1000
  });
}

function getActiveIngredientId(originalId: string): string {
  return customStates.value[originalId]?.selectedId || originalId;
}

function isItemDisabled(originalId: string): boolean {
  return customStates.value[originalId]?.isEnabled === false;
}

function getSubstitutes(ingId: string): string[] {
  const ing = INGREDIENTS_MAP.get(ingId);
  return ing?.substitutes || [];
}

function switchSubstitute(originalId: string, subId: string) {
  if (!customStates.value[originalId]) {
    customStates.value[originalId] = { originalId, selectedId: subId, isEnabled: true };
  } else {
    if (customStates.value[originalId].selectedId === subId) {
      customStates.value[originalId].selectedId = originalId;
      uni.showToast({
        title: '已切回原配方：' + getIngredientName(originalId),
        icon: 'none'
      });
    } else {
      customStates.value[originalId].selectedId = subId;
      uni.showToast({
        title: '已平替为：' + getIngredientName(subId) + ' (风味已重算)',
        icon: 'none'
      });
    }
  }
  uni.vibrateShort({ type: 'light' });
}

function toggleItemEnabled(originalId: string) {
  if (customStates.value[originalId]) {
    customStates.value[originalId].isEnabled = !customStates.value[originalId].isEnabled;
    uni.vibrateShort({ type: 'light' });
    const enabled = customStates.value[originalId].isEnabled;
    uni.showToast({
      title: enabled ? '已恢复使用此原料' : '已排除此原料 (风味已重算)',
      icon: 'none'
    });
  }
}

function formatIngredientVolume(amountMl: number, customUnit?: string): string {
  if (customUnit) {
    return portions.value > 1 ? `${customUnit} (x${portions.value})` : customUnit;
  }
  return formatVolume(amountMl, cabinetStore.unitPreference, portions.value);
}

const methodName = computed(() => {
  if (!recipe.value) return '';
  switch (recipe.value.method) {
    case 'shake': return '摇和法';
    case 'stir': return '搅拌法';
    case 'build': return '直调法';
    case 'muddle': return '捣碎法';
    default: return '混合法';
  }
});

const glassName = computed(() => {
  if (!recipe.value) return '';
  switch (recipe.value.glass) {
    case 'martini': return '马天尼高脚杯';
    case 'highball': return '高球长饮杯';
    case 'old_fashioned': return '古典矮杯';
    case 'coupe': return '浅碟香槟杯';
    case 'mule_mug': return '莫斯科铜骡杯';
    default: return '专用杯';
  }
});

const glassEmoji = computed(() => {
  if (!recipe.value) return '🍸';
  switch (recipe.value.glass) {
    case 'martini': return '🍸';
    case 'highball': return '🥤';
    case 'old_fashioned': return '🥃';
    case 'coupe': return '🥂';
    case 'mule_mug': return '🍺';
    default: return '🍹';
  }
});

function goToPoster() {
  if (recipe.value) {
    uni.navigateTo({
      url: `/pages/recipe/poster?id=${recipe.value.id}`
    });
  }
}

function startCrafting() {
  if (recipe.value) {
    uni.navigateTo({
      url: `/pages/recipe/craft?id=${recipe.value.id}&portions=${portions.value}`
    });
  }
}
</script>

<style scoped lang="scss">
.container {
  padding-bottom: 180rpx;
  background-color: #0E0F14;
  min-height: 100vh;
}

/* 展开手册纸质卡片 (Opened Recipe Journal Card) */
.detail-journal-card {
  background: #FAF7F2;
  border-bottom-left-radius: 44rpx;
  border-bottom-right-radius: 44rpx;
  padding: 30rpx 36rpx 44rpx 36rpx;
  box-shadow: 0 16rpx 40rpx rgba(0, 0, 0, 0.45);
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.retract-tab-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.retract-tab {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  background: #111827;
  color: #FAF7F2;
  padding: 10rpx 24rpx;
  border-radius: 999rpx;
  cursor: pointer;
  transition: transform 0.15s ease;
  box-shadow: 0 4rpx 12rpx rgba(17, 24, 39, 0.2);

  &:active {
    transform: scale(0.95);
  }
}

.retract-arrow {
  font-size: 28rpx;
  font-weight: 800;
  line-height: 1;
}

.retract-text {
  font-size: 22rpx;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.card-category-pill {
  display: flex;
  align-items: baseline;
  gap: 6rpx;
  background: rgba(0, 0, 0, 0.04);
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
}

.cat-num {
  font-size: 26rpx;
  font-weight: 800;
  color: #111827;
}

.cat-slash {
  font-size: 20rpx;
  color: #9CA3AF;
}

.cat-name {
  font-size: 20rpx;
  font-weight: 600;
  color: #6B7280;
}

/* 居中手绘插画 */
.detail-illustration-wrap {
  width: 100%;
  height: 380rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10rpx 0 20rpx 0;
}

.detail-cocktail-img {
  width: 320rpx;
  height: 380rpx;
  display: block;
}

/* 优雅双语标题与短语 */
.detail-title-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.detail-name-en {
  font-size: 26rpx;
  font-style: italic;
  font-family: 'Baskerville', 'Georgia', 'Times New Roman', serif;
  color: #4B5563;
  letter-spacing: 0.5px;
}

.detail-name-zh {
  font-size: 50rpx;
  font-weight: 900;
  color: #111827;
  letter-spacing: 2rpx;
  line-height: 1.2;
  margin-top: 6rpx;
  font-family: -apple-system, 'PingFang SC', sans-serif;
}

.detail-quote {
  font-size: 23rpx;
  color: #6B7280;
  line-height: 1.5;
  margin-top: 14rpx;
  max-width: 90%;
}

.detail-pills-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12rpx;
  margin-top: 22rpx;
}

.detail-pill {
  font-size: 20rpx;
  font-weight: 600;
  padding: 6rpx 18rpx;
  border-radius: 999rpx;
}

.pill-abv {
  background: #FEF3C7;
  color: #92400E;
  border: 1px solid #FDE68A;
}

.pill-method {
  background: #E5E7EB;
  color: #374151;
}

.pill-glass {
  background: #F3F4F6;
  color: #4B5563;
}

.pill-ready {
  background: #D1FAE5;
  color: #065F46;
}

.pill-sub {
  background: #FEF3C7;
  color: #B45309;
}

.pill-missing {
  background: #FEE2E2;
  color: #991B1B;
}

.content-body {
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

/* 黄金比例配方条卡片 (Parts Ratio Card) */
.ratio-card {
  padding: 28rpx;
}

.ratio-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 22rpx;
}

.ratio-title-wrap {
  display: flex;
  align-items: baseline;
  gap: 10rpx;
}

.ratio-icon {
  font-size: 26rpx;
}

.ratio-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #FFFFFF;
}

.ratio-subtitle {
  font-size: 18rpx;
  font-weight: 600;
  color: #F59E0B;
  letter-spacing: 1px;
}

.ratio-total {
  font-size: 22rpx;
  color: #9CA3AF;
}

.ratio-bar-track {
  width: 100%;
  height: 52rpx;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 14rpx;
  overflow: hidden;
  display: flex;
  box-shadow: inset 0 2rpx 6rpx rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.ratio-bar-segment {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-right: 1px solid rgba(0, 0, 0, 0.15);
  transition: width 0.3s ease;
  overflow: hidden;
}

.seg-name {
  font-size: 18rpx;
  font-weight: 700;
  color: #111827;
  line-height: 1.1;
  white-space: nowrap;
}

.seg-part {
  font-size: 16rpx;
  font-weight: 800;
  color: rgba(17, 24, 39, 0.75);
  line-height: 1;
}

.ratio-legend-list {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx 20rpx;
  margin-top: 22rpx;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: rgba(255, 255, 255, 0.04);
  padding: 6rpx 14rpx;
  border-radius: 8rpx;
}

.legend-color-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 4rpx;
  flex-shrink: 0;
}

.legend-name {
  font-size: 22rpx;
  color: #E5E7EB;
  font-weight: 500;
}

.legend-part-badge {
  font-size: 19rpx;
  font-weight: 700;
  color: #FDE68A;
}

.legend-ml {
  font-size: 19rpx;
  color: #9CA3AF;
}

/* 起源故事卡片 */
.story-card {
  padding: 28rpx;
}

.story-header {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 12rpx;
}

.story-icon {
  font-size: 26rpx;
}

.story-title {
  font-size: 26rpx;
  font-weight: 700;
  color: #FFFFFF;
}

.story-text {
  font-size: 22rpx;
  color: #9CA3AF;
  font-style: italic;
  line-height: 1.6;
  display: block;
}

.portion-card {
  padding: 24rpx;
}

.portion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-label {
  font-size: 24rpx;
  color: #9CA3AF;
  font-weight: 500;
}

.portion-stepper {
  display: flex;
  gap: 12rpx;
}

.portion-chip {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #9CA3AF;
  font-size: 22rpx;
  padding: 8rpx 20rpx;
  border-radius: 999rpx;
}

.portion-chip.active {
  background: #F59E0B;
  color: #000000;
  font-weight: 700;
}

.unit-box {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.ingredients-card {
  padding: 28rpx;
}

.ing-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.ing-header-left {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #FFFFFF;
}

.ing-hint {
  font-size: 20rpx;
  color: #F59E0B;
}

.ing-ready-count {
  font-size: 22rpx;
  color: #10B981;
}

.ing-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.ing-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18rpx 20rpx;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16rpx;
  transition: all 0.2s ease;
}

.ing-item:active {
  transform: scale(0.985);
  background: rgba(255, 255, 255, 0.06);
}

.ing-item.owned {
  background: rgba(16, 185, 129, 0.08);
  border-color: rgba(16, 185, 129, 0.3);
}

.ing-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.ing-check-circle {
  width: 38rpx;
  height: 38rpx;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  color: transparent;
  flex-shrink: 0;
}

.ing-check-circle.checked {
  background: #10B981;
  border-color: #10B981;
  color: #FFFFFF;
  font-weight: 800;
}

.ing-emoji {
  font-size: 34rpx;
  line-height: 1;
}

.ing-texts {
  display: flex;
  flex-direction: column;
}

.ing-title-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.status-tag-owned {
  font-size: 18rpx;
  color: #10B981;
  background: rgba(16, 185, 129, 0.15);
  padding: 2rpx 10rpx;
  border-radius: 6rpx;
  font-weight: 500;
}

.status-tag-missing {
  font-size: 18rpx;
  color: #F59E0B;
  background: rgba(245, 158, 11, 0.15);
  padding: 2rpx 10rpx;
  border-radius: 6rpx;
  font-weight: 500;
}

.status-tag-essential {
  font-size: 18rpx;
  color: #38BDF8;
  background: rgba(56, 189, 248, 0.15);
  padding: 2rpx 10rpx;
  border-radius: 6rpx;
  font-weight: 500;
}

.status-tag-optional {
  font-size: 18rpx;
  color: #9CA3AF;
  background: rgba(156, 163, 175, 0.15);
  padding: 2rpx 10rpx;
  border-radius: 6rpx;
  font-weight: 500;
}

.ing-header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6rpx;
}

.ready-badge-pill {
  font-size: 20rpx;
  color: #10B981;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
  font-weight: 600;
}

.status-tag-sub {
  font-size: 18rpx;
  color: #06B6D4;
  background: rgba(6, 182, 212, 0.15);
  padding: 2rpx 10rpx;
  border-radius: 6rpx;
  font-weight: 500;
}

.strike-through {
  text-decoration: line-through;
  opacity: 0.45;
}

.ing-item.disabled {
  opacity: 0.55;
  background: rgba(255, 255, 255, 0.01);
}

.ing-item-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 14rpx;
}

.ing-item-card .ing-item {
  background: transparent;
  border: none;
  border-radius: 0;
}

.ing-sub-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 20rpx;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px dashed rgba(255, 255, 255, 0.05);
}

.sub-chips {
  display: flex;
  align-items: center;
  gap: 8rpx;
  flex-wrap: wrap;
}

.sub-label {
  font-size: 18rpx;
  color: #9CA3AF;
}

.sub-chip {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
  font-size: 18rpx;
  color: #D1D5DB;
  transition: all 0.2s ease;
}

.sub-chip.active {
  background: #F59E0B;
  border-color: #F59E0B;
  color: #000000;
  font-weight: 700;
}

.exclude-chip {
  font-size: 18rpx;
  color: #9CA3AF;
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.04);
}

.exclude-chip.active {
  background: rgba(239, 68, 68, 0.2);
  color: #F87171;
  font-weight: 600;
}

.flavor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.dynamic-tag {
  background: rgba(245, 158, 11, 0.2);
  color: #FDE68A;
  font-size: 20rpx;
  font-weight: 600;
  padding: 4rpx 16rpx;
  border-radius: 999rpx;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.baseline-tag {
  font-size: 20rpx;
  color: #9CA3AF;
}

.ing-name {
  font-size: 26rpx;
  color: #E5E7EB;
  font-weight: 500;
}

.ing-sub-note {
  font-size: 18rpx;
  color: #F59E0B;
  margin-top: 4rpx;
}

.ing-vol {
  font-size: 26rpx;
  font-weight: 700;
  color: #FDE68A;
}

.flavor-card {
  padding: 28rpx;
}

.steps-card {
  padding: 28rpx;
}

.steps-timeline {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  margin-top: 20rpx;
}

.step-item {
  display: flex;
  gap: 20rpx;
}

.step-badge {
  width: 52rpx;
  height: 52rpx;
  border-radius: 14rpx;
  background: rgba(245, 158, 11, 0.15);
  color: #FDE68A;
  border: 1px solid rgba(245, 158, 11, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 800;
  font-family: -apple-system, sans-serif;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-title {
  font-size: 26rpx;
  font-weight: 700;
  color: #FFFFFF;
  display: block;
}

.step-desc {
  font-size: 24rpx;
  color: #9CA3AF;
  line-height: 1.5;
  margin-top: 6rpx;
  display: block;
}

.step-tip {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: rgba(245, 158, 11, 0.1);
  padding: 8rpx 14rpx;
  border-radius: 8rpx;
  margin-top: 10rpx;
}

.tip-icon {
  font-size: 22rpx;
}

.tip-text {
  font-size: 20rpx;
  color: #FDE68A;
}

.note-card {
  padding: 24rpx;
}

.note-tag {
  font-size: 24rpx;
  font-weight: 700;
  color: #FDE68A;
  display: block;
  margin-bottom: 8rpx;
}

.note-content {
  font-size: 22rpx;
  color: #D1D5DB;
  line-height: 1.5;
  display: block;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 30rpx env(safe-area-inset-bottom) 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius: 30rpx;
  border-top-right-radius: 30rpx;
  z-index: 100;
}

.bar-left {
  display: flex;
  gap: 28rpx;
}

.icon-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.fav-icon, .poster-icon {
  font-size: 38rpx;
}

.icon-label {
  font-size: 18rpx;
  color: #9CA3AF;
  margin-top: 4rpx;
}

.bar-right {
  flex: 1;
  padding-left: 30rpx;
}

.craft-start-btn {
  width: 100%;
  font-size: 26rpx;
}
</style>
