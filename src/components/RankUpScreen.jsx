import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { LEVELS, getLevelProgress } from "../utils/progression";

export const RankUpScreen = ({ isOpen, onClose, rankData }) => {
  if (!isOpen || !rankData) return null;

  const { oldRank, newRank, level, userXp } = rankData;

  const currentLevelInfo = LEVELS.find((l) => l.level === level);
  const nextLevelInfo = LEVELS.find((l) => l.level === level + 1);
  const { progress } = getLevelProgress(userXp);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-600 to-blue-700 rounded-2xl p-6 text-center max-w-md w-full mx-4 text-white shadow-2xl relative">
        <h2 className="text-3xl font-bold mb-4">🏆 Rank Up!</h2>

        <Swiper spaceBetween={20} slidesPerView={1}>
          {/* Current Rank Slide */}
          <SwiperSlide>
            <div className="p-4">
              <p className="text-xl mb-2">You’ve ranked up!</p>
              <div className="flex justify-center items-center gap-2 mb-4">
                <span className="line-through text-gray-300">{oldRank}</span>
                <span className="text-2xl">→</span>
                <span className="text-yellow-300 font-bold">{newRank}</span>
              </div>

              <div className="bg-white/20 rounded-lg p-4 mb-4">
                <p className="text-lg font-semibold">Level {level}</p>
                <p className="text-sm">Total XP: {userXp}</p>
              </div>
            </div>
          </SwiperSlide>

          {/* Progress Slide */}
          <SwiperSlide>
            <div className="flex flex-col items-center">
              <p className="text-lg mb-2">Your Progress</p>
              <div className="w-32 h-32 mb-4">
                <CircularProgressbar
                  value={progress}
                  text={`${Math.round(progress)}%`}
                  styles={buildStyles({
                    textColor: "#fff",
                    pathColor: "#FFD700",
                    trailColor: "#444",
                  })}
                />
              </div>
              {nextLevelInfo ? (
                <p className="text-sm">
                  {userXp - currentLevelInfo.xpRequired}/
                  {nextLevelInfo.xpRequired - currentLevelInfo.xpRequired} XP
                  towards <b>{nextLevelInfo.rank}</b>
                </p>
              ) : (
                <p className="text-sm">🎉 Max level reached!</p>
              )}
            </div>
          </SwiperSlide>

          {/* Next Rank Preview Slide */}
          {nextLevelInfo && (
            <SwiperSlide>
              <div className="p-4">
                <p className="text-lg mb-2">Next Up:</p>
                <h3 className="text-2xl font-bold text-yellow-300 mb-2">
                  {nextLevelInfo.rank}
                </h3>
                <p className="text-sm">
                  Reach {nextLevelInfo.xpRequired} XP to unlock this rank.
                </p>
              </div>
            </SwiperSlide>
          )}
        </Swiper>

        {/* Button */}
        <button
          onClick={onClose}
          className="bg-yellow-400 text-gray-900 mt-6 px-6 py-2 rounded-full text-lg font-bold hover:bg-yellow-300 transition-colors shadow-lg"
        >
          Continue
        </button>
      </div>
    </div>
  );
};
