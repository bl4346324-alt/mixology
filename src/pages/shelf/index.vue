<template>
  <view class="container">
    <!-- 顶部状态栏 -->
    <view class="shelf-header">
      <view class="header-info">
        <text class="title">我的专属酒柜</text>
        <text class="subtitle">已录入 {{ cabinetStore.myIngredients.length }} 种原料 · 可调配 {{ cabinetStore.canMakeRecipes.length }} 款鸡尾酒</text>
      </view>
      <view class="header-action" @tap="showResetConfirm">
        <text class="reset-btn">清空</text>
      </view>
    </view>

    <!-- 三栏选项卡切换 -->
    <view class="tab-switcher glass-card">
      <view
        class="tab-item"
        :class="{ active: currentTab === 'can_make' }"
        @tap="currentTab = 'can_make'"
      >
        <text class="tab-title">今晚可做</text>
        <text class="tab-badge badge-green">{{ cabinetStore.canMakeRecipes.length }}</text>
      </view>

      <view
        class="tab-item"
        :class="{ active: currentTab === 'missing_one' }"
        @tap="currentTab = 'missing_one'"
      >
        <text class="tab-title">差 1 种</text>
        <text class="tab-badge badge-red">{{ cabinetStore.missingOneRecipes.length }}</text>
      </view>

      <view
        class="tab-item"
        :class="{ active: currentTab === 'manage' }"
        @tap="currentTab = 'manage'"
      >
        <text class="tab-title">管理库存</text>
      </view>
    </view>

    <!-- ==============================================
         TAB 1: 今晚可做 (Can Make)
         ============================================== -->
    <view v-if="currentTab === 'can_make'" class="tab-content">
      <view v-if="cabinetStore.canMakeRecipes.length === 0" class="empty-box glass-card">
        <text class="empty-emoji">🧊</text>
        <text class="empty-title">当前还没有可完整调制的酒谱</text>
        <text class="empty-desc">去“管理库存”添加你家里的基酒或饮料，系统将自动为你匹配！</text>
        <button class="btn-gold empty-btn" @tap="currentTab = 'manage'">
          去勾选家里的酒水
        </button>
      </view>

      <view v-else class="match-list">
        <view class="ready-tips glass-card">
          <text class="tips-icon">✨</text>
          <text class="tips-text">以下鸡尾酒原料已全部备齐，今晚可直接开调！</text>
        </view>

        <RecipeCard
          v-for="item in cabinetStore.canMakeRecipes"
          :key="item.recipe.id"
          :recipe="item.recipe"
        />
      </view>
    </view>

    <!-- ==============================================
         TAB 2: 差 1 种原料 & 解锁价值榜 (Missing 1 & Unlock)
         ============================================== -->
    <view v-if="currentTab === 'missing_one'" class="tab-content">
      <!-- 终极采购建议：买哪瓶解锁最多 (Mixel式智能推荐) -->
      <view v-if="cabinetStore.unlockSuggestions.length > 0" class="unlock-banner glass-card-amber">
        <view class="unlock-header">
          <text class="unlock-tag">🔥 采购投资回报榜</text>
          <text class="unlock-sub">只需买一瓶，立刻大幅拓展酒单！</text>
        </view>
        <view class="unlock-list">
          <view
            v-for="(sug, idx) in cabinetStore.unlockSuggestions.slice(0, 3)"
            :key="sug.ingredient.id"
            class="unlock-item"
            @tap="quickAddIngredient(sug.ingredient.id)"
          >
            <view class="sug-left">
              <text class="sug-rank">NO.{{ idx + 1 }}</text>
              <view class="sug-ing-info">
                <text class="sug-name">{{ sug.ingredient.nameZh }}</text>
                <text class="sug-tags">{{ sug.ingredient.isConvenienceStore ? '便利店可买' : '酒水专营/网购' }}</text>
              </view>
            </view>
            <view class="sug-right">
              <text class="sug-unlock-count">+{{ sug.unlockRecipeCount }} 款新酒</text>
              <view class="quick-add-btn">
                <text>我买到了 +</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 仅差一种的配方卡片列表 -->
      <view class="missing-list">
        <view class="section-title">还差 1 种原料即可解锁 ({{ cabinetStore.missingOneRecipes.length }})</view>
        <RecipeCard
          v-for="item in cabinetStore.missingOneRecipes"
          :key="item.recipe.id"
          :recipe="item.recipe"
        />
      </view>
    </view>

    <!-- ==============================================
         TAB 3: 管理库存 (Manage Ingredients)
         ============================================== -->
    <view v-if="currentTab === 'manage'" class="tab-content">
      <!-- 快捷便利店一键筛选 -->
      <view class="manage-filters">
        <view
          class="filter-chip"
          :class="{ active: filterConvenienceOnly }"
          @tap="filterConvenienceOnly = !filterConvenienceOnly"
        >
          <text>🏪 仅看便利店易购原料</text>
        </view>
      </view>

      <!-- 按品类分组展示原料打卡 -->
      <view
        v-for="group in ingredientGroups"
        :key="group.category"
        class="group-section glass-card"
      >
        <view class="group-header">
          <text class="group-title">{{ group.title }}</text>
          <text class="group-count">{{ group.ownedCount }}/{{ group.items.length }}</text>
        </view>

        <view class="ingredient-grid">
          <view
            v-for="item in group.items"
            :key="item.id"
            class="ingredient-cell"
            :class="{ owned: cabinetStore.hasIngredient(item.id) }"
            @tap="cabinetStore.toggleIngredient(item.id)"
          >
            <view class="cell-top">
              <text class="cell-icon">{{ item.icon || '🍾' }}</text>
              <view class="check-circle">
                <text v-if="cabinetStore.hasIngredient(item.id)">✓</text>
              </view>
            </view>
            <text class="cell-name">{{ item.nameZh }}</text>
            <text class="cell-sub">{{ item.nameEn }}</text>
            <view v-if="item.isConvenienceStore" class="convenience-badge">便利店</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCabinetStore } from '../../stores/cabinet';
