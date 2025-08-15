import { LEVEL_CONFIG } from "../data/defaultUser";

export const LevelUpModal = ({ newLevel, onClose }) => {
  const levelInfo = LEVEL_CONFIG.find((l) => l.level === newLevel);
  const nextLevel = LEVEL_CONFIG.find((l) => l.level === newLevel + 1);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-8 max-w-md w-full text-center animate-pop-in transform transition-all duration-300 hover:scale-105">
        <div
          className={`${levelInfo.color} rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6`}
        >
          <span className="text-6xl">{levelInfo.icon}</span>
        </div>

        <h2 className="text-3xl font-bold mb-2 text-amber-600">Level Up!</h2>
        <p className="text-xl mb-1">Welcome to</p>
        <p className="text-2xl font-bold mb-4">{levelInfo.name} Rank</p>

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <p className="font-semibold">New Title: {levelInfo.title}</p>
          {nextLevel && (
            <p className="text-sm mt-2">
              Next: {nextLevel.name} at {nextLevel.xp_required} XP and{" "}
              {nextLevel.streak_required} day streak
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className="bg-amber hover:bg-amber-600 text-white  font-bold py-3 px-8 rounded-full transition transform hover:scale-105"
        >
          Continue Learning
        </button>
      </div>
    </div>
  );
};
