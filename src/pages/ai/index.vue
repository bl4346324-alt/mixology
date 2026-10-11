<template>
  <view class="container">
    <!-- 头部介绍 -->
    <view class="ai-header">
      <view class="ai-avatar">✨</view>
      <view class="ai-intro">
        <text class="ai-title">AI 微醺侍酒师</text>
        <text class="ai-desc">告诉我今晚的心情或冰箱现存食材，为您量身定制专属特调。</text>
      </view>
    </view>

    <!-- 快捷灵感芯片 -->
    <view class="quick-chips">
      <view
        v-for="(prompt, idx) in quickPrompts"
        :key="idx"
        class="chip-item"
        @tap="applyPrompt(prompt)"
      >
        <text>{{ prompt }}</text>
      </view>
    </view>

    <!-- 心情与偏好选择器 -->
    <view class="preference-card glass-card">
      <view class="pref-row">
        <text class="pref-label">当前心境：</text>
        <view class="mood-options">
          <view
            v-for="m in moods"
            :key="m.id"
            class="mood-chip"
            :class="{ active: selectedMood === m.id }"
            @tap="selectedMood = m.id"
          >
            <text>{{ m.emoji }} {{ m.name }}</text>
          </view>
        </view>
      </view>

      <view class="pref-row">
        <text class="pref-label">期望度数：</text>
        <view class="abv-options">
          <view
            v-for="a in abvChoices"
            :key="a.val"
            class="abv-chip"
            :class="{ active: selectedAbv === a.val }"
            @tap="selectedAbv = a.val"
          >
            <text>{{ a.label }}</text>
          </view>
        </view>
      </view>

      <!-- 需求输入框 -->
      <view class="input-wrap">
        <textarea
          v-model="customInput"
          placeholder="例如：今天加班好累，想喝点清爽、果香不甜的，家里有伏特加和乌龙茶..."
          placeholder-class="input-placeholder"
          class="custom-textarea"
          :maxlength="200"
        />
      </view>

      <!-- 生成按钮 -->
      <button
        class="btn-gold generate-btn"
        :class="{ loading: isGenerating }"
        :disabled="isGenerating"
        @tap="generateCocktail"
      >
        <text v-if="!isGenerating">🪄 唤醒侍酒师 · 测算专属风味</text>
        <text v-else>正在品鉴推演风味平衡...</text>
      </button>
    </view>

    <!-- 抖音同款复古活页特调卡片 (Retro Journal Custom Card) -->
    <view v-if="generatedResult" class="journal-result-wrap">
      <view class="ai-journal-card">
        <!-- 活页打孔装订孔装饰 -->
        <view class="binder-holes-row">
          <view class="binder-dot" />
          <view class="binder-dot" />
          <view class="binder-dot" />
        </view>

        <view class="journal-card-body">
          <!-- 卡片头部：定制序号、酒精度、双语名称、手绘插画 -->
          <view class="card-header-row">
            <view class="header-left">
              <view class="custom-badge-group">
                <text class="custom-tag">✨ AI EXCLUSIVE</text>
                <text class="abv-badge">{{ generatedResult.calculatedAbv }}% ABV</text>
              </view>
              <text class="journal-name-en">{{ generatedResult.nameEn }}</text>
              <text class="journal-name-zh">{{ generatedResult.nameZh }}</text>
            </view>

            <!-- 右侧手绘酒杯高清插画 -->
            <view class="header-right-visual">
              <image
                class="ai-glass-img"
                :src="generatedResult.coverImage || '/static/recipes/suntory_oolong_highball.png'"
                mode="aspectFit"
              />
            </view>
          </view>

          <!-- 微醺故事与金句语录 -->
          <view class="journal-story-box">
            <text class="story-quote-symbol">“</text>
            <text class="story-content">{{ generatedResult.story }}</text>
            <text class="story-quote-symbol">”</text>
          </view>

          <!-- 黄金调饮比例色条 (Mini Parts Ratio) -->
          <view v-if="ratioSegments.length > 0" class="mini-ratio-wrap">
            <view class="ratio-header">
              <text class="rh-title">PARTS RATIO 调饮比例</text>
            </view>
            <view class="ratio-track">
              <view
                v-for="seg in ratioSegments"
                :key="seg.id"
                class="ratio-seg"
                :style="{ width: seg.percent + '%', backgroundColor: seg.color }"
              >
                <text v-if="seg.percent >= 14" class="seg-text">{{ seg.shortName }}</text>
              </view>
            </view>
          </view>

          <!-- 五维风味雷达图与风味标签 -->
          <view class="radar-section">
            <view class="radar-title">风味特征推演：</view>
            <view class="radar-container">
              <FlavorRadar :flavor="generatedResult.flavor" :size="200" />
            </view>
            <view class="tags-cloud">
              <text v-for="(t, idx) in generatedResult.tags" :key="idx" class="flavor-tag">
                #{{ t }}
              </text>
            </view>
          </view>

          <!-- 调配原料清单 -->
          <view class="formula-box">
            <view class="formula-title">RECIPE FORMULA 原料清单</view>
            <view class="formula-list">
              <view
                v-for="(item, idx) in generatedResult.ingredients"
                :key="idx"
                class="formula-item"
              >
                <text class="f-dot">•</text>
                <text class="f-name">{{ getIngredientName(item.ingredientId) }}</text>
                <text class="f-val">
                  {{ item.customUnit ? item.customUnit : item.amountMl + ' ml' }}
                </text>
              </view>
            </view>
          </view>

          <!-- 制作步骤清单 -->
          <view class="steps-box">
            <view class="steps-title">CRAFT STEPS 调饮步骤</view>
            <view
              v-for="step in generatedResult.steps"
              :key="step.step"
              class="step-item"
            >
              <text class="step-badge">{{ step.step }}</text>
              <text class="step-text">{{ step.description }}</text>
            </view>
          </view>

          <!-- 底部红泥印章 -->
          <view class="journal-seal-row">
            <view class="ai-seal">
              <text class="seal-stars">★★★★★</text>
              <text class="seal-name">AI侍酒特调</text>
              <text class="seal-desc">独家配方</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 三联王牌操作栏 (Action Trio) -->
      <view class="trio-actions">
        <button
          class="action-btn-collect"
          :class="{ collected: isCollected }"
          @tap="toggleCollectToDeck"
        >
          <text>{{ isCollected ? '✓ 已收入卡盒' : '🎴 收录进微醺卡盒' }}</text>
        </button>

        <button class="action-btn-poster" @tap="generatePosterDirectly">
          <text>📸 拍立得海报</text>
        </button>

        <button class="action-btn-craft btn-gold" @tap="startCrafting">
          <text>🍸 前往制作</text>
        </button>
      </view>
    </view>

    <!-- 已收录的私房特调卡盒抽屉 (My Custom Deck Showcase) -->
    <view v-if="collectedDeck.length > 0" class="custom-deck-section">
      <view class="section-header">
        <view class="sh-left">
          <text class="sh-icon">🎴</text>
          <text class="sh-title">我的私房特调卡盒 ({{ collectedDeck.length }})</text>
        </view>
        <text class="sh-tip">可在首页随时抽卡浏览</text>
      </view>

      <scroll-view scroll-x class="deck-scroll" :show-scrollbar="false">
        <view class="deck-cards-row">
          <view
            v-for="item in collectedDeck"
            :key="item.id"
            class="custom-deck-card"
            @tap="previewCustomRecipe(item)"
          >
            <image
              class="cdc-img"
              :src="item.coverImage || '/static/recipes/suntory_oolong_highball.png'"
              mode="aspectFit"
            />
            <view class="cdc-info">
              <text class="cdc-name-zh">{{ item.nameZh }}</text>
              <text class="cdc-abv">{{ item.calculatedAbv }}% ABV</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { Recipe } from '../../types/recipe';
