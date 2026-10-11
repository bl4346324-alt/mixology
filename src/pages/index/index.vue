<template>
  <view class="container">
    <!-- 顶部品牌栏与视图模式切换 -->
    <view class="header-section">
      <view class="brand-wrap">
        <text class="volume-tag">VOLUME 01 · 饮品手册</text>
        <text class="brand-title">今晚，喝哪杯？</text>
      </view>

      <view class="header-right-actions">
        <!-- 视图切换胶囊 -->
        <view class="view-switch-pill" @tap="toggleViewMode">
          <text class="switch-icon">{{ viewMode === 'deck' ? '🗂️' : '📋' }}</text>
          <text class="switch-text">{{ viewMode === 'deck' ? '手册卡包' : '速查清单' }}</text>
        </view>

        <!-- 酒柜就绪计数快捷入口 -->
        <view class="quick-status" @tap="goToShelf">
          <text class="status-num">{{ canMakeCount }}</text>
          <text class="status-label">可做</text>
        </view>
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

    <!-- 抖音同款生活情境话题栏 (Mood & Scene Topics) -->
    <view class="mood-topics-wrapper">
      <scroll-view scroll-x class="mood-topics-scroll" :show-scrollbar="false">
        <view class="mood-topics-list">
          <view
            v-for="scene in moodScenes"
            :key="scene.id"
            class="mood-topic-pill"
            :class="{ active: currentMood === scene.id }"
            @tap="setMoodScene(scene.id)"
          >
            <text class="mood-emoji">{{ scene.emoji }}</text>
            <text class="mood-tag">#{{ scene.name }}</text>
          </view>
        </view>
      </scroll-view>
      <!-- 场景氛围微提示 -->
      <view v-if="currentMood !== 'all'" class="mood-scene-hint">
        <text class="hint-quote">“{{ activeMoodScene.desc }}”</text>
        <text class="hint-count">精选 {{ filteredRecipes.length }} 款特调</text>
      </view>
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

    <!-- 模式 1: 抖音同款《杯间·饮品手册》层叠卡片抽卡模式 (Deck Mode) -->
    <view v-if="viewMode === 'deck'" class="deck-view-wrapper">
      <RecipeCardDeck
        :recipes="filteredRecipes"
        :mood-name="currentMood !== 'all' ? activeMoodScene.name : ''"
        @select="onDeckSelect"
      />
    </view>

    <!-- 模式 2: 传统速查列表模式 (List Mode) -->
    <view v-else class="list-view-wrapper">
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
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { RECIPES, AI_CUSTOM_RECIPES } from '../../data/recipes';
import { INGREDIENTS_MAP } from '../../data/ingredients';
import type { Recipe, RecipeCategory } from '../../types/recipe';
import RecipeCard from '../../components/RecipeCard.vue';
import RecipeCardDeck from '../../components/RecipeCardDeck.vue';
import { useCabinetStore } from '../../stores/cabinet';

const cabinetStore = useCabinetStore();

// 视图模式：'deck' (手册卡盒模式，默认) | 'list' (速查列表模式)
const viewMode = ref<'deck' | 'list'>('deck');

function toggleViewMode() {
  viewMode.value = viewMode.value === 'deck' ? 'list' : 'deck';
  try {
    uni.vibrateShort({ type: 'light' });
  } catch (_) {}
}

function onDeckSelect(recipe: Recipe) {
  // 卡片抽取回调
  console.log('Selected card:', recipe.nameZh);
}

const searchQuery = ref('');
const currentCategory = ref<string>('all');
const currentMood = ref<string>('all');
const sortBy = ref<'default' | 'abv-asc' | 'abv-desc'>('default');

export interface MoodScene {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  recipeIds?: string[];
  matchFn?: (recipe: Recipe) => boolean;
}

const moodScenes: MoodScene[] = [
  {
    id: 'all',
    name: '全部特调',
    emoji: '🍸',
    desc: '全本调饮手册，随心挑选',
  },
  {
    id: 'nightcap',
    name: '晚安微醺',
    emoji: '🌙',
    desc: '深夜独酌，温润甜美，卸下一天疲惫',
    recipeIds: [
      'black_russian',
      'white_russian',
      'baileys_iced_latte',
      'espresso_martini',
      'coconut_rum_latte',
      'old_fashioned',
      'godfather',
      'boulevardier',
      'dahongpao_old_fashioned',
      'b52',
    ],
  },
  {
    id: 'decompress',
    name: '假期解压',
    emoji: '🛋️',
    desc: '结束假期与高压工作，1杯解千愁',
    recipeIds: [
      'long_island_iced_tea',
      'cuba_libre',
      'gin_and_tonic',
      'ice_tea_bomb',
      'negroni',
      'manhattan',
      'whiskey_sour',
      'jager_redbull',
      'tom_collins',
      'cola_bucket_whiskey',
    ],
  },
  {
    id: 'convenience',
    name: '便利店快手',
    emoji: '🏪',
    desc: '便利店软饮+小瓶基酒，30秒即调',
    matchFn: (r) => r.category === 'convenience',
  },
  {
    id: 'party',
    name: '周末聚会出片',
    emoji: '🥂',
    desc: '高颜值渐变分层，朋友聚会焦点',
    recipeIds: [
      'margarita',
      'tequila_sunrise',
      'zombie',
      'cosmopolitan',
      'french_75',
      'pina_colada',
      'moscow_mule',
      'aperol_spritz',
      'cinderella',
      'grape_soju_fizz',
    ],
  },
  {
    id: 'mocktail',
    name: '清醒不醉',
    emoji: '🍃',
    desc: '0% 无酒精负担，果香与草本气泡',
    matchFn: (r) => r.category === 'mocktail' || r.calculatedAbv === 0,
  },
  {
    id: 'tea',
    name: '新中式茶韵',
    emoji: '🍵',
    desc: '冷萃茶香浸润烈酒，东方清雅意境',
    matchFn: (r) => r.category === 'tea_cocktail' || r.tags.some(t => t.includes('茶')),
  },
  {
    id: 'ai_custom',
    name: 'AI私房特调',
    emoji: '✨',
    desc: 'AI 侍酒师独家量身定制的私房微醺配方',
    matchFn: (r) => r.id.startsWith('ai_') || r.tags?.some(t => t.includes('AI定制')),
  },
];

