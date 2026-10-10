<template>
  <view v-if="recipe" class="craft-container">
    <!-- 顶部工作台状态条 -->
    <view class="top-nav">
      <view class="back-btn" @tap="goBack">✕ 退出工作台</view>
      <text class="cocktail-name">{{ recipe.nameZh }} ({{ portions }}人份)</text>
      <text class="step-progress">{{ currentStepIndex + 1 }}/{{ totalSteps }}</text>
    </view>

    <!-- 进度条 -->
    <view class="progress-bar">
      <view class="progress-fill" :style="{ width: progressPercentage + '%' }"></view>
    </view>

    <!-- 主展示区：超大字、高对比度、清晰可见 -->
    <view class="stage-canvas">
      <!-- 步骤指示与标题 -->
      <view class="stage-header">
        <text class="stage-badge">STEP {{ currentStep.step }}</text>
        <text class="stage-title">{{ currentStep.title }}</text>
        <text class="stage-desc">{{ currentStep.description }}</text>
      </view>

      <!-- 针对不同动作的交互组件 -->
      <!-- 动作 1: 原料倒入量取清单 (支持逐项划掉) -->
      <view v-if="currentStep.actionType === 'measure' || currentStep.actionType === 'prep'" class="measure-board glass-card">
        <text class="board-tips">点击下方原料勾选完成：</text>
        <view class="ingredient-items">
          <view
            v-for="(ing, idx) in recipe.ingredients"
            :key="idx"
            class="pour-row"
            :class="{ checked: checkedIngredients.has(ing.ingredientId) }"
            @tap="toggleIngChecked(ing.ingredientId)"
          >
            <view class="pour-left">
              <view class="check-box">
                <text v-if="checkedIngredients.has(ing.ingredientId)">✓</text>
              </view>
              <text class="pour-name">{{ getIngredientName(ing.ingredientId) }}</text>
            </view>
            <text class="pour-vol">
              {{ formatIngredientVolume(ing.amountMl, ing.customUnit) }}
            </text>
          </view>
        </view>
      </view>

      <!-- 动作 2: 摇和法 Shake 节拍器模式 -->
      <view v-else-if="currentStep.actionType === 'shake'" class="shake-board glass-card-amber">
        <text class="shake-title">摇和节拍器 (Shake Metronome)</text>
        <text class="shake-subtitle">双手握紧雪克壶，跟随节拍剧烈摇和</text>

        <!-- 呼吸搏动光晕圆环 -->
        <view class="metronome-circle" :class="{ beating: isTimerRunning }">
          <text class="metronome-num">{{ timerSecondsLeft }}</text>
          <text class="metronome-unit">秒</text>
        </view>

        <button class="btn-gold timer-toggle-btn" @tap="toggleTimer">
          {{ isTimerRunning ? '暂停摇酒' : (timerSecondsLeft === 0 ? '重新计时' : `开始 ${currentStepTargetSeconds} 秒节拍摇和`) }}
        </button>
      </view>

      <!-- 动作 3: 搅拌 / 提拉混匀倒计时模式 (自适应长饮提拉与经典搅拌) -->
      <view v-else-if="currentStep.actionType === 'stir'" class="stir-board glass-card">
        <text class="shake-title">
          {{ isLightLift ? '轻柔垂直提拉 (Lift & Mix)' : '经典顺滑搅拌 (Classic Stir)' }}
        </text>
        <text class="shake-subtitle">
          {{ isLightLift 
            ? '吧勺由杯底垂直轻柔提拉 1-2 次混匀即可，切勿打圈搅拌以免气泡跑气' 
            : '吧勺贴紧杯壁平稳旋转，搅拌降温并释放 18%-20% 纯净融水' }}
        </text>

        <view class="metronome-circle" :class="{ beating: isTimerRunning }">
          <text class="metronome-num">{{ timerSecondsLeft }}</text>
          <text class="metronome-unit">秒</text>
        </view>

        <button class="btn-gold timer-toggle-btn" @tap="toggleTimer">
          {{ isTimerRunning ? '暂停计时' : (timerSecondsLeft === 0 ? '重新计时' : `开始 ${currentStepTargetSeconds} 秒${isLightLift ? '轻柔提拉' : '平稳搅拌'}`) }}
        </button>
      </view>

      <!-- 动作 4: 注入/倾倒 -->
      <view v-else-if="currentStep.actionType === 'pour'" class="pour-board glass-card">
        <text class="shake-title">注入配料 (Pour & Fill)</text>
        <text class="shake-subtitle">{{ currentStep.description }}</text>
        <view class="stage-icon-wrap">
          <text class="stage-icon">🥃</text>
        </view>
      </view>

      <!-- 动作 5: 装饰与点睛 -->
      <view v-else-if="currentStep.actionType === 'garnish'" class="pour-board glass-card">
        <text class="shake-title">饰品点缀 (Garnish)</text>
        <text class="shake-subtitle">{{ currentStep.description }}</text>
        <view class="stage-icon-wrap">
          <text class="stage-icon">🌿</text>
        </view>
      </view>

      <!-- 动作 6: 完成享用 -->
      <view v-else class="finish-board glass-card">
        <view class="finish-illus-wrap">
          <image
            class="finish-cocktail-img"
            :src="craftImageSrc"
            mode="aspectFit"
            @error="handleCraftImageError"
          />
        </view>
        <text class="finish-title">完成调制！即可享用</text>
        <text class="finish-desc">杯型：{{ glassName }} · 预计酒精度：{{ recipe.calculatedAbv }}% ABV</text>
        <text v-if="recipe.bartenderNote" class="finish-note">“{{ recipe.bartenderNote }}”</text>
      </view>

      <!-- 调酒师心得小贴士 -->
      <view v-if="currentStep.tip" class="tip-card">
        <text class="tip-icon">💡 秘诀：</text>
        <text class="tip-text">{{ currentStep.tip }}</text>
      </view>
    </view>

    <!-- 底部大按键导航 (湿手盲操大间距) -->
    <view class="bottom-controls">
      <button
        v-if="currentStepIndex > 0"
        class="btn-subtle prev-btn"
        @tap="prevStep"
      >
        ← 上一步
      </button>

      <button
        v-if="currentStepIndex < totalSteps - 1"
        class="btn-gold next-btn"
        @tap="nextStep"
      >
        下一步 →
      </button>

      <button
        v-else
        class="btn-gold complete-btn"
        @tap="finishCocktail"
      >
        🎉 完成制作 · 微醺打卡
      </button>
    </view>

    <!-- 打卡评分弹窗 -->
    <view v-if="showLogModal" class="modal-mask">
      <view class="modal-card glass-card-amber">
        <text class="modal-title">微醺品鉴打卡</text>
        <text class="modal-cocktail">{{ recipe.nameZh }}</text>

        <!-- 评分星星 -->
        <view class="star-rating">
          <text
            v-for="s in 5"
            :key="s"
            class="star-item"
            :class="{ active: s <= logRating }"
            @tap="logRating = s"
          >
            ★
          </text>
        </view>

        <textarea
          v-model="logNotes"
          placeholder="写一句今日调酒心境或口感反馈..."
          class="modal-textarea"
        />

        <view class="modal-actions">
          <button class="btn-subtle" @tap="closeModal">稍后打卡</button>
          <button class="btn-subtle save-btn" @tap="saveLogOnly">仅存手记</button>
          <button class="btn-gold poster-btn" @tap="saveAndGoPoster">📸 生成海报</button>
        </view>
      </view>
    </view>
  </view>

  <!-- 兜底异常空状态 (避免无数据时黑屏) -->
  <view v-else class="craft-empty-container">
    <view class="empty-card glass-card">
      <text class="empty-icon">🍸</text>
      <text class="empty-title">配方数据加载中或未找到</text>
      <text class="empty-desc">未能获取到当前特调的调酒步骤信息，请返回重试</text>
      <button class="btn-gold empty-btn" @tap="goBack">返回上一页</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { RECIPES_MAP } from '../../data/recipes';
