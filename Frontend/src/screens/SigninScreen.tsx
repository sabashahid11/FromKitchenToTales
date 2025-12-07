import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';

interface SigninScreenProps {
  onBack: () => void;
  onSignup?: () => void;
}

export function SigninScreen({ onBack, onSignup }: SigninScreenProps) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const user = await authApi.signin({
        username: formData.username || formData.email,
        email: formData.email,
        password: formData.password,
      });

      login(user);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors({ general: error.message });
      } else {
        setErrors({ general: 'An unexpected error occurred' });
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
      className="min-h-screen bg-cream-200 flex flex-col items-center p-6"
    >
      {/* Back Button */}
      <motion.button
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        onClick={onBack}
        className="self-start flex items-center text-olive-600 hover:text-olive-700 transition-colors mb-8"
      >
        <ArrowLeft size={24} />
      </motion.button>

      {/* Logo Section */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col items-center mb-8"
      >
        {/* Chef Hat Logo */}
        <div className="mb-2">
          <svg width="60" height="50" viewBox="0 0 60 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="30" cy="15" rx="20" ry="12" fill="#606C38"/>
            <ellipse cx="15" cy="17" rx="10" ry="10" fill="#606C38"/>
            <ellipse cx="45" cy="17" rx="10" ry="10" fill="#606C38"/>
            <rect x="12" y="25" width="36" height="20" rx="3" fill="#606C38"/>
            <path d="M15 45H45" stroke="#DDA15E" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M18 40H42" stroke="#DDA15E" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h2 className="text-olive-600 font-bold text-xl tracking-wide">KTT</h2>
      </motion.div>

      {/* Login Title */}
      <motion.h1
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-bold text-olive-800 mb-8 tracking-wide"
        style={{ fontFamily: "'Fredoka', 'Poppins', sans-serif" }}
      >
        LOGIN
      </motion.h1>

      {/* Form */}
      <motion.form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-5"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {/* Email Input */}
        <div>
          <motion.div
            whileFocus={{ scale: 1.01 }}
            className={`bg-cream-100 rounded-full px-6 py-4 shadow-sm border-2 transition-all duration-300 ${
              errors.email ? 'border-red-400' : 'border-transparent focus-within:border-golden-400'
            }`}
          >
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="enter username /Email ID"
              className="w-full bg-transparent outline-none text-olive-700 placeholder-golden-400 text-center"
            />
          </motion.div>
          {errors.email && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm mt-1 text-center"
            >
              {errors.email}
            </motion.p>
          )}
        </div>

        {/* Password Input */}
        <div>
          <motion.div
            className={`bg-cream-100 rounded-full px-6 py-4 shadow-sm border-2 transition-all duration-300 flex items-center ${
              errors.password ? 'border-red-400' : 'border-transparent focus-within:border-golden-400'
            }`}
          >
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="enter password"
              className="w-full bg-transparent outline-none text-olive-700 placeholder-golden-400 text-center"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-olive-500 hover:text-olive-700 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </motion.div>
          {errors.password && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm mt-1 text-center"
            >
              {errors.password}
            </motion.p>
          )}
        </div>

        {/* Error Message */}
        {errors.general && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-center"
          >
            {errors.general}
          </motion.div>
        )}

        {/* Login Button */}
        <motion.button
          type="submit"
          disabled={isLoading}
          className="w-full bg-olive-600 text-cream-100 font-semibold py-4 rounded-full shadow-lg hover:bg-olive-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                className="w-5 h-5 border-2 border-cream-100 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              Signing in...
            </span>
          ) : (
            'Log in'
          )}
        </motion.button>

        {/* Sign Up Link */}
        {onSignup && (
          <motion.div
            className="text-center pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span className="text-olive-600">Don't have an account? </span>
            <button
              type="button"
              onClick={onSignup}
              className="text-golden-500 font-semibold hover:text-golden-600 transition-colors"
            >
              Sign Up
            </button>
          </motion.div>
        )}
      </motion.form>
    </motion.div>
  );
}
