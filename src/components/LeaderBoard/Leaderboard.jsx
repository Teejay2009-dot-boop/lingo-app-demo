// src/pages/Leaderboard.js
import React, { useState, useEffect } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config/firebase";

import { auth } from "../../firebase/config/firebase";
import { FaTrophy, FaCrown, FaMedal, FaUserAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import DashboardLayout from "../dashboard/DashboardLayout";

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("all-time"); // 'weekly', 'monthly'

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        let q;
        if (timeRange === "weekly") {
          // For weekly leaderboard (you'll need to add a weeklyXP field to users)
          q = query(
            collection(db, "users"),
            orderBy("weeklyXP", "desc"),
            limit(50)
          );
        } else if (timeRange === "monthly") {
          // For monthly leaderboard
          q = query(
            collection(db, "users"),
            orderBy("monthlyXP", "desc"),
            limit(50)
          );
        } else {
          // All-time leaderboard
          q = query(
            collection(db, "users"),
            orderBy("total_xp", "desc"),
            limit(50)
          );
        }

        const querySnapshot = await getDocs(q);
        const usersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [timeRange]);

  if (loading) {
    return <div className="text-center py-8">Loading leaderboard...</div>;
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl px-auto  bg-gray-50 px-2 pt-24 md:pt-0">
        <h1 className="text-3xl font-bold text-center mb-6 ">Leaderboard</h1>

        {/* Time range selector */}
        <div className="flex justify-center gap-4 mb-8 pt-4 px-4">
          <button
            onClick={() => setTimeRange("weekly")}
            className={`px-4 py-2 rounded-full ${
              timeRange === "weekly" ? "bg-amber text-white" : "bg-gray-200"
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setTimeRange("monthly")}
            className={`px-4 py-2 rounded-full ${
              timeRange === "monthly"
                ? "bg-amber text-white"
                : "bg-gray-200"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setTimeRange("all-time")}
            className={`px-4 py-2 rounded-full ${
              timeRange === "all-time"
                ? "bg-amber text-white"
                : "bg-gray-200"
            }`}
          >
            All Time
          </button>
        </div>

        {/* Leaderboard table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {users.length === 0 ? (
            <div className="text-center p-8">No users found</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {users.map((user, index) => (
                <li
                  key={user.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    {/* Rank indicator */}
                    <div className="w-10 flex-shrink-0">
                      {index === 0 ? (
                        <FaCrown className="text-yellow-500 text-2xl" />
                      ) : index === 1 ? (
                        <FaTrophy className="text-gray-400 text-2xl" />
                      ) : index === 2 ? (
                        <FaMedal className="text-amber-600 text-2xl" />
                      ) : (
                        <span className="text-gray-500 font-medium">
                          {index + 1}
                        </span>
                      )}
                    </div>

                    {/* User info */}
                    <div className="flex items-center flex-grow">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-4">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FaUserAlt className="text-gray-500" />
                        )}
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-semibold">
                          {user.username || "Anonymous"}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {user.title || "Beginner"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {timeRange === "weekly"
                            ? user.weeklyXP || 0
                            : timeRange === "monthly"
                            ? user.monthlyXP || 0
                            : user.total_xp || 0}{" "}
                          XP
                        </p>
                        <p className="text-sm text-gray-500">
                          Level {user.level || 1}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Current user's position */}
        <div className="mt-8 bg-amber-50 p-4 rounded-xl border border-amber-200">
          <h2 className="text-xl font-semibold mb-2">Your Position</h2>
          {/* You'll need to fetch current user's position */}
          <p className="text-gray-700">
            {users.findIndex((u) => u.id === auth.currentUser?.uid) >= 0
              ? `You're ranked #${
                  users.findIndex((u) => u.id === auth.currentUser?.uid) + 1
                }`
              : "You're not on the leaderboard yet. Keep learning!"}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};
export default Leaderboard;
