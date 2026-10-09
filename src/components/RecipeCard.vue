<template>
  <view class="recipe-card glass-card" @tap="goToDetail">
    <!-- 顶部色彩横幅与类别 -->
    <view class="card-header" :style="{ background: recipe.coverColor }">
      <view class="header-left">
        <text class="category-pill">{{ categoryName }}</text>
        <text class="method-tag">{{ methodName }}</text>
      </view>
      <view class="header-right">
        <text class="abv-badge">{{ recipe.calculatedAbv }}% ABV</text>
      </view>
    </view>

    <!-- 卡片主体内容 -->
    <view class="card-body">
      <view class="title-row">
        <view class="title-wrap">
          <text class="name-zh">{{ recipe.nameZh }}</text>
          <text class="name-en">{{ recipe.nameEn }}</text>
        </view>
        <!-- 酒杯 Emoji -->
        <text class="glass-icon">{{ glassEmoji }}</text>
      </view>

      <text class="description">{{ recipe.description }}</text>

      <!-- 酒柜就绪状态提示 -->
      <view v-if="matchResult" class="status-row">
        <view v-if="matchResult.status === 'perfect'" class="status-pill status-ready">
          <text class="pill-dot">●</text>
          <text>酒柜已齐 · 现成可做</text>
        </view>
        <view v-else-if="matchResult.status === 'substitute'" class="status-pill status-sub">
          <text class="pill-dot">●</text>
          <text>可平替原料制作</text>
        </view>
        <view v-else-if="matchResult.status === 'missing_one'" class="status-pill status-missing">
          <text class="pill-dot">○</text>
          <text>仅差 1 种: {{ missingIngredientName }}</text>
        </view>
      </view>

      <!-- 底部标签栏 -->
      <view class="card-footer">
        <view class="tags-list">
          <text v-for="tag in recipe.tags.slice(0, 3)" :key="tag" class="tag-chip">
            #{{ tag }}
          </text>
        </view>
        <text class="time-meta">⏱ {{ recipe.prepTimeMinutes }}分钟</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Recipe } from '../types/recipe';
import { useCabinetStore } from '../stores/cabinet';

const props = defineProps<{
  recipe: Recipe;
}>();

const cabinetStore = useCabinetStore();

const matchResult = computed(() => {
  return cabinetStore.evaluateRecipe(props.recipe);
});

const missingIngredientName = computed(() => {
  if (matchResult.value.missingIngredients.length > 0) {
    return matchResult.value.missingIngredients[0].nameZh;
  }
  return '';
});

const categoryName = computed(() => {
  switch (props.recipe.category) {
    case 'iba': return 'IBA 经典';
    case 'convenience': return '便利店特调';
    case 'tea_cocktail': return '新中式茶酒';
    case 'mocktail': return '无酒精特调';
    default: return '现代特调';
  }
});

const methodName = computed(() => {
  switch (props.recipe.method) {
    case 'shake': return '摇和法 Shake';
    case 'stir': return '搅拌法 Stir';
    case 'build': return '直调法 Build';
    case 'muddle': return '捣碎法 Muddle';
    case 'blend': return '冰沙法 Blend';
    default: return '调制';
  }
});

const glassEmoji = computed(() => {
  switch (props.recipe.glass) {
    case 'martini': return '🍸';
    case 'highball': return '🥤';
    case 'old_fashioned': return '🥃';
    case 'coupe': return '🥂';
    case 'mule_mug': return '🍺';
    default: return '🍹';
  }
});

function goToDetail() {
  uni.navigateTo({
    url: `/pages/recipe/detail?id=${props.recipe.id}`
  });
}
</script>

<style scoped lang="scss">
.recipe-card {
  margin-bottom: 24rpx;
  overflow: hidden;
  border-radius: 24rpx;
  transition: transform 0.2s ease;
}

.recipe-card:active {
  transform: scale(0.985);
}

.card-header {
  height: 90rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.category-pill {
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(8px);
  color: #FFFFFF;
  font-size: 20rpx;
  font-weight: 600;
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
}

.method-tag {
  color: rgba(255, 255, 255, 0.85);
  font-size: 20rpx;
}

.abv-badge {
  background: rgba(0, 0, 0, 0.45);
  color: #FDE68A;
  font-size: 22rpx;
  font-weight: 700;
  padding: 6rpx 18rpx;
  border-radius: 999rpx;
  letter-spacing: 0.5px;
}

.card-body {
  padding: 24rpx;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12rpx;
}

.title-wrap {
  display: flex;
  flex-direction: column;
}

.name-zh {
  font-size: 34rpx;
  font-weight: 700;
  color: #FFFFFF;
  line-height: 1.2;
}

.name-en {
  font-size: 22rpx;
  color: #9CA3AF;
  margin-top: 4rpx;
}

.glass-icon {
  font-size: 40rpx;
}

.description {
  font-size: 24rpx;
  color: #D1D5DB;
  line-height: 1.5;
  margin-bottom: 20rpx;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.status-row {
  margin-bottom: 18rpx;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  font-size: 22rpx;
  padding: 8rpx 20rpx;
  border-radius: 999rpx;
  font-weight: 500;
}

.status-ready {
  background: rgba(16, 185, 129, 0.15);
  color: #34D399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-sub {
  background: rgba(245, 158, 11, 0.15);
  color: #FBBF24;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.status-missing {
  background: rgba(239, 68, 68, 0.12);
  color: #F87171;
  border: 1px solid rgba(239, 68, 68, 0.25);
}

.pill-dot {
  font-size: 18rpx;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 14rpx;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.tag-chip {
  font-size: 20rpx;
  color: #9CA3AF;
  background: rgba(255, 255, 255, 0.05);
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
}

.time-meta {
  font-size: 22rpx;
  color: #6B7280;
}
</style>
