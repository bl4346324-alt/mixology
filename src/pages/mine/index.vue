<template>
  <view class="container">
    <!-- 顶部主理人卡片与微醺头衔 -->
    <view class="profile-card glass-card-amber">
      <view class="avatar-wrap">
        <text class="avatar-emoji">🍸</text>
      </view>
      <view class="profile-info">
        <view class="name-row">
          <text class="user-name">微醺主理人</text>
          <text class="level-pill">{{ userLevelInfo.title }}</text>
        </view>
        <view class="user-stats-row">
          <text class="stat-item">已完饮打卡 <text class="stat-num">{{ favoritesStore.tastingLogs.length }}</text> 杯</text>
          <text class="stat-divider">·</text>
          <text class="stat-item">收藏 <text class="stat-num">{{ favoritesStore.favoriteIds.length }}</text> 款酒谱</text>
        </view>
      </view>
    </view>

    <!-- 微醺印章成就墙 (Bartender Stamps Showcase) -->
    <view class="stamps-wall-card glass-card">
      <view class="wall-header">
        <view class="wh-left">
          <text class="wh-icon">🔖</text>
          <text class="wh-title">微醺成就印章墙</text>
        </view>
        <text class="wh-count">{{ unlockedStampsCount }}/4 已解锁</text>
      </view>

      <view class="stamps-grid">
        <view
          v-for="stamp in stampList"
          :key="stamp.id"
          class="stamp-badge-item"
          :class="{ unlocked: stamp.isUnlocked }"
          @tap="showStampTip(stamp)"
        >
          <view class="stamp-circle">
            <text class="stamp-icon">{{ stamp.icon }}</text>
          </view>
          <text class="stamp-title">{{ stamp.name }}</text>
          <text class="stamp-status">{{ stamp.isUnlocked ? '已点亮' : '未解锁' }}</text>
        </view>
      </view>
    </view>

    <!-- 微信聚会王牌功能：派对吧台模式 (Party Bar) -->
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

    <!-- 选项卡切换：手账本 / 收藏夹 / 设置 -->
    <view class="content-tabs glass-card">
      <view
        class="tab-btn"
        :class="{ active: currentTab === 'logs' }"
        @tap="currentTab = 'logs'"
      >
        <text>📖 微醺手账 ({{ favoritesStore.tastingLogs.length }})</text>
      </view>
      <view
        class="tab-btn"
        :class="{ active: currentTab === 'fav' }"
        @tap="currentTab = 'fav'"
      >
        <text>❤️ 收藏酒谱 ({{ favoritesStore.favoriteIds.length }})</text>
      </view>
      <view
        class="tab-btn"
        :class="{ active: currentTab === 'settings' }"
        @tap="currentTab = 'settings'"
      >
        <text>⚙️ 单位设置</text>
      </view>
    </view>

    <!-- Tab 1: 抖音同款复古活页调酒手账集 (Tasting Journal) -->
    <view v-if="currentTab === 'logs'" class="tab-panel">
      <!-- 空状态：仪式感活页手账封面 -->
      <view v-if="favoritesStore.tastingLogs.length === 0" class="empty-journal-card">
        <view class="journal-book-cover">
          <text class="empty-book-icon">📖</text>
          <text class="empty-title">你的第一篇微醺手记还在等待落笔</text>
          <text class="empty-sub">去调酒工作台亲手完成一杯特调，记录独一无二的心境笔记与拍立得海报吧。</text>
          <button class="btn-gold go-discover-btn" @tap="goToDiscover">
            ✨ 去发现酒谱调一杯 →
          </button>
        </view>
      </view>

      <!-- 手账列表 -->
      <view v-else class="journal-list">
        <view
          v-for="(log, idx) in favoritesStore.tastingLogs"
          :key="log.id"
          class="journal-leaf-card"
        >
          <!-- 活页打孔装订线装饰 -->
          <view class="leaf-binder-holes">
            <view class="binder-hole" />
            <view class="binder-hole" />
            <view class="binder-hole" />
          </view>

          <!-- 卡片主要区域 -->
          <view class="leaf-body">
            <!-- 头部：序号、酒名、手绘插画缩略图 -->
            <view class="leaf-header">
              <view class="leaf-info-left">
                <view class="leaf-badge-row">
                  <text class="leaf-seq">VOLUME 01 · NO.{{ String(favoritesStore.tastingLogs.length - idx).padStart(2, '0') }}</text>
                  <text v-if="getRecipeAbv(log.recipeId)" class="leaf-abv">{{ getRecipeAbv(log.recipeId) }}% ABV</text>
                </view>

                <text class="leaf-name-en">{{ getRecipeEnName(log.recipeId) }}</text>
                <text class="leaf-name-zh" @tap="goToDetail(log.recipeId)">{{ log.recipeName }}</text>

                <view class="leaf-rating-row">
                  <text class="rating-stars">{{ '★'.repeat(Math.max(1, Math.min(5, log.rating))) }}</text>
                  <text class="rating-text">{{ getRatingLabel(log.rating) }}</text>
                </view>

                <text class="leaf-date">{{ formatJournalDate(log.createdAt) }}</text>
              </view>

              <!-- 右侧居中手绘酒杯高清插画 -->
              <view class="leaf-visual-right" @tap="goToDetail(log.recipeId)">
                <image
                  class="leaf-cocktail-img"
                  :src="getRecipeImage(log.recipeId, log.id)"
                  mode="aspectFit"
                  @error="handleImageError(log.id)"
                />
              </view>
            </view>

            <!-- 中部：微醺笔记随笔框 -->
            <view class="leaf-quote-box">
              <text class="quote-symbol left">“</text>
              <text class="leaf-notes-text">{{ log.notes || getRecipeDesc(log.recipeId) }}</text>
              <text class="quote-symbol right">”</text>
            </view>

            <!-- 底部：红泥完饮印章与快捷操作栏 -->
            <view class="leaf-footer">
              <view class="stamp-seal">
                <text class="seal-stars">★★★</text>
                <text class="seal-text">微醺特调</text>
                <text class="seal-sub">完饮留念</text>
              </view>

              <view class="leaf-actions">
                <button class="action-pill-btn secondary" @tap="confirmDeleteLog(log)">
                  🗑️
                </button>
                <button class="action-pill-btn" @tap="goToCraft(log.recipeId)">
                  🍸 再调一杯
                </button>
                <button class="action-pill-btn highlight" @tap="goToPoster(log)">
                  📸 拍立得海报
                </button>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Tab 2: 收藏夹列表 -->
    <view v-if="currentTab === 'fav'" class="tab-panel">
      <view v-if="favoriteRecipes.length === 0" class="empty-fav-card">
        <text class="empty-icon">🍸</text>
        <text class="empty-fav-title">还没有收藏心仪的酒谱</text>
        <text class="empty-fav-desc">在酒谱卡片右上角点击红心，即可收藏入册，随时查看配方。</text>
        <button class="btn-subtle go-btn" @tap="goToDiscover">
          去浏览精选酒谱 →
        </button>
      </view>

      <view v-else class="fav-grid">
        <view
          v-for="recipe in favoriteRecipes"
          :key="recipe.id"
          class="fav-recipe-card"
          @tap="goToDetail(recipe.id)"
        >
          <image
            class="fav-img"
            :src="recipe.coverImage || `/static/recipes/${recipe.id}.png`"
            mode="aspectFit"
          />
          <view class="fav-info">
            <view class="fav-title-row">
              <text class="fav-name-zh">{{ recipe.nameZh }}</text>
              <text class="fav-abv">{{ recipe.calculatedAbv }}% ABV</text>
            </view>
            <text class="fav-name-en">{{ recipe.nameEn }}</text>
            <text class="fav-desc">{{ recipe.description }}</text>
          </view>
          <view class="fav-action-arrow">→</view>
        </view>
      </view>
    </view>

    <!-- Tab 3: 单位与偏好设置 -->
    <view v-if="currentTab === 'settings'" class="tab-panel">
      <view class="settings-card glass-card">
        <text class="setting-title">全局容量单位习惯：</text>
        <text class="setting-desc">切换后，所有酒谱的配方用量与调酒工作台刻度将自动实时换算。</text>
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
import { useFavoritesStore, type TastingLog } from '../../stores/favorites';
import { useCabinetStore } from '../../stores/cabinet';
import { usePartyStore } from '../../stores/party';
import { RECIPES, RECIPES_MAP, getRecipeById } from '../../data/recipes';
import UnitSelector from '../../components/UnitSelector.vue';

