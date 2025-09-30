import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";
import ACHIEVEMENTS from "../data/achievements";
import {
  MdSchool,
  MdLocalFireDepartment,
  MdCalendarMonth,
  MdStar,
  MdBook,
  MdHearing,
  MdEditDocument,
  MdGroups,
  MdTimer,
  MdWbSunny,
  MdBedtime,
  MdCalendarViewWeek,
  MdEmojiEvents,
  MdWorkspacePremium,
  MdDoneAll,
  MdShare,
  MdStarBorder,
  MdExplore,
  MdDirectionsRun,
} from "react-icons/md";
import { FiLock, FiUnlock } from "react-icons/fi";
import { doc, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase/config/firebase";
import { getAchievementProgress } from "../utils/achievements";

const AchievementIcon = ({ iconName }) => {
  switch (iconName) {
    case "school":
      return <MdSchool className="text-4xl text-yellow-600" />;
    case "fire":
      return <MdLocalFireDepartment className="text-4xl text-red-500" />;
    case "calendar-month":
      return <MdCalendarMonth className="text-4xl text-blue-500" />;
    case "star":
      return <MdStar className="text-4xl text-yellow-500" />;
    case "book":
      return <MdBook className="text-4xl text-purple-600" />;
    case "ear-hearing":
      return <MdHearing className="text-4xl text-green-600" />;
    case "pencil":
      return <MdEditDocument className="text-4xl text-orange-500" />;
    case "account-group":
      return <MdGroups className="text-4xl text-indigo-500" />;
    case "timer":
      return <MdTimer className="text-4xl text-gray-700" />;
    case "weather-sunny":
      return <MdWbSunny className="text-4xl text-yellow-400" />;
    case "weather-night":
      return <MdBedtime className="text-4xl text-gray-800" />;
    case "calendar-weekend":
      return <MdCalendarViewWeek className="text-4xl text-green-500" />;
    case "trophy":
      return <MdEmojiEvents className="text-4xl text-yellow-600" />;
    case "trophy-award":
      return <MdWorkspacePremium className="text-4xl text-purple-700" />;
    case "progress-check":
      return <MdDoneAll className="text-4xl text-teal-500" />;
    case "progress-star":
      return <MdStar className="text-4xl text-amber-500" />;
    case "share":
      return <MdShare className="text-4xl text-blue-400" />;
    case "star-box":
      return <MdStarBorder className="text-4xl text-yellow-500" />;
    case "compass":
      return <MdExplore className="text-4xl text-cyan-500" />;
    case "run":
      return <MdDirectionsRun className="text-4xl text-red-600" />;
    default:
      return null;
  }
};

const Achievements = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    const userRef = doc(db, "users", auth.currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Get user's earned achievements
  const earnedAchievements = userData?.unlocked_achievements || [];

  // Group achievements by tier
  const groupedAchievements = Object.values(ACHIEVEMENTS).reduce(
    (acc, achievement) => {
      const tier = achievement.tier.charAt(0).toUpperCase() + achievement.tier.slice(1);
      if (!acc[tier]) {
        acc[tier] = [];
      }
      acc[tier].push(achievement);
      return acc;
    },
    {}
  );

  const getTierColor = (tier) => {
    switch (tier.toLowerCase()) {
      case 'platinum': return 'border-purple-500 bg-purple-50';
      case 'gold': return 'border-yellow-500 bg-yellow-50';
      case 'silver': return 'border-gray-400 bg-gray-50';
      case 'bronze': return 'border-orange-700 bg-orange-50';
      default: return 'border-amber-500 bg-amber-50';
    }
  };

  const getProgressColor = (progress, isCompleted) => {
    if (isCompleted) return "bg-green-500";
    if (progress > 75) return "bg-blue-500";
    if (progress > 50) return "bg-amber-500";
    if (progress > 25) return "bg-orange-500";
    return "bg-gray-400";
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="pt-14 lg:pt-0 p-4">
          <div className="text-center py-10">Loading achievements...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="pt-14 lg:pt-0 p-4">
        <button
          onClick={() => navigate(-1)}
          className="p-3 text-amber text-2xl rounded-lg"
        >
          <FaArrowLeft />
        </button>
        <p className="flex justify-center text-amber text-3xl font-bold mb-2">
          Achievements
        </p>
        <p className="text-center text-amber text-lg mb-6">
          Earned: {earnedAchievements.length} / {Object.keys(ACHIEVEMENTS).length}
        </p>

        {Object.entries(groupedAchievements).map(([tier, achievements]) => {
          const tierEarnedCount = achievements.filter(achievement => 
            earnedAchievements.includes(achievement.id)
          ).length;
          
          return (
            <div key={tier} className="mb-8">
              <div className={`border-l-4 ${getTierColor(tier)} rounded-lg p-4 mb-4`}>
                <h3 className="text-xl font-bold text-gray-800">
                  {tier} Achievements ({tierEarnedCount}/{achievements.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {achievements.map((achievement) => {
                  const isCompleted = earnedAchievements.includes(achievement.id);
                  const progress = getAchievementProgress(achievement, userData);
                  
                  return (
                    <div
                      key={achievement.id}
                      className={`bg-white rounded-xl shadow-md p-4 flex items-center justify-between border-2 ${
                        isCompleted ? 'border-green-500' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center flex-grow">
                        <div className={`w-12 h-12 flex items-center justify-center rounded-full mr-4 ${
                          isCompleted ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <AchievementIcon iconName={achievement.icon} />
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-lg font-semibold text-gray-800">
                              {achievement.name}
                            </p>
                            {isCompleted && (
                              <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                                Completed
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {achievement.description}
                          </p>
                          
                          {/* Progress Bar */}
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full transition-all duration-500 ${getProgressColor(progress, isCompleted)}`}
                              style={{ width: `${isCompleted ? 100 : progress}%` }}
                            ></div>
                          </div>
                          
                          {/* Progress Text */}
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-500">
                              {isCompleted ? "Completed!" : `${progress}% complete`}
                            </span>
                            {achievement.reward && (
                              <div className="flex gap-2 text-xs">
                                {achievement.reward.coins && (
                                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                    {achievement.reward.coins} coins
                                  </span>
                                )}
                                {achievement.reward.tickets && (
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    {achievement.reward.tickets} tickets
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        {isCompleted ? (
                          <div className="text-green-500 flex items-center">
                            <FiUnlock className="text-xl mr-1" />
                          </div>
                        ) : (
                          <div className="text-gray-400">
                            <FiLock className="text-xl" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
};

export default Achievements;