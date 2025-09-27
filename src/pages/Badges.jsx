import React, { useEffect, useState } from "react";
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
import { FiLock, FiUnlock } from "react-icons/fi";
import { doc, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase/config/firebase";

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
      return <MdEmojiEvents className="text-4xl text-yellow-600" />;
    case "progress-check":
      return <MdDoneAll className="text-4xl text-teal-500" />;
    default:
      return null;
  }
};

const Badges = () => {
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

    return () => unsubscribe();
  }, []);

  // Calculate badge progress
  const getBadgeProgress = (badge) => {
    if (!userData) return 0;

    const requirements = badge.requirements;
    const [key, requiredValue] = Object.entries(requirements)[0];

    let currentValue = 0;

    switch (key) {
      case "lessons":
      case "total_lessons":
        currentValue = userData.completed_lessons?.length || 0;
        break;
      case "streak":
        currentValue = userData.current_streak || 0;
        break;
      case "accuracy":
        currentValue = userData.progress?.accuracy || 0;
        break;
      case "level":
        currentValue = userData.level || 1;
        break;
      default:
        currentValue = 0;
    }

    const progress = Math.min((currentValue / requiredValue) * 100, 100);
    return Math.round(progress);
  };

  // Get user's earned badges
  const earnedBadges = userData?.unlocked_badges || [];

  // Group badges by tier
  const groupedBadges = Object.values(BADGES).reduce((acc, badge) => {
    const tier = badge.tier.charAt(0).toUpperCase() + badge.tier.slice(1);
    if (!acc[tier]) {
      acc[tier] = [];
    }
    acc[tier].push(badge);
    return acc;
  }, {});

  if (loading) {
    return (
      <DashboardLayout>
        <div className="pt-14 lg:pt-0 p-4">
          <div className="text-center py-10">Loading badges...</div>
        </div>
      </DashboardLayout>
    );
  }

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
          <p className="flex justify-center text-amber text-3xl font-bold mb-2">
            Badges
          </p>
          <p className="text-center text-amber text-lg mb-6">
            Earned: {earnedBadges.length} / {Object.keys(BADGES).length}
          </p>

          {Object.entries(groupedBadges).map(([tier, badges]) => {
            const tierEarnedCount = badges.filter((badge) =>
              earnedBadges.includes(badge.id)
            ).length;

            return (
              <div key={tier} className="mb-8">
                <h3 className="text-xl font-bold text-amber-700 mb-4">
                  {tier} Badges ({tierEarnedCount}/{badges.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {badges.map((badge) => {
                    const isCompleted = earnedBadges.includes(badge.id);
                    const progress = getBadgeProgress(badge);

                    return (
                      <div
                        key={badge.id}
                        className={`bg-white rounded-xl shadow-md p-4 flex flex-col items-center justify-center text-center w-full min-h-44 border-2 ${
                          isCompleted ? "border-amber-500" : "border-gray-200"
                        }`}
                      >
                        <div
                          className={`w-12 h-12 flex items-center justify-center rounded-full mb-2 ${
                            isCompleted ? "bg-amber-100" : "bg-gray-100"
                          }`}
                        >
                          <BadgeIcon iconName={badge.icon} />
                        </div>
                        <p className="text-lg font-semibold text-gray-800 mb-1">
                          {badge.name}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          {badge.description}
                        </p>

                        {isCompleted ? (
                          <div className="flex items-center text-green-500">
                            <FiUnlock className="text-xl mr-1" />
                            <span className="text-sm font-medium">Earned</span>
                          </div>
                        ) : (
                          <div className="w-full">
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                              <div
                                className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-500">
                              {progress}% Complete
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </DashboardLayout>
    </>
  );
};

export default Badges;
