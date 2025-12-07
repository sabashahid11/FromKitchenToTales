import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Trash2, Calendar, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { historyApi, HistoryItem as ApiHistoryItem } from '../api/endpoints';

interface DisplayHistoryItem {
  id: string;
  date: string;
  time: string;
  ingredients: string[];
  recipesFound: number;
}

// Helper function to format date
function formatDate(dateString: string): { date: string; time: string } {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  let dateLabel: string;
  if (diffDays === 0) {
    dateLabel = 'Today';
  } else if (diffDays === 1) {
    dateLabel = 'Yesterday';
  } else if (diffDays < 7) {
    dateLabel = `${diffDays} days ago`;
  } else {
    dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  return { date: dateLabel, time };
}

export function HistoryScreen() {
  const { user } = useAuth();
  const [history, setHistory] = useState<DisplayHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!user?.user_id) {
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await historyApi.fetchHistory({ user_id: user.user_id });

      // Transform API response to display format
      const displayHistory: DisplayHistoryItem[] = (response.history || []).map((item: ApiHistoryItem) => {
        const { date, time } = formatDate(item.created_at);
        return {
          id: item.id,
          date,
          time,
          ingredients: item.ingredients || [],
          recipesFound: item.recipes_count || 0,
        };
      });

      setHistory(displayHistory);
    } catch (err) {
      console.error('Failed to fetch history:', err);
      setError('Failed to load history');
    } finally {
      setIsLoading(false);
    }
  }, [user?.user_id]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const clearHistory = async () => {
    if (!user?.user_id) return;

    try {
      await historyApi.clearHistory({ user_id: user.user_id });
      setHistory([]);
    } catch (err) {
      console.error('Failed to clear history:', err);
      setError('Failed to clear history');
    }
  };

  const deleteItem = async (id: string) => {
    if (!user?.user_id) return;

    try {
      await historyApi.deleteHistoryItem({ user_id: user.user_id, history_id: id });
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Failed to delete history item:', err);
      setError('Failed to delete item');
    }
  };

  const groupedHistory = history.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {} as Record<string, HistoryItem[]>);

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
            History
          </motion.h1>
          {history.length > 0 && (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={clearHistory}
              className="p-3 bg-cream-100/20 rounded-full hover:bg-cream-100/30 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <Trash2 size={20} className="text-cream-100" />
            </motion.button>
          )}
        </div>
        <p className="text-cream-200/80 mt-1">{history.length} scan{history.length !== 1 ? 's' : ''} recorded</p>
      </div>

      <div className="px-6 -mt-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div
              className="w-12 h-12 border-4 border-olive-200 border-t-olive-600 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="mt-4 text-olive-600">Loading history...</p>
          </div>
        ) : history.length === 0 ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-cream-100 rounded-3xl shadow-lg p-12 text-center"
          >
            <div className="w-20 h-20 bg-olive-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock size={40} className="text-olive-400" />
            </div>
            <h3 className="text-xl font-bold text-olive-800 mb-2">No history yet</h3>
            <p className="text-olive-500">Your ingredient scans will appear here.</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedHistory).map(([date, items], groupIndex) => (
              <motion.div
                key={date}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: groupIndex * 0.1 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Calendar size={16} className="text-olive-500" />
                  <span className="text-olive-600 font-medium text-sm">{date}</span>
                </div>
                <div className="space-y-3">
                  <AnimatePresence>
                    {items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-cream-100 rounded-2xl shadow-lg p-4 relative overflow-hidden"
                      >
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="absolute top-3 right-3 p-2 text-olive-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-olive-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Search size={24} className="text-olive-600" />
                          </div>
                          <div className="flex-1 pr-8">
                            <div className="flex items-center gap-2 mb-1">
                              <Clock size={14} className="text-olive-400" />
                              <span className="text-olive-500 text-sm">{item.time}</span>
                            </div>
                            <p className="text-olive-800 font-medium">{item.ingredients.join(', ')}</p>
                            <p className="text-olive-500 text-sm mt-1">
                              {item.recipesFound} recipes found
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

