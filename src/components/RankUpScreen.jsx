import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { LEVELS, getLevelProgress } from "../utils/progression";

export const RankUpScreen = ({ isOpen, onClose, rankData }) => {
  if (!isOpen || !rankData) return null;

  const { oldRank, newRank, level, userXp } = rankData;

  const currentLevelInfo = LEVELS.find((l) => l.level === level);
  const nextLevelInfo = LEVELS.find((l) => l.level === level + 1);
  const { progress } = getLevelProgress(userXp);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 text-center max-w-sm w-full mx-4 shadow-2xl relative">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Ranks</h2>

        <Swiper spaceBetween={20} slidesPerView={1}>
          {/* Current Rank Slide */}
          <SwiperSlide>
            <div className="flex flex-col items-center">
              {/* Rank image placeholder */}
              <img
                src="/images/rank-icons/gold.png" // change to your actual rank icon
                alt="Rank Icon"
                className="w-24 h-24 mb-4"
              />

              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {newRank}
              </h3>
              <p className="text-gray-600 text-sm">Level {level}</p>
              <p className="text-gray-600 text-sm mb-4">XP {userXp}</p>

              {/* Progress bar */}
              {nextLevelInfo ? (
                <div className="w-full">
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-3 rounded-full"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: "#e1b300",
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    XP to Next Level:{" "}
                    <span className="font-semibold text-gray-700">
                      {userXp - currentLevelInfo.xpRequired}/
                      {nextLevelInfo.xpRequired - currentLevelInfo.xpRequired}
                    </span>
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-600 mt-2">
                  🎉 Max level reached!
                </p>
              )}
            </div>
          </SwiperSlide>

          {/* Next Rank Preview Slide */}
          {nextLevelInfo && (
            <SwiperSlide>
              <div className="flex flex-col items-center">
                <img
                  src="/images/rank-icons/next.png"
                  alt="Next Rank Icon"
                  className="w-20 h-20 mb-4"
                />
                <p className="text-lg text-gray-700 mb-1">Next Up:</p>
                <h3 className="text-xl font-bold text-[#e1b300] mb-1">
                  {nextLevelInfo.rank}
                </h3>
                <p className="text-sm text-gray-600">
                  Reach {nextLevelInfo.xpRequired} XP to unlock this rank.
                </p>
              </div>
            </SwiperSlide>
          )}
        </Swiper>

        {/* Button */}
        <button
          onClick={onClose}
          className="bg-[#e1b300] text-white mt-6 px-6 py-2 rounded-full text-lg font-bold hover:opacity-90 transition"
        >
          Continue
        </button>
      </div>
    </div>
  );
};
