import React, { useState, useEffect } from "react";
import island from "../assets/Rockremovebg-preview.png";
import avatar from "../assets/girlwithbg.jpg";
import { Link, useNavigate } from "react-router-dom";
import {
  FaFire,
  FaChartBar,
  FaProcedures,
  FaKeyboard,
  FaTree,
  FaHome,
} from "react-icons/fa";
import { auth, db } from "../firebase/config/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { updateStreak } from "../utils/streak";
import { signOut } from "firebase/auth";

export const Lesson = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        // No user logged in
        setLoading(false);
        setUserData(null);
        return;
      }

      console.log("👤 User logged in:", user.uid);
      
      const userRef = doc(db, "users", user.uid);
      const unsubscribeSnapshot = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log("🔥 User Data:", data);
          setUserData(data);
          updateStreak(user.uid);
        } else {
          console.log("❌ No user data found in Firestore");
          setUserData(null);
        }
        setLoading(false);
      }, (error) => {
        console.error("🔥 Firestore error:", error);
        setLoading(false);
        setUserData(null);
      });

      return () => unsubscribeSnapshot();
    });

    return () => unsubscribeAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-xl text-black">
        Loading user data...
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-xl text-black p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Account Not Found</h2>
        <p className="mb-6">Your account may have been deleted or there's no user data.</p>
        <div className="flex gap-4">
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
          <Link
            to="/login"
            className="bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors"
          >
            Login Again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cover lesson-container">
      {/* Top Navbar */}
      <div className="text-amber fixed top-0 w-full pt-3 px-1">
        <div className="">
          <div className="text-lg sm:text-md md:text-lg font-semibold flex items-center gap-2 w-full sm:gap-3 lg:text-lg justify-between lg:justify-end">
            <p className="pl-3 flex items-center">
              <Link to={'/lessons/shop'}>
                ${userData.coins || 0}
              </Link>
            </p>
            <p>XP: {userData.xp || userData.XP || 0}</p>
            <p className="flex gap-2 items-center">
              ❤ Lives: {userData.lives || 0}
            </p>
            
            <div className="flex gap-2 items-center"> 
              <p className="flex gap-2 items-center">
                <FaFire className="text-red-500" /> {userData.current_streak || 0}
              </p>
              {/* <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative"
              >
                <img
                  src={avatar}
                  alt="avatar"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-amber shadow"
                />
              </button> */}
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
          <button
            onClick={handleLogout}
            className="mt-2 w-full bg-red-500 text-white py-1 rounded hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      )}

      {/* Rest of your component remains the same */}
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

      {/* Mobile Navigation */}
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

      {/* Desktop Sidebar */}
      <div className="fixed top-1/2 -translate-y-1/2 left-0 border border-amber bg-gray-900 flex-col h-auto px-2 text-3xl rounded-r-full ml-2 lg:ml-6 justify-around text-amber z-30 hidden lg:flex py-5">
        <Link to={"/learn"} className="p-2 hover:text-white transition ease-in duration-300 flex flex-col items-center gap-3">
          <FaHome className="cursor-pointer" />
          <p className="text-sm text-amber">Home</p>
        </Link>
        <Link to={"/leaderboard"} className="p-2 hover:text-white transition ease-in duration-300 flex flex-col items-center gap-3">
          <FaChartBar className="cursor-pointer" /> 
          <p className="text-sm text-amber">Ranking</p>
        </Link>
        <Link to={"/dashboard"} className="p-2 hover:text-white transition items-center gap-3 flex flex-col ease-in duration-300">
          <FaKeyboard className="cursor-pointer" />
          <p className="text-sm text-amber">Dashboard</p>
        </Link>
        <Link to={"/notifications"} className="p-2 hover:text-white transition ease-in duration-300 flex flex-col items-center gap-3">
          <FaTree className="cursor-pointer" />
          <p className="text-sm text-amber">Feed</p>
        </Link>
        <Link to={"/profile"} className="p-2 hover:text-white transition ease-in duration-300 flex flex-col items-center gap-3">
          <FaProcedures className="cursor-pointer" />
          <p className="text-sm text-amber">Profile</p>
        </Link>
      </div>
    </div>
  );
};