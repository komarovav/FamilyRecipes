const API_URL = "http://localhost:8000";

export type IngredientInput = {
  name: string;
  amount?: number | null;
  unit?: string | null;
};

export type RecipeCreate = {
  title: string;
  description?: string;
  cooking_time?: number | null;
  servings?: number | null;
  meal_type?: string | null;
  source?: string | null;
  image_url?: string | null;
  ingredients: IngredientInput[];
};

export type Recipe = {
  id: number;
  title: string;
  description?: string | null;
  cooking_time?: number | null;
  servings?: number | null;
  meal_type?: string | null;
  source?: string | null;
  image_url?: string | null;
  ingredients: {
    name: string;
    amount?: number | null;
    unit?: string | null;
  }[];
};

export async function createRecipe(
  data: RecipeCreate,
  token: string
): Promise<Recipe> {
  const res = await fetch(`${API_URL}/recipes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(
      typeof error.detail === "string"
        ? error.detail
        : "Не удалось создать рецепт"
    );
  }

  return res.json();
}

export async function getRecipes(token: string): Promise<Recipe[]> {
  const res = await fetch(`${API_URL}/recipes`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(
      typeof error.detail === "string"
        ? error.detail
        : "Не удалось загрузить рецепты"
    );
  }

  return res.json();
}

export async function getRecipe(
  id: number | string,
  token: string
): Promise<Recipe> {
  const res = await fetch(`${API_URL}/recipes/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(
      typeof error.detail === "string" ? error.detail : "Рецепт не найден"
    );
  }

  return res.json();
}