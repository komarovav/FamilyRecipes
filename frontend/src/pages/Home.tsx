import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import RecipeCard from "../components/RecipeCard";
import { useAuth } from "../context/AuthContext";
import { getRecipes, type Recipe } from "../api/recipes";

type HomeProps = {
  logout: () => void;
  openRecipe: (recipeId: string | null) => void;
};

function Home({ logout, openRecipe }: HomeProps) {
  const { token } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div className="page">
      <Navbar logout={logout} />

      <main className="content">
        <div className="home-toolbar">
          <h1 className="home-toolbar__title">Мои рецепты</h1>
          <div className="home-toolbar__actions">
            <button className="icon-button" type="button" title="Поиск">
              🔍
            </button>
            <button className="icon-button" type="button" title="Фильтр">
              ☰
            </button>
          </div>
        </div>

        <button
          className="add-recipe-button"
          type="button"
          onClick={() => openRecipe(null)}
        >
          + Добавить рецепт
        </button>

        {loading && <p>Загрузка рецептов...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && !error && recipes.length > 0 ? (
          <div className="recipe-grid">
            {recipes.map((recipe) => (
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
      </main>
    </div>
  );
}

export default Home;