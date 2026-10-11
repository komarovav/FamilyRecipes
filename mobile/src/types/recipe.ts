export type RecipeCategory = 'Завтрак' | 'Обед' | 'Ужин' | 'Перекус'

export type RecipeIngredient = {
  name: string
  amount: number
  unit: string
}

export type Recipe = {
  id: string;
  title: string;
  description: string;
  category: string;
  cookTime: number;
  servings: number;
  source: string;
  photo?: string;
ingredients: RecipeIngredient[]
};