import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, BookmarkCheck, User, Settings, History } from 'lucide-react';
import { CaptureScreen } from '../screens/CaptureScreen';
import { DetectedIngredientsScreen } from '../screens/DetectedIngredientsScreen';
import { RecipesListScreen } from '../screens/RecipesListScreen';
import { RecipeDetailScreen } from '../screens/RecipeDetailScreen';
import { SavedRecipesScreen } from '../screens/SavedRecipesScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import type { Recipe, RecipeWithSteps } from '../api/types';

type MainTab = 'capture' | 'saved' | 'profile' | 'settings' | 'history';

type AppScreen =
  | { type: 'main'; tab: MainTab }
  | { type: 'detected-ingredients'; ingredients: string[]; recipes: Recipe[]; imageUrl: string }
  | { type: 'recipes-list'; recipes: Recipe[]; imageUrl: string }
  | { type: 'recipe-detail'; recipe: RecipeWithSteps; from: 'capture' | 'saved'; recipesContext?: { recipes: Recipe[]; imageUrl: string } };

export function AppStack() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>({
    type: 'main',
    tab: 'capture',
  });

  const handleRecipesDetected = (recipes: Recipe[], imageUrl: string) => {
    // compute a deduplicated list of detected ingredients from the returned recipes
    const detectedSet = new Set<string>();
    for (const r of recipes) {
      for (const ing of r.ingredients ?? []) {
        const trimmed = ing?.trim();
        if (trimmed) detectedSet.add(trimmed);
      }
    }

    const ingredients = Array.from(detectedSet);

    // first show a screen summarizing what we detected, then allow user to continue to recipes
    setCurrentScreen({ type: 'detected-ingredients', ingredients, recipes, imageUrl });
  };

  const handleRecipeSelect = (recipe: RecipeWithSteps, from: 'capture' | 'saved') => {
    setCurrentScreen({ type: 'recipe-detail', recipe, from });
  };

  const handleBackToMain = (tab: MainTab = 'capture') => {
    setCurrentScreen({ type: 'main', tab });
  };

  const renderScreen = () => {
    if (currentScreen.type === 'detected-ingredients') {
      return (
        <DetectedIngredientsScreen
          ingredients={currentScreen.ingredients}
          imageUrl={currentScreen.imageUrl}
          onBack={() => setCurrentScreen({ type: 'main', tab: 'capture' })}
          onContinue={() =>
            setCurrentScreen({ type: 'recipes-list', recipes: currentScreen.recipes, imageUrl: currentScreen.imageUrl })
          }
        />
      );
    }

    if (currentScreen.type === 'recipes-list') {
      return (
        <RecipesListScreen
          recipes={currentScreen.recipes}
          imageUrl={currentScreen.imageUrl}
          onBack={() => handleBackToMain('capture')}
          onRecipeSelect={(recipe) => {
            // Pass the current recipes context so we can go back to this list
            setCurrentScreen({
              type: 'recipe-detail',
              recipe,
              from: 'capture',
              recipesContext: { recipes: currentScreen.recipes, imageUrl: currentScreen.imageUrl }
            });
          }}
        />
      );
    }

    if (currentScreen.type === 'recipe-detail') {
      return (
        <RecipeDetailScreen
          recipe={currentScreen.recipe}
          onBack={() => {
            if (currentScreen.from === 'capture' && currentScreen.recipesContext) {
              // Go back to the recipes list
              setCurrentScreen({
                type: 'recipes-list',
                recipes: currentScreen.recipesContext.recipes,
                imageUrl: currentScreen.recipesContext.imageUrl
              });
            } else if (currentScreen.from === 'saved') {
              handleBackToMain('saved');
            } else {
              handleBackToMain('capture');
            }
          }}
        />
      );
    }

    if (currentScreen.type === 'main') {
      if (currentScreen.tab === 'capture') {
        return <CaptureScreen onRecipesDetected={handleRecipesDetected} />;
      }

      if (currentScreen.tab === 'saved') {
        return (
          <SavedRecipesScreen
            onRecipeSelect={(recipe) => handleRecipeSelect(recipe, 'saved')}
          />
        );
      }

      if (currentScreen.tab === 'profile') {
        return <ProfileScreen />;
      }

      if (currentScreen.tab === 'settings') {
        return <SettingsScreen />;
      }

      if (currentScreen.tab === 'history') {
        return <HistoryScreen />;
      }
    }

    return null;
  };

  const navItems = [
    { tab: 'settings' as MainTab, icon: Settings, label: 'Settings' },
    { tab: 'saved' as MainTab, icon: BookmarkCheck, label: 'Favorites' },
    { tab: 'capture' as MainTab, icon: Scan, label: 'Scan', isMain: true },
    { tab: 'history' as MainTab, icon: History, label: 'History' },
    { tab: 'profile' as MainTab, icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-cream-200">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen.type === 'main' ? currentScreen.tab : currentScreen.type}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="flex-1"
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>

      {currentScreen.type === 'main' && (
        <motion.nav
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="bg-cream-100 border-t border-olive-100 px-2 py-2 sticky bottom-0 shadow-lg z-50"
        >
          <div className="max-w-lg mx-auto flex justify-around items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen.tab === item.tab;

              if (item.isMain) {
                return (
                  <motion.button
                    key={item.tab}
                    onClick={() => setCurrentScreen({ type: 'main', tab: item.tab })}
                    className="relative -mt-8"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl ${
                      isActive
                        ? 'bg-olive-600'
                        : 'bg-olive-500 hover:bg-olive-600'
                    } transition-colors`}>
                      <Icon size={28} className="text-cream-100" />
                    </div>
                    <span className={`absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap ${
                      isActive ? 'text-olive-600' : 'text-olive-500'
                    }`}>
                      {item.label}
                    </span>
                  </motion.button>
                );
              }

              return (
                <motion.button
                  key={item.tab}
                  onClick={() => setCurrentScreen({ type: 'main', tab: item.tab })}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                    isActive
                      ? 'text-olive-600'
                      : 'text-olive-400 hover:text-olive-600'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className={`p-2 rounded-xl transition-colors ${
                    isActive ? 'bg-olive-100' : ''
                  }`}>
                    <Icon size={22} />
                  </div>
                  <span className="text-xs font-medium">{item.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.nav>
      )}
    </div>
  );
}
