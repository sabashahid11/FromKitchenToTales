import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  onSignup: () => void;
  onSignin: () => void;
}

export function WelcomeScreen({ onSignup, onSignin }: WelcomeScreenProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSparkle, setShowSparkle] = useState(false);

  useEffect(() => {
    // Trigger entrance animations
    const timer = setTimeout(() => setIsLoaded(true), 100);
    const sparkleTimer = setTimeout(() => setShowSparkle(true), 1500);
    return () => {
      clearTimeout(timer);
      clearTimeout(sparkleTimer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-olive-600 flex flex-col items-center justify-between p-6 overflow-hidden">
      {/* Decorative floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-4 h-4 bg-golden-400/30 rounded-full"
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-40 right-16 w-3 h-3 bg-cream-200/40 rounded-full"
          animate={{ y: [0, 15, 0], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
        <motion.div
          className="absolute bottom-40 left-20 w-2 h-2 bg-golden-300/50 rounded-full"
          animate={{ y: [0, -10, 0], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        {/* Sparkle decorations */}
        <AnimatePresence>
          {showSparkle && (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -top-8 right-8"
              >
                <Sparkles className="w-6 h-6 text-cream-100" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute top-0 right-0"
              >
                <Sparkles className="w-4 h-4 text-cream-200" />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* FROM text with sparkles */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center gap-2 mb-4"
        >
          <Sparkles className="w-4 h-4 text-cream-200" />
          <span className="text-cream-100 text-sm tracking-[0.3em] uppercase font-medium">
            from
          </span>
          <Sparkles className="w-4 h-4 text-cream-200" />
        </motion.div>

        {/* KITCHEN text */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isLoaded ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4, type: "spring", stiffness: 200 }}
          className="relative"
        >
          <h1
            className="text-6xl md:text-7xl font-bold tracking-tight"
            style={{
              fontFamily: "'Fredoka', 'Poppins', sans-serif",
              color: '#EDE0D4',
              textShadow: '4px 4px 0 #DDA15E, 6px 6px 0 rgba(0,0,0,0.1)',
              WebkitTextStroke: '2px #DDA15E',
            }}
          >
            KITCHEN
          </h1>
        </motion.div>

        {/* TO text - handwritten style circle */}
        <motion.div
          initial={{ opacity: 0, scale: 0, rotate: -20 }}
          animate={isLoaded ? { opacity: 1, scale: 1, rotate: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5, type: "spring", stiffness: 200 }}
          className="my-1"
        >
          <svg width="60" height="50" viewBox="0 0 60 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Handwritten "to" with circle */}
            <text
              x="30"
              y="35"
              textAnchor="middle"
              fill="#EDE0D4"
              fontSize="28"
              fontFamily="'Brush Script MT', cursive, serif"
              fontStyle="italic"
            >
              to
            </text>
            {/* Hand-drawn circle around "to" */}
            <ellipse
              cx="30"
              cy="25"
              rx="25"
              ry="20"
              stroke="#EDE0D4"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="2 4"
              opacity="0.8"
            />
          </svg>
        </motion.div>

        {/* TABLES text */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-5xl md:text-6xl font-bold tracking-tight text-cream-100 -mt-1"
          style={{
            fontFamily: "'Fredoka', 'Poppins', sans-serif",
            textShadow: '2px 2px 0 rgba(0,0,0,0.1)',
          }}
        >
          TABLES
        </motion.h2>

        {/* Decorative sparkles */}
        <motion.div
          className="absolute top-20 right-8"
          initial={{ opacity: 0, scale: 0 }}
          animate={isLoaded ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.8 }}
        >
          <Sparkles className="w-6 h-6 text-cream-200" />
        </motion.div>
        <motion.div
          className="absolute top-32 right-4"
          initial={{ opacity: 0, scale: 0 }}
          animate={isLoaded ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.9 }}
        >
          <Sparkles className="w-4 h-4 text-cream-200" />
        </motion.div>
      </div>

      {/* Bottom Section */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={isLoaded ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.8, type: "spring", stiffness: 100 }}
        className="w-full max-w-sm space-y-4 pb-8"
      >
        {/* Get Started Button - Slide style */}
        <motion.button
          onClick={onSignup}
          className="w-full bg-cream-100 rounded-full py-4 px-6 flex items-center justify-between shadow-lg group relative overflow-hidden"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Sliding circle indicator */}
          <motion.div
            className="w-10 h-10 bg-olive-800 rounded-full flex items-center justify-center"
            whileHover={{ x: 5 }}
          >
            <ChevronRight className="w-5 h-5 text-cream-100" />
          </motion.div>

          <span className="text-olive-700 font-semibold text-lg tracking-wide flex-1 text-center pr-10">
            GET STARTED
          </span>

          {/* Hover effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-golden-400/0 via-golden-400/10 to-golden-400/0"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6 }}
          />
        </motion.button>

        {/* Sign In Link */}
        <motion.button
          onClick={onSignin}
          className="w-full text-cream-200 text-center py-2 hover:text-cream-100 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="text-sm">Already have an account? </span>
          <span className="font-semibold underline underline-offset-2">Sign In</span>
        </motion.button>
      </motion.div>
    </div>
  );
}
