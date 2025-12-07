import type { Recipe } from '../api/types';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
}

export function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
    >
      <div className="aspect-video w-full overflow-hidden bg-gray-200">
        <img
          src={recipe.image_url}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-2">
          {recipe.title}
        </h3>
        <div className="flex flex-wrap gap-1">
          {recipe.ingredients.slice(0, 3).map((ingredient, index) => (
            <span
              key={index}
              className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full"
            >
              {ingredient}
            </span>
          ))}
          {recipe.ingredients.length > 3 && (
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
              +{recipe.ingredients.length - 3} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
