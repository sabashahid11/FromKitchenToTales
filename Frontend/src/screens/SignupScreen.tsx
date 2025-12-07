import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';

interface SignupScreenProps {
  onBack: () => void;
  onSignin?: () => void;
}

export function SignupScreen({ onBack, onSignin }: SignupScreenProps) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const user = await authApi.signup({
        username: formData.username,
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
      className="min-h-screen bg-cream-200 flex flex-col items-center p-6 overflow-y-auto"
    >
      {/* Back Button */}
      <motion.button
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        onClick={onBack}
        className="self-start flex items-center text-olive-600 hover:text-olive-700 transition-colors mb-6"
      >
        <ArrowLeft size={24} />
      </motion.button>

      {/* Logo Section */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col items-center mb-6"
      >
        <div className="mb-2">
          <svg width="50" height="42" viewBox="0 0 60 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="30" cy="15" rx="20" ry="12" fill="#606C38"/>
            <ellipse cx="15" cy="17" rx="10" ry="10" fill="#606C38"/>
            <ellipse cx="45" cy="17" rx="10" ry="10" fill="#606C38"/>
            <rect x="12" y="25" width="36" height="20" rx="3" fill="#606C38"/>
            <path d="M15 45H45" stroke="#DDA15E" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M18 40H42" stroke="#DDA15E" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h2 className="text-olive-600 font-bold text-lg tracking-wide">KTT</h2>
      </motion.div>

      {/* Signup Title */}
      <motion.h1
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-bold text-olive-800 mb-6 tracking-wide"
        style={{ fontFamily: "'Fredoka', 'Poppins', sans-serif" }}
      >
        SIGN UP
      </motion.h1>

      {/* Form */}
      <motion.form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {/* Username Input */}
        <div>
          <div className={`bg-cream-100 rounded-full px-6 py-4 shadow-sm border-2 transition-all duration-300 ${
            errors.username ? 'border-red-400' : 'border-transparent focus-within:border-golden-400'
          }`}>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="enter username"
              className="w-full bg-transparent outline-none text-olive-700 placeholder-golden-400 text-center"
            />
          </div>
          {errors.username && (
            <p className="text-red-500 text-sm mt-1 text-center">{errors.username}</p>
          )}
        </div>

        {/* Email Input */}
        <div>
          <div className={`bg-cream-100 rounded-full px-6 py-4 shadow-sm border-2 transition-all duration-300 ${
            errors.email ? 'border-red-400' : 'border-transparent focus-within:border-golden-400'
          }`}>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="enter email"
              className="w-full bg-transparent outline-none text-olive-700 placeholder-golden-400 text-center"
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-sm mt-1 text-center">{errors.email}</p>
          )}
        </div>

        {/* Password Input */}
        <div>
          <div className={`bg-cream-100 rounded-full px-6 py-4 shadow-sm border-2 transition-all duration-300 flex items-center ${
            errors.password ? 'border-red-400' : 'border-transparent focus-within:border-golden-400'
          }`}>
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
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1 text-center">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password Input */}
        <div>
          <div className={`bg-cream-100 rounded-full px-6 py-4 shadow-sm border-2 transition-all duration-300 flex items-center ${
            errors.confirmPassword ? 'border-red-400' : 'border-transparent focus-within:border-golden-400'
          }`}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="confirm password"
              className="w-full bg-transparent outline-none text-olive-700 placeholder-golden-400 text-center"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-olive-500 hover:text-olive-700 transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1 text-center">{errors.confirmPassword}</p>
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

        {/* Divider */}
        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-olive-300"></div>
          <span className="text-olive-500 text-sm">or</span>
          <div className="flex-1 h-px bg-olive-300"></div>
        </div>

        {/* Social Auth Buttons */}
        <div className="flex justify-center gap-4">
          <motion.button
            type="button"
            className="w-14 h-14 bg-cream-100 rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Google Icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </motion.button>

          <motion.button
            type="button"
            className="w-14 h-14 bg-cream-100 rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Facebook Icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854V15.47H7.078V12h3.047V9.356c0-3.007 1.792-4.668 4.533-4.668 1.312 0 2.686.234 2.686.234v2.953H15.83c-1.491 0-1.956.925-1.956 1.874V12h3.328l-.532 3.469h-2.796v8.385C19.612 22.954 24 17.99 24 12z" fill="#1877F2"/>
            </svg>
          </motion.button>
        </div>

        {/* Signup Button */}
        <motion.button
          type="submit"
          disabled={isLoading}
          className="w-full bg-olive-600 text-cream-100 font-semibold py-4 rounded-full shadow-lg hover:bg-olive-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
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
              Creating account...
            </span>
          ) : (
            'Sign up'
          )}
        </motion.button>

        {/* Sign In Link */}
        {onSignin && (
          <motion.div
            className="text-center pt-2 pb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span className="text-olive-600">Already have an account? </span>
            <button
              type="button"
              onClick={onSignin}
              className="text-golden-500 font-semibold hover:text-golden-600 transition-colors"
            >
              Log In
            </button>
          </motion.div>
        )}
      </motion.form>
    </motion.div>
  );
}
