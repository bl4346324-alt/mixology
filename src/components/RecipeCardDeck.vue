<template>
  <view class="recipe-deck-container">
    <!-- 顶部活页索引标签栏 (Tab Index Deck) -->
    <view class="deck-tabs-wrapper">
      <scroll-view
        scroll-x
        class="deck-tabs-scroll"
        :scroll-left="tabScrollLeft"
        scroll-with-animation
        :show-scrollbar="false"
      >
        <view class="deck-tabs-list">
          <view
            v-for="(recipe, index) in recipes"
            :key="recipe.id"
            class="tab-item"
            :class="{ active: index === currentIndex }"
            @tap="switchToIndex(index)"
          >
            <view class="tab-folder-shape">
              <text class="tab-index-num">{{ formatIndex(index) }}</text>
              <text class="tab-name">{{ recipe.nameZh }}</text>
              <text class="tab-en">{{ recipe.nameEn }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 卡片层叠主展示区 (Card Stack Area) -->
    <view
      class="deck-stage"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <!-- 若无卡片空状态 -->
      <view v-if="!currentRecipe" class="empty-deck">
        <text class="empty-icon">🍸</text>
        <text class="empty-text">当前分类下暂无酒谱卡片</text>
      </view>

      <!-- 堆叠底层卡片 2 (预告层) -->
      <view
        v-if="next2Recipe"
        class="recipe-paper-card stack-card stack-card-back"
      >
        <view class="card-inner-placeholder"></view>
      </view>

      <!-- 堆叠底层卡片 1 (微露边沿) -->
      <view
        v-if="nextRecipe"
        class="recipe-paper-card stack-card stack-card-middle"
        @tap="nextCard"
      >
        <view class="card-inner-placeholder">
          <text class="peek-text">{{ nextRecipe.nameZh }}</text>
        </view>
      </view>

      <!-- 当前置顶主卡片 (Active Front Card) -->
      <view
        v-if="currentRecipe"
        class="recipe-paper-card stack-card stack-card-front"
        :class="{ 'pulling-out': isPullingOut }"
        :style="cardTransformStyle"
        @tap="pullOutCard"
      >
        <!-- 卡片顶部序号与收藏书签 -->
        <view class="card-top-bar">
          <view class="index-badge">
            <text class="seq-num">{{ formatIndex(currentIndex) }}</text>
            <text class="slash">/</text>
            <text class="category-title">{{ moodName ? '#' + moodName : getCategoryName(currentRecipe.category) }}</text>
          </view>

          <!-- 收藏书签 Ribbon -->
          <view class="bookmark-btn" @tap.stop="toggleBookmark(currentRecipe.id)">
            <text class="bookmark-icon" :class="{ favorited: isBookmarked(currentRecipe.id) }">
              {{ isBookmarked(currentRecipe.id) ? '🔖' : '🏷️' }}
            </text>
            <text class="bookmark-label">
              {{ isBookmarked(currentRecipe.id) ? '已收藏' : '收藏' }}
            </text>
          </view>
        </view>

        <!-- 卡片居中手绘酒杯插画 (Hand-drawn Vector Artwork) -->
        <view class="card-illustration-wrap">
          <image
            class="card-cocktail-img"
            :src="getRecipeImage(currentRecipe)"
            mode="aspectFit"
            @error="handleCardImageError(currentRecipe.id)"
          />
        </view>

        <!-- 卡片文字排版区 (典雅双语 + 氛围微醺短语) -->
        <view class="card-typography-wrap">
          <!-- 英文经典衬线体 -->
          <text class="card-name-en">{{ currentRecipe.nameEn }}</text>

          <!-- 中文大字标题 -->
          <text class="card-name-zh">{{ currentRecipe.nameZh }}</text>

          <!-- 微醺意境/风味诗意一句话 -->
          <text class="card-story-quote">
            “{{ currentRecipe.description }}”
          </text>

          <!-- 属性微标签 (酒精度 · 手法 · 杯型) -->
          <view class="card-pills-row">
            <view class="meta-pill pill-abv">
              <text>{{ currentRecipe.calculatedAbv }}% ABV</text>
            </view>
            <view class="meta-pill pill-method">
              <text>{{ getMethodName(currentRecipe.method) }}</text>
            </view>
            <view class="meta-pill pill-glass">
              <text>{{ getGlassName(currentRecipe.glass) }}</text>
            </view>
            <!-- 酒柜匹配状态胶囊 -->
            <view
              v-if="cabinetMatch"
              class="meta-pill"
              :class="cabinetStatusClass"
            >
              <text>{{ cabinetStatusLabel }}</text>
            </view>
          </view>
        </view>

        <!-- 卡片底部抽卡 CTA -->
        <view class="card-pull-action" @tap.stop="pullOutCard">
          <view class="pull-btn">
            <text class="pull-text">抽出这一张</text>
            <text class="pull-arrow">→</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底栏控制器与指示器 (Deck Controls) -->
    <view class="deck-bottom-bar">
      <!-- 上一张 -->
      <view
        class="nav-btn prev-btn"
        :class="{ disabled: currentIndex === 0 }"
        @tap="prevCard"
      >
        <text class="arrow">‹</text>
      </view>

      <!-- 计数器与滑动提示 -->
      <view class="deck-counter-wrap">
        <text class="counter-num">
          {{ currentIndex + 1 }} <text class="counter-total">/ {{ recipes.length }}</text>
        </text>
        <text class="counter-hint">{{ moodName ? `左右轻扫 · 抽取 #${moodName} 配方` : '左右轻扫 · 抽出配方' }}</text>
      </view>

      <!-- 下一张 -->
      <view
        class="nav-btn next-btn"
        :class="{ disabled: currentIndex >= recipes.length - 1 }"
        @tap="nextCard"
      >
        <text class="arrow">›</text>
      </view>

      <!-- 随缘抽一杯按钮 (Lucky Draw) -->
      <view class="shuffle-btn" @tap="randomDraw">
        <text class="shuffle-icon">🎲</text>
        <text class="shuffle-text">随缘抽</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Recipe } from '../types/recipe';
