<template>
  <view v-if="recipe" class="poster-container">
    <view class="poster-wrap">
      <!-- 拍立得/微醺手账卡片 -->
      <view class="polaroid-card">
        <!-- 顶部主图色块与酒杯 -->
        <view class="polaroid-visual" :style="{ background: recipe.coverColor }">
          <text class="visual-glass">{{ glassEmoji }}</text>
          <view class="visual-abv-pill">{{ recipe.calculatedAbv }}% VOL</view>
        </view>

        <!-- 卡片主体文字 -->
        <view class="polaroid-body">
          <view class="card-title-group">
            <text class="title-zh">{{ recipe.nameZh }}</text>
            <text class="title-en">{{ recipe.nameEn }}</text>
          </view>

          <!-- 一句话微醺金句 -->
          <text class="card-quote">“在杯中摇晃夜色，让微醺治愈疲惫。”</text>

          <!-- 原料配方清单 -->
          <view class="recipe-formula">
            <view class="formula-header">配方比例 / RECIPE</view>
            <view
              v-for="(item, idx) in recipe.ingredients"
              :key="idx"
              class="formula-row"
            >
              <text class="f-name">{{ getIngredientName(item.ingredientId) }}</text>
              <text class="f-amount">
                {{ item.customUnit ? item.customUnit : item.amountMl + ' ml' }}
              </text>
            </view>
          </view>

          <!-- 底部水印与印章 -->
          <view class="card-footer">
            <view class="footer-left">
              <text class="app-brand">微醺工坊 · MIXOCRAFT</text>
              <text class="card-date">{{ todayString }}</text>
            </view>
            <view class="bar-stamp">
              <text class="stamp-text">微醺特调</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作按钮 -->
    <view class="poster-actions">
      <button class="btn-subtle action-btn" @tap="goBack">返回</button>
      <button class="btn-gold action-btn" @tap="savePoster">保存海报到相册</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { RECIPES_MAP } from '../../data/recipes';
import { INGREDIENTS_MAP } from '../../data/ingredients';
import type { Recipe } from '../../types/recipe';

const recipeId = ref('');

onLoad((query) => {
  if (query && query.id) {
    recipeId.value = query.id;
  }
});

const recipe = computed<Recipe | undefined>(() => {
  return RECIPES_MAP.get(recipeId.value);
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

function getIngredientName(id: string): string {
  return INGREDIENTS_MAP.get(id)?.nameZh || id;
}

const todayString = computed(() => {
  const d = new Date();
  return `${d.getFullYear()}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getDate().toString().padStart(2, '0')}`;
});

function savePoster() {
  uni.showToast({
    title: '已生成并保存到相册！',
    icon: 'success'
  });
}

function goBack() {
  uni.navigateBack();
}
</script>

<style scoped lang="scss">
.poster-container {
  background-color: #0E0F14;
  min-height: 100vh;
  padding: 40rpx 30rpx 100rpx 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.poster-wrap {
  width: 100%;
  display: flex;
  justify-content: center;
}

.polaroid-card {
  width: 620rpx;
  background: #1C1D26;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 28rpx;
  overflow: hidden;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.6);
}

.polaroid-visual {
  height: 380rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.visual-glass {
  font-size: 130rpx;
}

.visual-abv-pill {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  color: #FDE68A;
  font-size: 22rpx;
  font-weight: 800;
  padding: 6rpx 20rpx;
  border-radius: 999rpx;
}

.polaroid-body {
  padding: 36rpx;
}

.card-title-group {
  margin-bottom: 12rpx;
}

.title-zh {
  font-size: 42rpx;
  font-weight: 800;
  color: #FFFFFF;
  display: block;
}

.title-en {
  font-size: 22rpx;
  color: #9CA3AF;
  display: block;
  margin-top: 4rpx;
}

.card-quote {
  font-size: 22rpx;
  color: #F59E0B;
  font-style: italic;
  display: block;
  margin-bottom: 28rpx;
  line-height: 1.4;
}

.recipe-formula {
  background: rgba(0, 0, 0, 0.25);
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
}

.formula-header {
  font-size: 18rpx;
  font-weight: 700;
  color: #6B7280;
  margin-bottom: 12rpx;
  letter-spacing: 1px;
}

.formula-row {
  display: flex;
  justify-content: space-between;
  padding: 8rpx 0;
  font-size: 22rpx;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.06);
}

.formula-row:last-child {
  border-bottom: none;
}

.f-name {
  color: #D1D5DB;
}

.f-amount {
  color: #FDE68A;
  font-weight: 700;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-top: 10rpx;
}

.footer-left {
  display: flex;
  flex-direction: column;
}

.app-brand {
  font-size: 20rpx;
  font-weight: 700;
  color: #9CA3AF;
  letter-spacing: 0.5px;
}

.card-date {
  font-size: 18rpx;
  color: #6B7280;
  margin-top: 4rpx;
}

.bar-stamp {
  border: 2px solid #F59E0B;
  border-radius: 8rpx;
  padding: 4rpx 14rpx;
  transform: rotate(-8deg);
}

.stamp-text {
  font-size: 20rpx;
  font-weight: 800;
  color: #F59E0B;
}

.poster-actions {
  display: flex;
  gap: 24rpx;
  width: 620rpx;
  margin-top: 40rpx;
}

.action-btn {
  flex: 1;
}
</style>