import { INGREDIENTS_MAP } from '../../data/ingredients';
import FlavorRadar from '../../components/FlavorRadar.vue';

const quickPrompts = [
  '下班解乏 · 清爽微醺长饮',
  '女生聚会 · 无酒精低卡果香',
  '深夜独酌 · 泥煤烟熏古典',
  '便利店救急 · 仅用绿茶与金酒',
];

const moods = [
  { id: 'relax', emoji: '🍃', name: '放松解乏' },
  { id: 'party', emoji: '🎉', name: '狂欢派对' },
  { id: 'healing', emoji: '🌙', name: '深夜治愈' },
  { id: 'romantic', emoji: '🕯️', name: '微醺浪漫' },
];

const abvChoices = [
  { val: 'mocktail', label: '0% 纯果茶' },
  { val: 'low', label: '5-10% 微醺' },
  { val: 'medium', label: '15-20% 醇香' },
  { val: 'high', label: '25%+ 烈酒' },
];

const selectedMood = ref('relax');
const selectedAbv = ref('low');
const customInput = ref('');
const isGenerating = ref(false);
const generatedResult = ref<Recipe | null>(null);
const collectedDeck = ref<Recipe[]>([]);

onMounted(() => {
  loadCollectedDeck();
});

function loadCollectedDeck() {
  try {
    const saved = uni.getStorageSync('mixocraft_custom_deck');
    if (Array.isArray(saved)) {
      collectedDeck.value = saved;
    }
  } catch (_) {}
}

