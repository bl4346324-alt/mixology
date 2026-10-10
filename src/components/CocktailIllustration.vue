<template>
  <view class="cocktail-illus-wrap">
    <image
      class="glass-img"
      :src="displayImageSrc"
      mode="aspectFit"
      @error="handleImageError"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { GlasswareType } from '../types/recipe';

const props = withDefaults(
  defineProps<{
    glassType: GlasswareType | string;
    themeColor?: string;
    recipeId?: string;
    coverImage?: string;
  }>(),
  {
    glassType: 'highball',
    themeColor: '#B45309',
    recipeId: '',
    coverImage: '',
  }
);

const isImageError = ref(false);

watch(
  () => props.recipeId,
  () => {
    isImageError.value = false;
  }
);

function handleImageError() {
  isImageError.value = true;
}

const displayImageSrc = computed(() => {
  if (isImageError.value) {
    return '/static/recipes/long_island_iced_tea.png';
  }

  // 1. 外部显式传入的 coverImage
  if (props.coverImage && props.coverImage.trim()) {
    return props.coverImage;
  }

  // 2. 本地静态资源目录中的专属 PNG 文件
  if (props.recipeId && props.recipeId.trim()) {
    return `/static/recipes/${props.recipeId}.png`;
  }

  return '/static/recipes/long_island_iced_tea.png';
});
</script>

<style scoped lang="scss">
:host {
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
}

.cocktail-illus-wrap {
  width: 360rpx;
  height: 420rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.glass-img {
  width: 360rpx;
  height: 420rpx;
  display: block;
}
</style>
