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
        <text v-if="!isGenerating">🪄 唤醒侍酒师 · 生成特调配方</text>
        <text v-else>正在品鉴推演风味平衡...</text>
      </button>
    </view>

    <!-- 生成结果展示卡片 -->
    <view v-if="generatedResult" class="result-card glass-card-amber">
      <view class="result-badge">专属定制特调</view>
      
      <view class="result-top">
        <view class="result-names">
          <text class="result-zh">{{ generatedResult.nameZh }}</text>
          <text class="result-en">{{ generatedResult.nameEn }}</text>
        </view>
        <text class="result-abv">{{ generatedResult.calculatedAbv }}% ABV</text>
      </view>

      <text class="result-story">“{{ generatedResult.story }}”</text>

      <!-- 五维风味雷达 -->
      <view class="radar-box">
        <FlavorRadar :flavor="generatedResult.flavor" :size="200" />
      </view>

      <!-- 配方原料表 -->
      <view class="recipe-table">
        <view class="table-title">调配原料清单：</view>
        <view
          v-for="(item, idx) in generatedResult.ingredients"
          :key="idx"
          class="table-row"
        >
          <text class="ing-name">{{ getIngredientName(item.ingredientId) }}</text>
          <text class="ing-amount">
            {{ item.customUnit ? item.customUnit : item.amountMl + ' ml' }}
          </text>
        </view>
      </view>

      <!-- 调酒步骤 -->
      <view class="steps-section">
        <view class="table-title">制作步骤：</view>
        <view
          v-for="step in generatedResult.steps"
          :key="step.step"
          class="step-line"
        >
          <text class="step-num">{{ step.step }}.</text>
          <text class="step-desc">{{ step.description }}</text>
        </view>
      </view>

      <!-- 底部动作 -->
      <view class="result-actions">
        <button class="btn-gold action-btn" @tap="startCrafting">
          进入调酒工作台制作
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
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

function applyPrompt(p: string) {
  customInput.value = p;
}

function getIngredientName(id: string): string {
  return INGREDIENTS_MAP.get(id)?.nameZh || id;
}

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

    uni.showToast({
      title: '特调配方生成完成！',
      icon: 'success'
    });
  }, 1000);
}

function startCrafting() {
  if (generatedResult.value) {
    try {
      // 将 AI 定制配方存入本地临时存储，确保调酒工作台能直接读取并完整渲染步骤
      uni.setStorageSync('mixocraft_custom_recipe', generatedResult.value);
    } catch (e) {
      console.error('Failed to cache AI recipe', e);
    }
    // 传递进入工作台
    uni.navigateTo({
      url: `/pages/recipe/craft?id=${generatedResult.value.id}`
    });
  }
}
</script>

<style scoped lang="scss">
.container {
  padding: 30rpx 30rpx 100rpx 30rpx;
  background-color: #0E0F14;
  min-height: 100vh;
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
  line-height: 1.4;
}

.quick-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 28rpx;
}

.chip-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #D1D5DB;
  font-size: 22rpx;
  padding: 8rpx 20rpx;
  border-radius: 999rpx;
}

.chip-item:active {
  background: rgba(245, 158, 11, 0.2);
  border-color: #F59E0B;
  color: #FDE68A;
}

.preference-card {
  padding: 28rpx;
  margin-bottom: 34rpx;
}

.pref-row {
  margin-bottom: 24rpx;
}

.pref-label {
  font-size: 24rpx;
  color: #9CA3AF;
  margin-bottom: 12rpx;
  display: block;
}

.mood-options, .abv-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.mood-chip, .abv-chip {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #9CA3AF;
  font-size: 22rpx;
  padding: 10rpx 22rpx;
  border-radius: 999rpx;
  transition: all 0.2s ease;
}

.mood-chip.active, .abv-chip.active {
  background: rgba(245, 158, 11, 0.18);
  border-color: #F59E0B;
  color: #FDE68A;
  font-weight: 600;
}

.input-wrap {
  margin-bottom: 24rpx;
}

.custom-textarea {
  width: 100%;
  height: 160rpx;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08);
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
}

.generate-btn.loading {
  opacity: 0.7;
}

/* 结果卡片 */
.result-card {
  padding: 30rpx;
  position: relative;
  overflow: hidden;
  margin-top: 10rpx;
}

.result-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #F59E0B;
  color: #000000;
  font-size: 20rpx;
  font-weight: 700;
  padding: 6rpx 20rpx;
  border-bottom-left-radius: 16rpx;
}

.result-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 16rpx;
}

.result-zh {
  font-size: 38rpx;
  font-weight: 800;
  color: #FDE68A;
  display: block;
}

.result-en {
  font-size: 22rpx;
  color: #9CA3AF;
  display: block;
}

.result-abv {
  font-size: 28rpx;
  font-weight: 800;
  color: #10B981;
}

.result-story {
  font-size: 24rpx;
  color: #D1D5DB;
  font-style: italic;
  line-height: 1.5;
  margin-bottom: 20rpx;
  display: block;
}

.radar-box {
  display: flex;
  justify-content: center;
  margin: 10rpx 0 20rpx 0;
}

.table-title {
  font-size: 26rpx;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 12rpx;
}

.table-row {
  display: flex;
  justify-content: space-between;
  padding: 10rpx 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 24rpx;
}

.ing-name {
  color: #E5E7EB;
}

.ing-amount {
  color: #F59E0B;
  font-weight: 600;
}

.steps-section {
  margin-top: 24rpx;
  margin-bottom: 30rpx;
}

.step-line {
  display: flex;
  gap: 12rpx;
  font-size: 24rpx;
  color: #D1D5DB;
  line-height: 1.5;
  margin-bottom: 12rpx;
}

.step-num {
  color: #F59E0B;
  font-weight: 700;
}

.action-btn {
  width: 100%;
}
</style>
