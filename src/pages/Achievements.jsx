import React from "react";
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
import { FiLock, FiUnlock } from "react-icons/fi"; // For lock/unlock icons

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
      return <MdEmojiEvents className="text-4xl text-gold-500" />;
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

  // For now, let's assume some achievements are completed for demonstration
  const completedAchievements = new Set(["first_lesson", "social_butterfly"]);

  // Group achievements by tier
  const groupedAchievements = Object.values(ACHIEVEMENTS).reduce(
    (acc, achievement) => {
      const tier =
        achievement.tier.charAt(0).toUpperCase() + achievement.tier.slice(1);
      if (!acc[tier]) {
        acc[tier] = [];
      }
      acc[tier].push(achievement);
      return acc;
    },
    {}
  );

  return (
    <>
      <DashboardLayout>
        <div className="pt-14 lg:pt-0 p-4">
          <button
            onClick={() => navigate(-1)}
            className="p-3 text-amber text-2xl rounded-lg"
          >
            <FaArrowLeft />
          </button>
          <p className="flex justify-center text-amber text-3xl font-bold mb-6">
            Achievements
          </p>

          {Object.entries(groupedAchievements).map(([tier, achievements]) => (
            <div key={tier} className="mb-8">
              <h3 className="text-xl font-bold text-amber-700 mb-4">
                {tier} Achievements
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {achievements.map((achievement) => {
                  const isCompleted = completedAchievements.has(achievement.id);
                  return (
                    <div
                      key={achievement.id}
                      className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center flex-grow">
                        <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full mr-4">
                          <AchievementIcon iconName={achievement.icon} />
                        </div>
                        <div className="flex-grow">
                          <p className="text-lg font-semibold text-gray-800">
                            {achievement.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {achievement.description}
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                            <div
                              className={`h-2.5 rounded-full ${
                                isCompleted ? "bg-amber-500" : "bg-gray-400"
                              }`}
                              style={{ width: isCompleted ? "100%" : "0%" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end ml-4">
                        {isCompleted ? (
                          <span className="text-xs text-amber-700 font-semibold">
                            Completed!
                          </span>
                        ) : (
                          <FiLock className="text-gray-400 text-xl" />
                        )}
                        {isCompleted && (
                          <FiUnlock className="text-green-500 text-xl" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </DashboardLayout>
    </>
  );
};

export default Achievements;
