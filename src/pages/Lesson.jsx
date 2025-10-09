import React, { useState, useEffect } from "react";
import island from "../assets/Rockremovebg-preview.png";
import avatar from "../assets/girlwithbg.jpg";
import { Link } from "react-router-dom";
import mascot from "../assets/IMG-20250724-WA0115-removebg-preview.png";
import {
  FaCog,
  FaArrowCircleLeft,
  FaRobot,
  FaShopify,
  FaGamepad,
  FaCoins,
  FaFire,
  FaChartBar,
  FaProcedures,
  FaKeyboard,
  FaTree,
  FaHome,
} from "react-icons/fa";
import { auth, db } from "../firebase/config/firebase";
import { doc, onSnapshot, updateDoc, getDoc } from "firebase/firestore";
import { updateStreak } from "../utils/streak"; // Import updateStreak utility

export const Lesson = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [userData, setUserData] = useState(null);
  // Removed streakUpdated state as it's no longer needed

  // Removed local updateStreak function, now using the utility function

  // Updated Firestore listener
  useEffect(() => {
    if (!auth.currentUser) return;

    const userRef = doc(db, "users", auth.currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data());
        // Call updateStreak on component mount/user data load
        updateStreak(auth.currentUser.uid); // Use the global updateStreak
      }
    });

    return () => unsubscribe();
  }, []); // Empty dependency array to run once on mount for streak update

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-screen text-xl text-black">
        Loading user data...
      </div>
    );
  }

  return (
    <div className="bg-cover lesson-container">
      {/* Top Navbar */}
      <div className="text-amber fixed top-0 w-full pt-1">
        

        <div className="">
          <div className="text-xs sm:text-md md:text-lg font-semibold flex items-center gap-2 w-full sm:gap-3 lg:text-lg justify-between lg:justify-end">

            <p className="pl-3 flex items-center ">
              <Link to={'/lessons/shop'}>
              ${userData.coins}
              </Link>
            </p>
            <p>
              XP:{userData.XP}
            </p>
            <p className="flex gap-2 items-center">
              ❤ Lives: {userData.lives}
            </p>
            <div>
              {/* NEW: Streak display in navbar */}
            
          </div>

        <div className="flex gap-2 items-center"> 
          <p className="flex gap-2 items-center">
              <FaFire className="text-red-500" /> {userData.current_streak || 0}
            </p>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative"
          >
            <img
              src={avatar}
              alt="avatar"
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-amber shadow"
            />
          </button>
        </div>
            </div>
        </div>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-4 top-16 bg-gray-800 text-white rounded-lg shadow-md w-48 p-4 z-50">
          <p className="flex items-center gap-2">
            <FaFire className="text-red-500" /> Streak:{" "}
            {userData.current_streak || 0} days
          </p>
          <p>🔥 Longest: {userData.longest_streak || 0} days</p>
          <p>🎟 Tickets: {userData.tickets || 0}</p>
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

      <div className="fixed bottom-0 left-0 w-full h-16 flex items-center text-amber justify-around bg-gray-900 lg:hidden">
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

      {/* Sidebar */}
      <div className="fixed top-1/2 -translate-y-1/2 left-0 border border-amber bg-gray-900 flex-col  h-auto px-2 text-3xl rounded-r-full ml-2 lg:ml-6 justify-around text-amber z-30 hidden  lg:flex py-5">
        <Link
          to={"/learn"}
          className="p-2 hover:text-white transition ease-in duration-300 flex flex-col items-center gap-3"
        >
          <FaHome className="cursor-pointer" />
          <p className="text-sm text-amber">Home</p>
        </Link>
        <Link
          to={"/leaderboard"}
          className="p-2 hover:text-white transition ease-in duration-300 flex flex-col items-center gap-3"
        >
          <FaChartBar className="cursor-pointer" /> 
          <p className="text-sm text-amber">Ranking</p>
        </Link>
        <Link
          to={"/dashboard"}
          className="p-2 hover:text-white transition  items-center gap-3 flex flex-col ease-in duration-300"
        >
          <FaKeyboard className="cursor-pointer" />
        <p className="text-sm text-amber">Dashboard</p>
        </Link>
       
        <Link
          to={"/notifications"}
          className="p-2 hover:text-white transition ease-in duration-300 flex flex-col items-center gap-3"
        >
          <FaTree className="cursor-pointer" />
          <p className="text-sm text-amber">Feed</p>
        </Link>
        <Link
          to={"/profile"}
          className="p-2 hover:text-white transition ease-in duration-300 flex flex-col items-center gap-3"
        >
          <FaProcedures className="cursor-pointer" />
          <p className="text-sm text-amber">Profile</p>
        </Link>
      </div>

      {/* Bottom Mascot */}
    </div>
  );
};
