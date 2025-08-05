import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PremiumCustomizer from './PremiumCustomizer';
import { motion } from 'framer-motion';
import { FaArrowLeft } from 'react-icons/fa';

const CustomizationRouter = ({ initialProduct = null, onClose = null }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/');
    }
  };
  
  return (
    <div className="relative">
      {(location.pathname !== '/' || onClose) && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBack}
          className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl transition-all text-white hover:bg-white/20"
        >
          <FaArrowLeft />
          <span className="font-medium">{onClose ? 'Back to Store' : 'Back to Dashboard'}</span>
        </motion.button>
      )}
      <PremiumCustomizer initialProduct={initialProduct} />
    </div>
  );
};

export default CustomizationRouter;