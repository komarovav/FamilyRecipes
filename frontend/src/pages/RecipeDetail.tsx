import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  createRecipe,
  getRecipe,
  updateRecipe,
  deleteRecipe,
  getIngredientNames,
} from "../api/recipes";

type RecipeDetailProps = {
  recipeId: string | null;
  goHome: () => void;
};

type IngredientRow = {
  name: string;
  amount: string;
  unit: string;
};

type SuggestTarget = {
  index: number;
  field: "name" | "unit";
} | null;

const CATEGORIES = ["Завтрак", "Обед", "Ужин", "Перекус"];

const UNITS = [
  "г",
  "кг",
  "мл",
  "л",
  "шт",
  "ч. л.",
  "ст. л.",
  "стакан",
  "щепотка",
  "по вкусу",
];

const emptyIngredient = (): IngredientRow => ({
  name: "",
  amount: "",
  unit: "",
});

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
    emptyIngredient(),
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState("");

  const [ingredientNames, setIngredientNames] = useState<string[]>([]);
  const [activeSuggest, setActiveSuggest] = useState<SuggestTarget>(null);

  const buildPayload = () => ({
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
  });

  useEffect(() => {
    if (isNew || !token || !recipeId) {
      setLoading(false);
      return;
    }

    const id = recipeId;
    const tok = token;

    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getRecipe(id, tok);
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
            : [emptyIngredient()]
        );
      } catch (e: any) {
        setError(e.message || "Не удалось загрузить рецепт");
      } finally {
        setLoading(false);
      }
    })();
  }, [isNew, recipeId, token]);

  useEffect(() => {
    if (!token || (!isNew && !isEditing)) return;
    getIngredientNames(token)
      .then(setIngredientNames)
      .catch(() => setIngredientNames([]));
  }, [token, isNew, isEditing]);

  const updateIngredient = (
    index: number,
    field: keyof IngredientRow,
    value: string
  ) => {
    setIngredients((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
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
      if (isNew) {
        await createRecipe(buildPayload(), token);
        goHome();
      } else if (recipeId) {
        await updateRecipe(recipeId, buildPayload(), token);
        setIsEditing(false);
      }
    } catch (err: any) {
      setError(err.message || "Ошибка сохранения");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !recipeId) return;
    setIsDeleting(true);
    setError("");
    try {
      await deleteRecipe(recipeId, token);
      setShowDeleteModal(false);
      goHome();
    } catch (err: any) {
      setError(err.message || "Ошибка удаления");
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const header = (
    <div className="recipe-page-header">
      <button className="back-button" type="button" onClick={goHome}>
        ← Домой
      </button>
      {!isNew && (
        <div className="recipe-page-header__actions">
          {!isEditing ? (
            <>
              <button
                className="icon-button"
                type="button"
                title="Редактировать"
                onClick={() => setIsEditing(true)}
              >
                ✏️
              </button>
              <button
                className="icon-button"
                type="button"
                title="Удалить"
                onClick={() => setShowDeleteModal(true)}
              >
                🗑️
              </button>
            </>
          ) : (
            <button
              className="back-button"
              type="button"
              onClick={() => setIsEditing(false)}
            >
              Отмена
            </button>
          )}
        </div>
      )}
    </div>
  );

  const deleteModal = showDeleteModal ? (
    <div
      className="modal-overlay"
      onClick={() => !isDeleting && setShowDeleteModal(false)}
    >
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-card__title">Удалить рецепт?</h2>
        <p className="modal-card__text">
          «{title || "Без названия"}» будет удалён без возможности восстановления.
        </p>
        <div className="modal-card__actions">
          <button
            type="button"
            className="modal-btn modal-btn--ghost"
            disabled={isDeleting}
            onClick={() => setShowDeleteModal(false)}
          >
            Отмена
          </button>
          <button
            type="button"
            className="modal-btn modal-btn--danger"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? "Удаляем..." : "Удалить"}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  if (loading) {
    return (
      <div className="page">
        {header}
        <main className="content">
          <p>Загрузка...</p>
        </main>
      </div>
    );
  }

  // ПРОСМОТР
  if (!isNew && !isEditing) {
    const list = ingredients.filter((i) => i.name.trim());

    return (
      <div className="page">
        {header}
        <main className="content">
          {error && <div className="recipe-form__error">{error}</div>}

          <article className="recipe-view">
            <div className="recipe-view__photo">
              <span className="recipe-view__photo-icon">🍲</span>
            </div>
            <div className="recipe-view__body">
              {category && (
                <span className="recipe-view__badge">{category}</span>
              )}
              <h1 className="recipe-view__title">{title || "Без названия"}</h1>

              <div className="recipe-view__meta">
                {cookTime && (
                  <span className="recipe-view__meta-item">
                    ⏱ {cookTime} мин
                  </span>
                )}
                {servings && (
                  <span className="recipe-view__meta-item">
                    🍽 {servings} порц.
                  </span>
                )}
                {source && (
                  <span className="recipe-view__meta-item">от {source}</span>
                )}
              </div>

              <section className="recipe-view__section">
                <h2>Ингредиенты</h2>
                {list.length > 0 ? (
                  <ul className="recipe-view__ingredients">
                    {list.map((ing, index) => (
                      <li key={index}>
                        <span className="recipe-view__ing-name">{ing.name}</span>
                        {(ing.amount || ing.unit) && (
                          <span className="recipe-view__ing-amount">
                            {[ing.amount, ing.unit].filter(Boolean).join(" ")}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="recipe-view__empty">Нет ингредиентов</p>
                )}
              </section>

              {description && (
                <section className="recipe-view__section">
                  <h2>Описание</h2>
                  <p className="recipe-view__description">{description}</p>
                </section>
              )}
            </div>
          </article>
        </main>
        {deleteModal}
      </div>
    );
  }

  // СОЗДАНИЕ / РЕДАКТИРОВАНИЕ
  return (
    <div className="page">
      {header}
      <main className="content">
        <div className="recipe-view recipe-view--form">
          <div className="recipe-view__photo recipe-view__photo--form">
            <span className="recipe-view__photo-icon">📷</span>
            <span className="recipe-view__photo-hint">Фото позже</span>
          </div>

          <div className="recipe-view__body">
            {error && <div className="recipe-form__error">{error}</div>}

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
                {CATEGORIES.map((c) => (
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
                {ingredients.map((ing, index) => {
                  const qName = ing.name.trim().toLowerCase();
                  const qUnit = ing.unit.trim().toLowerCase();

                  const nameSuggestions =
                    activeSuggest?.index === index &&
                    activeSuggest.field === "name"
                      ? ingredientNames
                          .filter((n) => n.toLowerCase().includes(qName))
                          .filter((n) => n.toLowerCase() !== qName)
                          .slice(0, 6)
                      : [];

                  const unitSuggestions =
                    activeSuggest?.index === index &&
                    activeSuggest.field === "unit"
                      ? UNITS.filter((u) => u.toLowerCase().includes(qUnit)).slice(
                          0,
                          6
                        )
                      : [];

                  return (
                    <div className="ingredient-row" key={index}>
                      <div className="suggest-wrap">
                        <input
                          type="text"
                          value={ing.name}
                          autoComplete="off"
                          placeholder="Название"
                          onChange={(e) =>
                            updateIngredient(index, "name", e.target.value)
                          }
                          onFocus={() =>
                            setActiveSuggest({ index, field: "name" })
                          }
                          onBlur={() =>
                            setTimeout(() => setActiveSuggest(null), 150)
                          }
                        />
                        {nameSuggestions.length > 0 && (
                          <div className="suggest-menu">
                            {nameSuggestions.map((n) => (
                              <button
                                key={n}
                                type="button"
                                className="suggest-item"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  updateIngredient(index, "name", n);
                                  setActiveSuggest(null);
                                }}
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <input
                        type="number"
                        value={ing.amount}
                        placeholder="Кол-во"
                        onChange={(e) =>
                          updateIngredient(index, "amount", e.target.value)
                        }
                      />

                      <div className="suggest-wrap">
                        <input
                          type="text"
                          value={ing.unit}
                          autoComplete="off"
                          placeholder="Ед."
                          onChange={(e) =>
                            updateIngredient(index, "unit", e.target.value)
                          }
                          onFocus={() =>
                            setActiveSuggest({ index, field: "unit" })
                          }
                          onBlur={() =>
                            setTimeout(() => setActiveSuggest(null), 150)
                          }
                        />
                        {unitSuggestions.length > 0 && (
                          <div className="suggest-menu">
                            {unitSuggestions.map((u) => (
                              <button
                                key={u}
                                type="button"
                                className="suggest-item"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  updateIngredient(index, "unit", u);
                                  setActiveSuggest(null);
                                }}
                              >
                                {u}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        className="ingredient-row__remove"
                        type="button"
                        onClick={() =>
                          setIngredients((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}

                <button
                  className="ingredient-row__add"
                  type="button"
                  onClick={() =>
                    setIngredients((prev) => [...prev, emptyIngredient()])
                  }
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
                rows={10}
                placeholder="Как готовить..."
              />
            </div>

            <button
              className="add-recipe-button recipe-form__submit"
              type="button"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving
                ? "Сохранение..."
                : isNew
                  ? "Сохранить"
                  : "Сохранить изменения"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default RecipeDetail;