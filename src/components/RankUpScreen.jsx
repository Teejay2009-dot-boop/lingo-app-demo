import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { getLevelProgress } from "../utils/progression";
import { RANK_SYSTEM, getNextRankProgress } from "../data/RankSystem"; // FIXED IMPORT PATH

export const RankUpScreen = ({ isOpen, onClose, rankData }) => {
  if (!isOpen || !rankData) return null;

  const { oldRank, newRank, level, userXp } = rankData;

  // Use the new progressive level system
  const { progress, currentLevel, xpProgress, xpNeeded, totalXP } =
    getLevelProgress(userXp);

  // Get current rank info from the rank system
  const currentRankInfo = RANK_SYSTEM[newRank] || RANK_SYSTEM.Moonstone;

  // Get next rank progress
  const nextRankProgress = getNextRankProgress({
    level: currentLevel,
    accuracy: rankData.accuracy || 0,
    streak: rankData.streak || 0,
    lessonsCompleted: rankData.lessonsCompleted || 0,
  });

  // Simple XP formatting function since formatXP is not available
  const formatXP = (xp) => {
    if (xp >= 1000000) {
      return (xp / 1000000).toFixed(1) + "M";
    } else if (xp >= 1000) {
      return (xp / 1000).toFixed(1) + "K";
    }
    return xp.toString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 text-center max-w-sm w-full mx-4 shadow-2xl relative">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Rank Up! 🎉</h2>

        <Swiper spaceBetween={20} slidesPerView={1}>
          {/* Current Rank Slide */}
          <SwiperSlide>
            <div className="flex flex-col items-center">
              {/* Rank Badge */}
              <div
                className="w-24 h-24 mb-4 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                style={{
                  backgroundColor: `rgba(${currentRankInfo.color[0] * 255}, ${
                    currentRankInfo.color[1] * 255
                  }, ${currentRankInfo.color[2] * 255}, ${
                    currentRankInfo.color[3]
                  })`,
                }}
              >
                {newRank.charAt(0)}
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {newRank}
              </h3>
              <p className="text-gray-600 text-sm">Level {currentLevel}</p>
              <p className="text-gray-600 text-sm mb-4">
                {formatXP(totalXP)} Total XP
              </p>

              {/* Level Progress bar */}
              <div className="w-full">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: "#e1b300",
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {formatXP(xpProgress)} / {formatXP(xpNeeded)} XP to Level{" "}
                  {currentLevel + 1}
                </p>
              </div>

              {/* Rank Requirements Met */}
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-semibold text-green-800">
                  Requirements Met:
                </p>
                <p className="text-xs text-green-600">
                  Level {currentLevel} • Accuracy {rankData.accuracy || 0}% •
                  Streak {rankData.streak || 0} • Lessons{" "}
                  {rankData.lessonsCompleted || 0}
                </p>
              </div>
            </div>
          </SwiperSlide>

          {/* Next Rank Preview Slide */}
          {nextRankProgress && (
            <SwiperSlide>
              <div className="flex flex-col items-center">
                <div
                  className="w-20 h-20 mb-4 rounded-full flex items-center justify-center text-white text-xl font-bold opacity-60"
                  style={{
                    backgroundColor: `rgba(${
                      nextRankProgress.nextRank.color[0] * 255
                    }, ${nextRankProgress.nextRank.color[1] * 255}, ${
                      nextRankProgress.nextRank.color[2] * 255
                    }, ${nextRankProgress.nextRank.color[3]})`,
                  }}
                >
                  {nextRankProgress.nextRank.name.charAt(0)}
                </div>
                <p className="text-lg text-gray-700 mb-1">Next Rank:</p>
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  {nextRankProgress.nextRank.name}
                </h3>

                {/* Next Rank Requirements */}
                <div className="w-full mt-3 space-y-2">
                  <div className="text-left">
                    <p className="text-xs text-gray-600">
                      Level: {nextRankProgress.progress.level.toFixed(0)}%
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${nextRankProgress.progress.level}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-left">
                    <p className="text-xs text-gray-600">
                      Accuracy: {nextRankProgress.progress.accuracy.toFixed(0)}%
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-green-500"
                        style={{
                          width: `${nextRankProgress.progress.accuracy}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="text-left">
                    <p className="text-xs text-gray-600">
                      Streak: {nextRankProgress.progress.streak.toFixed(0)}%
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-orange-500"
                        style={{
                          width: `${nextRankProgress.progress.streak}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="text-left">
                    <p className="text-xs text-gray-600">
                      Lessons: {nextRankProgress.progress.lessons.toFixed(0)}%
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-purple-500"
                        style={{
                          width: `${nextRankProgress.progress.lessons}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          )}
        </Swiper>

        {/* Button */}
        <button
          onClick={onClose}
          className="bg-[#e1b300] text-white mt-6 px-6 py-2 rounded-full text-lg font-bold hover:opacity-90 transition w-full"
        >
          Continue
        </button>
      </div>
    </div>
  );
};
