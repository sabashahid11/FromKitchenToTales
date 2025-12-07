import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Heart, ChefHat, Clock, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { recipeApi } from '../api/endpoints';
import { ApiError } from '../api/client';
import type { Recipe, RecipeWithSteps } from '../api/types';

interface SavedRecipesScreenProps {
  onRecipeSelect: (recipe: RecipeWithSteps) => void;
}

export function SavedRecipesScreen({ onRecipeSelect }: SavedRecipesScreenProps) {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedRecipes = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await recipeApi.fetchRecipes({
        user_id: user.user_id,
      });
      setRecipes(response.recipes || []);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Failed to load saved recipes');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedRecipes();
  }, [user]);

  const handleRecipeClick = async (recipe: Recipe) => {
    if (!user?.user_id) {
      setError('Please sign in again to view recipe details.');
      return;
    }

    setIsLoadingRecipe(true);
    setSelectedRecipeId(recipe.id ? String(recipe.id) : recipe.title);
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
      className="min-h-screen bg-cream-200 pb-24"
    >
      {/* Header */}
      <div className="bg-olive-600 px-6 py-8 pb-12 rounded-b-[2.5rem]">
        <div className="flex items-center justify-between">
          <motion.h1
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-3xl font-bold text-cream-100"
            style={{ fontFamily: "'Fredoka', 'Poppins', sans-serif" }}
          >
            Favorites
          </motion.h1>
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={fetchSavedRecipes}
            disabled={isLoading}
            className="p-3 bg-cream-100/20 rounded-full hover:bg-cream-100/30 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw size={22} className={`text-cream-100 ${isLoading ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-cream-200/80 mt-2"
        >
          {recipes.length} saved recipe{recipes.length !== 1 ? 's' : ''}
        </motion.p>
      </div>

      {/* Content */}
      <div className="px-6 -mt-6">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-4"
          >
            {error}
          </motion.div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div
              className="w-12 h-12 border-4 border-olive-200 border-t-olive-600 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="mt-4 text-olive-600">Loading saved recipes...</p>
          </div>
        ) : recipes.length === 0 ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-cream-100 rounded-3xl shadow-lg p-12 text-center"
          >
            <div className="w-20 h-20 bg-olive-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart size={40} className="text-olive-400" />
            </div>
            <h3 className="text-xl font-bold text-olive-800 mb-2">No favorites yet</h3>
            <p className="text-olive-500">
              Start exploring and save your favorite recipes!
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {recipes.map((recipe, index) => {
                const recipeKey = recipe.id ? String(recipe.id) : `${recipe.title}-${index}`;
                const isSelected = selectedRecipeId === recipeKey || selectedRecipeId === recipe.title;

                return (
                  <motion.div
                    key={recipeKey}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleRecipeClick(recipe)}
                    className="bg-cream-100 rounded-3xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow relative"
                  >
                    {isSelected && isLoadingRecipe && (
                      <div className="absolute inset-0 bg-olive-900/50 flex items-center justify-center z-10 rounded-3xl">
                        <motion.div
                          className="w-10 h-10 border-4 border-cream-100/30 border-t-cream-100 rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      </div>
                    )}

                    <div className="flex">
                      {/* Image */}
                      <div className="w-28 h-28 flex-shrink-0 bg-olive-100 flex items-center justify-center">
                        {recipe.image_url ? (
                          <img
                            src={recipe.image_url}
                            alt={recipe.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ChefHat size={32} className="text-olive-400" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-4">
                        <h3 className="font-bold text-olive-800 text-lg line-clamp-1">{recipe.title}</h3>

                        {/* Ingredients preview */}
                        {recipe.ingredients && recipe.ingredients.length > 0 && (
                          <p className="text-olive-500 text-sm mt-1 line-clamp-1">
                            {recipe.ingredients.slice(0, 3).join(', ')}
                            {recipe.ingredients.length > 3 && '...'}
                          </p>
                        )}

                        {/* Meta info */}
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1 text-olive-400 text-xs">
                            <Clock size={14} />
                            <span>30 min</span>
                          </div>
                          <div className="flex items-center gap-1 text-olive-400 text-xs">
                            <Users size={14} />
                            <span>4 servings</span>
                          </div>
                        </div>
                      </div>

                      {/* Heart icon */}
                      <div className="p-4 flex items-start">
                        <Heart size={20} className="text-golden-400" fill="currentColor" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