import { useFavoritesStore } from '../stores/favorites';
import { useCabinetStore } from '../stores/cabinet';

const props = withDefaults(
  defineProps<{
    recipes: Recipe[];
    moodName?: string;
  }>(),
  {
    moodName: '',
  }
);

const emit = defineEmits<{
  (e: 'select', recipe: Recipe): void;
}>();

const favoritesStore = useFavoritesStore();
const cabinetStore = useCabinetStore();

const currentIndex = ref(0);
const isPullingOut = ref(false);
const imageErrorMap = ref<Record<string, boolean>>({});

function handleCardImageError(recipeId: string) {
  imageErrorMap.value[recipeId] = true;
}

function getRecipeImage(recipe: Recipe | null): string {
  if (!recipe) return '/static/recipes/long_island_iced_tea.png';
  if (imageErrorMap.value[recipe.id]) {
    return '/static/recipes/long_island_iced_tea.png';
  }
  if (recipe.coverImage && recipe.coverImage.trim()) {
    return recipe.coverImage;
  }
  return `/static/recipes/${recipe.id}.png`;
}

// 触控手势物理状态
const touchStartX = ref(0);
const touchStartY = ref(0);
const dragX = ref(0);
const dragY = ref(0);
const isDragging = ref(false);

// 顶部 Tab 自动居中滚动位置
const tabScrollLeft = computed(() => {
  return Math.max(0, (currentIndex.value - 1) * 90);
});

// 重置索引保护
watch(
  () => props.recipes,
  (newVal) => {
    if (currentIndex.value >= newVal.length) {
      currentIndex.value = 0;
    }
  }
);

// 当前卡片
const currentRecipe = computed(() => {
  if (!props.recipes || props.recipes.length === 0) return null;
  return props.recipes[currentIndex.value] || props.recipes[0];
});

// 下一张卡片 (堆叠中层)
const nextRecipe = computed(() => {
  if (!props.recipes || props.recipes.length <= 1) return null;
  const nextIdx = (currentIndex.value + 1) % props.recipes.length;
  return props.recipes[nextIdx];
});

// 下下张卡片 (堆叠底层)
const next2Recipe = computed(() => {
  if (!props.recipes || props.recipes.length <= 2) return null;
  const next2Idx = (currentIndex.value + 2) % props.recipes.length;
  return props.recipes[next2Idx];
});

// 格式化两位序号
function formatIndex(idx: number): string {
  return String(idx + 1).padStart(2, '0');
}

