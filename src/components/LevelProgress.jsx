// src/components/LevelProgress.js
import { LEVEL_CONFIG } from "../data/defaultUser";

export const LevelProgress = ({ user }) => {
  const currentLevel = LEVEL_CONFIG.find((l) => l.level === user.level);
  const nextLevel = LEVEL_CONFIG.find((l) => l.level === user.level + 1);

  const progress = nextLevel
    ? Math.min(100, (user.xp / nextLevel.xp_required) * 100)
    : 100;

  return (
    <div className="level-progress p-4 bg-white rounded-lg shadow">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{currentLevel.icon}</span>
        <div>
          <h3 className="font-bold">{currentLevel.title}</h3>
          <p className="text-sm text-gray-600">
            Level {user.level} • {user.xp}/{nextLevel?.xp_required || "MAX"} XP
          </p>
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 mb-1">
        <div
          className={`${currentLevel.color} h-3 rounded-full transition-all duration-500`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {nextLevel && (
        <div className="flex justify-between text-xs">
          <span>
            Streak: {user.current_streak}/{nextLevel.streak_required} days
          </span>
          <span>Next: {nextLevel.name}</span>
        </div>
      )}
    </div>
  );
};