function setMoodScene(moodId: string) {
  currentMood.value = moodId;
  try {
    uni.vibrateShort({ type: 'light' });
  } catch (_) {}
}

const activeMoodScene = computed(() => {
  return moodScenes.find(m => m.id === currentMood.value) || moodScenes[0];
});

const categories = [
  { id: 'all', name: '全部灵感' },
  { id: 'ai', name: '✨ AI定制' },
  { id: 'iba', name: 'IBA 经典' },
  { id: 'convenience', name: '便利店特调' },
  { id: 'tea_cocktail', name: '新中式茶酒' },
  { id: 'mocktail', name: '无酒精' },
];

const customDeckRecipes = ref<Recipe[]>([]);

function loadCustomDeck() {
  try {
    const customDeck = uni.getStorageSync('mixocraft_custom_deck');
    if (Array.isArray(customDeck)) {
      customDeckRecipes.value = customDeck;
    } else {
      customDeckRecipes.value = [];
    }
  } catch (_) {
    customDeckRecipes.value = [];
  }
}

onShow(() => {
  loadCustomDeck();
});

// 全局可用酒谱列表：基础库 + AI预设特调 + 用户在AI侍酒师收录的私房特调
const allAvailableRecipes = computed<Recipe[]>(() => {
  const list = [...RECIPES];
  for (const item of AI_CUSTOM_RECIPES) {
    if (!list.some(r => r.id === item.id)) {
      list.push(item);
    }
  }
  for (const item of customDeckRecipes.value) {
    if (!list.some(r => r.id === item.id)) {
      list.unshift(item); // 用户定制的私房特调置顶排列在卡盒最前
    }
  }
  return list;
});

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
  let list = allAvailableRecipes.value;

  // 1. 情绪生活场景筛选
  if (currentMood.value !== 'all') {
    const scene = moodScenes.find(m => m.id === currentMood.value);
    if (scene) {
      if (scene.matchFn) {
        list = list.filter(scene.matchFn);
      } else if (scene.recipeIds) {
        list = list.filter(r => scene.recipeIds!.includes(r.id));
      }
    }
  }

  // 2. 分类筛选
  if (currentCategory.value !== 'all') {
    if (currentCategory.value === 'ai') {
      list = list.filter(r => r.id.startsWith('ai_') || r.tags?.some(t => t.includes('AI定制')));
    } else {
      list = list.filter(r => r.category === currentCategory.value);
    }
  }

  // 3. 搜索词筛选 (酒名中文、英文、标签、描述、原料名称)
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

  // 4. 排序
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
  margin-bottom: 24rpx;
}

.brand-wrap {
  display: flex;
  flex-direction: column;
}

.volume-tag {
  font-size: 19rpx;
  font-weight: 700;
  color: #F59E0B;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 4rpx;
}

.brand-title {
  font-size: 42rpx;
  font-weight: 900;
  color: #FFFFFF;
  letter-spacing: 1px;
}

.brand-subtitle {
  font-size: 20rpx;
  color: #9CA3AF;
  letter-spacing: 0.5px;
  margin-top: 4rpx;
}

.header-right-actions {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.view-switch-pill {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 10rpx 20rpx;
  border-radius: 999rpx;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-switch-pill:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.14);
}

.switch-icon {
  font-size: 22rpx;
}

.switch-text {
  font-size: 21rpx;
  color: #FDE68A;
  font-weight: 600;
}

.quick-status {
  display: flex;
  align-items: baseline;
  gap: 6rpx;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
}

.deck-view-wrapper {
  margin-top: 10rpx;
  width: 100%;
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

/* 抖音同款生活情绪场景标签滑轨 */
.mood-topics-wrapper {
  margin-bottom: 22rpx;
}

.mood-topics-scroll {
  white-space: nowrap;
  width: 100%;
}

.mood-topics-list {
  display: inline-flex;
  gap: 14rpx;
  padding: 4rpx 0;
}

.mood-topic-pill {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 10rpx 22rpx;
  border-radius: 999rpx;
  transition: all 0.25s ease;
  cursor: pointer;

  &:active {
    transform: scale(0.95);
  }

  &.active {
    background: #FAF7F2;
    border-color: #FAF7F2;
    box-shadow: 0 4rpx 16rpx rgba(250, 247, 242, 0.25);

    .mood-tag {
      color: #111827;
      font-weight: 800;
    }
  }
}

.mood-emoji {
  font-size: 24rpx;
}

.mood-tag {
  font-size: 22rpx;
  color: #D1D5DB;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.mood-scene-hint {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10rpx 12rpx 0 12rpx;
}

.hint-quote {
  font-size: 21rpx;
  color: #F59E0B;
  font-style: italic;
}

.hint-count {
  font-size: 20rpx;
  color: #9CA3AF;
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
