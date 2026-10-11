import { defineStore } from 'pinia';
import { ref } from 'vue';

const STORAGE_KEY_FAVORITES = 'mixocraft_favorites';
const STORAGE_KEY_LOGS = 'mixocraft_tasting_logs';

export interface TastingLog {
  id: string;
  recipeId: string;
  recipeName: string;
  rating: number;        // 1-5 星
  notes: string;         // 微醺笔记与风味感受
  createdAt: number;     // 时间戳
}

export const useFavoritesStore = defineStore('favorites', () => {
  const savedFavorites = uni.getStorageSync(STORAGE_KEY_FAVORITES);
  const favoriteIds = ref<string[]>(
    Array.isArray(savedFavorites) ? savedFavorites : ['mojito', 'gin_and_tonic']
  );

  const savedLogs = uni.getStorageSync(STORAGE_KEY_LOGS);
  const tastingLogs = ref<TastingLog[]>(
    Array.isArray(savedLogs) ? savedLogs : []
  );

  function isFavorite(recipeId: string): boolean {
    return favoriteIds.value.includes(recipeId);
  }

  function toggleFavorite(recipeId: string) {
    const idx = favoriteIds.value.indexOf(recipeId);
    if (idx >= 0) {
      favoriteIds.value.splice(idx, 1);
    } else {
      favoriteIds.value.push(recipeId);
    }
    try {
      uni.setStorageSync(STORAGE_KEY_FAVORITES, favoriteIds.value);
    } catch (e) {
      console.error(e);
    }
  }

  function addTastingLog(log: Omit<TastingLog, 'id' | 'createdAt'>) {
    const newLog: TastingLog = {
      ...log,
      id: 'log_' + Date.now(),
      createdAt: Date.now(),
    };
    tastingLogs.value.unshift(newLog);
    try {
      uni.setStorageSync(STORAGE_KEY_LOGS, tastingLogs.value);
    } catch (e) {
      console.error(e);
    }
  }

  function removeTastingLog(id: string) {
    const idx = tastingLogs.value.findIndex(l => l.id === id);
    if (idx >= 0) {
      tastingLogs.value.splice(idx, 1);
      try {
        uni.setStorageSync(STORAGE_KEY_LOGS, tastingLogs.value);
      } catch (e) {
        console.error(e);
      }
    }
  }

  return {
    favoriteIds,
    tastingLogs,
    isFavorite,
    toggleFavorite,
    addTastingLog,
    removeTastingLog,
  };
});
