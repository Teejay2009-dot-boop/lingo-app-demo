import React from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";
import BADGES from "../data/badges";
import {
  MdSchool,
  MdLocalFireDepartment,
  MdCalendarMonth,
  MdStar,
  MdBook,
  MdHearing,
  MdEditDocument,
  MdWbSunny,
  MdBedtime,
  MdCalendarViewWeek,
  MdTimer,
  MdEmojiEvents,
  MdDoneAll,
} from "react-icons/md";
import { FiLock, FiUnlock } from "react-icons/fi"; // For lock/unlock icons

const BadgeIcon = ({ iconName }) => {
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
    case "pencil":
      return <MdEditDocument className="text-4xl text-orange-500" />;
    case "ear-hearing":
      return <MdHearing className="text-4xl text-green-600" />;
    case "weather-sunny":
      return <MdWbSunny className="text-4xl text-yellow-400" />;
    case "weather-night":
      return <MdBedtime className="text-4xl text-gray-800" />;
    case "calendar-weekend":
      return <MdCalendarViewWeek className="text-4xl text-green-500" />;
    case "timer":
      return <MdTimer className="text-4xl text-gray-700" />;
    case "trophy":
      return <MdEmojiEvents className="text-4xl text-gold-500" />;
    case "progress-check":
      return <MdDoneAll className="text-4xl text-teal-500" />;
    default:
      return null;
  }
};

const Badges = () => {
  const navigate = useNavigate();

  // For now, let's assume some badges are completed for demonstration
  const completedBadges = new Set(["first_lesson"]);

  // Group badges by tier
  const groupedBadges = Object.values(BADGES).reduce((acc, badge) => {
    const tier = badge.tier.charAt(0).toUpperCase() + badge.tier.slice(1);
    if (!acc[tier]) {
      acc[tier] = [];
    }
    acc[tier].push(badge);
    return acc;
  }, {});

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
            Badges
          </p>

          {Object.entries(groupedBadges).map(([tier, badges]) => (
            <div key={tier} className="mb-8">
              <h3 className="text-xl font-bold text-amber-700 mb-4">
                {tier} Badges
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {badges.map((badge) => {
                  const isCompleted = completedBadges.has(badge.id);
                  return (
                    <div
                      key={badge.id}
                      className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center justify-center text-center w-40 h-44"
                    >
                      <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full mb-2">
                        <BadgeIcon iconName={badge.icon} />
                      </div>
                      <p className="text-lg font-semibold text-gray-800 mb-1">
                        {badge.name}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        {badge.description}
                      </p>
                      {isCompleted ? (
                        <FiUnlock className="text-green-500 text-xl" />
                      ) : (
                        <FiLock className="text-gray-400 text-xl" />
                      )}
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

export default Badges;