const isCollected = computed(() => {
  if (!generatedResult.value) return false;
  return collectedDeck.value.some(r => r.id === generatedResult.value?.id);
});

function applyPrompt(p: string) {
  customInput.value = p;
}

function getIngredientName(id: string): string {
  return INGREDIENTS_MAP.get(id)?.nameZh || id;
}

// Mini 黄金比例色条计算
interface RatioSegment {
  id: string;
  shortName: string;
  percent: number;
  color: string;
}

const INGREDIENT_COLORS: Record<string, string> = {
  bourbon_whiskey: '#EA580C',
  suntory_oolong: '#78350F',
  dongfang_shuye_green: '#10B981',
  lime_juice: '#84CC16',
  simple_syrup: '#FDE68A',
  soda_water: '#BAE6FD',
  gin: '#6EE7B7',
  vodka: '#93C5FD',
};
const defaultColors = ['#F59E0B', '#3B82F6', '#10B981', '#EC4899', '#8B5CF6'];

const ratioSegments = computed<RatioSegment[]>(() => {
  if (!generatedResult.value) return [];
  const liquids = generatedResult.value.ingredients.filter(item => item.amountMl && item.amountMl > 0);
  if (liquids.length === 0) return [];
  const totalMl = liquids.reduce((acc, cur) => acc + cur.amountMl, 0);
  if (totalMl <= 0) return [];

  return liquids.map((item, idx) => {
    const name = getIngredientName(item.ingredientId).split('/')[0].trim().slice(0, 4);
    const percent = Math.round((item.amountMl / totalMl) * 100);
    const color = INGREDIENT_COLORS[item.ingredientId] || defaultColors[idx % defaultColors.length];
    return {
      id: item.ingredientId,
      shortName: name,
      percent,
      color,
    };
  });
});

