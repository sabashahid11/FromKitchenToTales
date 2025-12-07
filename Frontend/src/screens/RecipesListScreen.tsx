import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RefreshCw, ChefHat, Clock, Users, Sparkles } from 'lucide-react';
import { recipeApi } from '../api/endpoints';
import { ApiError } from '../api/client';
import type { Recipe, RecipeWithSteps } from '../api/types';
import { useAuth } from '../context/AuthContext';

interface RecipesListScreenProps {
  recipes: Recipe[];
  imageUrl: string;
  onBack: () => void;
  onRecipeSelect: (recipe: RecipeWithSteps) => void;
}

export function RecipesListScreen({
  recipes: initialRecipes,
  imageUrl,
  onBack,
  onRecipeSelect,
}: RecipesListScreenProps) {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState(initialRecipes);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await recipeApi.getRecipesList({ url: imageUrl });
      setRecipes(response.recipes);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Failed to refresh recipes');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecipeClick = async (recipe: Recipe) => {
    if (!user?.user_id) {
      setError('Please sign in again to view recipe details.');
      return;
    }

    setIsLoadingRecipe(true);
    setSelectedRecipeId(recipe.id || null);
    setError(null);

    try {
      const detailedRecipe = await recipeApi.getRecipeContent({
        recipe,
        user_id: user.user_id,
      });
      onRecipeSelect(detailedRecipe);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Failed to load recipe details');
      }
    } finally {
      setIsLoadingRecipe(false);
      setSelectedRecipeId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-cream-200"
    >
      {/* Header */}
      <div className="bg-olive-600 px-6 py-6 pb-12 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-4">
          <motion.button
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            onClick={onBack}
            className="p-2 -ml-2 text-cream-100 hover:text-cream-200 transition-colors"
          >
            <ArrowLeft size={24} />
          </motion.button>

          <motion.button
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 bg-olive-500 hover:bg-olive-400 text-cream-100 px-4 py-2 rounded-full transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            <span className="text-sm font-medium">Refresh</span>
          </motion.button>
        </div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h1
            className="text-3xl font-bold text-cream-100 mb-1"
            style={{ fontFamily: "'Fredoka', 'Poppins', sans-serif" }}
          >
            Recommended Recipes
          </h1>
          <p className="text-cream-200">
            Found <span className="text-golden-400 font-semibold">{recipes.length}</span> delicious options
          </p>
        </motion.div>
      </div>

      {/* Recipe Cards */}
      <div className="px-6 -mt-6 pb-8">
        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-4"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {recipes.length === 0 ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-cream-100 rounded-3xl p-12 text-center shadow-lg"
          >
            <ChefHat className="w-16 h-16 text-olive-400 mx-auto mb-4" />
            <p className="text-olive-600 text-lg font-medium">No recipes found</p>
            <p className="text-olive-500 text-sm mt-2">Try scanning different ingredients</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {recipes.map((recipe, index) => (
              <motion.div
                key={recipe.id ? String(recipe.id) : `${recipe.title}-${index}`}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => !isLoadingRecipe && handleRecipeClick(recipe)}
                className={`bg-cream-100 rounded-3xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  isLoadingRecipe && selectedRecipeId === recipe.id ? 'ring-2 ring-golden-400' : ''
                }`}
              >
                <div className="flex">
                  {/* Recipe Image */}
                  <div className="w-28 h-28 md:w-36 md:h-36 flex-shrink-0 bg-olive-600 relative overflow-hidden">
                    {recipe.image_url ? (
                      <img
                        src={recipe.image_url}
                        alt={recipe.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ChefHat className="w-12 h-12 text-cream-100/50" />
                      </div>
                    )}

                    {/* Loading overlay */}
                    {isLoadingRecipe && selectedRecipeId === recipe.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-olive-600/80 flex items-center justify-center"
                      >
                        <motion.div
                          className="w-8 h-8 border-2 border-cream-100 border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      </motion.div>
                    )}
                  </div>

                  {/* Recipe Info */}
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-olive-800 line-clamp-2 mb-1">
                        {recipe.title}
                      </h3>
                      {recipe.ingredients && recipe.ingredients.length > 0 && (
                        <p className="text-olive-500 text-sm line-clamp-1">
                          {recipe.ingredients.slice(0, 3).join(', ')}
                          {recipe.ingredients.length > 3 && ` +${recipe.ingredients.length - 3} more`}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-2">
                      {recipe.prep_time && (
                        <div className="flex items-center gap-1 text-olive-500 text-xs">
                          <Clock size={14} />
                          <span>{recipe.prep_time}</span>
                        </div>
                      )}
                      {recipe.servings && (
                        <div className="flex items-center gap-1 text-olive-500 text-xs">
                          <Users size={14} />
                          <span>{recipe.servings} servings</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Arrow indicator */}
                  <div className="flex items-center pr-4">
                    <motion.div
                      className="w-8 h-8 rounded-full bg-olive-100 flex items-center justify-center"
                      whileHover={{ scale: 1.1, backgroundColor: '#606C38' }}
                    >
                      <Sparkles size={16} className="text-olive-600" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