import { INGREDIENTS } from '../../data/ingredients';
import RecipeCard from '../../components/RecipeCard.vue';
import type { IngredientCategory } from '../../types/ingredient';

const cabinetStore = useCabinetStore();
const currentTab = ref<'can_make' | 'missing_one' | 'manage'>('can_make');
const filterConvenienceOnly = ref(false);

const categoryMeta: { key: IngredientCategory; title: string }[] = [
  { key: 'spirit', title: '基酒 / 烈酒 (Spirits)' },
  { key: 'liqueur', title: '利口酒 / 风味酒 (Liqueurs)' },
  { key: 'mixer', title: '软饮 / 苏打与茶 (Mixers)' },
  { key: 'juice', title: '果汁与鲜果 (Juices)' },
  { key: 'syrup', title: '糖浆与甜味剂 (Syrups)' },
  { key: 'bitters', title: '苦精与调味 (Bitters)' },
  { key: 'garnish', title: '装饰与辅料 (Garnish)' },
  { key: 'ice', title: '冰块与老冰 (Ice)' },
];

const ingredientGroups = computed(() => {
  return categoryMeta.map(cat => {
    let items = INGREDIENTS.filter(i => i.category === cat.key);
    if (filterConvenienceOnly.value) {
      items = items.filter(i => i.isConvenienceStore);
    }
    const ownedCount = items.filter(i => cabinetStore.hasIngredient(i.id)).length;
    return {
      category: cat.key,
      title: cat.title,
      items,
      ownedCount,
    };
  }).filter(group => group.items.length > 0);
});

function quickAddIngredient(id: string) {
  cabinetStore.toggleIngredient(id);
  uni.showToast({
    title: '已加入我的酒柜！',
    icon: 'success'
  });
}

function showResetConfirm() {
  uni.showModal({
    title: '清空酒柜',
    content: '确定要重置并清空所有已勾选的原料吗？',
    confirmColor: '#F59E0B',
    success: (res) => {
      if (res.confirm) {
        cabinetStore.clearCabinet();
      }
    }
  });
}
</script>

<style scoped lang="scss">
.container {
  padding: 30rpx 30rpx 100rpx 30rpx;
  background-color: #0E0F14;
  min-height: 100vh;
}

.shelf-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28rpx;
}

.title {
  font-size: 40rpx;
  font-weight: 800;
  color: #FFFFFF;
}

.subtitle {
  font-size: 22rpx;
  color: #9CA3AF;
  margin-top: 6rpx;
  display: block;
}

