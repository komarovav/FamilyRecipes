export type RecipeCategory = 'Завтрак' | 'Обед' | 'Ужин' | 'Перекус'

export type RecipeIngredient = {
  name: string
  amount: number
  unit: string
}

export type Recipe = {
  id: string
  title: string
  description: string
  photo?: string
  category: RecipeCategory
  cookTime: number // в минутах
  servings: number
  source: string
  ingredients: RecipeIngredient[]
}

// Тестовые данные для бутафории — реальные данные будут приходить с бэкенда
export const recipes: Recipe[] = [
  {
    id: '1',
    title: 'Бабушкины оладьи',
    description: 'Пышные оладьи на кефире, любимый завтрак на выходных.',
    category: 'Завтрак',
    cookTime: 30,
    servings: 4,
    source: 'Бабушка',
    ingredients: [
      { name: 'Кефир', amount: 500, unit: 'мл' },
      { name: 'Мука', amount: 300, unit: 'г' },
      { name: 'Яйцо', amount: 2, unit: 'шт' },
      { name: 'Сахар', amount: 2, unit: 'ст. л.' },
    ],
  },
  {
    id: '2',
    title: 'Борщ по-семейному',
    description: 'Наваристый борщ с говядиной, готовим по воскресеньям.',
    category: 'Обед',
    cookTime: 120,
    servings: 6,
    source: 'Мама',
    ingredients: [
      { name: 'Говядина', amount: 600, unit: 'г' },
      { name: 'Свёкла', amount: 2, unit: 'шт' },
      { name: 'Капуста', amount: 300, unit: 'г' },
      { name: 'Картофель', amount: 4, unit: 'шт' },
    ],
  },
  {
    id: '3',
    title: 'Запечённая курица с овощами',
    description: 'Простой ужин в духовке, минимум хлопот.',
    category: 'Ужин',
    cookTime: 60,
    servings: 4,
    source: 'Папа',
    ingredients: [
      { name: 'Курица', amount: 1, unit: 'шт' },
      { name: 'Картофель', amount: 5, unit: 'шт' },
      { name: 'Морковь', amount: 2, unit: 'шт' },
    ],
  },
  {
    id: '4',
    title: 'Творожные сырники',
    description: 'Быстрый и вкусный перекус с домашним творогом.',
    category: 'Перекус',
    cookTime: 20,
    servings: 3,
    source: 'Прабабушка',
    ingredients: [
      { name: 'Творог', amount: 400, unit: 'г' },
      { name: 'Мука', amount: 100, unit: 'г' },
      { name: 'Яйцо', amount: 1, unit: 'шт' },
    ],
  },
]