import { INGREDIENTS_MAP } from '../../data/ingredients';
import type { Recipe, CraftStep } from '../../types/recipe';
import { useCabinetStore } from '../../stores/cabinet';
import { useFavoritesStore } from '../../stores/favorites';
import { formatVolume } from '../../utils/unit';

const cabinetStore = useCabinetStore();
const favoritesStore = useFavoritesStore();

const recipeId = ref('');
const portions = ref(1);
const currentStepIndex = ref(0);
const checkedIngredients = ref<Set<string>>(new Set());
const customRecipe = ref<Recipe | null>(null);

// 倒计时器状态
const timerSecondsLeft = ref(12);
const isTimerRunning = ref(false);
let timerInterval: any = null;

// 打卡手记弹窗
const showLogModal = ref(false);
const logRating = ref(5);
const logNotes = ref('入口清爽，酸甜平衡极佳，微醺状态刚刚好！');

onLoad((query) => {
  if (query && query.id) {
    recipeId.value = query.id;
  }
  if (query && query.portions) {
    portions.value = Number(query.portions) || 1;
  }

  // 尝试读取 AI 侍酒定制或临时特调配方
  if (!RECIPES_MAP.get(recipeId.value) || recipeId.value.startsWith('ai_')) {
    try {
      const cached = uni.getStorageSync('mixocraft_custom_recipe');
      if (cached && (cached.id === recipeId.value || recipeId.value.startsWith('ai_'))) {
        customRecipe.value = cached;
        recipeId.value = cached.id;
      }
    } catch (e) {
      console.error('Failed to load custom recipe in craft', e);
    }
  }

  resetTimerForCurrentStep();
});