const favoritesStore = useFavoritesStore();
const cabinetStore = useCabinetStore();
const partyStore = usePartyStore();

// 默认直接选中「微醺手账」Tab，增强仪式感
const currentTab = ref<'logs' | 'fav' | 'settings'>('logs');

const favoriteRecipes = computed(() => {
  return RECIPES.filter(r => favoritesStore.isFavorite(r.id));
});

// 用户调饮成就等级计算
const userLevelInfo = computed(() => {
  const count = favoritesStore.tastingLogs.length;
  if (count === 0) return { level: 0, title: '探索学徒 Lv.0' };
  if (count <= 3) return { level: 1, title: '吧台常客 Lv.1' };
  if (count <= 7) return { level: 2, title: '资深特调客 Lv.2' };
  if (count <= 15) return { level: 3, title: '微醺老饕 Lv.3' };
  return { level: 4, title: '传奇首席主理人 Lv.4' };
});

// 微醺成就印章徽章列表
interface StampBadge {
  id: string;
  name: string;
  icon: string;
  desc: string;
  isUnlocked: boolean;
}

const stampList = computed<StampBadge[]>(() => {
  const logs = favoritesStore.tastingLogs;
  const count = logs.length;

  const hasIba = logs.some(l => RECIPES_MAP.get(l.recipeId)?.category === 'iba');
  const hasConvenience = logs.some(l => RECIPES_MAP.get(l.recipeId)?.category === 'convenience');
  const hasMocktail = logs.some(l => RECIPES_MAP.get(l.recipeId)?.category === 'mocktail');

  return [
    {
      id: 'first_drink',
      name: '微醺首调',
      icon: '🍸',
      desc: '在调酒工作台完成首次特调制作并记录手记',
      isUnlocked: count >= 1,
    },
    {
      id: 'iba_master',
      name: '经典守望',
      icon: '🏛️',
      desc: '调配并打卡任意 IBA 官方经典国际配方',
      isUnlocked: hasIba,
    },
    {
      id: 'convenience_pro',
      name: '便利狂想',
      icon: '🏪',
      desc: '调配并打卡任意便利店神仙混饮特调',
      isUnlocked: hasConvenience,
    },
    {
      id: 'pure_mind',
      name: '清醒生活',
      icon: '🍃',
      desc: '调配并打卡任意无酒精 Mocktail',
      isUnlocked: hasMocktail,
    },
  ];
});

