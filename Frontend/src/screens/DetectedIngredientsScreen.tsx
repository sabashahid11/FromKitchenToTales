import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, Plus, Sparkles, Search } from 'lucide-react';

// Ingredient emoji mapping
const ingredientEmojis: Record<string, string> = {
  potato: '🥔', tomato: '🍅', onion: '🧅', garlic: '🧄', carrot: '🥕',
  broccoli: '🥦', lettuce: '🥬', pepper: '🌶️', corn: '🌽', mushroom: '🍄',
  egg: '🥚', cheese: '🧀', milk: '🥛', butter: '🧈', bread: '🍞',
  chicken: '🍗', beef: '🥩', fish: '🐟', shrimp: '🦐', bacon: '🥓',
  apple: '🍎', banana: '🍌', orange: '🍊', lemon: '🍋', strawberry: '🍓',
  rice: '🍚', pasta: '🍝', noodles: '🍜', pizza: '🍕', burger: '🍔',
  salt: '🧂', honey: '🍯', oil: '🫒', avocado: '🥑', cucumber: '🥒',
  spinach: '🥬', cabbage: '🥬', eggplant: '🍆', pea: '🫛', bean: '🫘',
};

const getIngredientEmoji = (ingredient: string): string => {
  const lower = ingredient.toLowerCase();
  for (const [key, emoji] of Object.entries(ingredientEmojis)) {
    if (lower.includes(key)) return emoji;
  }
  return '🥗';
};

interface DetectedIngredientsScreenProps {
  ingredients: string[];
  imageUrl?: string;
  onContinue: () => void;
  onBack: () => void;
}

export function DetectedIngredientsScreen({
  ingredients: initialIngredients,
  imageUrl,
  onContinue,
  onBack,
}: DetectedIngredientsScreenProps) {
  const [ingredients, setIngredients] = useState<string[]>(initialIngredients);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newIngredient, setNewIngredient] = useState('');

  const removeIngredient = (index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const addIngredient = () => {
    if (newIngredient.trim()) {
      setIngredients(prev => [...prev, newIngredient.trim()]);
      setNewIngredient('');
      setShowAddInput(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-cream-200 flex flex-col"
    >
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center gap-4">
        <motion.button
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          onClick={onBack}
          className="p-2 -ml-2 text-olive-600 hover:text-olive-700 transition-colors"
        >
          <ArrowLeft size={24} />
        </motion.button>
        <motion.h1
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-2xl font-bold text-olive-800"
          style={{ fontFamily: "'Fredoka', 'Poppins', sans-serif" }}
        >
          Ingredients Found
        </motion.h1>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-32 custom-scrollbar">
        {/* Image Preview (small) */}
        {imageUrl && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-6"
          >
            <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg border-4 border-cream-100">
              <img
                src={imageUrl}
                alt="Scanned"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        )}

        {/* Ingredients Pills */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          {ingredients.length === 0 ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-cream-100 rounded-3xl p-8 text-center"
            >
              <Sparkles className="w-12 h-12 text-olive-400 mx-auto mb-3" />
              <p className="text-olive-600 font-medium">No ingredients detected</p>
              <p className="text-olive-500 text-sm mt-1">Try adding some manually below</p>
            </motion.div>
          ) : (
            <div className="flex flex-wrap gap-3">
              <AnimatePresence mode="popLayout">
                {ingredients.map((ingredient, index) => (
                  <motion.div
                    key={`${ingredient}-${index}`}
                    layout
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="ingredient-pill bg-cream-100 border-2 border-olive-200"
                  >
                    <span className="text-xl">{getIngredientEmoji(ingredient)}</span>
                    <span className="text-olive-700 font-medium capitalize">{ingredient}</span>
                    <motion.button
                      onClick={() => removeIngredient(index)}
                      className="ml-1 p-1 hover:bg-olive-100 rounded-full transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X size={16} className="text-olive-500" />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Add More Button */}
          <AnimatePresence mode="wait">
            {showAddInput ? (
              <motion.div
                key="input"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex gap-2 mt-4"
              >
                <input
                  type="text"
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addIngredient()}
                  placeholder="Enter ingredient..."
                  className="flex-1 bg-cream-100 rounded-full px-5 py-3 text-olive-700 placeholder-olive-400 border-2 border-olive-200 focus:border-golden-400 focus:outline-none"
                  autoFocus
                />
                <motion.button
                  onClick={addIngredient}
                  className="bg-olive-600 text-cream-100 px-5 py-3 rounded-full font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Add
                </motion.button>
                <motion.button
                  onClick={() => { setShowAddInput(false); setNewIngredient(''); }}
                  className="p-3 text-olive-500 hover:text-olive-700"
                  whileTap={{ scale: 0.95 }}
                >
                  <X size={20} />
                </motion.button>
              </motion.div>
            ) : (
              <motion.button
                key="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAddInput(true)}
                className="mt-4 w-full border-2 border-dashed border-olive-300 rounded-full py-4 flex items-center justify-center gap-2 text-olive-500 hover:border-olive-400 hover:text-olive-600 transition-colors"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Plus size={20} />
                <span className="font-medium">Add More</span>
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Fixed Bottom Button */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-cream-200 via-cream-200 to-transparent pt-12"
      >
        <motion.button
          onClick={onContinue}
          disabled={ingredients.length === 0}
          className="w-full bg-olive-600 text-cream-100 py-5 rounded-full font-bold text-lg shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
          whileHover={{ scale: ingredients.length > 0 ? 1.02 : 1 }}
          whileTap={{ scale: ingredients.length > 0 ? 0.98 : 1 }}
        >
          <Search size={22} />
          FIND RECIPES

          {/* Shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-cream-100/20 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          />
        </motion.button>

        <p className="text-center text-olive-500 text-sm mt-3">
          {ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''} selected
        </p>
      </motion.div>
    </motion.div>
  );
}

export default DetectedIngredientsScreen;
