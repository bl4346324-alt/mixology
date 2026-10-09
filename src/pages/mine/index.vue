<template>
  <view class="container">
    <!-- 用户信息卡片 -->
    <view class="profile-card glass-card-amber">
      <view class="avatar-wrap">
        <text class="avatar-emoji">🍸</text>
      </view>
      <view class="profile-info">
        <text class="user-name">主理调酒师</text>
        <view class="user-badge-row">
          <text class="badge-role">家庭主理人</text>
          <text class="badge-level">微醺大师 Lv.2</text>
        </view>
      </view>
    </view>

    <!-- 微信聚会王牌功能：派对吧台模式 (Party Mode) -->
    <view class="party-entry-card glass-card" @tap="goToParty">
      <view class="party-left">
        <view class="party-title-row">
          <text class="party-emoji">🎉</text>
          <text class="party-title">派对吧台模式 (Party Bar)</text>
          <text v-if="partyStore.session?.isOpen" class="open-pill">营业中</text>
        </view>
        <text class="party-sub">开派对/露营神器：生成今日酒单，朋友微信扫码即可点单！</text>
      </view>
      <view class="party-arrow">→</view>
    </view>

    <!-- 收藏与手记选项卡 -->
    <view class="content-tabs glass-card">
      <view
        class="tab-btn"
        :class="{ active: currentTab === 'fav' }"
        @tap="currentTab = 'fav'"
      >
        <text>收藏酒谱 ({{ favoritesStore.favoriteIds.length }})</text>
      </view>
      <view
        class="tab-btn"
        :class="{ active: currentTab === 'logs' }"
        @tap="currentTab = 'logs'"
      >
        <text>调酒手记 ({{ favoritesStore.tastingLogs.length }})</text>
      </view>
      <view
        class="tab-btn"
        :class="{ active: currentTab === 'settings' }"
        @tap="currentTab = 'settings'"
      >
        <text>单位设置</text>
      </view>
    </view>

    <!-- Tab 1: 收藏夹 -->
    <view v-if="currentTab === 'fav'" class="tab-panel">
      <view v-if="favoriteRecipes.length === 0" class="empty-fav">
        <text>还没有收藏酒谱，在浏览时点击右上角红心收藏吧！</text>
      </view>
      <RecipeCard
        v-for="recipe in favoriteRecipes"
        :key="recipe.id"
        :recipe="recipe"
      />
    </view>

    <!-- Tab 2: 调酒打卡手记 -->
    <view v-if="currentTab === 'logs'" class="tab-panel">
      <view v-if="favoritesStore.tastingLogs.length === 0" class="empty-fav">
        <text>在调酒工作台完成制作后，即可记录品鉴评分与心得笔记~</text>
      </view>
      <view
        v-for="log in favoritesStore.tastingLogs"
        :key="log.id"
        class="log-card glass-card"
      >
        <view class="log-top">
          <text class="log-name">{{ log.recipeName }}</text>
          <view class="log-stars">
            <text v-for="s in 5" :key="s" class="star" :class="{ filled: s <= log.rating }">★</text>
          </view>
        </view>
        <text class="log-notes">{{ log.notes }}</text>
        <text class="log-date">{{ formatDate(log.createdAt) }}</text>
      </view>
    </view>

    <!-- Tab 3: 单位与偏好设置 -->
    <view v-if="currentTab === 'settings'" class="tab-panel">
      <view class="settings-card glass-card">
        <text class="setting-title">全局容量单位习惯：</text>
        <text class="setting-desc">切换后，所有酒谱的配方用量与工作台刻度将自动实时换算。</text>
        <view class="unit-selector-wrap">
          <UnitSelector
            :model-value="cabinetStore.unitPreference"
            @update:model-value="cabinetStore.setUnit"
          />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useFavoritesStore } from '../../stores/favorites';
import { useCabinetStore } from '../../stores/cabinet';
import { usePartyStore } from '../../stores/party';
import { RECIPES } from '../../data/recipes';
import RecipeCard from '../../components/RecipeCard.vue';
import UnitSelector from '../../components/UnitSelector.vue';

const favoritesStore = useFavoritesStore();
const cabinetStore = useCabinetStore();
const partyStore = usePartyStore();

const currentTab = ref<'fav' | 'logs' | 'settings'>('fav');

const favoriteRecipes = computed(() => {
  return RECIPES.filter(r => favoritesStore.isFavorite(r.id));
});

function goToParty() {
  uni.navigateTo({
    url: '/pages/party/manage'
  });
}

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
}
</script>

<style scoped lang="scss">
.container {
  padding: 30rpx 30rpx 100rpx 30rpx;
  background-color: #0E0F14;
  min-height: 100vh;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 32rpx;
  margin-bottom: 28rpx;
}

.avatar-wrap {
  width: 110rpx;
  height: 110rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid #F59E0B;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-emoji {
  font-size: 54rpx;
}

.profile-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 38rpx;
  font-weight: 800;
  color: #FFFFFF;
}

.user-badge-row {
  display: flex;
  gap: 12rpx;
  margin-top: 10rpx;
}

.badge-role {
  background: rgba(245, 158, 11, 0.2);
  color: #FDE68A;
  font-size: 20rpx;
  font-weight: 600;
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
}

.badge-level {
  background: rgba(16, 185, 129, 0.2);
  color: #34D399;
  font-size: 20rpx;
  font-weight: 600;
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
}

/* 派对入口 */
.party-entry-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx;
  margin-bottom: 30rpx;
  border: 1px solid rgba(245, 158, 11, 0.3);
  background: linear-gradient(135deg, rgba(30, 24, 18, 0.8), rgba(20, 20, 30, 0.9));
}

.party-left {
  flex: 1;
}

.party-title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.party-emoji {
  font-size: 32rpx;
}

.party-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #FDE68A;
}

.open-pill {
  background: #10B981;
  color: #000000;
  font-size: 18rpx;
  font-weight: 700;
  padding: 2rpx 12rpx;
  border-radius: 999rpx;
}

.party-sub {
  font-size: 22rpx;
  color: #9CA3AF;
  line-height: 1.4;
  display: block;
}

.party-arrow {
  font-size: 36rpx;
  color: #F59E0B;
  padding-left: 16rpx;
}

/* 选项卡 */
.content-tabs {
  display: flex;
  padding: 8rpx;
  border-radius: 999rpx;
  margin-bottom: 30rpx;
}

.tab-btn {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  font-size: 24rpx;
  color: #9CA3AF;
  border-radius: 999rpx;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background: #F59E0B;
  color: #000000;
  font-weight: 700;
}

.empty-fav {
  text-align: center;
  padding: 60rpx 40rpx;
  color: #6B7280;
  font-size: 24rpx;
  line-height: 1.5;
}

.log-card {
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.log-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.log-name {
  font-size: 28rpx;
  font-weight: 700;
  color: #FFFFFF;
}

.log-stars {
  display: flex;
  gap: 4rpx;
}

.star {
  font-size: 24rpx;
  color: #4B5563;
}

.star.filled {
  color: #F59E0B;
}

.log-notes {
  font-size: 24rpx;
  color: #D1D5DB;
  line-height: 1.5;
  margin-bottom: 12rpx;
  display: block;
}

.log-date {
  font-size: 20rpx;
  color: #6B7280;
}

.settings-card {
  padding: 30rpx;
}

.setting-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #FFFFFF;
  display: block;
}

.setting-desc {
  font-size: 22rpx;
  color: #9CA3AF;
  margin-top: 6rpx;
  margin-bottom: 24rpx;
  display: block;
}

.unit-selector-wrap {
  margin-top: 10rpx;
}
</style>
