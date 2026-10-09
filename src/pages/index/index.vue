<template>
  <view class="container">
    <!-- 顶部品牌栏 -->
    <view class="header-section">
      <view class="brand-wrap">
        <text class="brand-title">微醺工坊</text>
        <text class="brand-subtitle">MIXOCRAFT · 在家调一杯好酒</text>
      </view>
      <view class="quick-status" @tap="goToShelf">
        <text class="status-num">{{ canMakeCount }}</text>
        <text class="status-label">款可做</text>
      </view>
    </view>

    <!-- 搜索框 -->
    <view class="search-box glass-card">
      <text class="search-icon">🔍</text>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索鸡尾酒名、基酒或原料..."
        placeholder-class="search-placeholder"
        class="search-input"
      />
      <text v-if="searchQuery" class="clear-icon" @tap="searchQuery = ''">✕</text>
    </view>

    <!-- 分类标签滑动条 -->
    <scroll-view scroll-x class="category-scroll" :show-scrollbar="false">
      <view class="category-list">
        <view
          v-for="cat in categories"
          :key="cat.id"
          class="cat-tab"
          :class="{ active: currentCategory === cat.id }"
          @tap="currentCategory = cat.id"
        >
          <text class="cat-name">{{ cat.name }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 今日特调高光推荐 (当无搜索关键词时显示) -->
    <view v-if="!searchQuery && featuredRecipe" class="featured-banner glass-card-amber" @tap="goToRecipe(featuredRecipe.id)">
      <view class="featured-tag">今日特调推荐</view>
      <view class="featured-content">
        <view class="featured-left">
          <text class="featured-title">{{ featuredRecipe.nameZh }}</text>
          <text class="featured-subtitle">{{ featuredRecipe.nameEn }} · {{ featuredRecipe.calculatedAbv }}% ABV</text>
          <text class="featured-desc">{{ featuredRecipe.description }}</text>
          <view class="featured-btn">
            <text>立即调一杯 →</text>
          </view>
        </view>
        <view class="featured-right">
          <text class="featured-glass">🍹</text>
        </view>
      </view>
    </view>

    <!-- 酒谱列表栏头 -->
    <view class="section-title-row">
      <text class="section-title">精选酒谱 ({{ filteredRecipes.length }})</text>
      <!-- 快速排序/筛选 -->
      <view class="sort-selector" @tap="toggleSort">
        <text class="sort-text">{{ sortLabel }} ⇅</text>
      </view>
    </view>

    <!-- 配方列表 -->
    <view class="recipe-list">
      <view v-if="filteredRecipes.length === 0" class="empty-state">
        <text class="empty-icon">🍸</text>
        <text class="empty-text">未找到相关酒谱，试试其他关键词或分类吧</text>
      </view>

      <RecipeCard
        v-for="recipe in filteredRecipes"
        :key="recipe.id"
        :recipe="recipe"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { RECIPES } from '../../data/recipes';
import { INGREDIENTS_MAP } from '../../data/ingredients';
import type { RecipeCategory } from '../../types/recipe';
import RecipeCard from '../../components/RecipeCard.vue';
import { useCabinetStore } from '../../stores/cabinet';

const cabinetStore = useCabinetStore();

const searchQuery = ref('');
const currentCategory = ref<string>('all');
const sortBy = ref<'default' | 'abv-asc' | 'abv-desc'>('default');

const categories = [
  { id: 'all', name: '全部灵感' },
  { id: 'iba', name: 'IBA 经典' },
  { id: 'convenience', name: '便利店特调' },
  { id: 'tea_cocktail', name: '新中式茶酒' },
  { id: 'mocktail', name: '无酒精' },
];

const canMakeCount = computed(() => {
  return cabinetStore.canMakeRecipes.length;
});

const featuredRecipe = computed(() => {
  return RECIPES.find(r => r.id === 'suntory_oolong_highball') || RECIPES[0];
});

const sortLabel = computed(() => {
  if (sortBy.value === 'abv-asc') return '度数从低到高';
  if (sortBy.value === 'abv-desc') return '度数从高到低';
  return '默认推荐';
});

function toggleSort() {
  if (sortBy.value === 'default') sortBy.value = 'abv-asc';
  else if (sortBy.value === 'abv-asc') sortBy.value = 'abv-desc';
  else sortBy.value = 'default';
}

const filteredRecipes = computed(() => {
  let list = RECIPES;

  // 1. 分类筛选
  if (currentCategory.value !== 'all') {
    list = list.filter(r => r.category === currentCategory.value);
  }

  // 2. 搜索词筛选 (酒名中文、英文、标签、描述、原料名称)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    list = list.filter(r => 
      r.nameZh.toLowerCase().includes(q) ||
      r.nameEn.toLowerCase().includes(q) ||
      r.tags.some(t => t.toLowerCase().includes(q)) ||
      r.description.toLowerCase().includes(q) ||
      r.ingredients.some(ing => {
        const target = INGREDIENTS_MAP.get(ing.ingredientId);
        return target && (target.nameZh.toLowerCase().includes(q) || target.nameEn.toLowerCase().includes(q));
      })
    );
  }

  // 3. 排序
  if (sortBy.value === 'abv-asc') {
    list = [...list].sort((a, b) => a.calculatedAbv - b.calculatedAbv);
  } else if (sortBy.value === 'abv-desc') {
    list = [...list].sort((a, b) => b.calculatedAbv - a.calculatedAbv);
  }

  return list;
});

