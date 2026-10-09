import type { Recipe } from '../types/recipe';
import { IBA_RECIPES } from './recipes/iba';
import { CONVENIENCE_RECIPES } from './recipes/convenience';
import { TEA_RECIPES } from './recipes/tea';
import { MOCKTAIL_RECIPES } from './recipes/mocktail';

export const RECIPES: Recipe[] = [
  ...IBA_RECIPES,
  ...CONVENIENCE_RECIPES,
  ...TEA_RECIPES,
  ...MOCKTAIL_RECIPES,
];

export const RECIPES_MAP = new Map<string, Recipe>(
  RECIPES.map(item => [item.id, item])
);
