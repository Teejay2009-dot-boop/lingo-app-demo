import React from "react";

export const LevelUpModal = ({ level, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-sm mx-auto animate-fade-in-up">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Level Up!</h2>
        <p className="text-xl text-amber-500 mb-6">
          You've reached Level {level}!
        </p>
        <button
          onClick={onClose}
          className="bg-amber text-white py-3 px-8 rounded-full text-lg font-semibold shadow-lg hover:bg-amber-600 transition duration-300 transform hover:scale-105"
        >
          Continue
        </button>
      </div>
    </div>
  );
};
