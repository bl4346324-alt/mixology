<template>
  <view class="party-container">
    <!-- 头部吧台控制台 -->
    <view class="party-header glass-card-amber">
      <view class="header-top">
        <view class="bar-identity">
          <text class="bar-title">{{ currentSession?.title || '今晚微醺吧台' }}</text>
          <text class="bar-host">主理调酒师：{{ currentSession?.bartenderName || '我' }}</text>
        </view>
        <view class="status-toggle" :class="{ open: currentSession?.isOpen }" @tap="toggleOpen">
          <text>{{ currentSession?.isOpen ? '营业中 🟢' : '已暂停 🔴' }}</text>
        </view>
      </view>

      <view class="share-tips">
        <text class="tips-text">朋友通过微信扫码或点开链接即可进入点单页</text>
        <button class="btn-gold invite-btn" @tap="goToOrderPage">
          模拟客人点单体验 →
        </button>
      </view>
    </view>

    <!-- 订单队列管理 -->
    <view class="orders-section">
      <view class="section-header">
        <text class="section-title">点单队列 ({{ partyStore.orders.length }})</text>
        <text v-if="partyStore.orders.length > 0" class="clear-orders" @tap="clearAllOrders">清空历史</text>
      </view>

      <view v-if="partyStore.orders.length === 0" class="empty-orders glass-card">
        <text class="empty-icon">🔔</text>
        <text class="empty-title">当前还没有新订单</text>
        <text class="empty-sub">聚会朋友下单后，订单将第一时间在此显示并带提示声！</text>
      </view>

      <view class="order-list">
        <view
          v-for="order in partyStore.orders"
          :key="order.id"
          class="order-card glass-card"
          :class="order.status"
        >
          <view class="order-header">
            <view class="order-customer">
              <text class="cust-name">👤 {{ order.customerName }}</text>
              <text class="cust-time">{{ formatTime(order.createdAt) }}</text>
            </view>
            <view class="order-status-badge">
              <text v-if="order.status === 'pending'" class="badge-pending">待调制</text>
              <text v-else-if="order.status === 'mixing'" class="badge-mixing">正在调制</text>
              <text v-else class="badge-served">已出酒</text>
            </view>
          </view>

          <view class="order-body">
            <text class="order-cocktail">{{ order.recipeName }}</text>
            <text v-if="order.specialNotes" class="order-notes">备注：{{ order.specialNotes }}</text>
          </view>

          <!-- 房主动作切换按钮 -->
          <view class="order-actions">
            <button
              v-if="order.status === 'pending'"
              class="btn-gold order-act-btn"
              @tap="partyStore.updateOrderStatus(order.id, 'mixing')"
            >
              开始调制
            </button>
            <button
              v-else-if="order.status === 'mixing'"
              class="btn-gold order-act-btn btn-served"
              @tap="partyStore.updateOrderStatus(order.id, 'served')"
            >
              ✓ 调制完成 · 呼叫取酒
            </button>
            <text v-else class="done-label">已于刚刚出酒享用 ✨</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { usePartyStore } from '../../stores/party';

const partyStore = usePartyStore();

onMounted(() => {
  // 若未初始化会话，自动建立一个默认吧台
  if (!partyStore.session) {
    partyStore.startParty('周五微醺轰趴吧台', '家庭调酒师', ['mojito', 'gin_and_tonic', 'suntory_oolong_highball']);
  }
});

const currentSession = computed(() => partyStore.session);

function toggleOpen() {
  if (partyStore.session) {
    partyStore.togglePartyOpen(!partyStore.session.isOpen);
  }
}

function clearAllOrders() {
  uni.showModal({
    title: '清空订单',
    content: '确定要清空全部点单记录吗？',
    confirmColor: '#F59E0B',
    success: (res) => {
      if (res.confirm) {
        partyStore.orders = [];
      }
    }
  });
}

function goToOrderPage() {
  uni.navigateTo({
    url: '/pages/party/order'
  });
}

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
}
</script>

<style scoped lang="scss">
.party-container {
  background-color: #0E0F14;
  min-height: 100vh;
  padding: 30rpx 30rpx 100rpx 30rpx;
}

.party-header {
  padding: 32rpx;
  margin-bottom: 34rpx;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24rpx;
}

.bar-title {
  font-size: 38rpx;
  font-weight: 800;
  color: #FDE68A;
  display: block;
}

.bar-host {
  font-size: 22rpx;
  color: #9CA3AF;
  margin-top: 6rpx;
  display: block;
}

.status-toggle {
  background: rgba(255, 255, 255, 0.08);
  padding: 8rpx 20rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  font-weight: 600;
  color: #EF4444;
}

.status-toggle.open {
  background: rgba(16, 185, 129, 0.2);
  color: #34D399;
}

.share-tips {
  border-top: 1px solid rgba(245, 158, 11, 0.2);
  padding-top: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.tips-text {
  font-size: 22rpx;
  color: #D1D5DB;
}

.invite-btn {
  font-size: 24rpx;
}

.orders-section {
  display: flex;
  flex-direction: column;
}

.section-header {
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

.clear-orders {
  font-size: 22rpx;
  color: #9CA3AF;
}

.empty-orders {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 30rpx;
  text-align: center;
}

.empty-icon {
  font-size: 70rpx;
  margin-bottom: 16rpx;
}

.empty-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #FFFFFF;
}

.empty-sub {
  font-size: 22rpx;
  color: #9CA3AF;
  margin-top: 8rpx;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.order-card {
  padding: 24rpx;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.order-customer {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.cust-name {
  font-size: 26rpx;
  font-weight: 700;
  color: #FFFFFF;
}

.cust-time {
  font-size: 20rpx;
  color: #6B7280;
}

.badge-pending {
  background: rgba(239, 68, 68, 0.2);
  color: #F87171;
  font-size: 20rpx;
  font-weight: 700;
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
}

.badge-mixing {
  background: rgba(245, 158, 11, 0.2);
  color: #FBBF24;
  font-size: 20rpx;
  font-weight: 700;
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
}

.badge-served {
  background: rgba(16, 185, 129, 0.2);
  color: #34D399;
  font-size: 20rpx;
  font-weight: 700;
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
}

.order-body {
  margin-bottom: 20rpx;
}

.order-cocktail {
  font-size: 32rpx;
  font-weight: 800;
  color: #FDE68A;
  display: block;
}

.order-notes {
  font-size: 22rpx;
  color: #9CA3AF;
  margin-top: 6rpx;
  display: block;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
}

.order-act-btn {
  font-size: 22rpx;
  padding: 12rpx 30rpx;
}

.btn-served {
  background: linear-gradient(135deg, #10B981, #059669);
  color: #FFFFFF;
}

.done-label {
  font-size: 22rpx;
  color: #10B981;
}
</style>