// 触摸手势事件
function handleTouchStart(e: TouchEvent) {
  if (isPullingOut.value) return;
  const touch = e.touches[0];
  touchStartX.value = touch.clientX;
  touchStartY.value = touch.clientY;
  dragX.value = 0;
  dragY.value = 0;
  isDragging.value = true;
}

function handleTouchMove(e: TouchEvent) {
  if (!isDragging.value || isPullingOut.value) return;
  const touch = e.touches[0];
  const deltaX = touch.clientX - touchStartX.value;
  const deltaY = touch.clientY - touchStartY.value;
  
  // 允许跟手微位移
  dragX.value = deltaX * 0.8;
  dragY.value = deltaY * 0.4;
}

function handleTouchEnd() {
  if (!isDragging.value || isPullingOut.value) return;
  isDragging.value = false;

  const threshold = 55; // 划过 55px 触发切卡
  if (dragX.value < -threshold) {
    nextCard();
  } else if (dragX.value > threshold) {
    prevCard();
  } else if (dragY.value < -80) {
    // 向上大滑直接抽出此张
    pullOutCard();
  }

  // 弹性复位
  dragX.value = 0;
  dragY.value = 0;
}

// 卡片跟随手指位移样式
const cardTransformStyle = computed(() => {
  if (!isDragging.value) {
    return {};
  }
  const rotateDeg = dragX.value * 0.04;
  return {
    transform: `translate3d(${dragX.value}px, ${dragY.value}px, 0) rotate(${rotateDeg}deg)`,
    transition: 'none'
  };
});

function switchToIndex(idx: number) {
  if (idx >= 0 && idx < props.recipes.length) {
    currentIndex.value = idx;
    try {
      uni.vibrateShort({ type: 'light' });
    } catch (_) {}
  }
}

function prevCard() {
  if (currentIndex.value > 0) {
    currentIndex.value--;
  } else {
    // 循环或保持
    currentIndex.value = props.recipes.length - 1;
  }
  try {
    uni.vibrateShort({ type: 'light' });
  } catch (_) {}
}

function nextCard() {
  if (currentIndex.value < props.recipes.length - 1) {
    currentIndex.value++;
  } else {
    // 循环回第一张
    currentIndex.value = 0;
  }
  try {
    uni.vibrateShort({ type: 'light' });
  } catch (_) {}
}

// 随缘抽卡
function randomDraw() {
  if (props.recipes.length <= 1) return;
  let target = Math.floor(Math.random() * props.recipes.length);
  if (target === currentIndex.value) {
    target = (target + 1) % props.recipes.length;
  }
  currentIndex.value = target;
  try {
    uni.vibrateShort({ type: 'medium' });
  } catch (_) {}
}

// 抽出这一张交互动效
function pullOutCard() {
  if (!currentRecipe.value || isPullingOut.value) return;
  isPullingOut.value = true;

  try {
    uni.vibrateShort({ type: 'medium' });
  } catch (_) {}

  // 发出选中事件，并跳转详情页
  const selected = currentRecipe.value;
  emit('select', selected);

  setTimeout(() => {
    uni.navigateTo({
      url: `/pages/recipe/detail?id=${selected.id}`,
      complete: () => {
        // 重置抽卡动画状态
        setTimeout(() => {
          isPullingOut.value = false;
        }, 400);
      }
    });
  }, 260);
}

// 收藏相关
function isBookmarked(id: string): boolean {
  return favoritesStore.isFavorite(id);
}

function toggleBookmark(id: string) {
  favoritesStore.toggleFavorite(id);
  try {
    uni.vibrateShort({ type: 'light' });
  } catch (_) {}
}

// 酒柜就绪判断
const cabinetMatch = computed(() => {
  if (!currentRecipe.value) return null;
  return cabinetStore.evaluateRecipe(currentRecipe.value);
});

const cabinetStatusLabel = computed(() => {
  if (!cabinetMatch.value) return '';
  if (cabinetMatch.value.status === 'perfect') return '✨ 现成可做';
  if (cabinetMatch.value.status === 'substitute') return '🔄 平替可做';
  if (cabinetMatch.value.status === 'missing_one') return '仅缺 1 样';
  return '';
});

