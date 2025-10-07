import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { auth, db } from "../firebase/config/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { RANK_SYSTEM, getUserRank } from "../data/RankSystem";
import { getLevelProgress } from "../utils/progression";

const Ranking = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/login");
      return;
    }

    const userUnsubscribe = onSnapshot(
      doc(db, "users", auth.currentUser.uid),
      (doc) => {
        if (doc.exists()) {
          setUserData(doc.data());
        }
        setLoading(false);
      }
    );

    return () => userUnsubscribe();
  }, [navigate]);

  // Get user's current rank info
  const userRankInfo = userData
    ? getUserRank({
        level: userData.level || 1,
        accuracy: userData.progress?.accuracy || 0,
        streak: userData.current_streak || 0,
        lessonsCompleted: userData.total_lessons || 0,
      })
    : { name: "Moonstone" };

  // Get all ranks in order
  const allRanks = Object.keys(RANK_SYSTEM);
  const currentRankIndex = allRanks.indexOf(userRankInfo.name);

  // Format XP function
  const formatXP = (xp) => {
    if (xp === undefined || xp === null) return "0";
    const xpNumber = Number(xp);
    if (isNaN(xpNumber)) return "0";
    if (xpNumber >= 1000000) {
      return (xpNumber / 1000000).toFixed(1) + "M";
    } else if (xpNumber >= 1000) {
      return (xpNumber / 1000).toFixed(1) + "K";
    }
    return xpNumber.toString();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading ranks...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-600 hover:text-amber-600 rounded-lg transition-colors"
              >
                <FaArrowLeft className="text-xl" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Ranks</h1>
                <p className="text-gray-500 text-sm">Swipe to view all ranks</p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Rank Info */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-white rounded-2xl p-6 text-center shadow-md border-2 border-amber-300">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {userData?.username || "Learner"}
            </h2>
            <p className="text-amber-600 text-lg font-semibold">
              Current Rank: {userRankInfo.name}
            </p>
            <p className="text-gray-500">
              Level {userData?.level || 1} • {formatXP(userData?.xp || 0)} XP
            </p>
          </div>
        </div>

        {/* Horizontal Rank Slider */}
        <div className="max-w-sm mx-auto px-4 py-6">
          <div className="bg-white rounded-2xl p-6 text-center shadow-2xl">
            <Swiper spaceBetween={20} slidesPerView={1}>
              {allRanks.map((rankName, index) => {
                const rank = RANK_SYSTEM[rankName];
                const isCurrentRank = rankName === userRankInfo.name;
                const isUnlocked = index <= currentRankIndex;

                return (
                  <SwiperSlide key={rankName}>
                    <div className="flex flex-col items-center">
                      {/* Rank Badge */}
                      <div
                        className="w-24 h-24 mb-4 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg"
                        style={{
                          backgroundColor: `rgba(${rank.color[0] * 255}, ${
                            rank.color[1] * 255
                          }, ${rank.color[2] * 255}, ${rank.color[3]})`,
                          border: isCurrentRank ? "4px solid #e1b300" : "none",
                        }}
                      >
                        {rankName.charAt(0)}
                      </div>

                      <h3 className="text-2xl font-bold text-gray-900 mb-1">
                        {rankName}
                      </h3>

                      {isCurrentRank && (
                        <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-bold mb-2">
                          CURRENT RANK
                        </span>
                      )}

                      <p className="text-gray-600 text-sm mb-2">
                        Level {rank.min_level} - {rank.max_level}
                      </p>

                      {/* Requirements */}
                      <div className="w-full mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-semibold text-gray-800 mb-2">
                          Requirements:
                        </p>
                        <div className="space-y-1 text-xs text-gray-600">
                          <div>Accuracy: {rank.requirements.accuracy}%</div>
                          <div>Streak: {rank.requirements.streak} days</div>
                          <div>Lessons: {rank.requirements.lessons}</div>
                        </div>
                      </div>

                      {/* Status */}
                      <div
                        className={`mt-4 px-4 py-2 rounded-full text-sm font-medium ${
                          isUnlocked
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {isUnlocked ? "✓ Unlocked" : "🔒 Locked"}
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>

            {/* Progress Indicator */}
            <div className="mt-6">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>
                  {currentRankIndex + 1} of {allRanks.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      (currentRankIndex / (allRanks.length - 1)) * 100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="max-w-sm mx-auto px-4 py-6">
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
              Your Progress
            </h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-amber-50 rounded-lg">
                <p className="text-2xl font-bold text-amber-600">
                  {userData?.level || 1}
                </p>
                <p className="text-xs text-gray-600">Level</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {userData?.progress?.accuracy || 0}%
                </p>
                <p className="text-xs text-gray-600">Accuracy</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">
                  {userData?.current_streak || 0}
                </p>
                <p className="text-xs text-gray-600">Streak</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {userData?.total_lessons || 0}
                </p>
                <p className="text-xs text-gray-600">Lessons</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Ranking;
