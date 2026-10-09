export type VolumeUnit = 'ml' | 'oz' | 'cap' | 'spoon';

export const UNIT_FACTORS = {
  ml: 1,
  oz: 30,         // 1 盎司在调酒界标准约为 30ml
  cap: 5,         // 标准矿泉水瓶盖一满盖约 5ml
  spoon: 15,      // 家用标准汤勺一满勺约 15ml
};

/**
 * 格式化容量数字与单位
 * @param ml 毫升数
 * @param targetUnit 目标显示单位
 * @param portions 人份乘数 (默认 1)
 */
export function formatVolume(
  ml: number, 
  targetUnit: VolumeUnit = 'ml', 
  portions: number = 1
): string {
  if (ml <= 0) return '';
  const scaledMl = ml * portions;

  switch (targetUnit) {
    case 'oz': {
      const ozValue = scaledMl / 30;
      // 常见盎司整除或半格显示
      if (Math.abs(ozValue - Math.round(ozValue)) < 0.05) {
        return `${Math.round(ozValue)} oz`;
      }
      return `${ozValue.toFixed(1)} oz`;
    }
    case 'cap': {
      const caps = Math.round(scaledMl / 5);
      return `约 ${caps} 瓶盖`;
    }
    case 'spoon': {
      const spoons = (scaledMl / 15).toFixed(1);
      return `约 ${spoons} 汤勺`;
    }
    case 'ml':
    default:
      return `${Math.round(scaledMl)} ml`;
  }
}
