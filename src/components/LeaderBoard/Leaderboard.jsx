import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
  doc,
} from "firebase/firestore";
import { db, auth } from "../../firebase/config/firebase";
import { FaTrophy, FaCrown, FaMedal, FaUserAlt, FaFire } from "react-icons/fa";
import { Link } from "react-router-dom";
import DashboardLayout from "../dashboard/DashboardLayout";
import { getUserRank } from "../../utils/rankSystem";
import {
  FaChartBar,
  FaKeyboard,
  FaTree,
  FaHome,
  FaProcedures,
} from "react-icons/fa";

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaderboardMode, setLeaderboardMode] = useState("general");
  const [currentUserPosition, setCurrentUserPosition] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  
  // Add refs to track mounted state and prevent infinite loops
  const mountedRef = useRef(true);
  const currentUserDataRef = useRef(null);

  // Fetch current user's data - FIXED: Only run once
  useEffect(() => {
    if (!auth.currentUser) {
      setCurrentUserData(null);
      currentUserDataRef.current = null;
      return;
    }

    const userDocRef = doc(db, "users", auth.currentUser.uid);
    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (!mountedRef.current) return;
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCurrentUserData(data);
          currentUserDataRef.current = data;
        } else {
          setCurrentUserData(null);
          currentUserDataRef.current = null;
        }
      },
      (error) => {
        console.error("Error fetching currentUserData:", error);
        if (mountedRef.current) {
          setCurrentUserData(null);
          currentUserDataRef.current = null;
        }
      }
    );
    
    return () => {
      unsubscribe();
    };
  }, []); // Empty dependency array - only run once

  // Fetch leaderboard data - FIXED: Optimized with proper dependencies
  useEffect(() => {
    if (!mountedRef.current) return;

    let unsubscribe;
    setLoading(true);

    const fetchLeaderboard = async () => {
      try {
        let q;

        if (leaderboardMode === "general") {
          q = query(collection(db, "users"), orderBy("xp", "desc"), limit(50));
        } else if (leaderboardMode === "rank") {
          // Use the ref instead of state to avoid dependency loop
          const userRank = currentUserDataRef.current?.rank;
          if (!userRank) {
            setUsers([]);
            setCurrentUserPosition(null);
            setLoading(false);
            return;
          }
          q = query(
            collection(db, "users"),
            where("rank", "==", userRank),
            orderBy("xp", "desc"),
            limit(50)
          );
        }

        unsubscribe = onSnapshot(
          q,
          (querySnapshot) => {
            if (!mountedRef.current) return;

            const usersData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              rank: getUserRank({
                level: doc.data().level || 1,
                accuracy: doc.data().progress?.accuracy || 0,
                streak: doc.data().current_streak || 0,
                lessons: doc.data().lessons || 0,
              }),
            }));

            setUsers(usersData);

            if (auth.currentUser) {
              const position = usersData.findIndex(
                (user) => user.id === auth.currentUser.uid
              );
              setCurrentUserPosition(position >= 0 ? position + 1 : null);
            }
            setLoading(false);
          },
          (error) => {
            console.error("Error in onSnapshot:", error);
            if (mountedRef.current) {
              setLoading(false);
            }
          }
        );
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    // Only fetch if we have the necessary data for rank mode
    if (leaderboardMode === "rank" && !currentUserDataRef.current) {
      setLoading(false);
      return;
    }

    fetchLeaderboard();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [leaderboardMode]); // Only depend on leaderboardMode

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Format XP to whole numbers
  const formatXP = (xp) => {
    return Math.round(xp || 0);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading leaderboard...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full px-2 sm:px-4 pt-20 md:pt-8 pb-20 max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Leaderboard
        </h1>

        {/* Leaderboard mode selector */}
        <div className="flex justify-center gap-2 sm:gap-4 mb-6">
          <button
            onClick={() => setLeaderboardMode("general")}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-colors text-sm sm:text-base ${
              leaderboardMode === "general"
                ? "bg-yellow-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            General
          </button>
          <button
            onClick={() => setLeaderboardMode("rank")}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-colors text-sm sm:text-base ${
              leaderboardMode === "rank"
                ? "bg-yellow-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            My Rank
          </button>
        </div>

        {/* Leaderboard table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
          {users.length === 0 ? (
            <div className="text-center p-8 sm:p-12 text-gray-500 text-sm sm:text-base">
              {leaderboardMode === "rank" && !currentUserData?.rank
                ? "Log in to see your rank leaderboard."
                : "No users found for this leaderboard."}
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {users.map((user, index) => (
                <li
                  key={user.id}
                  className={`relative flex items-center py-4 px-3 sm:py-6 sm:px-6 transition-colors ${
                    user.id === auth.currentUser?.uid
                      ? "bg-yellow-50 border-l-4 border-yellow-500"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {/* Rank Badge */}
                  <div className="flex-shrink-0 mr-3 sm:mr-4 w-6 sm:w-8 text-center">
                    {index === 0 ? (
                      <FaCrown className="text-yellow-500 text-xl sm:text-2xl" />
                    ) : index === 1 ? (
                      <FaTrophy className="text-gray-400 text-xl sm:text-2xl" />
                    ) : index === 2 ? (
                      <FaMedal className="text-yellow-600 text-xl sm:text-2xl" />
                    ) : (
                      <span className="text-gray-500 font-bold text-base sm:text-lg">
                        #{index + 1}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="flex-shrink-0 mr-3 sm:mr-4">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-white">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FaUserAlt className="text-gray-500 text-sm sm:text-xl" />
                      )}
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-grow min-w-0 flex justify-between items-center">
                    <div className="min-w-0 flex-1 mr-2">
                      <h3 className="font-semibold text-gray-800 text-sm sm:text-lg truncate">
                        {user.username || "Anonymous"}
                        {user.id === auth.currentUser?.uid && (
                          <span className="ml-1 sm:ml-2 text-yellow-500 text-xs sm:text-sm">
                            (You)
                          </span>
                        )}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">
                        {user.rank || "Beginner"} • Lvl {user.level || 1}
                      </p>
                    </div>

                    {/* XP and Streak */}
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-gray-800 text-sm sm:text-lg">
                        {formatXP(user.xp)} XP
                      </p>
                      {(user.current_streak || 0) > 3 && (
                        <div className="flex items-center justify-end text-yellow-500 text-xs sm:text-sm">
                          <FaFire className="mr-1" />
                          <span className="hidden sm:inline">
                            {user.current_streak} day
                          </span>
                          <span className="sm:hidden">
                            {user.current_streak}d
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Current user's position */}
        {auth.currentUser && currentUserData && (
          <div className="bg-yellow-50 p-4 sm:p-6 rounded-xl border border-yellow-200">
            <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-800">
              Your Position
            </h2>
            {currentUserPosition !== null ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-gray-700 text-sm sm:text-base">
                  {leaderboardMode === "general"
                    ? `You are #${currentUserPosition} globally`
                    : `You are #${currentUserPosition} in ${currentUserData.rank} Rank`}
                </p>
                {(currentUserData?.current_streak || 0) > 3 && (
                  <div className="flex items-center text-yellow-600 text-sm sm:text-base">
                    <FaFire className="mr-1 sm:mr-2" />
                    <span>{currentUserData.current_streak}-day streak</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-700 text-sm sm:text-base">
                {leaderboardMode === "rank"
                  ? `You are not yet ranked in ${currentUserData.rank} Rank. Complete lessons to earn XP!`
                  : `You are not on the leaderboard yet. Complete lessons to earn XP!`}
              </p>
            )}
          </div>
        )}

        {/* Mobile Navigation */}
        <div className="fixed bottom-0 left-0 w-full h-16 flex items-center text-yellow-500 justify-around bg-gray-100 lg:hidden">
          <Link to={"/lessons"} className="flex flex-col items-center pt-3">
            <FaHome className="text-xl" />
            <p className="text-yellow-500 text-xs">Home</p>
          </Link>
          <Link to={"/leaderboard"} className="flex flex-col items-center pt-3">
            <FaChartBar className="text-xl" />
            <p className="text-yellow-500 text-xs">Ranking</p>
          </Link>
          <Link to={"/dashboard"} className="flex flex-col items-center pt-3">
            <FaKeyboard className="text-xl" />
            <p className="text-yellow-500 text-xs">Dashboard</p>
          </Link>
          <Link
            to={"/notifications"}
            className="flex flex-col items-center pt-3"
          >
            <FaTree className="text-xl" />
            <p className="text-yellow-500 text-xs">Feed</p>
          </Link>
          <Link to={"/profile"} className="flex flex-col items-center pt-3">
            <FaProcedures className="text-xl" />
            <p className="text-yellow-500 text-xs">Profile</p>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Leaderboard;