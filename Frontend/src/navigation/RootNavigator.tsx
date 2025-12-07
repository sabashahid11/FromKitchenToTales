import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { AuthStack } from './AuthStack';
import { AppStack } from './AppStack';

export function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-olive-600 flex flex-col items-center justify-center">
        {/* Animated Logo */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <svg width="80" height="70" viewBox="0 0 60 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="30" cy="15" rx="20" ry="12" fill="#EDE0D4"/>
            <ellipse cx="15" cy="17" rx="10" ry="10" fill="#EDE0D4"/>
            <ellipse cx="45" cy="17" rx="10" ry="10" fill="#EDE0D4"/>
            <rect x="12" y="25" width="36" height="20" rx="3" fill="#EDE0D4"/>
            <path d="M15 45H45" stroke="#606C38" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M18 40H42" stroke="#606C38" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </motion.div>

        {/* Loading spinner */}
        <motion.div
          className="w-12 h-12 border-4 border-cream-200/30 border-t-cream-100 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-cream-200 font-medium"
        >
          Loading...
        </motion.p>
      </div>
    );
  }

  return user ? <AppStack /> : <AuthStack />;
}
