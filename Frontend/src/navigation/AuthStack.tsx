import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { SigninScreen } from '../screens/SigninScreen';

type AuthScreen = 'welcome' | 'signup' | 'signin';

export function AuthStack() {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>('welcome');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return (
          <WelcomeScreen
            onSignup={() => setCurrentScreen('signup')}
            onSignin={() => setCurrentScreen('signin')}
          />
        );
      case 'signup':
        return (
          <SignupScreen
            onBack={() => setCurrentScreen('welcome')}
            onSignin={() => setCurrentScreen('signin')}
          />
        );
      case 'signin':
        return (
          <SigninScreen
            onBack={() => setCurrentScreen('welcome')}
            onSignup={() => setCurrentScreen('signup')}
          />
        );
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentScreen}
        initial={{ opacity: 0, x: currentScreen === 'welcome' ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: currentScreen === 'welcome' ? 20 : -20 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen"
      >
        {renderScreen()}
      </motion.div>
    </AnimatePresence>
  );
}