const unlockedStampsCount = computed(() => {
  return stampList.value.filter(s => s.isUnlocked).length;
});

function showStampTip(stamp: StampBadge) {
  uni.showToast({
    title: `${stamp.name}: ${stamp.desc} (${stamp.isUnlocked ? '已解锁' : '未解锁'})`,
    icon: 'none',
    duration: 2500,
  });
}

const imageErrorMap = ref<Record<string, boolean>>({});

function handleImageError(logId: string) {
  imageErrorMap.value[logId] = true;
}

function getRecipeAbv(id: string): number {
  return getRecipeById(id)?.calculatedAbv || 0;
}

function getRecipeEnName(id: string): string {
  return getRecipeById(id)?.nameEn || '';
}

function getRecipeDesc(id: string): string {
  return getRecipeById(id)?.description || '在杯中摇晃夜色，让微醺治愈疲惫。';
}

function getRecipeImage(id: string, logId?: string): string {
  if (logId && imageErrorMap.value[logId]) {
    return '/static/recipes/suntory_oolong_highball.png';
  }
  const r = getRecipeById(id);
  if (r?.coverImage && r.coverImage.trim()) {
    return r.coverImage;
  }
  if (id === 'ai_custom_mocktail') {
    return '/static/recipes/dongfang_shuye_highball.png';
  }
  if (id.startsWith('ai_') || id === 'ai_custom_special') {
    return '/static/recipes/suntory_oolong_highball.png';
  }
  return `/static/recipes/${id}.png`;
}

