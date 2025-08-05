import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FixedProductCustomizer from './FixedProductCustomizer';
import { motion } from 'framer-motion';
import { FaArrowLeft } from 'react-icons/fa';

const CustomizationRouter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <div className="relative">
      {location.pathname !== '/' && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <FaArrowLeft />
          <span className="font-medium">Back to Dashboard</span>
        </motion.button>
      )}
      <FixedProductCustomizer />
    </div>
  );
};

export default CustomizationRouter;