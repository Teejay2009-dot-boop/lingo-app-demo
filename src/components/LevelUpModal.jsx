// src/components/LevelUpModal.js
import { LEVEL_CONFIG } from "../data/defaultUser";

export const LevelUpModal = ({ newLevel, onClose }) => {
  const levelInfo = LEVEL_CONFIG.find((l) => l.level === newLevel);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full text-center animate-pop-in">
        <div
          className={`text-6xl mb-4 ${levelInfo.color} rounded-full w-20 h-20 flex items-center justify-center mx-auto`}
        >
          {levelInfo.icon}
        </div>
        <h2 className="text-2xl font-bold mb-2">Level Up!</h2>
        <p className="text-lg mb-4">You've reached {levelInfo.name}!</p>
        <p className="mb-6">
          New title: <span className="font-semibold">{levelInfo.title}</span>
        </p>
        <button
          onClick={onClose}
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-6 rounded-full transition"
        >
          Continue Learning
        </button>
      </div>
    </div>
  );
};
