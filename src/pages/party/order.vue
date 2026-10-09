<template>
  <view class="order-container">
    <!-- 吧台欢迎牌 -->
    <view class="welcome-card glass-card-amber">
      <text class="bar-title">{{ session?.title || '今晚微醺吧台' }}</text>
      <text class="bar-welcome">“{{ session?.welcomeMessage || '欢迎光临！今晚酒单已备好，请随意点单~' }}”</text>
      <view class="host-line">
        <text class="host-tag">主理调酒师：{{ session?.bartenderName || '房主' }}</text>
        <text v-if="session?.isOpen" class="open-status">营业中 🍸</text>
        <text v-else class="closed-status">已打烊 😴</text>
      </view>
    </view>

    <!-- 菜单列表 -->
    <view class="menu-section">
      <text class="section-title">今日特调酒单 ({{ availableRecipes.length }})</text>

      <view class="menu-list">
        <view
          v-for="recipe in availableRecipes"
          :key="recipe.id"
          class="menu-item glass-card"
          @tap="selectRecipe(recipe)"
        >
          <view class="item-left">
            <view class="item-title-row">
              <text class="item-zh">{{ recipe.nameZh }}</text>
              <text class="item-abv">{{ recipe.calculatedAbv }}% ABV</text>
            </view>
            <text class="item-desc">{{ recipe.description }}</text>
            <view class="item-tags">
              <text v-for="t in recipe.tags.slice(0, 2)" :key="t" class="tag-pill">#{{ t }}</text>
            </view>
          </view>
          <view class="item-right">
            <button class="order-action-btn">点一杯 +</button>
          </view>
        </view>
      </view>
    </view>

    <!-- 下单弹窗 -->
    <view v-if="selectedCocktail" class="modal-mask">
      <view class="modal-card glass-card-amber">
        <view class="modal-header">
          <text class="modal-cocktail-title">点单：{{ selectedCocktail.nameZh }}</text>
          <text class="close-x" @tap="selectedCocktail = null">✕</text>
        </view>

        <view class="input-group">
          <text class="input-label">您的称呼 / 昵称：</text>
          <input
            v-model="customerName"
            type="text"
            placeholder="如：小张、沙发右侧的猫..."
            class="name-input"
          />
        </view>

        <view class="input-group">
          <text class="input-label">特殊偏好或留言：</text>
          <input
            v-model="specialNotes"
            type="text"
            placeholder="如：少放冰、要微醺淡一点、多薄荷..."
            class="name-input"
          />
        </view>

        <view class="modal-buttons">
          <button class="btn-subtle" @tap="selectedCocktail = null">取消</button>
          <button class="btn-gold confirm-btn" @tap="submitOrder">提交订单</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePartyStore } from '../../stores/party';
import { RECIPES } from '../../data/recipes';
import type { Recipe } from '../../types/recipe';

const partyStore = usePartyStore();

const session = computed(() => partyStore.session);

const availableRecipes = computed(() => {
  if (!session.value || session.value.activeRecipeIds.length === 0) {
    return RECIPES.slice(0, 5);
  }
  return RECIPES.filter(r => session.value!.activeRecipeIds.includes(r.id));
});

const selectedCocktail = ref<Recipe | null>(null);
const customerName = ref('');
const specialNotes = ref('');

function selectRecipe(r: Recipe) {
  selectedCocktail.value = r;
  customerName.value = '';
  specialNotes.value = '';
}

function submitOrder() {
  if (!selectedCocktail.value) return;
  const name = customerName.value.trim() || '神秘酒客';

  partyStore.placeOrder(
    selectedCocktail.value.id,
    selectedCocktail.value.nameZh,
    name,
    specialNotes.value.trim()
  );

  uni.showToast({
    title: '点单成功！调酒师正在准备~',
    icon: 'success'
  });

  selectedCocktail.value = null;
}
</script>

<style scoped lang="scss">
.order-container {
  background-color: #0E0F14;
  min-height: 100vh;
  padding: 30rpx 30rpx 100rpx 30rpx;
}

.welcome-card {
  padding: 32rpx;
  margin-bottom: 34rpx;
}

.bar-title {
  font-size: 40rpx;
  font-weight: 800;
  color: #FDE68A;
  display: block;
}

.bar-welcome {
  font-size: 24rpx;
  color: #D1D5DB;
  font-style: italic;
  margin-top: 12rpx;
  margin-bottom: 20rpx;
  display: block;
  line-height: 1.5;
}

.host-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(245, 158, 11, 0.2);
  padding-top: 16rpx;
}

.host-tag {
  font-size: 22rpx;
  color: #9CA3AF;
}

.open-status {
  font-size: 22rpx;
  color: #10B981;
  font-weight: 700;
}

.closed-status {
  font-size: 22rpx;
  color: #EF4444;
  font-weight: 700;
}

.menu-section {
  display: flex;
  flex-direction: column;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 20rpx;
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.menu-item {
  padding: 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.item-left {
  flex: 1;
  padding-right: 20rpx;
}

.item-title-row {
  display: flex;
  align-items: baseline;
  gap: 16rpx;
  margin-bottom: 8rpx;
}

.item-zh {
  font-size: 32rpx;
  font-weight: 700;
  color: #FFFFFF;
}

.item-abv {
  font-size: 22rpx;
  color: #F59E0B;
  font-weight: 700;
}

.item-desc {
  font-size: 22rpx;
  color: #9CA3AF;
  line-height: 1.4;
  display: block;
  margin-bottom: 12rpx;
}

.item-tags {
  display: flex;
  gap: 10rpx;
}

.tag-pill {
  font-size: 18rpx;
  color: #6B7280;
  background: rgba(255, 255, 255, 0.04);
  padding: 2rpx 12rpx;
  border-radius: 6rpx;
}

.order-action-btn {
  background: #F59E0B;
  color: #000000;
  font-size: 22rpx;
  font-weight: 700;
  padding: 10rpx 24rpx;
  border-radius: 999rpx;
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
  padding: 36rpx;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28rpx;
}

.modal-cocktail-title {
  font-size: 32rpx;
  font-weight: 800;
  color: #FDE68A;
}

.close-x {
  font-size: 32rpx;
  color: #9CA3AF;
  padding: 6rpx;
}

.input-group {
  margin-bottom: 24rpx;
}

.input-label {
  font-size: 22rpx;
  color: #9CA3AF;
  display: block;
  margin-bottom: 10rpx;
}

.name-input {
  width: 100%;
  height: 80rpx;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14rpx;
  padding: 0 20rpx;
  font-size: 24rpx;
  color: #FFFFFF;
  box-sizing: border-box;
}

.modal-buttons {
  display: flex;
  gap: 20rpx;
  margin-top: 36rpx;
}

.confirm-btn {
  flex: 1;
}
</style>
