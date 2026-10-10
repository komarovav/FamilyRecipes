import type { Recipe } from "../api/recipes";

type RecipeCardProps = {
  recipe: Recipe;
  onClick?: () => void;
};

function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  return (
    <div className="recipe-card" onClick={onClick}>
      <div className="recipe-card__photo">
        {recipe.image_url ? (
          <img src={recipe.image_url} alt={recipe.title} />
        ) : (
          <div className="recipe-card__photo-placeholder">🍲</div>
        )}
        {recipe.meal_type ? (
          <span className="recipe-card__category">{recipe.meal_type}</span>
        ) : null}
      </div>

      <div className="recipe-card__body">
        <h3 className="recipe-card__title">{recipe.title}</h3>

        {recipe.description ? (
          <p className="recipe-card__description">{recipe.description}</p>
        ) : null}

        <div className="recipe-card__meta">
          {recipe.cooking_time != null ? (
            <span className="recipe-card__meta-item">
              ⏱ {recipe.cooking_time} мин
            </span>
          ) : null}
          {recipe.servings != null ? (
            <span className="recipe-card__meta-item">
              🍽 {recipe.servings} порц.
            </span>
          ) : null}
        </div>

        {recipe.source ? (
          <span className="recipe-card__source">от {recipe.source}</span>
        ) : null}
      </div>
    </div>
  );
}

export default RecipeCard;