onUnmounted(() => {
  clearInterval(timerInterval);
});

const recipe = computed<Recipe | undefined>(() => {
  if (customRecipe.value && customRecipe.value.id === recipeId.value) {
    return customRecipe.value;
  }
  return RECIPES_MAP.get(recipeId.value);
});

const totalSteps = computed(() => {
  return recipe.value?.steps.length || 1;
});

const currentStep = computed<CraftStep>(() => {
  if (!recipe.value || !recipe.value.steps[currentStepIndex.value]) {
    return {
      step: 1,
      title: '准备原料',
      description: '请准备齐备杯型与原料',
      actionType: 'prep',
    };
  }
  return recipe.value.steps[currentStepIndex.value];
});

const progressPercentage = computed(() => {
  return ((currentStepIndex.value + 1) / totalSteps.value) * 100;
});

function getIngredientName(id: string): string {
  return INGREDIENTS_MAP.get(id)?.nameZh || id;
}

function formatIngredientVolume(amountMl: number, customUnit?: string): string {
  if (customUnit) {
    return portions.value > 1 ? `${customUnit} (x${portions.value})` : customUnit;
  }
  return formatVolume(amountMl, cabinetStore.unitPreference, portions.value);
}

function toggleIngChecked(id: string) {
  if (checkedIngredients.value.has(id)) {
    checkedIngredients.value.delete(id);
  } else {
    checkedIngredients.value.add(id);
    // 轻微震动反馈
    uni.vibrateShort({ type: 'light' });
  }
}

const currentStepTargetSeconds = computed(() => {
  if (currentStep.value.timerSeconds) {
    return currentStep.value.timerSeconds;
  }
  if (currentStep.value.actionType === 'shake') return 12;
  if (currentStep.value.actionType === 'stir') {
    return (recipe.value?.method === 'build' || recipe.value?.method === 'muddle') ? 5 : 25;
  }
  return 10;
});

const isLightLift = computed(() => {
  return currentStepTargetSeconds.value <= 8 || recipe.value?.method === 'build' || recipe.value?.method === 'muddle';
});

function resetTimerForCurrentStep() {
  clearInterval(timerInterval);
  isTimerRunning.value = false;
  timerSecondsLeft.value = currentStepTargetSeconds.value;
}

function toggleTimer() {
  if (isTimerRunning.value) {
    clearInterval(timerInterval);
    isTimerRunning.value = false;
  } else {
    if (timerSecondsLeft.value <= 0) {
      timerSecondsLeft.value = currentStepTargetSeconds.value;
    }
    isTimerRunning.value = true;
    timerInterval = setInterval(() => {
      if (timerSecondsLeft.value > 1) {
        timerSecondsLeft.value--;
        // 每秒轻微节拍震动
        uni.vibrateShort({ type: 'light' });
      } else {
        timerSecondsLeft.value = 0;
        clearInterval(timerInterval);
        isTimerRunning.value = false;
        // 完成长震动
        uni.vibrateLong();
      }
    }, 1000);
  }
}

function nextStep() {
  if (currentStepIndex.value < totalSteps.value - 1) {
    currentStepIndex.value++;
    resetTimerForCurrentStep();
  }
}

function prevStep() {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--;
    resetTimerForCurrentStep();
  }
}

function finishCocktail() {
  showLogModal.value = true;
}