function goToShelf() {
  uni.switchTab({
    url: '/pages/shelf/index'
  });
}

function goToRecipe(id: string) {
  uni.navigateTo({
    url: `/pages/recipe/detail?id=${id}`
  });
}
</script>

<style scoped lang="scss">
.container {
  padding: 30rpx 30rpx 100rpx 30rpx;
  background-color: #0E0F14;
  min-height: 100vh;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28rpx;
}

.brand-wrap {
  display: flex;
  flex-direction: column;
}

.brand-title {
  font-size: 44rpx;
  font-weight: 800;
  color: #FFFFFF;
  letter-spacing: 1px;
}

.brand-subtitle {
  font-size: 20rpx;
  color: #9CA3AF;
  letter-spacing: 0.5px;
  margin-top: 4rpx;
}

.quick-status {
  display: flex;
  align-items: baseline;
  gap: 6rpx;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  padding: 10rpx 20rpx;
  border-radius: 999rpx;
}

.status-num {
  font-size: 30rpx;
  font-weight: 800;
  color: #10B981;
}

.status-label {
  font-size: 20rpx;
  color: #10B981;
}

.search-box {
  display: flex;
  align-items: center;
  padding: 18rpx 24rpx;
  margin-bottom: 28rpx;
  border-radius: 20rpx;
}

.search-icon {
  font-size: 28rpx;
  margin-right: 16rpx;
}

.search-input {
  flex: 1;
  font-size: 26rpx;
  color: #FFFFFF;
}

.search-placeholder {
  color: #6B7280;
}

.clear-icon {
  font-size: 26rpx;
  color: #9CA3AF;
  padding: 4rpx 10rpx;
}

.category-scroll {
  white-space: nowrap;
  margin-bottom: 28rpx;
}

.category-list {
  display: flex;
  gap: 16rpx;
}

.cat-tab {
  padding: 14rpx 28rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 999rpx;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.2s ease;
}

.cat-tab.active {
  background: #F59E0B;
  border-color: #F59E0B;
}

.cat-name {
  font-size: 24rpx;
  color: #9CA3AF;
  font-weight: 500;
}

.cat-tab.active .cat-name {
  color: #000000;
  font-weight: 700;
}

.featured-banner {
  padding: 28rpx;
  margin-bottom: 34rpx;
  position: relative;
  overflow: hidden;
}

.featured-tag {
  position: absolute;
  top: 0;
  right: 0;
  background: #F59E0B;
  color: #000000;
  font-size: 18rpx;
  font-weight: 700;
  padding: 6rpx 18rpx;
  border-bottom-left-radius: 16rpx;
}

.featured-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.featured-left {
  flex: 1;
  padding-right: 20rpx;
}

.featured-title {
  font-size: 34rpx;
  font-weight: 800;
  color: #FDE68A;
  display: block;
}

.featured-subtitle {
  font-size: 20rpx;
  color: #9CA3AF;
  margin-top: 4rpx;
  display: block;
}

.featured-desc {
  font-size: 22rpx;
  color: #D1D5DB;
  margin-top: 10rpx;
  display: block;
  line-height: 1.4;
}

.featured-btn {
  margin-top: 16rpx;
  display: inline-block;
  background: rgba(245, 158, 11, 0.2);
  border: 1px solid rgba(245, 158, 11, 0.4);
  color: #FDE68A;
  font-size: 22rpx;
  font-weight: 600;
  padding: 8rpx 20rpx;
  border-radius: 999rpx;
}

.featured-glass {
  font-size: 80rpx;
}

.section-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #FFFFFF;
}

.sort-selector {
  font-size: 22rpx;
  color: #9CA3AF;
  background: rgba(255, 255, 255, 0.05);
  padding: 6rpx 18rpx;
  border-radius: 999rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
  color: #6B7280;
}

.empty-icon {
  font-size: 70rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 24rpx;
}
</style>