function getRatingLabel(rating: number): string {
  switch (rating) {
    case 5: return '惊艳回味';
    case 4: return '顺滑合口';
    case 3: return '适宜微醺';
    case 2: return '风味平淡';
    default: return '翻车特饮';
  }
}

function formatJournalDate(timestamp: number): string {
  const d = new Date(timestamp);
  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const hours = d.getHours().toString().padStart(2, '0');
  const mins = d.getMinutes().toString().padStart(2, '0');
  return `${d.getFullYear()}.${month}.${day} ${weekDays[d.getDay()]} ${hours}:${mins}`;
}

function goToParty() {
  uni.navigateTo({
    url: '/pages/party/manage',
  });
}

function goToDetail(recipeId: string) {
  uni.navigateTo({
    url: `/pages/recipe/detail?id=${recipeId}`,
  });
}

function goToCraft(recipeId: string) {
  uni.navigateTo({
    url: `/pages/recipe/craft?id=${recipeId}`,
  });
}

function goToPoster(log: TastingLog) {
  const notesParam = encodeURIComponent(log.notes || '');
  uni.navigateTo({
    url: `/pages/recipe/poster?id=${log.recipeId}&rating=${log.rating}&notes=${notesParam}`,
  });
}

function goToDiscover() {
  uni.switchTab({
    url: '/pages/index/index',
  });
}

function confirmDeleteLog(log: TastingLog) {
  uni.showModal({
    title: '删除手记',
    content: `确定删除《${log.recipeName}》的调酒手记吗？此操作无法撤销。`,
    confirmText: '删除',
    confirmColor: '#DC2626',
    cancelText: '保留',
    success: (res) => {
      if (res.confirm) {
        favoritesStore.removeTastingLog(log.id);
        uni.showToast({
          title: '已删除手记',
          icon: 'success',
        });
      }
    },
  });
}
</script>

<style scoped lang="scss">
.container {
  padding: 30rpx 30rpx 120rpx 30rpx;
  background-color: #0E0F14;
  min-height: 100vh;
  box-sizing: border-box;
}

/* 主理人卡片 */
.profile-card {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
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
  box-shadow: 0 4rpx 16rpx rgba(245, 158, 11, 0.25);
}

.avatar-emoji {
  font-size: 54rpx;
}

.profile-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.user-name {
  font-size: 38rpx;
  font-weight: 800;
  color: #FFFFFF;
  letter-spacing: 0.5px;
}

.level-pill {
  background: rgba(245, 158, 11, 0.2);
  color: #FDE68A;
  border: 1px solid rgba(245, 158, 11, 0.4);
  font-size: 20rpx;
  font-weight: 700;
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
}

.user-stats-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 10rpx;
}

.stat-item {
  font-size: 22rpx;
  color: #9CA3AF;
}

.stat-num {
  font-weight: 800;
  color: #F59E0B;
  margin: 0 4rpx;
}

.stat-divider {
  color: #4B5563;
}

/* 微醺印章成就墙 */
.stamps-wall-card {
  padding: 24rpx 28rpx;
  margin-bottom: 24rpx;
  background: linear-gradient(135deg, rgba(26, 28, 36, 0.9), rgba(18, 20, 26, 0.95));
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24rpx;
}

.wall-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.wh-left {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.wh-icon {
  font-size: 28rpx;
}

.wh-title {
  font-size: 26rpx;
  font-weight: 800;
  color: #E5E7EB;
  letter-spacing: 0.5px;
}

.wh-count {
  font-size: 20rpx;
  color: #F59E0B;
  font-weight: 700;
}

.stamps-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
}

.stamp-badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 8rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
  opacity: 0.55;

  &.unlocked {
    opacity: 1;
    background: rgba(245, 158, 11, 0.08);
    border: 1px solid rgba(245, 158, 11, 0.35);

    .stamp-circle {
      background: rgba(245, 158, 11, 0.2);
      border-color: #F59E0B;
    }

    .stamp-title {
      color: #FDE68A;
      font-weight: 800;
    }

    .stamp-status {
      color: #34D399;
      font-weight: 700;
    }
  }
}

