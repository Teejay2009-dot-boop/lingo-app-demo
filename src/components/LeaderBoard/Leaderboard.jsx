import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  where, // Added where for rank filtering
  doc, // Added doc for direct document reference
} from "firebase/firestore";
import { db, auth } from "../../firebase/config/firebase";
import { FaTrophy, FaCrown, FaMedal, FaUserAlt, FaFire } from "react-icons/fa";
import { Link } from "react-router-dom";
import DashboardLayout from "../dashboard/DashboardLayout";
import { getLevel } from "../../utils/progression"; // Import getRank from progression.js
import { BeatLoader } from "react-spinners";

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaderboardMode, setLeaderboardMode] = useState("general"); // "general" or "rank"
  const [currentUserPosition, setCurrentUserPosition] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null); // To store current user's data

  // Fetch current user's data
  useEffect(() => {
    if (!auth.currentUser) {
      console.log("Leaderboard: No auth.currentUser, returning.");
      setCurrentUserData(null); // Explicitly set to null if no user
      return;
    }

    console.log(
      "Leaderboard: Fetching currentUserData for UID:",
      auth.currentUser.uid
    );
    const userDocRef = doc(db, "users", auth.currentUser.uid); // Direct reference to user document

    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log("Leaderboard: currentUserData fetched:", data);
          setCurrentUserData(data);
        } else {
          console.log("Leaderboard: currentUserData does not exist.");
          setCurrentUserData(null); // User data not found
        }
      },
      (error) => {
        console.error("Leaderboard: Error fetching currentUserData:", error);
        setCurrentUserData(null);
      }
    );
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.currentUser?.uid]); // Depend on auth.currentUser.uid

  useEffect(() => {
    let unsubscribe;
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        console.log(
          "Leaderboard: Fetching leaderboard for mode:",
          leaderboardMode
        );
        let q;

        if (leaderboardMode === "general") {
          q = query(collection(db, "users"), orderBy("xp", "desc"), limit(50)); // Order by xp
          console.log("Leaderboard: General query constructed.");
        } else if (leaderboardMode === "rank") {
          if (!currentUserData?.rank) {
            console.log(
              "Leaderboard: Rank mode selected but currentUserData.rank is missing."
            );
            setUsers([]);
            setCurrentUserPosition(null);
            setLoading(false);
            return;
          }
          q = query(
            collection(db, "users"),
            where("rank", "==", currentUserData.rank),
            orderBy("xp", "desc"),
            limit(50)
          ); // Filter by current user's rank
          console.log(
            "Leaderboard: Rank query constructed for rank:",
            currentUserData.rank
          );
        }

        unsubscribe = onSnapshot(
          q,
          (querySnapshot) => {
            const usersData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              rank: getLevel(doc.data().xp || 0).rank, // Get rank from getLevel(xp).rank
            }));

            console.log("Leaderboard: Fetched users data:", usersData);
            setUsers(usersData);

            // Find current user's position
            if (auth.currentUser) {
              const position = usersData.findIndex(
                (user) => user.id === auth.currentUser.uid
              );
              console.log("Leaderboard: Current user position:", position + 1);
              setCurrentUserPosition(position >= 0 ? position + 1 : null);
            }
            setLoading(false); // Set loading to false here, inside onSnapshot
          },
          (error) => {
            console.error(
              "Leaderboard: Error in onSnapshot for leaderboard:",
              error
            );
            setLoading(false);
          }
        );
      } catch (error) {
        console.error("Leaderboard: Error fetching leaderboard:", error);
        setLoading(false);
      }
    };

    if (leaderboardMode === "rank" && !currentUserData) {
      console.log(
        "Leaderboard: Waiting for currentUserData before fetching rank leaderboard."
      );
      setLoading(true); // Keep loading true while waiting for currentUserData
      return;
    }

    fetchLeaderboard();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [leaderboardMode, currentUserData]); // Depend on leaderboardMode and currentUserData

  if (loading) {
    console.log("Leaderboard: Component is in loading state.");
    return (
      <DashboardLayout>
        <div className="text-center py-8">Loading leaderboard...</div>
      </DashboardLayout>
    );
  }

  console.log(
    "Leaderboard: Rendering component with users:",
    users,
    "and currentUserData:",
    currentUserData
  );
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto bg-gray-50 p-4 md:px-8 pt-24 md:pt-8 pb-8">
        <h1 className="text-3xl font-bold text-center mb-6">Leaderboard</h1>

        {/* Leaderboard mode selector */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setLeaderboardMode("general")}
            className={`px-4 py-2 rounded-full text-sm sm:text-base ${
              leaderboardMode === "general"
                ? "bg-amber text-white"
                : "bg-gray-200"
            }`}
          >
            General
          </button>
          <button
            onClick={() => setLeaderboardMode("rank")}
            className={`px-4 py-2 rounded-full text-sm sm:text-base ${
              leaderboardMode === "rank" ? "bg-amber text-white" : "bg-gray-200"
            }`}
          >
            My Rank
          </button>
        </div>

        {/* Leaderboard table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          {users.length === 0 ? (
            <div className="text-center p-8">
              {leaderboardMode === "rank" && !currentUserData?.rank
                ? "Log in to see your rank leaderboard."
                : "No users found for this leaderboard."}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {users.map((user, index) => (
                <li
                  key={user.id}
                  className={`relative flex items-center py-4 px-3 sm:px-6 transition-colors
    ${user.id === auth.currentUser?.uid ? "bg-amber-50" : "hover:bg-gray-50"}`}
                >
                  {/* Rank Badge */}
                  <div className="flex-shrink-0 mr-2 sm:mr-4 w-6 text-center">
                    {index === 0 ? (
                      <FaCrown className="text-yellow-500 text-xl sm:text-2xl" />
                    ) : index === 1 ? (
                      <FaTrophy className="text-gray-400 text-xl sm:text-2xl" />
                    ) : index === 2 ? (
                      <FaMedal className="text-amber-600 text-xl sm:text-2xl" />
                    ) : (
                      <span className="text-gray-500 font-bold text-base sm:text-lg">
                        #{index + 1}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="relative flex-shrink-0 mx-2 sm:mx-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FaUserAlt className="text-gray-500 text-base sm:text-xl" />
                      )}
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-grow ml-2 sm:ml-4 flex justify-between items-center flex-wrap">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-base sm:text-lg">
                        {user.username || "Anonymous"}
                        {user.id === auth.currentUser?.uid && (
                          <span className="ml-2 text-amber-500 text-xs sm:text-sm">
                            (You)
                          </span>
                        )}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {user.rank || "Beginner"} (Lvl {user.level || 1})
                      </p>
                    </div>

                    {/* XP and Level */}
                    <div className="text-right min-w-[70px] sm:min-w-[100px] mt-2 sm:mt-0">
                      <p className="font-bold text-gray-800 text-base sm:text-lg">
                        {user.xp || 0} XP
                      </p>
                      <div className="flex items-center justify-end">
                        {(user.current_streak || 0) > 3 && (
                          <FaFire className="text-amber-500 text-xs sm:text-sm" />
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Current user's position */}
        {auth.currentUser && currentUserData && (
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-sm sm:text-base">
            <h2 className="text-xl font-semibold mb-2">Your Position</h2>
            {currentUserPosition !== null ? (
              <div className="flex items-center justify-between flex-wrap">
                <p className="text-gray-700 mb-2 sm:mb-0">
                  {leaderboardMode === "general"
                    ? `You are #${currentUserPosition} globally.`
                    : `You are #${currentUserPosition} in ${currentUserData.rank} Rank.`}
                </p>
                {(currentUserData?.current_streak || 0) > 3 && (
                  <div className="flex items-center text-amber-600">
                    <FaFire className="mr-1" />
                    <span>{currentUserData.current_streak}-day streak</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-700">
                {leaderboardMode === "rank"
                  ? `You are not yet ranked in ${currentUserData.rank} Rank. Complete lessons to earn XP!`
                  : `You are not on the leaderboard yet. Complete lessons to earn XP!`}
              </p>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Leaderboard;
