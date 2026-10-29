const API_URL = "http://10.120.159.241:8000";

import * as FileSystem from "expo-file-system/legacy";

export type MobileImageFile = {
  uri: string;
  type: string;
  name: string;
};

export async function uploadRecipeImage(
  file: MobileImageFile,
  token: string
): Promise<string> {
  const result = await FileSystem.uploadAsync(
    `${API_URL}/recipes/upload-image`,
    file.uri,
    {
      httpMethod: "POST",
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: "file",
      mimeType: file.type || "image/jpeg",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );

  if (result.status < 200 || result.status >= 300) {
    let message = "Ошибка загрузки фото";
    try {
      const err = JSON.parse(result.body);
      if (typeof err?.detail === "string") message = err.detail;
    } catch {
    }
    throw new Error(message);
  }

  const data = JSON.parse(result.body);
  return data.url ?? data.image_url;
}

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

export async function updateRecipe(
  id: number | string,
  data: RecipeCreate,
  token: string
): Promise<Recipe> {
  const res = await fetch(`${API_URL}/recipes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(
      typeof error.detail === "string" ? error.detail : "Не удалось обновить рецепт"
    );
  }

  return res.json();
}

export async function deleteRecipe(
  id: number | string,
  token: string
): Promise<void> {
  const res = await fetch(`${API_URL}/recipes/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(
      typeof error.detail === "string" ? error.detail : "Не удалось удалить рецепт"
    );
  }
}

export async function getIngredientNames(token: string): Promise<string[]> {
  const res = await fetch(`${API_URL}/recipes/ingredients/names`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error("Не удалось загрузить ингредиенты");
  }
  return res.json();
}