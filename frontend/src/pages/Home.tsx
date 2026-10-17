import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import RecipeCard from "../components/RecipeCard";
import { useAuth } from "../context/AuthContext";
import { getRecipes, type Recipe } from "../api/recipes";

type HomeProps = {
  logout: () => void;
  openRecipe: (recipeId: string | null) => void;
};

const CATEGORIES = ["Все", "Завтрак", "Обед", "Ужин", "Перекус"] as const;

function Home({ logout, openRecipe }: HomeProps) {
  const { token } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("Все");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function load() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        setError("");
        const data = await getRecipes(token);
        setRecipes(data);
      } catch (e: any) {
        setError(e.message || "Ошибка загрузки");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return recipes.filter((r) => {
      const matchesCategory =
        category === "Все" || (r.meal_type || "") === category;

      const matchesSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        (r.description || "").toLowerCase().includes(q) ||
        (r.source || "").toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [recipes, search, category]);

  return (
    <div className="page">
      <Navbar logout={logout} />

      <main className="content">
        <div className="home-toolbar">
          <h1 className="home-toolbar__title">Мои рецепты</h1>
          <div className="home-toolbar__actions">
            <button
              className="icon-button"
              type="button"
              title="Поиск"
              onClick={() => setShowFilters((v) => !v)}
            >
              🔍
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="home-filters">
            <input
              className="home-search"
              type="search"
              placeholder="Поиск по названию, описанию, источнику..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="home-categories">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={
                    category === c
                      ? "category-chip category-chip--active"
                      : "category-chip"
                  }
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          className="add-recipe-button"
          type="button"
          onClick={() => openRecipe(null)}
        >
          + Добавить рецепт
        </button>

        {loading && <p>Загрузка рецептов...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && filtered.length > 0 ? (
          <div className="recipe-grid">
            {filtered.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={() => openRecipe(String(recipe.id))}
              />
            ))}
          </div>
        ) : null}

        {!loading && !error && recipes.length === 0 ? (
          <div className="home-card">
            <h2>Рецепты</h2>
            <p>Рецептов пока нет.</p>
          </div>
        ) : null}

        {!loading &&
          !error &&
          recipes.length > 0 &&
          filtered.length === 0 && (
            <div className="home-card">
              <h2>Ничего не найдено</h2>
              <p>Попробуйте другой запрос или категорию.</p>
            </div>
          )}
      </main>
    </div>
  );
}

export default Home;