import type { Recipe } from '../data/recipes'

type RecipeCardProps = {
  recipe: Recipe
  onClick?: (recipe: Recipe) => void
}

function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  return (
    <div
      className="recipe-card"
      onClick={() => onClick?.(recipe)}
    >
      <div className="recipe-card__photo">
        {recipe.photo ? (
          <img src={recipe.photo} alt={recipe.title} />
        ) : (
          <div className="recipe-card__photo-placeholder">🍲</div>
        )}

        <span className="recipe-card__category">
          {recipe.category}
        </span>
      </div>

      <div className="recipe-card__body">
        <h3 className="recipe-card__title">
          {recipe.title}
        </h3>

        <p className="recipe-card__description">
          {recipe.description}
        </p>

        <div className="recipe-card__meta">
          <span className="recipe-card__meta-item">
            ⏱ {recipe.cookTime} мин
          </span>

          <span className="recipe-card__meta-item">
            🍽 {recipe.servings} порц.
          </span>
        </div>

        <span className="recipe-card__source">
          от {recipe.source}
        </span>
      </div>
    </div>
  )
}

export default RecipeCard
