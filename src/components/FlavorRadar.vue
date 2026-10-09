<template>
  <view class="radar-wrapper">
    <!-- 1. 原生 Canvas 雷达图 (彻底兼容微信小程序与各端) -->
    <view class="canvas-box">
      <canvas
        :canvas-id="uniqueCanvasId"
        :id="uniqueCanvasId"
        class="flavor-canvas"
        :style="{ width: size + 'px', height: size + 'px' }"
      ></canvas>
    </view>

    <!-- 2. 五维风味量化进度卡片 (直观读数与风味描述) -->
    <view class="flavor-bars">
      <view
        v-for="dim in dimensionList"
        :key="dim.key"
        class="bar-row"
      >
        <view class="bar-label-group">
          <text class="bar-icon">{{ dim.icon }}</text>
          <text class="bar-name">{{ dim.name }}</text>
        </view>

        <!-- 5格胶囊进度槽 -->
        <view class="capsule-track">
          <view
            v-for="step in 5"
            :key="step"
            class="capsule-step"
            :class="{ active: step <= dim.value }"
          ></view>
        </view>

        <view class="bar-value-group">
          <text class="bar-desc">{{ dim.desc }}</text>
          <text class="bar-score">{{ dim.value }}/5</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, watch, getCurrentInstance, ref } from 'vue';
import type { FlavorProfile } from '../types/recipe';

const props = withDefaults(
  defineProps<{
    flavor: FlavorProfile;
    size?: number;
  }>(),
  {
    size: 200,
  }
);

const instance = getCurrentInstance();
const uniqueCanvasId = ref('flavor_canvas_' + Math.random().toString(36).substring(2, 8));

const dimensionsConfig = [
  { 
    key: 'sweetness', 
    name: '甜度', 
    icon: '🍭',
    descs: ['极干爽', '微甜', '适中清甜', '甜美浓郁', '高甜丝滑'] 
  },
  { 
    key: 'sourness', 
    name: '酸度', 
    icon: '🍋',
    descs: ['无酸感', '柔和果酸', '酸甜平衡', '鲜亮明亮', '锐利高酸'] 
  },
  { 
    key: 'strength', 
    name: '烈度', 
    icon: '🥃',
    descs: ['零酒精', '轻微醺', '醇厚平衡', '劲道饱满', '烈度硬汉'] 
  },
  { 
    key: 'bitterness', 
    name: '苦度', 
    icon: '🌿',
    descs: ['无苦味', '草本微香', '清苦回甘', '典型苦香', '深邃重苦'] 
  },
  { 
    key: 'refreshment', 
    name: '清爽', 
    icon: '🫧',
    descs: ['醇厚低沉', '温润柔滑', '适度清爽', '充盈气泡', '极冰爽快'] 
  },
];

const dimensionList = computed(() => {
  return dimensionsConfig.map(cfg => {
    const val = (props.flavor as any)?.[cfg.key] ?? 1;
    const clampedVal = Math.max(1, Math.min(5, Math.round(val)));
    return {
      key: cfg.key,
      name: cfg.name,
      icon: cfg.icon,
      value: clampedVal,
      desc: cfg.descs[clampedVal - 1] || '风味平衡',
    };
  });
});

