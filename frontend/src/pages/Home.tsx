import Navbar from '../components/Navbar'
import RecipeCard from '../components/RecipeCard'
import { recipes } from '../data/recipes'

type HomeProps = {
  logout: () => void
  openRecipe: (recipeId: string | null) => void
}

function Home({ logout, openRecipe }: HomeProps) {

  return (
    <div className="page">

      <Navbar
        logout={logout}
      />

      <main className="content">

        <div className="home-toolbar">

          <h1 className="home-toolbar__title">
            Мои рецепты
          </h1>

          <div className="home-toolbar__actions">

            <button
              className="icon-button"
              type="button"
              title="Поиск"
            >
              🔍
            </button>

            <button
              className="icon-button"
              type="button"
              title="Фильтр"
            >
              📍
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

        {recipes.length > 0 ? (

          <div className="recipe-grid">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={() => openRecipe(recipe.id)}
              />
            ))}
          </div>
        ) : (
          <div className="home-card">
            <h2>
              Рецепты
            </h2>
            <p>
              Рецептов пока нет.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

export default Home
