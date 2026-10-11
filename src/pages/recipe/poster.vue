<template>
  <view v-if="recipe" class="poster-container">
    <view class="poster-wrap">
      <!-- 抖音同款复古活页/拍立得手账酒卡 -->
      <view class="polaroid-card">
        <!-- 顶部主图区域与手绘酒杯插画 -->
        <view class="polaroid-visual">
          <view class="visual-badge-left">
            <text class="vol-tag">VOLUME 01</text>
            <text class="seq-tag">NO.{{ recipeIndexStr }}</text>
          </view>
          <view class="visual-abv-pill">{{ recipe.calculatedAbv }}% ABV</view>

          <!-- 居中高清手绘插画 -->
          <image
            class="polaroid-cocktail-img"
            :src="posterImageSrc"
            mode="aspectFit"
            @error="handlePosterImageError"
          />
        </view>

        <!-- 卡片主体文字与手账排版 -->
        <view class="polaroid-body">
          <view class="card-title-group">
            <text class="title-en">{{ recipe.nameEn }}</text>
            <text class="title-zh">{{ recipe.nameZh }}</text>
          </view>

          <!-- 今日微醺心境 / 金句语录 -->
          <view class="quote-box">
            <text class="quote-text">“{{ displayNotes }}”</text>
          </view>

          <!-- 黄金比例色彩分层条 (Mini Parts Ratio) -->
          <view v-if="ratioSegments.length > 0" class="mini-ratio-wrap">
            <view class="ratio-bar-track">
              <view
                v-for="seg in ratioSegments"
                :key="seg.id"
                class="ratio-bar-segment"
                :style="{ width: seg.percent + '%', backgroundColor: seg.color }"
              >
                <text v-if="seg.percent >= 14" class="seg-name">{{ seg.shortName }}</text>
              </view>
            </view>
          </view>

          <!-- 原料配方清单 (优雅双列手账) -->
          <view class="recipe-formula">
            <view class="formula-header">
              <text class="fh-title">RECIPE FORMULA</text>
              <text class="fh-method">{{ methodName }} · {{ glassName }}</text>
            </view>
            <view class="formula-grid">
              <view
                v-for="(item, idx) in recipe.ingredients"
                :key="idx"
                class="formula-row"
              >
                <text class="f-dot">•</text>
                <text class="f-name">{{ getIngredientName(item.ingredientId) }}</text>
                <text class="f-amount">
                  {{ item.customUnit ? item.customUnit : item.amountMl + ' ml' }}
                </text>
              </view>
            </view>
          </view>

          <!-- 底部水印与微醺印章 -->
          <view class="card-footer">
            <view class="footer-left">
              <text class="app-brand">杯间 · 天天调饮记</text>
              <text class="brand-en">MIXOCRAFT COCKTAIL JOURNAL</text>
              <text class="card-date">{{ todayString }} · 调饮打卡</text>
            </view>
            <view class="bar-stamp">
              <text class="stamp-stars">{{ '★'.repeat(ratingNumber) }}</text>
              <text class="stamp-text">微醺特调</text>
              <text class="stamp-sub">完饮留念</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作按钮 -->
    <view class="poster-actions">
      <button class="btn-subtle action-btn" @tap="goBack">返回</button>
      <button class="btn-gold action-btn primary-action" @tap="savePoster">📸 保存海报到相册</button>
    </view>

    <!-- 离屏 Canvas 2D 画布用于真实生成高清图片导出 -->
    <canvas
      type="2d"
      id="exportCanvas"
      class="export-canvas"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, getCurrentInstance } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { RECIPES, RECIPES_MAP } from '../../data/recipes';
import { INGREDIENTS_MAP } from '../../data/ingredients';
import type { Recipe } from '../../types/recipe';

const instance = getCurrentInstance();

const recipeId = ref('');
const customRecipe = ref<Recipe | null>(null);
const userRating = ref(5);
const userNotes = ref('');
const isImageError = ref(false);

onLoad((query) => {
  if (query && query.id) {
    recipeId.value = query.id;
  }
  if (query && query.rating) {
    userRating.value = Number(query.rating) || 5;
  }
  if (query && query.notes) {
    userNotes.value = decodeURIComponent(query.notes);
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
      console.error('Failed to load custom recipe in poster', e);
    }
  }
});

