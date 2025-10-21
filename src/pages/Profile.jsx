import { auth, db } from "../firebase/config/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { getUserRank } from "../utils/rankSystem";
import { useEffect, useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import profilePic from "../assets/IMG-20250724-WA0123.jpg";
import { Link } from "react-router-dom";
import StreakCalendar from "../components/StreakCalendar";
import {
  FaChartBar,
  FaKeyboard,
  FaTree,
  FaHome,
  FaProcedures,
  FaCog,
  FaFire,
  FaStar,
  FaTrophy,
  FaMedal,
  FaCalendarAlt, // Added missing import
} from "react-icons/fa";
import { getLevelProgress } from "../utils/progression";
import BADGES from "../data/badges";
import ACHIEVEMENTS from "../data/achievements";

// Badge Icon component
const BadgeIcon = ({ iconName }) => {
  switch (iconName) {
    case "school":
      return <FaMedal className="text-2xl text-yellow-600" />;
    case "fire":
      return <FaFire className="text-2xl text-red-500" />;
    case "calendar-month":
      return <FaMedal className="text-2xl text-blue-500" />;
    case "star":
      return <FaStar className="text-2xl text-yellow-500" />;
    case "book":
      return <FaMedal className="text-2xl text-purple-600" />;
    case "pencil":
      return <FaMedal className="text-2xl text-orange-500" />;
    case "ear-hearing":
      return <FaMedal className="text-2xl text-green-600" />;
    case "weather-sunny":
      return <FaMedal className="text-2xl text-yellow-400" />;
    case "weather-night":
      return <FaMedal className="text-2xl text-gray-800" />;
    case "calendar-weekend":
      return <FaMedal className="text-2xl text-green-500" />;
    case "timer":
      return <FaMedal className="text-2xl text-gray-700" />;
    case "trophy":
      return <FaTrophy className="text-2xl text-yellow-600" />;
    case "progress-check":
      return <FaMedal className="text-2xl text-teal-500" />;
    default:
      return <FaMedal className="text-2xl text-amber-500" />;
  }
};

// Achievement Icon component
const AchievementIcon = ({ iconName }) => {
  switch (iconName) {
    case "school":
    case "book":
    case "pencil":
      return <FaMedal className="text-2xl text-yellow-600" />;
    case "fire":
      return <FaFire className="text-2xl text-red-500" />;
    case "star":
    case "trophy":
    case "trophy-award":
      return <FaTrophy className="text-2xl text-yellow-500" />;
    case "timer":
    case "run":
      return <FaMedal className="text-2xl text-blue-500" />;
    default:
      return <FaMedal className="text-2xl text-amber-500" />;
  }
};

export default function Profile() {
  const [user, setUser] = useState(null);
  const [recentBadges, setRecentBadges] = useState([]);
  const [recentAchievements, setRecentAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStreakCalendar, setShowStreakCalendar] = useState(false);

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

  useEffect(() => {
    if (!auth.currentUser) return;

    const uid = auth.currentUser.uid;

    // Listen to user data - ONLY ONE SOURCE NOW
    const userUnsubscribe = onSnapshot(doc(db, "users", uid), (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        setUser(userData);

        // Get recent badges from unlocked_badges
        if (userData.unlocked_badges) {
          const userBadges = userData.unlocked_badges.slice(-4).reverse();
          const badgeDetails = userBadges
            .map((badgeId) => BADGES[badgeId])
            .filter((badge) => badge);
          setRecentBadges(badgeDetails);
        }

        // Get recent achievements from unlocked_achievements
        if (userData.unlocked_achievements) {
          const userAchievements = userData.unlocked_achievements
            .slice(-4)
            .reverse();
          const achievementDetails = userAchievements
            .map((achievementId) => ACHIEVEMENTS[achievementId])
            .filter((achievement) => achievement);
          setRecentAchievements(achievementDetails);
        }
      }
      setLoading(false);
    });

    // REMOVED: The meta streak listener entirely

    return () => {
      userUnsubscribe();
      // No streak unsubscribe needed anymore
    };
  }, []);

  // Get real rank using rank system
  const realRank = user
    ? getUserRank({
        level: user.level || 1,
        accuracy: user.progress?.accuracy || 0,
        streak: user.current_streak || 0,
        lessonsCompleted: user.total_lessons || user.lessons || 0,
      })
    : "Moonstone";

  // Get level progress
  const progressData = user
    ? getLevelProgress(user.xp || 0)
    : {
        currentLevel: 1,
        progress: 0,
        totalXP: 0,
      };

  // Get current streak - ONLY from user document now
  const currentStreak = user?.current_streak || 0;
  const longestStreak = user?.longest_streak || 0;

  // Get total counts
  const totalBadges = user?.unlocked_badges?.length || 0;
  const totalAchievements = user?.unlocked_achievements?.length || 0;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white relative pb-10">
        {/* Profile Header Background */}
        <div className="bg-yellow-400 h-48 rounded-b-3xl relative overflow-hidden">
          <div className="absolute inset-0 bg-profile-wave opacity-20"></div>
          <h1 className="text-white text-xl font-bold text-center pt-6">
            Profile
          </h1>
        </div>

        {/* Profile Picture */}
        <div
          className="absolute left-1/2 transform -translate-x-1/2"
          style={{ top: "100px" }}
        >
          <img
            src={user?.photoURL || profilePic}
            className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
            alt="Profile"
          />
        </div>

        {/* User Info */}
        <div className="text-center mt-20 px-4">
          <h2 className="text-3xl font-bold text-gray-800">
            Hey {user?.username || "Learner"}
          </h2>
          <p className="text-amber-600 text-lg flex items-center justify-center gap-1 mt-2">
            <span className="text-xl">🔶</span> {realRank}
          </p>
        </div>

        {/* Settings Button */}
        <div className="flex justify-center mt-4 fixed bottom-20 right-5 z-10">
          <Link
            to="/profile/settings"
            className="flex items-center justify-center text-3xl bg-amber text-white w-16 h-16 rounded-2xl hover:bg-amber-600 transition-colors shadow-lg"
          >
            <FaCog />
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="flex justify-around items-center flex-wrap gap-4 mt-8 px-4">
          {/* Level Card */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl shadow-md bg-white border border-yellow-200 w-32 h-32">
            <FaStar className="text-amber-500 text-2xl mb-2" />
            <p className="text-amber-500 font-bold text-lg mb-1">Level</p>
            <p className="text-gray-800 text-3xl font-bold">
              {progressData.currentLevel}
            </p>
            
          </div>

          {/* Streak Card */}
          <div
            onClick={() => setShowStreakCalendar(true)}
            className="flex flex-col items-center justify-center p-4 rounded-xl shadow-md bg-white border border-yellow-200 w-32 h-32 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <FaFire className="text-red-500 text-2xl mb-2" />
            <p className="text-amber-500 font-bold text-lg mb-1">Streak</p>
            <p className="text-gray-800 text-3xl font-bold">{currentStreak}</p>
            
          </div>

          {/* XP Card */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl shadow-md bg-white border border-yellow-200 w-32 h-32">
            <FaTrophy className="text-amber-500 text-2xl mb-2" />
            <p className="text-amber-500 font-bold text-lg mb-1">Total XP</p>
            <p className="text-gray-800 text-2xl font-bold">
              {formatXP(user?.xp || 0)}
            </p>
            
          </div>
        </div>

        {/* Accuracy Card */}
        <div className="mx-4 mt-6 p-4 bg-white rounded-xl shadow-md border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-500 font-bold text-lg">Accuracy</p>
              <p className="text-gray-800 text-2xl font-bold">
                {user?.progress?.accuracy || 0}%
              </p>
              <p className="text-xs text-gray-500">
                {user?.progress?.correct_answers || 0}/
                {user?.progress?.total_questions || 0} correct
              </p>
            </div>
            <div className="text-4xl">🎯</div>
          </div>
        </div>

        {/* Recent Badges Section */}
        <div className="px-4 mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-yellow-600">
              Recent Badges ({totalBadges})
            </h2>
            <Link
              to="/badges"
              className="text-amber-500 hover:underline text-sm"
            >
              See all &gt;
            </Link>
          </div>

          {recentBadges.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {recentBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex flex-col items-center p-4 bg-white rounded-xl shadow-md border border-yellow-100 hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-amber-100 mb-2">
                    <BadgeIcon iconName={badge.icon} />
                  </div>
                  <p className="text-gray-700 font-medium text-center text-sm mb-1">
                    {badge.name}
                  </p>
                  <p className="text-gray-500 text-xs text-center">
                    {badge.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <span className="text-4xl mb-4 block">🏆</span>
              <p className="text-gray-600">No badges earned yet</p>
              <p className="text-gray-500 text-sm mt-2">
                Complete lessons to earn your first badge!
              </p>
            </div>
          )}
        </div>

        {/* Recent Achievements Section */}
        <div className="px-4 mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-yellow-600">
              Recent Achievements ({totalAchievements})
            </h2>
            <Link
              to="/achievements"
              className="text-amber-500 hover:underline text-sm"
            >
              See all &gt;
            </Link>
          </div>

          {recentAchievements.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {recentAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center p-3 bg-white rounded-xl shadow-md border border-green-100 hover:shadow-lg transition-shadow"
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-100 mr-3">
                    <AchievementIcon iconName={achievement.icon} />
                  </div>
                  <div className="flex-grow">
                    <p className="text-gray-700 font-medium text-sm">
                      {achievement.name}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <span className="text-3xl mb-3 block">⭐</span>
              <p className="text-gray-600 text-sm">No achievements yet</p>
              <p className="text-gray-500 text-xs mt-1">
                Keep learning to unlock achievements!
              </p>
            </div>
          )}
        </div>

        {/* Quick Stats Section */}
        <div className="px-4 mt-8">
          <h2 className="text-2xl font-bold text-yellow-600 mb-4">
            Quick Stats
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-xl shadow-md border border-yellow-100">
              <p className="text-gray-500 text-sm">Coins</p>
              <p className="text-2xl font-bold text-gray-800">
                {user?.coins || 0}
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-md border border-yellow-100">
              <p className="text-gray-500 text-sm">Lives</p>
              <p className="text-2xl font-bold text-gray-800">
                {user?.lives || 0}/{user?.max_lives || 5}
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-md border border-yellow-100">
              <p className="text-gray-500 text-sm">Badges</p>
              <p className="text-2xl font-bold text-gray-800">{totalBadges}</p>
            </div>
            <div className="p-4 bg-white rounded-xl shadow-md border border-yellow-100">
              <p className="text-gray-500 text-sm">Achievements</p>
              <p className="text-2xl font-bold text-gray-800">
                {totalAchievements}
              </p>
            </div>
          </div>
        </div>

        {/* Streak Calendar Modal */}
        <StreakCalendar
          isOpen={showStreakCalendar}
          onClose={() => setShowStreakCalendar(false)}
        />

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 w-full h-16 flex items-center text-amber justify-around bg-gray-100 lg:hidden">
          <Link to={"/lessons"} className="flex flex-col items-center pt-3">
            <FaHome className="text-2xl" />
            <p className="text-amber text-sm">Home</p>
          </Link>
          <Link to={"/leaderboard"} className="flex flex-col items-center pt-3">
            <FaChartBar className="text-2xl" />
            <p className="text-amber text-sm">Ranking</p>
          </Link>
          <Link to={"/dashboard"} className="flex flex-col items-center pt-3">
            <FaKeyboard className="text-2xl " />
            <p className="text-amber text-sm">Dashboard</p>
          </Link>
          <Link
            to={"/notifications"}
            className="flex flex-col items-center pt-3"
          >
            <FaTree className="text-2xl" />
            <p className="text-amber text-sm">Feed</p>
          </Link>
          <Link to={"/profile"} className="flex flex-col items-center pt-3">
            <FaProcedures className="text-2xl" />
            <p className="text-amber text-sm">Profile</p>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}