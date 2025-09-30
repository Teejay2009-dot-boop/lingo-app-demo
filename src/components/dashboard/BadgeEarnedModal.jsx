import React from "react";
import { FaTimes, FaTrophy, FaExternalLinkAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const BadgeEarnedModal = ({ badge, isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen || !badge) return null;

  const handleViewBadges = () => {
    onClose();
    navigate("/badges");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-auto shadow-2xl transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-amber-600 flex items-center">
            <FaTrophy className="mr-2" />
            Badge Unlocked!
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Badge Content */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-amber-300">
            <span className="text-3xl">🏆</span>
          </div>

          <h3 className="text-xl font-bold text-gray-800 mb-2">{badge.name}</h3>

          <p className="text-gray-600 mb-4">{badge.description}</p>

          <div className="bg-amber-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-amber-700 font-medium">
              {badge.tier === "gold"
                ? "🌟 Gold Tier"
                : badge.tier === "silver"
                ? "🥈 Silver Tier"
                : "🥉 Bronze Tier"}{" "}
              Badge
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
          >
            Continue
          </button>
          <button
            onClick={handleViewBadges}
            className="flex-1 bg-amber-500 text-white py-3 rounded-lg font-semibold hover:bg-amber-600 transition-colors flex items-center justify-center"
          >
            View Badges <FaExternalLinkAlt className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BadgeEarnedModal;