const recipe = computed<Recipe | undefined>(() => {
  if (customRecipe.value && customRecipe.value.id === recipeId.value) {
    return customRecipe.value;
  }
  return RECIPES_MAP.get(recipeId.value);
});

function handlePosterImageError() {
  isImageError.value = true;
}

const posterImageSrc = computed(() => {
  if (!recipe.value) return '/static/recipes/long_island_iced_tea.png';
  if (isImageError.value) return '/static/recipes/long_island_iced_tea.png';
  if (recipe.value.coverImage && recipe.value.coverImage.trim()) {
    return recipe.value.coverImage;
  }
  if (recipe.value.id.startsWith('ai_')) {
    return recipe.value.category === 'mocktail'
      ? '/static/recipes/dongfang_shuye_highball.png'
      : '/static/recipes/suntory_oolong_highball.png';
  }
  return `/static/recipes/${recipe.value.id}.png`;
});

const recipeIndexStr = computed(() => {
  if (!recipe.value) return '01';
  const idx = RECIPES.findIndex(r => r.id === recipe.value?.id);
  if (idx >= 0) {
    return String(idx + 1).padStart(2, '0');
  }
  return '01';
});

const displayNotes = computed(() => {
  if (userNotes.value && userNotes.value.trim()) {
    return userNotes.value;
  }
  return recipe.value?.description || '在杯中摇晃夜色，让微醺治愈疲惫。';
});

const ratingNumber = computed(() => {
  return Math.min(5, Math.max(1, userRating.value));
});

function getIngredientName(id: string): string {
  return INGREDIENTS_MAP.get(id)?.nameZh || id;
}

const methodName = computed(() => {
  if (!recipe.value) return '';
  switch (recipe.value.method) {
    case 'shake': return '摇和法';
    case 'stir': return '搅拌法';
    case 'build': return '直调法';
    case 'muddle': return '捣碎法';
    default: return '混合法';
  }
});

const glassName = computed(() => {
  if (!recipe.value) return '专用杯';
  switch (recipe.value.glass) {
    case 'martini': return '马天尼杯';
    case 'highball': return '高球杯';
    case 'old_fashioned': return '古典杯';
    case 'coupe': return '浅碟香槟杯';
    case 'mule_mug': return '铜骡杯';
    default: return '专用杯';
  }
});

const todayString = computed(() => {
  const d = new Date();
  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return `${d.getFullYear()}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getDate().toString().padStart(2, '0')} ${weekDays[d.getDay()]}`;
});

// Mini 黄金比例色条计算
interface RatioSegment {
  id: string;
  shortName: string;
  percent: number;
  color: string;
}

const INGREDIENT_COLORS: Record<string, string> = {
  gin: '#6EE7B7',
  london_dry_gin: '#6EE7B7',
  vodka: '#93C5FD',
  white_rum: '#FDE68A',
  dark_rum: '#D97706',
  tequila: '#FBBF24',
  bourbon_whiskey: '#EA580C',
  rye_whiskey: '#C2410C',
  scotch_whiskey: '#B45309',
  whiskey: '#B45309',
  cognac: '#9A3412',
  cointreau: '#F97316',
  triple_sec: '#FB923C',
  kahlua: '#78350F',
  baileys: '#F59E0B',
  campari: '#EF4444',
  aperol: '#F97316',
  sweet_vermouth: '#DC2626',
  dry_vermouth: '#A3E635',
  lemon_juice: '#FACC15',
  lime_juice: '#84CC16',
  cola: '#78350F',
  soda_water: '#BAE6FD',
  tonic_water: '#7DD3FC',
  iced_tea: '#B45309',
};

const defaultColors = ['#F59E0B', '#3B82F6', '#10B981', '#EC4899', '#8B5CF6', '#14B8A6'];