const isImageError = ref(false);

function handleCraftImageError() {
  isImageError.value = true;
}

const craftImageSrc = computed(() => {
  if (!recipe.value) return '/static/recipes/long_island_iced_tea.png';
  if (isImageError.value) return '/static/recipes/long_island_iced_tea.png';
  if (recipe.value.coverImage && recipe.value.coverImage.trim()) {
    return recipe.value.coverImage;
  }
  return `/static/recipes/${recipe.value.id}.png`;
});

const glassName = computed(() => {
  if (!recipe.value) return '专用杯';
  switch (recipe.value.glass) {
    case 'martini': return '马天尼高脚杯';
    case 'highball': return '高球长饮杯';
    case 'old_fashioned': return '古典矮杯';
    case 'coupe': return '浅碟香槟杯';
    case 'mule_mug': return '莫斯科铜骡杯';
    default: return '专用杯';
  }
});

function closeModal() {
  showLogModal.value = false;
  uni.navigateBack();
}

function saveLogOnly() {
  if (recipe.value) {
    favoritesStore.addTastingLog({
      recipeId: recipe.value.id,
      recipeName: recipe.value.nameZh,
      rating: logRating.value,
      notes: logNotes.value,
    });
    uni.showToast({
      title: '手记已记录！',
      icon: 'success'
    });
    setTimeout(() => {
      showLogModal.value = false;
      uni.navigateBack();
    }, 600);
  }
}

function saveAndGoPoster() {
  if (recipe.value) {
    favoritesStore.addTastingLog({
      recipeId: recipe.value.id,
      recipeName: recipe.value.nameZh,
      rating: logRating.value,
      notes: logNotes.value,
    });
    const curId = recipe.value.id;
    const rating = logRating.value;
    const notes = encodeURIComponent(logNotes.value);
    showLogModal.value = false;
    uni.navigateTo({
      url: `/pages/recipe/poster?id=${curId}&rating=${rating}&notes=${notes}`
    });
  }
}

function goBack() {
  uni.navigateBack();
}
</script>

<style scoped lang="scss">
.craft-container {
  background-color: #0A0A0F;
  min-height: 100vh;
  padding: 30rpx 30rpx 200rpx 30rpx;
  box-sizing: border-box;
}

.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.back-btn {
  font-size: 24rpx;
  color: #9CA3AF;
  background: rgba(255, 255, 255, 0.08);
  padding: 10rpx 24rpx;
  border-radius: 999rpx;
}

.cocktail-name {
  font-size: 28rpx;
  font-weight: 700;
  color: #FFFFFF;
}

.step-progress {
  font-size: 24rpx;
  font-weight: 800;
  color: #F59E0B;
}

.progress-bar {
  width: 100%;
  height: 8rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 999rpx;
  margin-bottom: 40rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #F59E0B;
  transition: width 0.3s ease;
}

.stage-canvas {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.stage-header {
  text-align: center;
}

.stage-badge {
  display: inline-block;
  background: rgba(245, 158, 11, 0.2);
  color: #FDE68A;
  font-size: 22rpx;
  font-weight: 800;
  padding: 6rpx 24rpx;
  border-radius: 999rpx;
  margin-bottom: 16rpx;
  letter-spacing: 1px;
}

.stage-title {
  font-size: 48rpx;
  font-weight: 800;
  color: #FFFFFF;
  display: block;
  margin-bottom: 12rpx;
}

.stage-desc {
  font-size: 28rpx;
  color: #D1D5DB;
  line-height: 1.6;
  display: block;
  padding: 0 20rpx;
}

/* 动作模块 */
.measure-board {
  padding: 28rpx;
}

.board-tips {
  font-size: 22rpx;
  color: #9CA3AF;
  margin-bottom: 20rpx;
  display: block;
}

.ingredient-items {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.pour-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.04);
  padding: 20rpx 24rpx;
  border-radius: 18rpx;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.2s ease;
}

.pour-row.checked {
  opacity: 0.4;
  text-decoration: line-through;
  background: rgba(16, 185, 129, 0.08);
}

.pour-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.check-box {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 2px solid #F59E0B;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #000000;
  font-weight: 800;
}

.pour-row.checked .check-box {
  background: #10B981;
  border-color: #10B981;
  color: #FFFFFF;
}

.pour-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #FFFFFF;
}