// 模拟基于风味规则模型的智能配方生成引擎
function generateCocktail() {
  isGenerating.value = true;
  generatedResult.value = null;

  setTimeout(() => {
    isGenerating.value = false;

    if (selectedAbv.value === 'mocktail') {
      generatedResult.value = {
        id: 'ai_custom_mocktail',
        nameZh: '暮色晚风 · 茉莉冷萃',
        nameEn: 'Sunset Breeze Jasmine',
        category: 'mocktail',
        coverColor: 'linear-gradient(135deg, #10B981, #065F46)',
        coverImage: '/static/recipes/dongfang_shuye_highball.png',
        description: '无酒精的淡雅花香与清脆青柠酸度碰撞，带来如晚风拂面般的轻盈治愈。',
        story: '专为您量身调制的无酒精灵感特调。冷萃茉莉的清幽香气与细密气泡水融为一体，不给身体增添任何酒精负担。',
        method: 'build',
        glass: 'highball',
        iceType: '满杯方冰',
        difficulty: 'easy',
        prepTimeMinutes: 2,
        calculatedAbv: 0.0,
        flavor: {
          sweetness: 2,
          sourness: 3,
          strength: 1,
          bitterness: 1,
          refreshment: 5,
        },
        tags: ['AI定制', '无酒精', '东方茶香', '低卡轻盈'],
        ingredients: [
          { ingredientId: 'dongfang_shuye_green', amountMl: 120 },
          { ingredientId: 'lime_juice', amountMl: 15 },
          { ingredientId: 'simple_syrup', amountMl: 10 },
          { ingredientId: 'soda_water', amountMl: 60 },
          { ingredientId: 'mint_leaves', amountMl: 0, customUnit: '3-4片' },
        ],
        steps: [
          {
            step: 1,
            title: '冰镇杯身',
            description: '在高球杯中装满大块冰块，倒入青柠汁与糖浆。',
            actionType: 'prep',
          },
          {
            step: 2,
            title: '注入纯茶',
            description: '缓缓倒入冰镇东方树叶茉莉花茶。',
            actionType: 'pour',
          },
          {
            step: 3,
            title: '补足气泡',
            description: '顶层注满苏打水，轻提吧勺一次，饰以薄荷叶。',
            actionType: 'garnish',
          }
        ],
      };
    } else {
      generatedResult.value = {
        id: 'ai_custom_special',
        nameZh: '琥珀月影 · 乌龙微醺特调',
        nameEn: 'Amber Moonlight Oolong',
        category: 'tea_cocktail',
        coverColor: 'linear-gradient(135deg, #F59E0B, #78350F)',
        coverImage: '/static/recipes/suntory_oolong_highball.png',
        description: '炭焙茶香收敛了波旁威士忌的辛辣，青柠酸度唤醒了夜晚的灵感。',
        story: '根据您“放松解乏”的需求专门定制。美式威士忌的木质香气与无糖乌龙的茶多酚在冰块中达到完美平衡，回甘绵长。',
        method: 'build',
        glass: 'highball',
        iceType: '老冰块',
        difficulty: 'easy',
        prepTimeMinutes: 2,
        calculatedAbv: 8.5,
        flavor: {
          sweetness: 2,
          sourness: 3,
          strength: 2,
          bitterness: 2,
          refreshment: 4,
        },
        tags: ['AI定制', '茶酒新中式', '回甘悠长', '极速解乏'],
        ingredients: [
          { ingredientId: 'bourbon_whiskey', amountMl: 40 },
          { ingredientId: 'suntory_oolong', amountMl: 110 },
          { ingredientId: 'lime_juice', amountMl: 10 },
          { ingredientId: 'simple_syrup', amountMl: 8 },
          { ingredientId: 'ice_cubes', amountMl: 0, customUnit: '满杯' },
        ],
        steps: [
          {
            step: 1,
            title: '冰杯注酒',
            description: '在高球杯中放入冰块，倒入 40ml 威士忌。',
            actionType: 'prep',
          },
          {
            step: 2,
            title: '酸甜平衡',
            description: '加入 10ml 青柠汁与 8ml 糖浆，搅拌两圈唤醒风味。',
            actionType: 'measure',
          },
          {
            step: 3,
            title: '注满冷萃乌龙',
            description: '倒满冰镇三得利乌龙茶，垂直提拉吧勺一次融合。',
            actionType: 'pour',
          }
        ],
      };
    }

    // 缓存生成的当前配方
    try {
      uni.setStorageSync('mixocraft_custom_recipe', generatedResult.value);
    } catch (_) {}

    uni.showToast({
      title: '特调配方生成完成！',
      icon: 'success'
    });
  }, 900);
}

// 🎴 收录至微醺卡盒
function toggleCollectToDeck() {
  if (!generatedResult.value) return;
  const current = generatedResult.value;
  const idx = collectedDeck.value.findIndex(r => r.id === current.id);

  if (idx >= 0) {
    collectedDeck.value.splice(idx, 1);
    uni.showToast({ title: '已从卡盒移出', icon: 'none' });
  } else {
    collectedDeck.value.unshift(current);
    try {
      uni.vibrateShort({ type: 'medium' });
    } catch (_) {}
    uni.showToast({ title: '🎴 已收录进微醺卡盒！', icon: 'success' });
  }

  try {
    uni.setStorageSync('mixocraft_custom_deck', collectedDeck.value);
    uni.setStorageSync('mixocraft_custom_recipe', current);
  } catch (e) {
    console.error('Failed to update custom deck', e);
  }
}

// 📸 生成拍立得海报
function generatePosterDirectly() {
  if (!generatedResult.value) return;
  try {
    uni.setStorageSync('mixocraft_custom_recipe', generatedResult.value);
  } catch (_) {}
  const curId = generatedResult.value.id;
  const notes = encodeURIComponent(generatedResult.value.description);
  uni.navigateTo({
    url: `/pages/recipe/poster?id=${curId}&rating=5&notes=${notes}`
  });
}

// 🍸 前往工作台制作
function startCrafting() {
  if (generatedResult.value) {
    try {
      uni.setStorageSync('mixocraft_custom_recipe', generatedResult.value);
    } catch (_) {}
    uni.navigateTo({
      url: `/pages/recipe/craft?id=${generatedResult.value.id}`
    });
  }
}

// 查看历史收录的私房特调
function previewCustomRecipe(recipe: Recipe) {
  generatedResult.value = recipe;
  try {
    uni.setStorageSync('mixocraft_custom_recipe', recipe);
  } catch (_) {}
  uni.showToast({
    title: `已调出《${recipe.nameZh}》`,
    icon: 'none'
  });
}
</script>

<style scoped lang="scss">
.container {
  padding: 30rpx 30rpx 140rpx 30rpx;
  background-color: #0E0F14;
  min-height: 100vh;
  box-sizing: border-box;
}