function drawRadar() {
  // 使用 uni.createCanvasContext 兼容微信小程序
  const ctx = uni.createCanvasContext(uniqueCanvasId.value, instance?.proxy);
  if (!ctx) return;

  const size = props.size;
  const center = size / 2;
  const radius = center - 30; // 留出文字边距

  // 1. 绘制网格刻度环 (25%, 50%, 75%, 100%)
  for (const scale of [0.25, 0.5, 0.75, 1.0]) {
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 72 - 90) * Math.PI / 180;
      const x = center + radius * scale * Math.cos(angle);
      const y = center + radius * scale * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.setStrokeStyle('rgba(255, 255, 255, 0.1)');
    ctx.setLineWidth(1);
    ctx.stroke();
  }

  // 2. 绘制 5 根辐射中心轴
  for (let i = 0; i < 5; i++) {
    const angle = (i * 72 - 90) * Math.PI / 180;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.lineTo(x, y);
    ctx.setStrokeStyle('rgba(255, 255, 255, 0.12)');
    ctx.setLineWidth(1);
    ctx.stroke();
  }

  // 3. 绘制风味多边形
  const dimKeys = ['sweetness', 'sourness', 'strength', 'bitterness', 'refreshment'];
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const val = (props.flavor as any)?.[dimKeys[i]] ?? 1;
    const ratio = Math.max(0.2, Math.min(1.0, val / 5));
    const angle = (i * 72 - 90) * Math.PI / 180;
    const x = center + radius * ratio * Math.cos(angle);
    const y = center + radius * ratio * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.setFillStyle('rgba(245, 158, 11, 0.35)');
  ctx.fill();
  ctx.setStrokeStyle('#F59E0B');
  ctx.setLineWidth(2);
  ctx.stroke();

  // 4. 绘制顶点金光圆点
  for (let i = 0; i < 5; i++) {
    const val = (props.flavor as any)?.[dimKeys[i]] ?? 1;
    const ratio = Math.max(0.2, Math.min(1.0, val / 5));
    const angle = (i * 72 - 90) * Math.PI / 180;
    const x = center + radius * ratio * Math.cos(angle);
    const y = center + radius * ratio * Math.sin(angle);
    ctx.beginPath();
    ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    ctx.setFillStyle('#FDE68A');
    ctx.fill();
    ctx.setStrokeStyle('#F59E0B');
    ctx.setLineWidth(1.5);
    ctx.stroke();
  }

  // 5. 绘制周边文字标签
  const names = ['甜度', '酸度', '烈度', '苦度', '清爽'];
  ctx.setFontSize(10);
  ctx.setFillStyle('#9CA3AF');
  ctx.setTextAlign('center');
  ctx.setTextBaseline('middle');
  for (let i = 0; i < 5; i++) {
    const angle = (i * 72 - 90) * Math.PI / 180;
    const x = center + (radius + 15) * Math.cos(angle);
    const y = center + (radius + 15) * Math.sin(angle);
    ctx.fillText(names[i], x, y);
  }

  ctx.draw();
}

onMounted(() => {
  setTimeout(() => {
    drawRadar();
  }, 100);
});

watch(() => props.flavor, () => {
  drawRadar();
}, { deep: true });
</script>

<style scoped lang="scss">
.radar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.canvas-box {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10rpx 0 20rpx 0;
}

.flavor-canvas {
  display: block;
}

.flavor-bars {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  background: rgba(0, 0, 0, 0.25);
  padding: 20rpx 24rpx;
  border-radius: 20rpx;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-sizing: border-box;
}

.bar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.bar-label-group {
  display: flex;
  align-items: center;
  gap: 10rpx;
  width: 120rpx;
}

.bar-icon {
  font-size: 24rpx;
}

.bar-name {
  font-size: 24rpx;
  color: #D1D5DB;
  font-weight: 500;
}

.capsule-track {
  display: flex;
  gap: 8rpx;
  flex: 1;
  padding: 0 16rpx;
}

.capsule-step {
  flex: 1;
  height: 12rpx;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999rpx;
  transition: all 0.3s ease;
}

.capsule-step.active {
  background: linear-gradient(90deg, #F59E0B, #FDE68A);
  box-shadow: 0 0 10rpx rgba(245, 158, 11, 0.4);
}

.bar-value-group {
  display: flex;
  align-items: center;
  gap: 12rpx;
  width: 180rpx;
  justify-content: flex-end;
}

.bar-desc {
  font-size: 20rpx;
  color: #F59E0B;
}

.bar-score {
  font-size: 20rpx;
  color: #9CA3AF;
  font-weight: 700;
}
</style>
