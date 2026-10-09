<template>
  <view v-if="recipe" class="container">
    <!-- 顶部横幅与返回 -->
    <view class="hero-banner" :style="{ background: recipe.coverColor }">
      <view class="hero-content">
        <text class="hero-glass">{{ glassEmoji }}</text>
        <view class="hero-titles">
          <text class="name-zh">{{ recipe.nameZh }}</text>
          <text class="name-en">{{ recipe.nameEn }}</text>
        </view>
        <view class="hero-tags">
          <text class="badge-abv">{{ displayAbv }}% ABV</text>
          <text class="badge-method">{{ methodName }}</text>
          <text class="badge-glass">{{ glassName }}</text>
        </view>
      </view>
    </view>

    <!-- 主体区域 -->
    <view class="content-body">
      <!-- 简介与起源故事 -->
      <view class="story-card glass-card">
        <text class="story-desc">{{ recipe.description }}</text>
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
          <text class="ing-ready-count">
            {{ availableCount }}/{{ recipe.ingredients.length }} 样已就绪
          </text>
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
            <view class="step-badge">{{ step.step }}</view>
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
import { RECIPES_MAP } from '../../data/recipes';
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

onLoad((query) => {
  if (query && query.id) {
    recipeId.value = query.id;
  }
});

const recipe = computed<Recipe | undefined>(() => {
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

.hero-banner {
  padding: 60rpx 30rpx 40rpx 30rpx;
  border-bottom-left-radius: 40rpx;
  border-bottom-right-radius: 40rpx;
}

.hero-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.hero-glass {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.name-zh {
  font-size: 46rpx;
  font-weight: 800;
  color: #FFFFFF;
  display: block;
}

.name-en {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 6rpx;
  display: block;
}

.hero-tags {
  display: flex;
  gap: 12rpx;
  margin-top: 24rpx;
}

.badge-abv, .badge-method, .badge-glass {
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(8px);
  color: #FFFFFF;
  font-size: 22rpx;
  font-weight: 600;
  padding: 6rpx 20rpx;
  border-radius: 999rpx;
}

.badge-abv {
  color: #FDE68A;
}

.content-body {
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.story-card {
  padding: 28rpx;
}

.story-desc {
  font-size: 26rpx;
  color: #FFFFFF;
  font-weight: 600;
  display: block;
  margin-bottom: 12rpx;
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
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background: rgba(245, 158, 11, 0.2);
  color: #FDE68A;
  border: 1px solid rgba(245, 158, 11, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  font-weight: 800;
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