.ai-header {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 28rpx;
}

.ai-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #F59E0B, #D97706);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(245, 158, 11, 0.4);
}

.ai-intro {
  flex: 1;
}

.ai-title {
  font-size: 38rpx;
  font-weight: 800;
  color: #FFFFFF;
  display: block;
}

.ai-desc {
  font-size: 22rpx;
  color: #9CA3AF;
  margin-top: 4rpx;
  display: block;
}

.quick-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
  margin-bottom: 28rpx;
}

.chip-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 10rpx 22rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  color: #D1D5DB;
  transition: all 0.2s ease;

  &:active {
    background: rgba(245, 158, 11, 0.15);
    color: #FDE68A;
  }
}

.preference-card {
  padding: 32rpx;
  margin-bottom: 36rpx;
  border-radius: 24rpx;
}

.pref-row {
  margin-bottom: 28rpx;
}

.pref-label {
  font-size: 24rpx;
  font-weight: 700;
  color: #E5E7EB;
  margin-bottom: 14rpx;
  display: block;
}

.mood-options, .abv-options {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
}

.mood-chip, .abv-chip {
  padding: 12rpx 24rpx;
  border-radius: 16rpx;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 24rpx;
  color: #9CA3AF;
  transition: all 0.2s ease;

  &.active {
    background: #F59E0B;
    border-color: #F59E0B;
    color: #000000;
    font-weight: 800;
  }
}

.input-wrap {
  margin-top: 20rpx;
  margin-bottom: 28rpx;
}

.custom-textarea {
  width: 100%;
  height: 150rpx;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  padding: 20rpx;
  font-size: 24rpx;
  color: #FFFFFF;
  box-sizing: border-box;
}

.input-placeholder {
  color: #6B7280;
}

.generate-btn {
  width: 100%;
  font-size: 28rpx;
  font-weight: 800;
  padding: 24rpx 0;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 抖音同款复古活页特调卡片 (Retro Journal Card) */
.journal-result-wrap {
  margin-top: 10rpx;
  margin-bottom: 40rpx;
}

.ai-journal-card {
  background: #FAF7F2;
  border-radius: 28rpx;
  overflow: hidden;
  box-shadow: 0 16rpx 50rpx rgba(0, 0, 0, 0.55);
}

.binder-holes-row {
  height: 24rpx;
  background: #EDE8DF;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 80rpx;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.1);
}

.binder-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #111827;
  opacity: 0.6;
}

