import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Bookmark, BookmarkCheck, Clock, Users, ChefHat, Flame, Star } from 'lucide-react';
import { Toast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { recipeApi } from '../api/endpoints';
import { ApiError } from '../api/client';
import type { Recipe, RecipeWithSteps } from '../api/types';

interface RecipeDetailScreenProps {
  recipe: RecipeWithSteps;
  onBack: () => void;
}

export function RecipeDetailScreen({ recipe, onBack }: RecipeDetailScreenProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(
    null
  );
  const safeIngredients = Array.isArray(recipe.ingredients)
    ? recipe.ingredients
    : [];
  const safeSteps = Array.isArray(recipe.steps) ? recipe.steps : [];
  const normalizedRecipeId =
    recipe?.id === null || recipe?.id === undefined
      ? ''
      : String(recipe.id).trim();
  const [isSaved, setIsSaved] = useState(Boolean(normalizedRecipeId));
  const [savedRecipeId, setSavedRecipeId] = useState(normalizedRecipeId);

  type SaveRecipeOptions = {
    showSuccessToast?: boolean;
    manageLoadingState?: boolean;
  };

  const saveRecipe = async (
    { showSuccessToast = true, manageLoadingState = true }: SaveRecipeOptions = {}
  ): Promise<string | null> => {
    if (!user?.user_id) {
      setToast({ message: 'Please sign in to save recipes', type: 'error' });
      return null;
    }

    if (manageLoadingState) {
      setIsLoading(true);
    }

    try {
      const recipePayload: Recipe = {
        title: recipe.title,
        image_url: recipe.image_url,
        ingredients: recipe.ingredients,
      };

      if (normalizedRecipeId) {
        recipePayload.id = normalizedRecipeId;
      }

      const response = await recipeApi.saveRecipe({
        user_id: user.user_id,
        recipe_data: recipePayload,
      });

      const persistedIdRaw =
        response?.recipe_id ??
        response?.response?.[0]?.id ??
        normalizedRecipeId;
      const nextRecipeId =
        typeof persistedIdRaw === 'string' || typeof persistedIdRaw === 'number'
          ? String(persistedIdRaw).trim()
          : normalizedRecipeId;

      if (!nextRecipeId) {
        setToast({
          message: 'Unable to determine saved recipe ID. Please try again.',
          type: 'error',
        });
        return null;
      }

      setIsSaved(true);
      setSavedRecipeId(nextRecipeId);

      if (showSuccessToast) {
        setToast({ message: 'Recipe saved successfully!', type: 'success' });
      }

      return nextRecipeId;
    } catch (error) {
      if (error instanceof ApiError) {
        setToast({ message: error.message, type: 'error' });
      } else {
        setToast({ message: 'Failed to save recipe', type: 'error' });
      }
      return null;
    } finally {
      if (manageLoadingState) {
        setIsLoading(false);
      }
    }
  };

  const handleSaveRecipe = () => {
    void saveRecipe();
  };

  const handleRatingSubmit = async () => {
    if (rating === 0) {
      setToast({ message: 'Please select a rating', type: 'error' });
      return;
    }

    if (!user?.user_id) {
      setToast({ message: 'Please sign in to rate this recipe', type: 'error' });
      return;
    }

    setIsLoading(true);

    try {
      let targetRecipeId = isSaved && savedRecipeId ? savedRecipeId : null;

      if (!targetRecipeId) {
        const persistedId = await saveRecipe({
          showSuccessToast: false,
          manageLoadingState: false,
        });

        if (!persistedId) {
          return;
        }

        targetRecipeId = persistedId;
      }

      await recipeApi.giveReview({
        recipe_id: targetRecipeId,
        reviews: rating,
        user_id: user.user_id,
      });

      setToast({ message: 'Thank you for your review!', type: 'success' });
    } catch (error) {
      if (error instanceof ApiError) {
        setToast({ message: error.message, type: 'error' });
      } else {
        setToast({ message: 'Failed to submit review', type: 'error' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-cream-200"
    >
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Hero Image Section */}
      <div className="relative">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="h-72 md:h-96 w-full overflow-hidden"
        >
          {recipe.image_url ? (
            <img
              src={recipe.image_url}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-olive-600 flex items-center justify-center">
              <ChefHat className="w-24 h-24 text-cream-100/50" />
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-olive-900/80 via-transparent to-olive-900/30" />
        </motion.div>

        {/* Back Button */}
        <motion.button
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          onClick={onBack}
          className="absolute top-6 left-6 p-3 bg-cream-100/90 rounded-full shadow-lg hover:bg-cream-100 transition-colors"
        >
          <ArrowLeft size={24} className="text-olive-600" />
        </motion.button>

        {/* Save Button */}
        <motion.button
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          onClick={handleSaveRecipe}
          disabled={isLoading || isSaved}
          className={`absolute top-6 right-6 p-3 rounded-full shadow-lg transition-all ${
            isSaved
              ? 'bg-golden-400 text-cream-100'
              : 'bg-cream-100/90 text-olive-600 hover:bg-cream-100'
          }`}
        >
          {isSaved ? <BookmarkCheck size={24} /> : <Bookmark size={24} />}
        </motion.button>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-bold text-cream-100 mb-2"
            style={{ fontFamily: "'Fredoka', 'Poppins', sans-serif" }}
          >
            {recipe.title}
          </motion.h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 -mt-4 relative">
        {/* Quick Info Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-cream-100 rounded-3xl shadow-lg p-6 mb-6"
        >
          <h2 className="text-lg font-bold text-olive-800 mb-4">Quick Info</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center p-3 bg-cream-200 rounded-2xl">
              <Clock className="w-6 h-6 text-olive-600 mb-1" />
              <span className="text-xs text-olive-500">Prep Time</span>
              <span className="font-semibold text-olive-700">{recipe.prep_time || '15 min'}</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-cream-200 rounded-2xl">
              <Flame className="w-6 h-6 text-golden-500 mb-1" />
              <span className="text-xs text-olive-500">Cook Time</span>
              <span className="font-semibold text-olive-700">{recipe.cook_time || '30 min'}</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-cream-200 rounded-2xl">
              <Users className="w-6 h-6 text-olive-600 mb-1" />
              <span className="text-xs text-olive-500">Servings</span>
              <span className="font-semibold text-olive-700">{recipe.servings || '4'}</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-cream-200 rounded-2xl">
              <ChefHat className="w-6 h-6 text-olive-600 mb-1" />
              <span className="text-xs text-olive-500">Difficulty</span>
              <span className="font-semibold text-olive-700">{recipe.difficulty || 'Medium'}</span>
            </div>
          </div>
        </motion.div>

        {/* Ingredients Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-cream-100 rounded-3xl shadow-lg p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-olive-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-olive-600 rounded-full flex items-center justify-center">
              <span className="text-cream-100 text-sm">🥗</span>
            </span>
            Ingredients
          </h2>
          {safeIngredients.length > 0 ? (
            <ul className="space-y-3">
              {safeIngredients.map((ingredient, index) => (
                <motion.li
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="flex items-center gap-3 text-olive-700"
                >
                  <span className="w-2 h-2 bg-golden-400 rounded-full flex-shrink-0"></span>
                  <span>{ingredient}</span>
                </motion.li>
              ))}
            </ul>
          ) : (
            <p className="text-olive-500">No ingredients available.</p>
          )}
        </motion.div>

        {/* Instructions Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-cream-100 rounded-3xl shadow-lg p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-olive-800 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-olive-600 rounded-full flex items-center justify-center">
              <span className="text-cream-100 text-sm">📝</span>
            </span>
            Instructions
          </h2>
          {safeSteps.length > 0 ? (
            <ol className="space-y-6">
              {safeSteps.map((step, index) => (
                <motion.li
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-olive-600 text-cream-100 rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                    {index + 1}
                  </div>
                  <div className="flex-1 pt-2">
                    <p className="text-olive-700 leading-relaxed">{step}</p>
                  </div>
                </motion.li>
              ))}
            </ol>
          ) : (
            <p className="text-olive-500">No instructions available.</p>
          )}
        </motion.div>

        {/* Rating Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-cream-100 rounded-3xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-olive-800 mb-4">Rate This Recipe</h2>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Star Rating */}
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`p-1 transition-colors ${
                    star <= rating ? 'text-golden-400' : 'text-olive-300'
                  }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Star size={32} fill={star <= rating ? 'currentColor' : 'none'} />
                </motion.button>
              ))}
            </div>

            <motion.button
              onClick={handleRatingSubmit}
              disabled={isLoading || rating === 0}
              className="bg-olive-600 text-cream-100 px-6 py-3 rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              whileHover={{ scale: rating > 0 ? 1.02 : 1 }}
              whileTap={{ scale: rating > 0 ? 0.98 : 1 }}
            >
              {isLoading ? 'Submitting...' : 'Submit Rating'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
