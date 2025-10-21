import React from 'react';
import { motion } from 'framer-motion';
import xpBoost from '../assets/xpboost-removebg-preview.png';
import { FaBolt, FaStar, FaCheck } from 'react-icons/fa';

const LessonCompletionWithBoost = ({ 
  basicXP = 0, 
  boostMultiplier = 1, 
  onContinue,
  lessonTitle = "Lesson Completed"
}) => {
  const hasBoost = boostMultiplier > 1;
  const bonusXP = hasBoost ? Math.floor(basicXP * (boostMultiplier - 1)) : 0;
  const totalXP = basicXP + bonusXP;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="bg-yellow-50 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center border-2 border-yellow-200"
      >
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex justify-center mb-4">
            <div className="relative">
              {hasBoost ? (
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <img 
                    src={xpBoost} 
                    alt="XP Boost" 
                    className="w-24 h-24 object-contain mx-auto"
                  />
                </motion.div>
              ) : (
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="text-6xl text-yellow-500 mb-2"
                >
                  <FaBolt />
                </motion.div>
              )}
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-yellow-900 mb-2">
            {lessonTitle}
          </h2>
          
          {hasBoost ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-yellow-600 font-semibold text-lg"
            >
              XP Boost Active! ⚡
            </motion.p>
          ) : (
            <p className="text-gray-600 font-semibold text-lg">
              Lesson Complete! ✅
            </p>
          )}
        </motion.div>

        {/* XP Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl p-6 mb-6 shadow-lg border border-yellow-100"
        >
          {/* Basic XP */}
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-600 font-medium">Basic XP:</span>
            <span className="text-gray-800 font-semibold flex items-center gap-2">
              <FaStar className="text-gray-400" />
              {basicXP} XP
            </span>
          </div>

          {/* Bonus XP */}
          {hasBoost && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="flex justify-between items-center mb-4"
            >
              <span className="text-yellow-600 font-medium">Bonus XP:</span>
              <motion.span
                animate={{ 
                  scale: [1, 1.1, 1],
                  color: ["#d97706", "#ca8a04", "#d97706"]
                }}
                transition={{ duration: 0.5, delay: 1 }}
                className="text-yellow-600 font-bold flex items-center gap-2"
              >
                <FaBolt className="text-yellow-500" />
                +{bonusXP} XP
              </motion.span>
            </motion.div>
          )}

          {/* Divider */}
          {hasBoost && (
            <div className="border-t border-yellow-200 my-4"></div>
          )}

          {/* Total XP */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
            className="flex justify-between items-center pt-3"
          >
            <span className="text-yellow-700 font-bold text-lg">Total XP:</span>
            <motion.span
              animate={{ 
                scale: [1, 1.05, 1],
                textShadow: ["0 0 0px #ca8a04", "0 0 10px #ca8a04", "0 0 0px #ca8a04"]
              }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="text-yellow-700 font-bold text-xl flex items-center gap-2"
            >
              <FaStar className="text-yellow-500" />
              {totalXP} XP 🎉
            </motion.span>
          </motion.div>
        </motion.div>

        {/* Close Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          onClick={onContinue}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 px-8 rounded-xl w-full transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          <div className="flex items-center justify-center gap-2">
            <FaCheck />
            Close
          </div>
        </motion.button>
      </motion.div>
    </div>
  );
};

export default LessonCompletionWithBoost;