.journal-card-body {
  padding: 34rpx 36rpx;
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.header-left {
  flex: 1;
  padding-right: 20rpx;
}

.custom-badge-group {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.custom-tag {
  font-size: 18rpx;
  font-weight: 900;
  color: #B45309;
  letter-spacing: 0.5px;
}

.abv-badge {
  background: #FEF3C7;
  color: #92400E;
  border: 1px solid #FDE68A;
  font-size: 18rpx;
  font-weight: 800;
  padding: 2rpx 12rpx;
  border-radius: 999rpx;
}

.journal-name-en {
  font-size: 24rpx;
  font-style: italic;
  font-family: 'Baskerville', 'Georgia', serif;
  color: #4B5563;
  display: block;
}

.journal-name-zh {
  font-size: 44rpx;
  font-weight: 900;
  color: #111827;
  letter-spacing: 0.5px;
  line-height: 1.2;
  margin-top: 4rpx;
  display: block;
}

.header-right-visual {
  width: 160rpx;
  height: 190rpx;
  background: #F3EFEA;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10rpx;
  box-sizing: border-box;
}

.ai-glass-img {
  width: 140rpx;
  height: 170rpx;
  display: block;
}

.journal-story-box {
  background: #F3EFEA;
  border-radius: 16rpx;
  padding: 18rpx 22rpx;
  margin-bottom: 24rpx;
  display: flex;
  align-items: flex-start;
  gap: 6rpx;
}

.story-quote-symbol {
  font-size: 30rpx;
  font-family: 'Georgia', serif;
  color: #B45309;
  line-height: 1;
}

.story-content {
  flex: 1;
  font-size: 22rpx;
  color: #4B5563;
  line-height: 1.5;
  font-style: italic;
}

/* 黄金比例色条 */
.mini-ratio-wrap {
  margin-bottom: 24rpx;
}

.ratio-header {
  margin-bottom: 8rpx;
}

.rh-title {
  font-size: 18rpx;
  font-weight: 800;
  color: #9CA3AF;
  letter-spacing: 0.5px;
}

.ratio-track {
  width: 100%;
  height: 32rpx;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 8rpx;
  overflow: hidden;
  display: flex;
}

.ratio-seg {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-right: 1px solid rgba(0, 0, 0, 0.1);
}

.seg-text {
  font-size: 16rpx;
  font-weight: 800;
  color: #111827;
  white-space: nowrap;
}

/* 雷达与标签 */
.radar-section {
  background: #F3EFEA;
  border-radius: 18rpx;
  padding: 20rpx;
  margin-bottom: 24rpx;
}

.radar-title {
  font-size: 20rpx;
  font-weight: 800;
  color: #6B7280;
  margin-bottom: 10rpx;
}

.radar-container {
  display: flex;
  justify-content: center;
  margin-bottom: 14rpx;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  justify-content: center;
}

.flavor-tag {
  background: rgba(245, 158, 11, 0.12);
  color: #92400E;
  font-size: 20rpx;
  font-weight: 700;
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
}

/* 配方与步骤清单 */
.formula-box, .steps-box {
  background: #F3EFEA;
  border-radius: 18rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 20rpx;
}

.formula-title, .steps-title {
  font-size: 18rpx;
  font-weight: 800;
  color: #9CA3AF;
  letter-spacing: 0.5px;
  margin-bottom: 12rpx;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding-bottom: 6rpx;
}

.formula-list {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.formula-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 22rpx;
}

.f-dot {
  color: #B45309;
  margin-right: 6rpx;
}

.f-name {
  color: #374151;
  font-weight: 600;
  flex: 1;
}

.f-val {
  color: #B45309;
  font-weight: 800;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.step-badge {
  background: #B45309;
  color: #FFFFFF;
  font-size: 18rpx;
  font-weight: 800;
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 4rpx;
}

.step-text {
  font-size: 22rpx;
  color: #4B5563;
  line-height: 1.5;
  flex: 1;
}

/* 火漆印章 */
.journal-seal-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 10rpx;
}

.ai-seal {
  border: 2px solid #DC2626;
  border-radius: 10rpx;
  padding: 4rpx 14rpx;
  transform: rotate(-5deg);
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

.seal-name {
  font-size: 18rpx;
  font-weight: 900;
  color: #DC2626;
}

.seal-desc {
  font-size: 12rpx;
  font-weight: 700;
  color: #DC2626;
}

/* 三联王牌操作栏 */
.trio-actions {
  display: flex;
  gap: 14rpx;
  margin-top: 24rpx;
}

.action-btn-collect {
  flex: 1.2;
  font-size: 22rpx;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.1);
  color: #FDE68A;
  border: 1px solid rgba(245, 158, 11, 0.4);
  border-radius: 16rpx;
  padding: 22rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &.collected {
    background: rgba(16, 185, 129, 0.2);
    color: #34D399;
    border-color: rgba(16, 185, 129, 0.5);
  }
}

.action-btn-poster {
  flex: 1;
  font-size: 22rpx;
  font-weight: 800;
  background: #EDE8DF;
  color: #374151;
  border-radius: 16rpx;
  padding: 22rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn-craft {
  flex: 1.2;
  font-size: 22rpx;
  font-weight: 800;
  border-radius: 16rpx;
  padding: 22rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 我的私房特调卡盒抽屉 (Custom Deck Section) */
.custom-deck-section {
  margin-top: 40rpx;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 24rpx;
  padding: 24rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.sh-left {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.sh-icon {
  font-size: 28rpx;
}

.sh-title {
  font-size: 26rpx;
  font-weight: 800;
  color: #E5E7EB;
}

.sh-tip {
  font-size: 20rpx;
  color: #F59E0B;
}

.deck-scroll {
  width: 100%;
  white-space: nowrap;
}

.deck-cards-row {
  display: inline-flex;
  gap: 16rpx;
  padding: 4rpx 0;
}

.custom-deck-card {
  width: 220rpx;
  background: #FAF7F2;
  border-radius: 18rpx;
  padding: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.4);
}

.cdc-img {
  width: 120rpx;
  height: 140rpx;
  margin-bottom: 8rpx;
}

.cdc-info {
  width: 100%;
  text-align: center;
}

.cdc-name-zh {
  font-size: 22rpx;
  font-weight: 800;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.cdc-abv {
  font-size: 18rpx;
  font-weight: 700;
  color: #B45309;
  display: block;
  margin-top: 2rpx;
}
</style>
