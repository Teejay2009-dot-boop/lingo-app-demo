import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import Badge from "../components/dashboard/Badges";
import NavBar from "../components/dashboard/NavBar";
import { FaStar, FaSteam, FaHeart, FaWallet } from "react-icons/fa";
import { Link } from "react-router-dom";
import avatar from "../assets/girlwithbg.jpg";
import { auth, db } from "../firebase/config/firebase";
import { doc, onSnapshot } from "firebase/firestore";

const Dashboard = () => {
  const [width, setWidth] = useState(window.innerWidth);
  const [userData, setUserData] = useState(null);

  // 📌 Track window resize
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 📌 Fetch live user data from Firestore
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const unsubscribeSnapshot = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        });
        return unsubscribeSnapshot;
      }
    });
    return unsubscribeAuth;
  }, []);

  if (!userData) {
    return (
      <DashboardLayout>
        <NavBar />
        <div className="p-8 text-center flex items-center justify-center text-xl h-screen">Loading your data...</div>
      </DashboardLayout>
    );
  }

  const totalLessons = userData.total_lessons || 0;
  const completedLessons = userData.completed_lessons?.length || 0;
  const progressPercent =
    totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  const xpProgress = userData.xp_to_next_level
    ? (userData.xp / userData.xp_to_next_level) * 100
    : 0;

  return (
    <DashboardLayout>
      <NavBar />

      {/* Greeting Banner */}
      <div className="pt-28 bg-gray-50 py-0 px-4 lg:px-12 rounded-xl shadow-sm mb-8 animate-fade-in-up transition">
        <div className="lg:flex items-center justify-between flex-wrap">
          <div className="flex items-center gap-6">
            <img
              src={avatar}
              alt="Avatar"
              className="w-16 h-16 rounded-full border-2 border-amber"
            />
            <div>
              <h1 className="text-4xl font-bold text-amber pt-2">
                Hi, {userData.username || "Learner"}!
              </h1>
              <p className="text-amber py-1 text-lg">{userData.title}</p>
            </div>
          </div>
          <Link to={"/lessons"}>
            <button className="bg-amber text-white py-3 px-8 rounded-lg shadow hover:scale-105 transition-transform my-4 lg:my-0">
              Start Lesson
            </button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 md:grid-rows-2 gap-8 bg-gray-50 py-10 px-4 lg:px-12">
        {/* XP Card */}
        <div className="bg-white p-6 flex justify-between rounded-2xl shadow items-center">
          <FaStar className="text-7xl text-amber" />
          <div>
            <h1 className="text-3xl font-bold">{userData.xp}</h1>
            <p className="text-gray-500">Current XP</p>
            <div className="w-40 h-2 bg-gray-200 rounded mt-2">
              <div
                className="h-2 bg-amber rounded"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400">
              XP to next level: {userData.xp_to_next_level}
            </p>
          </div>
        </div>

        {/* Streak Card */}
        <div className="bg-white p-6 flex gap-4 rounded-2xl shadow items-center">
          <FaSteam className="text-7xl text-amber" />
          <div>
            <h1 className="text-3xl font-bold">{userData.streak_days}</h1>
            <p className="text-gray-500">Day Streak</p>
            <p className="text-xs text-gray-400">
              🔥 Streak Freezes: {userData.streak_freezes}
            </p>
          </div>
        </div>

        {/* Coins & Lives */}
        <div className="bg-white p-6 rounded-2xl shadow flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <FaWallet className="text-3xl text-yellow-500" />
            <p className="text-lg font-bold">Coins: {userData.coins}</p>
          </div>
          <div className="flex items-center gap-4 mt-3">
            <FaHeart className="text-red-500 text-3xl" />
            <p className="text-lg font-bold">
              Lives: {userData.lives}/{userData.max_lives}
            </p>
          </div>
        </div>

        {/* Weekly Progress */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-semibold mb-2">Weekly Progress</h2>
          <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden mb-2">
            <div
              className="bg-yellow-500 h-4 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-sm text-gray-600">
            {completedLessons} / {totalLessons} lessons completed
          </p>
        </div>

        {/* Challenge Card */}
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center justify-center">
          <span className="text-4xl mb-2">⚡</span>
          <h1 className="text-2xl font-semibold text-center mb-4">
            Try today's Challenge
          </h1>
          <button className="w-full bg-amber py-2 text-white rounded-2xl shadow font-semibold hover:scale-105 transition-transform duration-200">
            Start Challenge
          </button>
        </div>

        {/* Explore More */}
        <div className="bg-amber pt-4 px-2 rounded-2xl flex flex-col justify-between text-white">
          <div>
            <h1 className="text-3xl font-semibold px-3">Explore More</h1>
            <p className="text-2xl font-semibold px-3">Lessons</p>
          </div>
          <Link to={"/lessons"}>
            <button className="bg-white text-amber mt-4 py-2 rounded-full w-full font-bold mb-5 hover:bg-gray-200">
              Go to Lessons
            </button>
          </Link>
        </div>
      </div>

      {/* Badges */}
      <div className="mt-8 transition-transform duration-300 hover:scale-105 px-4 lg:px-12">
        <Badge />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