.stamp-circle {
  width: 68rpx;
  height: 68rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8rpx;
}

.stamp-icon {
  font-size: 32rpx;
}

.stamp-title {
  font-size: 20rpx;
  color: #9CA3AF;
  text-align: center;
  white-space: nowrap;
}

.stamp-status {
  font-size: 16rpx;
  color: #6B7280;
  margin-top: 4rpx;
}

/* 派对入口 */
.party-entry-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 28rpx;
  margin-bottom: 28rpx;
  border: 1px solid rgba(245, 158, 11, 0.3);
  background: linear-gradient(135deg, rgba(30, 24, 18, 0.8), rgba(20, 20, 30, 0.9));
  border-radius: 20rpx;
}

.party-left {
  flex: 1;
}

.party-title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 6rpx;
}

.party-emoji {
  font-size: 30rpx;
}

.party-title {
  font-size: 26rpx;
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
  font-size: 20rpx;
  color: #9CA3AF;
  line-height: 1.4;
  display: block;
}

.party-arrow {
  font-size: 34rpx;
  color: #F59E0B;
  padding-left: 16rpx;
}

/* 选项卡 */
.content-tabs {
  display: flex;
  padding: 8rpx;
  border-radius: 999rpx;
  margin-bottom: 28rpx;
  background: rgba(255, 255, 255, 0.05);
}

.tab-btn {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  font-size: 22rpx;
  color: #9CA3AF;
  border-radius: 999rpx;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background: #F59E0B;
  color: #000000;
  font-weight: 800;
}

/* 抖音同款活页手账集 (Tasting Journal) */
.empty-journal-card {
  padding: 60rpx 40rpx;
  display: flex;
  justify-content: center;
}

.journal-book-cover {
  width: 100%;
  background: #FAF7F2;
  border-radius: 28rpx;
  padding: 60rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 16rpx 40rpx rgba(0, 0, 0, 0.5);
}

.empty-book-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 900;
  color: #111827;
  margin-bottom: 12rpx;
}

.empty-sub {
  font-size: 24rpx;
  color: #6B7280;
  line-height: 1.6;
  margin-bottom: 36rpx;
}

.go-discover-btn {
  font-size: 26rpx;
  font-weight: 700;
  padding: 20rpx 48rpx;
}

.journal-list {
  display: flex;
  flex-direction: column;
  gap: 28rpx;
}

/* 独立复古活页纸卡片 (Leaf Card) */
.journal-leaf-card {
  background: #FAF7F2;
  border-radius: 28rpx;
  overflow: hidden;
  box-shadow: 0 12rpx 36rpx rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
}

/* 顶部装订打孔装饰 */
.leaf-binder-holes {
  background: #EDE8DF;
  height: 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 60rpx;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.1);
}

.binder-hole {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #111827;
  opacity: 0.6;
}

.leaf-body {
  padding: 30rpx 32rpx 28rpx 32rpx;
}

.leaf-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.leaf-info-left {
  flex: 1;
  padding-right: 20rpx;
}

.leaf-badge-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.leaf-seq {
  font-size: 18rpx;
  font-weight: 800;
  color: #9CA3AF;
  letter-spacing: 0.5px;
}

.leaf-abv {
  background: #FEF3C7;
  color: #92400E;
  font-size: 18rpx;
  font-weight: 800;
  padding: 2rpx 12rpx;
  border-radius: 999rpx;
  border: 1px solid #FDE68A;
}

.leaf-name-en {
  font-size: 22rpx;
  font-style: italic;
  font-family: 'Baskerville', 'Georgia', serif;
  color: #4B5563;
  display: block;
}

.leaf-name-zh {
  font-size: 40rpx;
  font-weight: 900;
  color: #111827;
  letter-spacing: 0.5px;
  line-height: 1.2;
  margin-top: 2rpx;
  display: block;
}

.leaf-rating-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-top: 8rpx;
}

.rating-stars {
  font-size: 26rpx;
  color: #D97706;
  letter-spacing: 2rpx;
}

.rating-text {
  font-size: 20rpx;
  color: #78350F;
  font-weight: 700;
}

