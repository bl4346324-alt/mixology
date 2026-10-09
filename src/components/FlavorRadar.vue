<template>
  <view class="radar-container">
    <!-- SVG 5维风味雷达图 (兼容各端与微信小程序) -->
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" class="radar-svg">
      <!-- 刻度底网 (20%, 40%, 60%, 80%, 100%) -->
      <polygon
        v-for="scale in [0.2, 0.4, 0.6, 0.8, 1.0]"
        :key="scale"
        :points="getPolygonPoints(scale)"
        fill="none"
        stroke="rgba(255, 255, 255, 0.08)"
        stroke-width="1"
      />

      <!-- 5 根辐射轴线 -->
      <line
        v-for="(point, idx) in axisPoints"
        :key="'axis_' + idx"
        :x1="center"
        :y1="center"
        :x2="point.x"
        :y2="point.y"
        stroke="rgba(255, 255, 255, 0.12)"
        stroke-width="1"
      />

      <!-- 填充的风味多边形 -->
      <polygon
        :points="dataPolygonPoints"
        fill="rgba(245, 158, 11, 0.25)"
        stroke="#F59E0B"
        stroke-width="2"
      />

      <!-- 5个数据顶点高亮点 -->
      <circle
        v-for="(point, idx) in dataPoints"
        :key="'dot_' + idx"
        :cx="point.x"
        :cy="point.y"
        r="3.5"
        fill="#FDE68A"
        stroke="#F59E0B"
        stroke-width="1.5"
      />

      <!-- 维度文字标签 -->
      <text
        v-for="(label, idx) in labelConfigs"
        :key="'label_' + idx"
        :x="label.x"
        :y="label.y"
        text-anchor="middle"
        dominant-baseline="central"
        fill="#9CA3AF"
        font-size="11"
        font-weight="500"
      >
        {{ label.name }}
      </text>
    </svg>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { FlavorProfile } from '../types/recipe';

const props = withDefaults(
  defineProps<{
    flavor: FlavorProfile;
    size?: number;
  }>(),
  {
    size: 220,
  }
);

const center = computed(() => props.size / 2);
const radius = computed(() => (props.size / 2) - 30); // 留出文字边距

// 5 个轴：甜度、酸度、烈度、苦度、清爽度
const dimensions = [
  { key: 'sweetness', name: '甜度' },
  { key: 'sourness', name: '酸度' },
  { key: 'strength', name: '烈度' },
  { key: 'bitterness', name: '苦度' },
  { key: 'refreshment', name: '清爽' },
];

// 计算角度 (以正上方为起点: -90 度)
function getAngle(idx: number): number {
  return (idx * (360 / 5) - 90) * (Math.PI / 180);
}

// 刻度底网多边形
function getPolygonPoints(scale: number): string {
  const r = radius.value * scale;
  return dimensions
    .map((_, idx) => {
      const angle = getAngle(idx);
      const x = center.value + r * Math.cos(angle);
      const y = center.value + r * Math.sin(angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

// 5 根外周顶点坐标
const axisPoints = computed(() => {
  return dimensions.map((_, idx) => {
    const angle = getAngle(idx);
    return {
      x: center.value + radius.value * Math.cos(angle),
      y: center.value + radius.value * Math.sin(angle),
    };
  });
});

// 数据点坐标 (数值 1-5 归一化为 0.2 - 1.0)
const dataPoints = computed(() => {
  return dimensions.map((dim, idx) => {
    const val = (props.flavor as any)[dim.key] ?? 1;
    const ratio = Math.max(0.15, Math.min(1.0, val / 5));
    const angle = getAngle(idx);
    return {
      x: center.value + radius.value * ratio * Math.cos(angle),
      y: center.value + radius.value * ratio * Math.sin(angle),
    };
  });
});

const dataPolygonPoints = computed(() => {
  return dataPoints.value.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
});

// 标签文字坐标 (向外扩展一段距离)
const labelConfigs = computed(() => {
  const labelRadius = radius.value + 16;
  return dimensions.map((dim, idx) => {
    const angle = getAngle(idx);
    return {
      name: dim.name,
      x: center.value + labelRadius * Math.cos(angle),
      y: center.value + labelRadius * Math.sin(angle),
    };
  });
});
</script>

<style scoped>
.radar-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10rpx;
}
.radar-svg {
  display: block;
}
</style>