const ratioSegments = computed<RatioSegment[]>(() => {
  if (!recipe.value) return [];
  const liquids = recipe.value.ingredients.filter(item => item.amountMl && item.amountMl > 0);
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

// 保存海报逻辑（全面使用微信小程序现代 Canvas 2D 接口，杜绝旧版 Canvas 回调卡死及路径解析问题）
function savePoster() {
  uni.showLoading({ title: '正在绘制海报...', mask: true });

  const query = uni.createSelectorQuery().in(instance?.proxy);
  query.select('#exportCanvas')
    .fields({ node: true, size: true })
    .exec((res) => {
      if (!res || !res[0] || !res[0].node) {
        console.error('Canvas 2D node not found', res);
        uni.hideLoading();
        uni.showToast({
          title: '画布初始化失败，请重试',
          icon: 'none'
        });
        return;
      }

      const canvas = res[0].node;
      const ctx = canvas.getContext('2d');

      const logicalW = 700;
      const logicalH = 1100;
      const dpr = 2; // Retina 2x 高清 (1400 x 2200)

      canvas.width = logicalW * dpr;
      canvas.height = logicalH * dpr;
      ctx.scale(dpr, dpr);

      const renderAllAndExport = (cocktailImg: any) => {
        // 1. 背景卡片
        ctx.fillStyle = '#FAF7F2';
        ctx.fillRect(0, 0, logicalW, logicalH);

        // 2. 顶部主视觉内衬
        ctx.fillStyle = '#F3EFEA';
        ctx.fillRect(36, 36, logicalW - 72, 430);

        // 3. 绘制手绘鸡尾酒插画 (居中且保持宽高比)
        if (cocktailImg && cocktailImg.width && cocktailImg.height) {
          const maxW = 280;
          const maxH = 340;
          let drawW = maxW;
          let drawH = maxH;
          const aspect = cocktailImg.width / cocktailImg.height;
          if (aspect > maxW / maxH) {
            drawW = maxW;
            drawH = maxW / aspect;
          } else {
            drawH = maxH;
            drawW = maxH * aspect;
          }
          drawW = Math.round(drawW);
          drawH = Math.round(drawH);
          const imgX = Math.round((logicalW - drawW) / 2);
          const imgY = Math.round(36 + (430 - drawH) / 2 + 15);
          try {
            ctx.drawImage(cocktailImg, imgX, imgY, drawW, drawH);
          } catch (err) {
            console.error('Canvas drawImage error:', err);
          }
        }

        // 4. 绘制文字信息
        ctx.fillStyle = '#9CA3AF';
        ctx.font = 'normal 22px sans-serif';
        ctx.fillText(`VOLUME 01 · NO.${recipeIndexStr.value}`, 56, 76);

        ctx.fillStyle = '#B45309';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText(`${recipe.value?.calculatedAbv}% ABV`, logicalW - 170, 76);

        // 5. 中文大字标题与英文
        ctx.fillStyle = '#4B5563';
        ctx.font = 'italic 26px Georgia, serif';
        ctx.fillText(recipe.value?.nameEn || '', 56, 520);

        ctx.fillStyle = '#111827';
        ctx.font = 'bold 44px sans-serif';
        ctx.fillText(recipe.value?.nameZh || '', 56, 580);

        // 6. 金句语录
        ctx.fillStyle = '#6B7280';
        ctx.font = 'normal 22px sans-serif';
        const quote = displayNotes.value.slice(0, 30);
        ctx.fillText(`“${quote}”`, 56, 630);

        // 7. 比例条
        let startX = 56;
        const barY = 665;
        const barWidth = logicalW - 112;
        const barHeight = 24;
        for (const seg of ratioSegments.value) {
          const sw = (seg.percent / 100) * barWidth;
          ctx.fillStyle = seg.color;
          ctx.fillRect(startX, barY, sw, barHeight);
          startX += sw;
        }

        // 8. 配方清单
        ctx.fillStyle = '#9CA3AF';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('RECIPE FORMULA', 56, 730);

        let formY = 770;
        if (recipe.value) {
          for (const item of recipe.value.ingredients.slice(0, 5)) {
            ctx.fillStyle = '#374151';
            ctx.font = 'normal 22px sans-serif';
            ctx.fillText(`• ${getIngredientName(item.ingredientId)}`, 56, formY);

            ctx.fillStyle = '#B45309';
            ctx.font = 'bold 22px sans-serif';
            const vol = item.customUnit ? item.customUnit : `${item.amountMl} ml`;
            ctx.fillText(vol, logicalW - 180, formY);
            formY += 40;
          }
        }

        // 9. 底部品牌与印章
        ctx.fillStyle = '#9CA3AF';
        ctx.font = 'normal 20px sans-serif';
        ctx.fillText('杯间 · 天天调饮记', 56, logicalH - 80);
        ctx.fillText(todayString.value, 56, logicalH - 50);

        // 印章
        ctx.strokeStyle = '#DC2626';
        ctx.lineWidth = 3;
        ctx.strokeRect(logicalW - 190, logicalH - 120, 140, 70);
        ctx.fillStyle = '#DC2626';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText('微醺特调', logicalW - 175, logicalH - 86);
        ctx.font = 'normal 16px sans-serif';
        ctx.fillText('完饮留念', logicalW - 165, logicalH - 62);

        // 10. Canvas 2D 导出到临时文件（无需 ctx.draw 回调，同层渲染直接读取内存缓冲区）
        uni.canvasToTempFilePath({
          canvas,
          destWidth: logicalW * dpr,
          destHeight: logicalH * dpr,
          success: (tempRes) => {
            uni.hideLoading();
            uni.saveImageToPhotosAlbum({
              filePath: tempRes.tempFilePath,
              success: () => {
                uni.showToast({
                  title: '📸 海报已保存至相册！',
                  icon: 'success',
                  duration: 2000
                });
              },
              fail: (err) => {
                console.warn('saveImageToPhotosAlbum fail:', err);
                uni.showToast({
                  title: '请在手机微信中长按保存',
                  icon: 'none'
                });
              }
            });
          },
          fail: (err) => {
            console.error('canvasToTempFilePath fail:', err);
            uni.hideLoading();
            uni.showToast({
              title: '海报导出失败，请重试',
              icon: 'none'
            });
          }
        }, instance?.proxy);
      };

      // 创建图片对象并监听加载
      const rawSrc = posterImageSrc.value;
      if (!rawSrc) {
        renderAllAndExport(null);
        return;
      }

      let isImageHandled = false;
      const img = canvas.createImage();

      // 超时熔断保护：若图片加载超过 800ms，不等图片直接渲染导出，绝不卡死
      const imgTimeout = setTimeout(() => {
        if (!isImageHandled) {
          isImageHandled = true;
          console.warn('Image load timed out in canvas 2d, rendering text only');
          renderAllAndExport(null);
        }
      }, 800);

      img.onload = () => {
        if (!isImageHandled) {
          isImageHandled = true;
          clearTimeout(imgTimeout);
          renderAllAndExport(img);
        }
      };

      img.onerror = (err) => {
        if (!isImageHandled) {
          isImageHandled = true;
          clearTimeout(imgTimeout);
          console.warn('Image load error in canvas 2d', err);
          renderAllAndExport(null);
        }
      };

      // 赋值根绝对路径
      img.src = rawSrc;
    });
}

function goBack() {
  uni.navigateBack();
}
</script>

<style scoped lang="scss">
.poster-container {
  background-color: #0E0F14;
  min-height: 100vh;
  padding: 40rpx 30rpx 120rpx 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
}

.poster-wrap {
  width: 100%;
  display: flex;
  justify-content: center;
}

/* 拍立得/微醺手账卡片本体 */
.polaroid-card {
  width: 640rpx;
  background: #FAF7F2;
  border-radius: 36rpx;
  overflow: hidden;
  box-shadow: 0 24rpx 70rpx rgba(0, 0, 0, 0.65), 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 顶部视觉区域 */
.polaroid-visual {
  height: 440rpx;
  background: #F3EFEA;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 20rpx;
}

.visual-badge-left {
  position: absolute;
  top: 24rpx;
  left: 28rpx;
  display: flex;
  align-items: baseline;
  gap: 8rpx;
  z-index: 2;
}

.vol-tag {
  font-size: 20rpx;
  font-weight: 800;
  color: #9CA3AF;
  letter-spacing: 0.5px;
}

.seq-tag {
  font-size: 24rpx;
  font-weight: 800;
  color: #111827;
}

.visual-abv-pill {
  position: absolute;
  top: 24rpx;
  right: 28rpx;
  background: #FEF3C7;
  color: #92400E;
  border: 1px solid #FDE68A;
  font-size: 20rpx;
  font-weight: 800;
  padding: 6rpx 18rpx;
  border-radius: 999rpx;
  z-index: 2;
}

.polaroid-cocktail-img {
  width: 320rpx;
  height: 380rpx;
  display: block;
  z-index: 1;
}

/* 卡片排版主体 */
.polaroid-body {
  padding: 34rpx 36rpx;
}

.card-title-group {
  margin-bottom: 12rpx;
}

.title-en {
  font-size: 26rpx;
  font-style: italic;
  font-family: 'Baskerville', 'Georgia', 'Times New Roman', serif;
  color: #4B5563;
  letter-spacing: 0.5px;
  display: block;
}

.title-zh {
  font-size: 46rpx;
  font-weight: 900;
  color: #111827;
  letter-spacing: 1.5rpx;
  line-height: 1.2;
  margin-top: 4rpx;
  display: block;
  font-family: -apple-system, 'PingFang SC', sans-serif;
}

.quote-box {
  margin: 14rpx 0 20rpx 0;
}

.quote-text {
  font-size: 22rpx;
  color: #6B7280;
  line-height: 1.5;
  display: block;
  font-style: italic;
}

/* 黄金比例色条 */
.mini-ratio-wrap {
  margin-bottom: 24rpx;
}

.ratio-bar-track {
  width: 100%;
  height: 36rpx;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 10rpx;
  overflow: hidden;
  display: flex;
}

.ratio-bar-segment {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.seg-name {
  font-size: 16rpx;
  font-weight: 800;
  color: #111827;
  white-space: nowrap;
}

/* 配方清单 */
.recipe-formula {
  background: #F3EFEA;
  border-radius: 18rpx;
  padding: 22rpx 24rpx;
  margin-bottom: 30rpx;
}

.formula-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14rpx;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding-bottom: 8rpx;
}

.fh-title {
  font-size: 18rpx;
  font-weight: 800;
  color: #9CA3AF;
  letter-spacing: 1px;
}

.fh-method {
  font-size: 18rpx;
  color: #6B7280;
  font-weight: 600;
}

.formula-grid {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.formula-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 22rpx;
  padding: 4rpx 0;
}

.f-dot {
  color: #B45309;
  font-size: 20rpx;
  margin-right: 6rpx;
}

.f-name {
  color: #374151;
  font-weight: 600;
  flex: 1;
}

.f-amount {
  color: #B45309;
  font-weight: 800;
  font-family: -apple-system, sans-serif;
}

/* 底部水印与印章 */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-top: 10rpx;
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
}

.footer-left {
  display: flex;
  flex-direction: column;
}

.app-brand {
  font-size: 22rpx;
  font-weight: 800;
  color: #111827;
  letter-spacing: 0.5px;
}

.brand-en {
  font-size: 16rpx;
  font-weight: 700;
  color: #9CA3AF;
  letter-spacing: 0.5px;
  margin-top: 2rpx;
}

.card-date {
  font-size: 18rpx;
  color: #6B7280;
  margin-top: 6rpx;
}

.bar-stamp {
  border: 2px solid #DC2626;
  border-radius: 12rpx;
  padding: 6rpx 14rpx;
  transform: rotate(-6deg);
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(220, 38, 38, 0.04);
}

.stamp-stars {
  font-size: 14rpx;
  color: #DC2626;
  letter-spacing: 1px;
}

.stamp-text {
  font-size: 20rpx;
  font-weight: 900;
  color: #DC2626;
  letter-spacing: 1px;
}

.stamp-sub {
  font-size: 14rpx;
  font-weight: 700;
  color: #DC2626;
}

/* 底部操作条 */
.poster-actions {
  display: flex;
  gap: 20rpx;
  width: 640rpx;
  margin-top: 36rpx;
}

.action-btn {
  flex: 1;
  font-size: 24rpx;
  padding: 22rpx 0;
}

.primary-action {
  flex: 2;
  font-weight: 700;
}

/* 离屏 Canvas (置于可视区域内负层级，保证微信 Native 渲染管线正常触发 draw 刷新回调，绝不卡死) */
.export-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 700px;
  height: 1100px;
  z-index: -999;
  opacity: 0;
  pointer-events: none;
}
</style>