const cabinetStatusClass = computed(() => {
  if (!cabinetMatch.value) return '';
  if (cabinetMatch.value.status === 'perfect') return 'pill-ready';
  if (cabinetMatch.value.status === 'substitute') return 'pill-sub';
  return 'pill-missing';
});

function getCategoryName(category: string): string {
  switch (category) {
    case 'iba': return 'IBA 官方经典';
    case 'convenience': return '便利店特调';
    case 'tea_cocktail': return '新中式茶酒';
    case 'mocktail': return '无酒精特调';
    default: return '经典调配';
  }
}

function getMethodName(method: string): string {
  switch (method) {
    case 'shake': return '摇和法';
    case 'stir': return '搅拌法';
    case 'build': return '直调法';
    case 'muddle': return '捣碎法';
    case 'blend': return '冰沙法';
    default: return '特调';
  }
}

function getGlassName(glass: string): string {
  switch (glass) {
    case 'martini': return '马天尼杯';
    case 'highball': return '高球杯';
    case 'old_fashioned': return '古典杯';
    case 'coupe': return '浅碟香槟杯';
    case 'mule_mug': return '莫斯科骡子铜杯';
    case 'collins': return '柯林杯';
    default: return '品饮杯';
  }
}
</script>

<style scoped lang="scss">
.recipe-deck-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  padding-bottom: 20rpx;
}

/* ================= 顶部活页索引标签栏 ================= */
.deck-tabs-wrapper {
  width: 100%;
  margin-bottom: 12rpx;
  overflow: hidden;
}

.deck-tabs-scroll {
  white-space: nowrap;
  width: 100%;
}

.deck-tabs-list {
  display: inline-flex;
  padding: 8rpx 10rpx 0 10rpx;
  gap: 16rpx;
}

.tab-item {
  display: inline-block;
  cursor: pointer;
  transition: all 0.25s ease;
}

.tab-folder-shape {
  background: #2A2D3A;
  border-top-left-radius: 18rpx;
  border-top-right-radius: 18rpx;
  padding: 12rpx 28rpx 14rpx 28rpx;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: none;
  display: flex;
  align-items: baseline;
  gap: 10rpx;
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.25);
  transition: all 0.25s ease;
}

.tab-item.active .tab-folder-shape {
  background: #FAF7F2;
  border-color: #FAF7F2;
  transform: translateY(2rpx);
}

.tab-index-num {
  font-size: 20rpx;
  font-weight: 700;
  color: #9CA3AF;
  font-family: -apple-system, sans-serif;
}

.tab-item.active .tab-index-num {
  color: #B45309;
}

.tab-name {
  font-size: 24rpx;
  font-weight: 600;
  color: #D1D5DB;
}

.tab-item.active .tab-name {
  color: #111827;
  font-weight: 800;
}

.tab-en {
  font-size: 18rpx;
  color: #6B7280;
  font-style: italic;
  font-family: 'Baskerville', 'Georgia', serif;
}

.tab-item.active .tab-en {
  color: #6B7280;
}

/* ================= 主卡片层叠舞台 ================= */
.deck-stage {
  position: relative;
  width: 100%;
  height: 980rpx;
  margin: 0 auto;
  perspective: 1000px;
}

/* 空状态 */
.empty-deck {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9CA3AF;
  background: #181922;
  border-radius: 36rpx;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 26rpx;
}

/* 核心：复古米白质感卡片主体 */
.recipe-paper-card {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
  background: #FAF7F2;
  border-radius: 36rpx;
  padding: 34rpx 36rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 20rpx 50rpx rgba(0, 0, 0, 0.55), 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  user-select: none;
}

/* 堆叠层级：底层第三张 */
.stack-card-back {
  transform: translateY(34rpx) scale(0.91);
  opacity: 0.35;
  z-index: 1;
  background: #E5E0D8;
  pointer-events: none;
}

/* 堆叠层级：底层第二张 */
.stack-card-middle {
  transform: translateY(18rpx) scale(0.955);
  opacity: 0.72;
  z-index: 2;
  background: #F3EFEA;
  cursor: pointer;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 16rpx;
}

.peek-text {
  font-size: 22rpx;
  color: #9CA3AF;
  font-weight: 600;
}

/* 置顶主卡片 */
.stack-card-front {
  transform: translateY(0) scale(1);
  opacity: 1;
  z-index: 10;
  transition: transform 0.28s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.28s ease;
}

