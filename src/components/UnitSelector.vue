<template>
  <view class="unit-selector">
    <view
      v-for="unit in units"
      :key="unit.value"
      class="unit-item"
      :class="{ active: modelValue === unit.value }"
      @tap="$emit('update:modelValue', unit.value)"
    >
      <text class="unit-label">{{ unit.label }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { VolumeUnit } from '../utils/unit';

defineProps<{
  modelValue: VolumeUnit;
}>();

defineEmits<{
  (e: 'update:modelValue', val: VolumeUnit): void;
}>();

const units: { label: string; value: VolumeUnit }[] = [
  { label: 'ml (毫升)', value: 'ml' },
  { label: 'oz (盎司)', value: 'oz' },
  { label: '瓶盖 (约5ml)', value: 'cap' },
  { label: '汤勺 (约15ml)', value: 'spoon' },
];
</script>

<style scoped lang="scss">
.unit-selector {
  display: flex;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 999rpx;
  padding: 6rpx;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.unit-item {
  flex: 1;
  text-align: center;
  padding: 10rpx 0;
  border-radius: 999rpx;
  transition: all 0.2s ease;
}

.unit-item.active {
  background: #F59E0B;
  box-shadow: 0 4rpx 12rpx rgba(245, 158, 11, 0.35);
}

.unit-label {
  font-size: 22rpx;
  color: #9CA3AF;
  font-weight: 500;
}

.unit-item.active .unit-label {
  color: #000000;
  font-weight: 700;
}
</style>