.reset-btn {
  font-size: 22rpx;
  color: #EF4444;
  background: rgba(239, 68, 68, 0.1);
  padding: 8rpx 20rpx;
  border-radius: 999rpx;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.tab-switcher {
  display: flex;
  padding: 8rpx;
  margin-bottom: 30rpx;
  border-radius: 999rpx;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 16rpx 0;
  border-radius: 999rpx;
  transition: all 0.2s ease;
}

.tab-item.active {
  background: #F59E0B;
}

.tab-title {
  font-size: 24rpx;
  color: #9CA3AF;
  font-weight: 500;
}

.tab-item.active .tab-title {
  color: #000000;
  font-weight: 700;
}

.tab-badge {
  font-size: 18rpx;
  padding: 2rpx 12rpx;
  border-radius: 999rpx;
  font-weight: 700;
}

.badge-green {
  background: rgba(16, 185, 129, 0.2);
  color: #34D399;
}

.badge-red {
  background: rgba(239, 68, 68, 0.2);
  color: #F87171;
}

.tab-item.active .tab-badge {
  background: rgba(0, 0, 0, 0.2);
  color: #000000;
}

.ready-tips {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 24rpx;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.tips-icon {
  font-size: 30rpx;
}

.tips-text {
  font-size: 24rpx;
  color: #34D399;
  font-weight: 500;
}

.empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 80rpx 40rpx;
}

.empty-emoji {
  font-size: 90rpx;
  margin-bottom: 24rpx;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #FFFFFF;
}

.empty-desc {
  font-size: 24rpx;
  color: #9CA3AF;
  margin-top: 12rpx;
  margin-bottom: 36rpx;
  line-height: 1.5;
}

.empty-btn {
  width: 320rpx;
  font-size: 26rpx;
}

/* 解锁榜 */
.unlock-banner {
  padding: 26rpx;
  margin-bottom: 34rpx;
}

.unlock-header {
  margin-bottom: 18rpx;
}

.unlock-tag {
  font-size: 26rpx;
  font-weight: 800;
  color: #FDE68A;
  display: block;
}

.unlock-sub {
  font-size: 20rpx;
  color: #9CA3AF;
  margin-top: 4rpx;
  display: block;
}

.unlock-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.unlock-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.25);
  padding: 16rpx 20rpx;
  border-radius: 16rpx;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.sug-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.sug-rank {
  font-size: 24rpx;
  font-weight: 800;
  color: #F59E0B;
}

.sug-ing-info {
  display: flex;
  flex-direction: column;
}

.sug-name {
  font-size: 26rpx;
  font-weight: 600;
  color: #FFFFFF;
}

.sug-tags {
  font-size: 18rpx;
  color: #9CA3AF;
}

.sug-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.sug-unlock-count {
  font-size: 22rpx;
  color: #10B981;
  font-weight: 700;
}

.quick-add-btn {
  background: rgba(245, 158, 11, 0.2);
  border: 1px solid rgba(245, 158, 11, 0.4);
  color: #FDE68A;
  font-size: 20rpx;
  font-weight: 600;
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 20rpx;
}

/* 管理原料网格 */
.manage-filters {
  display: flex;
  margin-bottom: 20rpx;
}

.filter-chip {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #9CA3AF;
  font-size: 22rpx;
  padding: 10rpx 24rpx;
  border-radius: 999rpx;
}

.filter-chip.active {
  background: rgba(245, 158, 11, 0.2);
  border-color: #F59E0B;
  color: #FDE68A;
}

.group-section {
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.group-title {
  font-size: 26rpx;
  font-weight: 700;
  color: #F3F4F6;
}

.group-count {
  font-size: 22rpx;
  color: #9CA3AF;
}

.ingredient-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.ingredient-cell {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18rpx;
  padding: 16rpx;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.2s ease;
}

.ingredient-cell.owned {
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.4);
}

.cell-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.cell-icon {
  font-size: 32rpx;
}

.check-circle {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  color: transparent;
}

.ingredient-cell.owned .check-circle {
  background: #F59E0B;
  border-color: #F59E0B;
  color: #000000;
  font-weight: 800;
}

.cell-name {
  font-size: 24rpx;
  font-weight: 600;
  color: #FFFFFF;
}

.cell-sub {
  font-size: 18rpx;
  color: #9CA3AF;
  margin-top: 4rpx;
}

.convenience-badge {
  align-self: flex-start;
  margin-top: 10rpx;
  background: rgba(16, 185, 129, 0.15);
  color: #34D399;
  font-size: 16rpx;
  padding: 2rpx 8rpx;
  border-radius: 6rpx;
}
</style>