.leaf-date {
  font-size: 18rpx;
  color: #9CA3AF;
  margin-top: 6rpx;
  display: block;
}

/* 右侧手绘插画 */
.leaf-visual-right {
  width: 140rpx;
  height: 170rpx;
  background: #F3EFEA;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10rpx;
  box-sizing: border-box;
}

.leaf-cocktail-img {
  width: 120rpx;
  height: 150rpx;
  display: block;
}

/* 随笔微醺语录框 */
.leaf-quote-box {
  background: #F3EFEA;
  border-radius: 16rpx;
  padding: 16rpx 20rpx;
  margin-bottom: 24rpx;
  display: flex;
  align-items: flex-start;
  gap: 8rpx;
}

.quote-symbol {
  font-size: 28rpx;
  font-family: 'Georgia', serif;
  color: #B45309;
  line-height: 1;
}

.leaf-notes-text {
  flex: 1;
  font-size: 22rpx;
  color: #4B5563;
  line-height: 1.5;
  font-style: italic;
}

/* 底部印章与操作条 */
.leaf-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
  padding-top: 18rpx;
}

.stamp-seal {
  border: 2px solid #DC2626;
  border-radius: 10rpx;
  padding: 4rpx 12rpx;
  transform: rotate(-4deg);
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(220, 38, 38, 0.04);
}

.seal-stars {
  font-size: 12rpx;
  color: #DC2626;
  letter-spacing: 1px;
}

.seal-text {
  font-size: 18rpx;
  font-weight: 900;
  color: #DC2626;
  letter-spacing: 0.5px;
}

.seal-sub {
  font-size: 12rpx;
  font-weight: 700;
  color: #DC2626;
}

.leaf-actions {
  display: flex;
  gap: 12rpx;
}

.action-pill-btn {
  font-size: 20rpx;
  font-weight: 700;
  padding: 12rpx 22rpx;
  border-radius: 999rpx;
  background: #EDE8DF;
  color: #374151;
  border: none;
  line-height: 1.2;

  &.highlight {
    background: #F59E0B;
    color: #000000;
    box-shadow: 0 4rpx 12rpx rgba(245, 158, 11, 0.3);
  }

  &.secondary {
    background: rgba(0, 0, 0, 0.05);
    color: #9CA3AF;
    padding: 12rpx 16rpx;
  }
}

/* 收藏夹 Tab 样式 */
.empty-fav-card {
  text-align: center;
  padding: 80rpx 40rpx;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 24rpx;
}

.empty-icon {
  font-size: 64rpx;
  display: block;
  margin-bottom: 16rpx;
}

.empty-fav-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #E5E7EB;
  display: block;
  margin-bottom: 8rpx;
}

.empty-fav-desc {
  font-size: 22rpx;
  color: #6B7280;
  display: block;
  margin-bottom: 30rpx;
}

.go-btn {
  font-size: 24rpx;
  padding: 16rpx 40rpx;
  display: inline-block;
}

.fav-grid {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.fav-recipe-card {
  background: #14151D;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20rpx;
  padding: 20rpx 24rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.fav-img {
  width: 90rpx;
  height: 110rpx;
  border-radius: 12rpx;
  background: rgba(255, 255, 255, 0.03);
}

.fav-info {
  flex: 1;
}

.fav-title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.fav-name-zh {
  font-size: 28rpx;
  font-weight: 800;
  color: #FFFFFF;
}

.fav-abv {
  background: rgba(245, 158, 11, 0.15);
  color: #FBBF24;
  font-size: 18rpx;
  font-weight: 700;
  padding: 2rpx 10rpx;
  border-radius: 999rpx;
}

.fav-name-en {
  font-size: 20rpx;
  font-style: italic;
  color: #6B7280;
  margin: 2rpx 0;
  display: block;
}

.fav-desc {
  font-size: 20rpx;
  color: #9CA3AF;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.fav-action-arrow {
  font-size: 30rpx;
  color: #F59E0B;
  padding-left: 8rpx;
}

/* 单位设置卡片 */
.settings-card {
  padding: 30rpx;
  border-radius: 20rpx;
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
