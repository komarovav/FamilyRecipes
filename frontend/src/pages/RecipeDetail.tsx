import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { createRecipe, getRecipe, type Recipe } from "../api/recipes";

type RecipeDetailProps = {
  recipeId: string | null;
  goHome: () => void;
};

type IngredientRow = {
  name: string;
  amount: string;
  unit: string;
};

const categories = ["Завтрак", "Обед", "Ужин", "Перекус"];

function RecipeDetail({ recipeId, goHome }: RecipeDetailProps) {
  const { token } = useAuth();
  const isNew = !recipeId;

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Завтрак");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("");
  const [source, setSource] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState<IngredientRow[]>([
    { name: "", amount: "", unit: "" },
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (isNew || !token || !recipeId) return;

      try {
        setLoading(true);
        setError("");
        const data: Recipe = await getRecipe(recipeId, token);

        setTitle(data.title);
        setCategory(data.meal_type || "Завтрак");
        setCookTime(data.cooking_time != null ? String(data.cooking_time) : "");
        setServings(data.servings != null ? String(data.servings) : "");
        setSource(data.source || "");
        setDescription(data.description || "");
        setIngredients(
          data.ingredients?.length
            ? data.ingredients.map((i) => ({
                name: i.name,
                amount: i.amount != null ? String(i.amount) : "",
                unit: i.unit || "",
              }))
            : [{ name: "", amount: "", unit: "" }]
        );
      } catch (e: any) {
        setError(e.message || "Не удалось загрузить рецепт");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isNew, recipeId, token]);

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", amount: "", unit: "" }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (
    index: number,
    field: keyof IngredientRow,
    value: string
  ) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Введите название рецепта");
      return;
    }
    if (!token) {
      setError("Вы не авторизованы");
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      await createRecipe(
        {
          title: title.trim(),
          description: description.trim() || undefined,
          cooking_time: cookTime ? Number(cookTime) : undefined,
          servings: servings ? Number(servings) : undefined,
          meal_type: category,
          source: source.trim() || undefined,
          ingredients: ingredients
            .filter((i) => i.name.trim())
            .map((i) => ({
              name: i.name.trim(),
              amount: i.amount ? Number(i.amount) : null,
              unit: i.unit.trim() || null,
            })),
        },
        token
      );
      goHome();
    } catch (err: any) {
      setError(err.message || "Ошибка сохранения");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="recipe-page-header">
          <button className="back-button" type="button" onClick={goHome}>
            Домой
          </button>
        </div>
        <main className="content">
          <p>Загрузка...</p>
        </main>
      </div>
    );
  }

  if (!isNew) {
    return (
      <div className="page">
        <div className="recipe-page-header">
          <button className="back-button" type="button" onClick={goHome}>
            ← Домой
          </button>
        </div>

        <main className="content recipe-form">
          {error && (
            <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>
          )}

          <div className="photo-upload" style={{ cursor: "default" }}>
            <span>🍲</span>
          </div>

          <h1 style={{ margin: "0 0 8px", color: "#515726" }}>{title}</h1>
          {category && (
            <p style={{ margin: "0 0 24px", color: "#777" }}>{category}</p>
          )}

          <div className="form-row" style={{ marginBottom: 20 }}>
            {cookTime && (
              <div className="form-group">
                <label>Время</label>
                <p style={{ margin: 0 }}>{cookTime} мин</p>
              </div>
            )}
            {servings && (
              <div className="form-group">
                <label>Порции</label>
                <p style={{ margin: 0 }}>{servings}</p>
              </div>
            )}
          </div>

          {source && (
            <div className="form-group">
              <label>Источник</label>
              <p style={{ margin: 0 }}>{source}</p>
            </div>
          )}

          <div className="form-group">
            <label>Ингредиенты</label>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {ingredients
                .filter((i) => i.name.trim())
                .map((ing, index) => (
                  <li key={index} style={{ marginBottom: 6 }}>
                    {ing.name}
                    {ing.amount ? ` — ${ing.amount}` : ""}
                    {ing.unit ? ` ${ing.unit}` : ""}
                  </li>
                ))}
            </ul>
            {ingredients.filter((i) => i.name.trim()).length === 0 && (
              <p style={{ margin: 0, color: "#777" }}>Нет ингредиентов</p>
            )}
          </div>

          {description && (
            <div className="form-group">
              <label>Описание</label>
              <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{description}</p>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="recipe-page-header">
        <button className="back-button" type="button" onClick={goHome}>
          Домой
        </button>
      </div>

      <main className="content recipe-form">
        {error && (
          <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>
        )}

        <button className="photo-upload" type="button" disabled>
          <span>📷 Добавить фото (позже)</span>
        </button>

        <div className="form-group">
          <label>Название</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Название рецепта"
          />
        </div>

        <div className="form-group">
          <label>Категория</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Время (мин)</label>
            <input
              type="number"
              value={cookTime}
              onChange={(e) => setCookTime(e.target.value)}
              placeholder="30"
            />
          </div>
          <div className="form-group">
            <label>Порции</label>
            <input
              type="number"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              placeholder="4"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Источник</label>
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="Бабушка"
          />
        </div>

        <div className="form-group">
          <label>Ингредиенты</label>
          <div className="ingredients-list">
            {ingredients.map((ing, index) => (
              <div className="ingredient-row" key={index}>
                <input
                  type="text"
                  value={ing.name}
                  onChange={(e) =>
                    updateIngredient(index, "name", e.target.value)
                  }
                  placeholder="Название"
                />
                <input
                  type="number"
                  value={ing.amount}
                  onChange={(e) =>
                    updateIngredient(index, "amount", e.target.value)
                  }
                  placeholder="Кол-во"
                />
                <input
                  type="text"
                  value={ing.unit}
                  onChange={(e) =>
                    updateIngredient(index, "unit", e.target.value)
                  }
                  placeholder="Ед."
                />
                <button
                  className="ingredient-row__remove"
                  type="button"
                  onClick={() => removeIngredient(index)}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              className="ingredient-row__add"
              type="button"
              onClick={addIngredient}
            >
              + Добавить ингредиент
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Описание</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Как готовить..."
          />
        </div>

        <button
          className="add-recipe-button"
          type="button"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Сохранение..." : "Сохранить"}
        </button>
      </main>
    </div>
  );
}

export default RecipeDetail;
