import React, { useState, useEffect } from "react";
import { NavBar } from "../components/NavBar";
import background from "../assets/Lesson-Night.jpg";
import data from "../data/lesson.json";
import island from "../assets/Rockremovebg-preview.png";
import avatar from "../assets/girlwithbg.jpg";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { Link } from "react-router-dom";
import mascot from "../assets/IMG-20250724-WA0115-removebg-preview.png";
import {
  FaCog,
  FaHeart,
  FaWallet,
  FaArrowCircleLeft,
  FaRobot,
  FaShopify,
  FaGamepad,
  FaCoins,
} from "react-icons/fa";

// 🔹 Firebase imports
import { auth, db } from "../firebase/config/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export const Lesson = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [userData, setUserData] = useState(null);

  // 📌 Real-time fetch from Firestore
  useEffect(() => {
    if (!auth.currentUser) return;

    const userRef = doc(db, "users", auth.currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    });

    return () => unsubscribe();
  }, []);

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-screen text-xl text-white">
        Loading user data...
      </div>
    );
  }

  return (
    <div className="bg-cover bg-center lesson-container">
      {/* Top Navbar */}
      <div className="text-amber fixed top-0 left-0 w-full z-50 p-4 flex justify-between items-center bg-gray-900 bg-opacity-70 backdrop-blur-sm shadow-md">
        <Link to="/dashboard">
          <FaArrowCircleLeft className="text-2xl cursor-pointer" />
        </Link>

        <div className="flex items-center gap-4">
          <div className="text-md font-semibold flex items-center gap-3">
            ⭐ {userData.xp} XP
            <p className="hidden md:block lg:flex gap-2 items-center">
              Coins: <FaCoins /> {userData.coins}
            </p>
            <p className="flex gap-2 items-center">
              ❤ Lives: {userData.lives}/{userData.max_lives}
            </p>
          </div>

          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative"
          >
            <img
              src={avatar}
              alt="avatar"
              className="w-10 text-lg h-10 rounded-full border border-amber shadow"
            />
          </button>
        </div>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-4 top-16 bg-gray-800 text-white rounded-lg shadow-md w-48 p-4 z-50">
          <p>🎟 Tickets: {userData.tickets}</p>
          <p>🔥 Streak: {userData.streak_days} days</p>
        </div>
      )}

      {/* Main Island Button */}
      <div className="flex items-center justify-center min-h-screen px-4">
        <Link to={"/lessons/section"}>
          <button>
            <img
              src={island}
              alt="island"
              className="w-full max-w-md object-contain cursor-pointer animate-float mx-auto"
            />
          </button>
        </Link>
      </div>

      {/* Sidebar */}
      <div className="fixed top-[350px] lg:top-[300px] left-0 border border-amber bg-gray-900 flex flex-col py-3 h-64 px-2 text-3xl rounded-full ml-2 lg:ml-6 justify-around text-amber z-30">
        <Link to={"/chat"}>
          <FaRobot className="cursor-pointer hover:text-white transition ease-in duration-300" />
        </Link>
        <Link to={"/lessons/shop"}>
          <FaShopify className="cursor-pointer hover:text-white transition ease-in duration-300" />
        </Link>
        <FaGamepad className="cursor-pointer hover:text-white transition ease-in duration-300" />
        <FaCog className="text-2xl cursor-pointer" />
      </div>

      {/* Bottom Mascot */}
      <div className="text-amber fixed bottom-0 right-0 items-start">
        <Link to={"/chat"}>
          <button className="ease-in duration-100 hover:scale-110 transition-transform">
            <img src={mascot} style={{ width: "10rem" }} alt="" />
          </button>
        </Link>
      </div>
    </div>
  );
};
