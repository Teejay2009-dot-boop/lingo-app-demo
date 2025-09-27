import { auth, db } from "../firebase/config/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import profilePic from "../assets/IMG-20250724-WA0123.jpg";
import { Link } from "react-router-dom";
import { FaChartBar, FaKeyboard, FaTree, FaHome, FaProcedures } from "react-icons/fa";
import { getUserRank } from "../utils/rankSystem";

export default function Profile() {
  const [user, setUser] = useState(null);

  // Placeholder for recent badges and achievements
  const recentBadges = [
    {
      id: "b1",
      icon: "🥇",
      name: "First Lesson",
      description: "Completed your first lesson!",
    },
    {
      id: "b2",
      icon: "🌟",
      name: "7-Day Streak",
      description: "Maintained a streak for 7 days!",
    },
    // ... more badges
  ];

  const recentAchievements = [
    {
      id: "a1",
      icon: "🔥",
      name: "Fire Streak",
      description: "Completed 30 consecutive lessons!",
    },
    {
      id: "a2",
      icon: "🧠",
      name: "Grammar Guru",
      description: "Mastered all grammar modules!",
    },
    // ... more achievements
  ];

  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubscribe = onSnapshot(
      doc(db, "users", auth.currentUser.uid),
      (doc) => {
        if (doc.exists()) setUser(doc.data());
      }
    );

    const streakMetaRef = doc(
      db,
      `users/${auth.currentUser.uid}/meta`,
      "streak"
    );
    const unsubscribeStreak = onSnapshot(streakMetaRef, (snap) => {
      if (snap.exists()) {
        setUser((prevUser) => ({ ...prevUser, ...snap.data() }));
      }
    });

    return () => {
      unsubscribe();
      unsubscribeStreak();
    };
  }, []);

  // Get real rank using rank system
  const realRank = user
    ? getUserRank({
        level: user.level || 1,
        accuracy: user.progress?.accuracy || 0,
        streak: user.current_streak || 0,
        lessons: user.lessons || 0,
      })
    : "Moonstone";

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
            Hey {user?.username || "Joxy"}
          </h2>
          <p className="text-amber-600 text-lg flex items-center justify-center gap-1 mt-2">
            <span className="text-xl">🔶</span> {realRank}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="flex justify-around items-center flex-wrap gap-4 mt-8 px-4">
          {/* Level Card */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl shadow-md bg-white border border-yellow-200 w-32 h-32">
            <p className="text-amber-500 font-bold text-lg mb-2">Level</p>
            <p className="text-gray-800 text-3xl font-bold">
              {user?.level || 15}
            </p>
          </div>
          {/* Streak Card */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl shadow-md bg-white border border-yellow-200 w-32 h-32">
            <p className="text-4xl mb-1">🔥</p>
            <p className="text-gray-800 text-3xl font-bold">
              {user?.streak || 15} day
            </p>
          </div>
          {/* XP Card */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl shadow-md bg-white border border-yellow-200 w-32 h-32">
            <p className="text-amber-500 font-bold text-lg mb-2">XP</p>
            <p className="text-gray-800 text-3xl font-bold">
              {user?.xp || 800}
              </p>
            </div>
          </div>

        {/* Badges Section */}
        <div className="px-4 mt-12">
          <Link to="/badges" className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-yellow-600">Badges</h2>
            <span className="text-amber-500 hover:underline">See all &gt;</span>
          </Link>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {recentBadges.slice(0, 2).map((badge) => (
              <div
                key={badge.id}
                className="flex flex-col items-center p-4 bg-white rounded-xl shadow-md border border-yellow-100"
              >
                <span className="text-4xl mb-2">{badge.icon}</span>
                <p className="text-gray-700 font-medium text-center">
                  {badge.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements Section */}
        <div className="px-4 mt-12">
          <Link
            to="/achievements"
            className="flex justify-between items-center mb-4"
          >
            <h2 className="text-2xl font-bold text-yellow-600">Achievements</h2>
            <span className="text-amber-500 hover:underline">See all &gt;</span>
          </Link>
          <div className="space-y-4">
            {recentAchievements.slice(0, 2).map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center p-4 bg-white rounded-xl shadow-md border border-yellow-100"
              >
                <span className="text-4xl mr-4">{achievement.icon}</span>
                <p className="text-gray-700 font-medium">{achievement.name}</p>
              </div>
            ))}
          </div>
        </div>

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
                <Link to={"/notifications"} className="flex flex-col items-center pt-3">
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
