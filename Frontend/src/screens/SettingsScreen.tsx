import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trash2, Shield, Info, ChevronRight, Smartphone
} from 'lucide-react';
import { Toast } from '../components/Toast';


export function SettingsScreen() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const menuItems = [
    { icon: Shield, label: 'Privacy Policy', action: () => setToast({ message: 'Opening Privacy Policy...', type: 'success' }) },
    { icon: Info, label: 'About App', action: () => setToast({ message: 'From Kitchen To Tables v1.0.0', type: 'success' }) },
    { icon: Smartphone, label: 'App Version', value: '1.0.0' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-cream-200 pb-24"
    >
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Header */}
      <div className="bg-olive-600 px-6 py-8 pb-12 rounded-b-[2.5rem]">
        <motion.h1
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl font-bold text-cream-100"
          style={{ fontFamily: "'Fredoka', 'Poppins', sans-serif" }}
        >
          Settings
        </motion.h1>
        <p className="text-cream-200/80 mt-1">Customize your experience</p>
      </div>

      <div className="px-6 -mt-6 space-y-4">
        {/* Menu Items */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-cream-100 rounded-3xl shadow-lg p-5"
        >
          <h3 className="text-olive-800 font-bold mb-4">About</h3>
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              onClick={item.action}
              className={`flex items-center justify-between w-full py-3 ${index !== menuItems.length - 1 ? 'border-b border-olive-100' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-olive-100 rounded-xl flex items-center justify-center">
                  <item.icon size={20} className="text-olive-600" />
                </div>
                <span className="text-olive-800 font-medium">{item.label}</span>
              </div>
              {item.value ? (
                <span className="text-olive-500 text-sm">{item.value}</span>
              ) : (
                <ChevronRight size={20} className="text-olive-400" />
              )}
            </button>
          ))}
        </motion.div>

        {/* Clear Data */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={() => setToast({ message: 'Cache cleared!', type: 'success' })}
          className="w-full bg-red-50 text-red-600 rounded-3xl shadow-lg p-5 flex items-center justify-center gap-3 hover:bg-red-100 transition-colors"
        >
          <Trash2 size={20} />
          <span className="font-medium">Clear Cache</span>
        </motion.button>
      </div>
    </motion.div>
  );
}