.pour-vol {
  font-size: 34rpx;
  font-weight: 800;
  color: #FDE68A;
}

/* 节拍器圆环 */
.shake-board, .stir-board {
  padding: 40rpx 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.shake-title {
  font-size: 34rpx;
  font-weight: 800;
  color: #FDE68A;
  display: block;
}

.shake-subtitle {
  font-size: 22rpx;
  color: #9CA3AF;
  margin-top: 8rpx;
  margin-bottom: 36rpx;
  display: block;
}

.metronome-circle {
  width: 220rpx;
  height: 220rpx;
  border-radius: 50%;
  border: 6rpx solid #F59E0B;
  background: rgba(245, 158, 11, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 40rpx;
  transition: all 0.3s ease;
}

.metronome-circle.beating {
  animation: pulse 1s infinite alternate;
  box-shadow: 0 0 50rpx rgba(245, 158, 11, 0.6);
}

@keyframes pulse {
  0% { transform: scale(0.96); }
  100% { transform: scale(1.08); }
}

.metronome-num {
  font-size: 72rpx;
  font-weight: 900;
  color: #FDE68A;
  line-height: 1;
}

.metronome-unit {
  font-size: 24rpx;
  color: #9CA3AF;
  margin-top: 6rpx;
}

.timer-toggle-btn {
  width: 400rpx;
}

/* 完成板块 */
.finish-board {
  padding: 60rpx 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.finish-icon {
  font-size: 100rpx;
  margin-bottom: 20rpx;
}

.finish-illus-wrap {
  width: 100%;
  height: 320rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}

.finish-cocktail-img {
  width: 260rpx;
  height: 320rpx;
  display: block;
}

.finish-title {
  font-size: 40rpx;
  font-weight: 800;
  color: #FFFFFF;
  display: block;
}

.finish-desc {
  font-size: 24rpx;
  color: #9CA3AF;
  margin-top: 10rpx;
  display: block;
}

.finish-note {
  font-size: 24rpx;
  color: #FDE68A;
  font-style: italic;
  margin-top: 24rpx;
  line-height: 1.5;
  display: block;
}

.tip-card {
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: rgba(245, 158, 11, 0.1);
  padding: 20rpx;
  border-radius: 16rpx;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.tip-icon {
  font-size: 24rpx;
  color: #F59E0B;
  font-weight: 700;
}

.tip-text {
  font-size: 22rpx;
  color: #D1D5DB;
}

.bottom-controls {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx 30rpx env(safe-area-inset-bottom) 30rpx;
  background: #0A0A0F;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  gap: 20rpx;
  z-index: 100;
}

.prev-btn {
  flex: 1;
}

.next-btn {
  flex: 2;
}

.complete-btn {
  flex: 1;
  background: linear-gradient(135deg, #10B981, #059669);
  color: #FFFFFF;
}

/* 弹窗 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-card {
  width: 600rpx;
  padding: 40rpx;
  text-align: center;
}

.modal-title {
  font-size: 36rpx;
  font-weight: 800;
  color: #FFFFFF;
  display: block;
}

.modal-cocktail {
  font-size: 26rpx;
  color: #FDE68A;
  margin-top: 8rpx;
  margin-bottom: 24rpx;
  display: block;
}

.star-rating {
  display: flex;
  justify-content: center;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.star-item {
  font-size: 50rpx;
  color: #4B5563;
}

.star-item.active {
  color: #F59E0B;
}

.modal-textarea {
  width: 100%;
  height: 160rpx;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  padding: 16rpx;
  font-size: 24rpx;
  color: #FFFFFF;
  margin-bottom: 30rpx;
  text-align: left;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  gap: 12rpx;

  button {
    flex: 1;
    font-size: 22rpx;
    padding: 18rpx 0;
  }

  .poster-btn {
    flex: 1.3;
  }
}

.stage-icon-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 40rpx 0;
}

.stage-icon {
  font-size: 110rpx;
  line-height: 1;
}

.craft-empty-container {
  min-height: 100vh;
  background-color: #0A0A0F;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  box-sizing: border-box;
}

.empty-card {
  padding: 60rpx 40rpx;
  text-align: center;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 12rpx;
}

.empty-desc {
  font-size: 24rpx;
  color: #9CA3AF;
  margin-bottom: 40rpx;
}

.empty-btn {
  width: 60%;
}
</style>
