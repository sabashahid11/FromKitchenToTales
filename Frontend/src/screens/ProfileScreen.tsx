import { useState, FormEvent, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, LogOut, Mail, Edit3, Check, Leaf } from 'lucide-react';
import { Toast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { authApi, dietApi } from '../api/endpoints';
import { ApiError } from '../api/client';
import type { DietPreference } from '../api/types';


const DIET_OPTIONS: { id: DietPreference; label: string; emoji: string }[] = [
  { id: 'Vegetarian', label: 'Vegetarian', emoji: '🥬' },
  { id: 'Vegan', label: 'Vegan', emoji: '🌱' },
  { id: 'Halal', label: 'Halal', emoji: '🍖' },
  { id: 'Kosher', label: 'Kosher', emoji: '✡️' },
  { id: 'Gluten-Free', label: 'Gluten-Free', emoji: '🌾' },
  { id: 'Dairy-Free', label: 'Dairy-Free', emoji: '🥛' },
];

export function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(
    null
  );
  const [dietPreferences, setDietPreferences] = useState<string[]>([]);
  const [isSavingDiet, setIsSavingDiet] = useState(false);

  // Fetch diet preferences on mount
  useEffect(() => {
    if (user?.user_id) {
      dietApi.fetchDietPreferences({ user_id: user.user_id })
        .then((response) => {
          setDietPreferences(response.diet_preferences || []);
        })
        .catch((err) => {
          console.error('Failed to fetch diet preferences:', err);
        });
    }
  }, [user?.user_id]);

  const toggleDietPreference = async (preference: string) => {
    if (!user?.user_id) return;

    const newPreferences = dietPreferences.includes(preference)
      ? dietPreferences.filter((p) => p !== preference)
      : [...dietPreferences, preference];

    setDietPreferences(newPreferences);
    setIsSavingDiet(true);

    try {
      await dietApi.saveDietPreferences({
        user_id: user.user_id,
        diet_preferences: newPreferences,
      });
      setToast({ message: 'Diet preferences saved!', type: 'success' });
    } catch (err) {
      console.error('Failed to save diet preferences:', err);
      // Revert on error
      setDietPreferences(dietPreferences);
      setToast({ message: 'Failed to save preferences', type: 'error' });
    } finally {
      setIsSavingDiet(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!user) return;

    if (!username.trim()) {
      setError('Username cannot be empty');
      return;
    }

    if (username === user.username) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authApi.updateUser({
        user_id: user.user_id,
        updates: {
          username,
        },
      });

      updateUser({ username });
      setToast({ message: 'Profile updated successfully!', type: 'success' });
      setIsEditing(false);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Failed to update profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return null;
  }

  const displayName = user.username || user.email?.split('@')[0] || 'Chef';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-cream-200 pb-24"
    >
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="bg-olive-600 px-6 py-8 pb-20 rounded-b-[2.5rem]">
        <motion.h1
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl font-bold text-cream-100"
          style={{ fontFamily: "'Fredoka', 'Poppins', sans-serif" }}
        >
          Profile
        </motion.h1>
      </div>

      {/* Profile Card */}
      <div className="px-6 -mt-12">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-cream-100 rounded-3xl shadow-lg p-6"
        >
          {/* Avatar */}
          <div className="flex flex-col items-center -mt-16 mb-4">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="w-24 h-24 bg-olive-500 rounded-full flex items-center justify-center shadow-xl border-4 border-cream-100"
            >
              <User size={48} className="text-cream-100" />
            </motion.div>
            <h2 className="text-xl font-bold text-olive-800 mt-3">{displayName}</h2>
            <p className="text-olive-500 text-sm">{user.email}</p>
          </div>

          {/* Edit Username Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div>
              <label className="text-olive-600 text-sm font-medium mb-2 block">Username</label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={!isEditing}
                  className={`w-full bg-cream-200 rounded-2xl px-5 py-4 pr-12 text-olive-700 placeholder-olive-400 border-2 transition-all ${
                    isEditing
                      ? 'border-golden-400 focus:outline-none'
                      : 'border-transparent'
                  } ${error ? 'border-red-400' : ''}`}
                  placeholder="Enter your username"
                />
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-olive-500 hover:text-olive-700"
                >
                  <Edit3 size={20} />
                </button>
              </div>
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>

            <div>
              <label className="text-olive-600 text-sm font-medium mb-2 block">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full bg-cream-200 rounded-2xl px-5 py-4 pr-12 text-olive-500 border-2 border-transparent cursor-not-allowed"
                />
                <Mail size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-olive-400" />
              </div>
            </div>

            {isEditing && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-olive-600 text-cream-100 py-4 rounded-full font-semibold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {isLoading ? (
                  <motion.span
                    className="w-5 h-5 border-2 border-cream-100 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                ) : (
                  <>
                    <Check size={20} />
                    Save Changes
                  </>
                )}
              </motion.button>
            )}
          </form>
        </motion.div>

        {/* Diet Preferences Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-cream-100 rounded-3xl shadow-lg p-6 mt-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <Leaf size={20} className="text-olive-600" />
            <h3 className="text-lg font-bold text-olive-800">Diet Preferences</h3>
            {isSavingDiet && (
              <motion.div
                className="w-4 h-4 border-2 border-olive-400 border-t-transparent rounded-full ml-2"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            )}
          </div>
          <p className="text-olive-500 text-sm mb-4">
            Select your dietary preferences. Recipes will be filtered accordingly.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {DIET_OPTIONS.map((option) => {
              const isSelected = dietPreferences.includes(option.id);
              return (
                <motion.button
                  key={option.id}
                  onClick={() => toggleDietPreference(option.id)}
                  disabled={isSavingDiet}
                  className={`py-3 px-4 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 transition-all border-2 ${
                    isSelected
                      ? 'bg-golden-400 border-golden-500 text-olive-800'
                      : 'bg-cream-200 border-transparent text-olive-600 hover:border-olive-200'
                  } ${isSavingDiet ? 'opacity-50' : ''}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>{option.emoji}</span>
                  <span>{option.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Settings Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-cream-100 rounded-3xl shadow-lg p-6 mt-4"
        >
          <h3 className="text-lg font-bold text-olive-800 mb-4">Settings</h3>

          <motion.button
            onClick={handleLogout}
            className="w-full bg-red-50 text-red-600 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <LogOut size={20} />
            Sign Out
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}