/* 抽出卡片动画 */
.stack-card-front.pulling-out {
  transform: translateY(-240rpx) scale(0.96) !important;
  opacity: 0 !important;
  transition: all 0.32s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* 卡片顶部状态行 */
.card-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.index-badge {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.seq-num {
  font-size: 32rpx;
  font-weight: 800;
  color: #111827;
  font-family: -apple-system, sans-serif;
}

.slash {
  font-size: 24rpx;
  color: #9CA3AF;
}

.category-title {
  font-size: 22rpx;
  font-weight: 600;
  color: #6B7280;
  letter-spacing: 0.5px;
}

.bookmark-btn {
  display: flex;
  align-items: center;
  gap: 6rpx;
  background: rgba(0, 0, 0, 0.04);
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  cursor: pointer;
}

.bookmark-icon {
  font-size: 26rpx;
}

.bookmark-label {
  font-size: 20rpx;
  color: #4B5563;
  font-weight: 600;
}

/* 居中插画容器 */
.card-illustration-wrap {
  flex: 1;
  width: 100%;
  min-height: 420rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10rpx 0;
}

.card-cocktail-img {
  width: 360rpx;
  height: 420rpx;
  display: block;
}

/* 卡片文字排版区 */
.card-typography-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 8rpx 0 16rpx 0;
}

.card-name-en {
  font-size: 28rpx;
  font-style: italic;
  font-family: 'Baskerville', 'Georgia', 'Times New Roman', serif;
  color: #4B5563;
  letter-spacing: 0.5px;
}

.card-name-zh {
  font-size: 54rpx;
  font-weight: 900;
  color: #111827;
  letter-spacing: 2rpx;
  line-height: 1.2;
  margin-top: 6rpx;
  font-family: -apple-system, 'PingFang SC', sans-serif;
}

.card-story-quote {
  font-size: 23rpx;
  color: #6B7280;
  line-height: 1.5;
  margin-top: 14rpx;
  max-width: 90%;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.card-pills-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12rpx;
  margin-top: 20rpx;
}

.meta-pill {
  font-size: 20rpx;
  font-weight: 600;
  padding: 6rpx 16rpx;
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

/* 抽出这一张按钮 */
.card-pull-action {
  width: 100%;
  display: flex;
  justify-content: center;
  padding-top: 14rpx;
}

.pull-btn {
  background: #111827;
  color: #FFFFFF;
  padding: 18rpx 56rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  box-shadow: 0 8rpx 20rpx rgba(17, 24, 39, 0.25);
  transition: transform 0.15s ease, background-color 0.2s ease;
}

.pull-btn:active {
  transform: scale(0.96);
  background: #000000;
}

.pull-text {
  font-size: 26rpx;
  font-weight: 700;
  letter-spacing: 1px;
}

.pull-arrow {
  font-size: 26rpx;
  font-weight: 700;
}

/* ================= 底栏导航与翻动提示 ================= */
.deck-bottom-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 16rpx 0 16rpx;
}

.nav-btn {
  width: 76rpx;
  height: 76rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-btn:active {
  transform: scale(0.92);
  background: rgba(255, 255, 255, 0.16);
}

.nav-btn.disabled {
  opacity: 0.3;
  pointer-events: none;
}

.arrow {
  font-size: 40rpx;
  color: #FFFFFF;
  line-height: 1;
}

.deck-counter-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.counter-num {
  font-size: 28rpx;
  font-weight: 800;
  color: #FDE68A;
  font-family: -apple-system, sans-serif;
}

.counter-total {
  font-size: 22rpx;
  color: #9CA3AF;
  font-weight: 500;
}

.counter-hint {
  font-size: 19rpx;
  color: #6B7280;
  margin-top: 4rpx;
  letter-spacing: 0.5px;
}

.shuffle-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.35);
  padding: 12rpx 24rpx;
  border-radius: 999rpx;
  cursor: pointer;
  transition: all 0.2s ease;
}

.shuffle-btn:active {
  transform: scale(0.94);
  background: rgba(245, 158, 11, 0.25);
}

.shuffle-icon {
  font-size: 24rpx;
}

.shuffle-text {
  font-size: 22rpx;
  color: #FDE68A;
  font-weight: 600;
}
</style>
