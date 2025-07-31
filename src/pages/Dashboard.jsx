import React from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";

import Badge from "../components/dashboard/Badges";

import NavBar from "../components/dashboard/NavBar";
import users from "../data/user";
import { useState, useEffect } from "react";
import { FaStar, FaSteam } from "react-icons/fa";

const Dashboard = () => {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    // CleanUp functionto remove listener
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalLessons = 10; // You can adjust this later
  const [completedLessons, setCompletedLessons] = useState(0);

  const handleCompleteLesson = () => {
    if (completedLessons < totalLessons) {
      setCompletedLessons(completedLessons + 1);
    }
  };

  const progressPercent = (completedLessons / totalLessons) * 100;

  return (
    <DashboardLayout>
      <NavBar />

      <div className="transition-all duration-700 ease-in-out transform hover:scale-105 opacity-0 animate-fadeIn bg-gray-50 py-8 px-4 lg:px-12 flex flex-col lg:flex-row justify-between items-center rounded-xl shadow-sm mb-8 animate-fade-in-up">
        <div className="flex items-center gap-6">
          <div className="text-6xl">👩‍🦰</div>
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-amber pt-2">
              Hi, {users.name}!
            </h1>
            <p className="text-amber py-1 text-lg">Ready to learn today?</p>
          </div>
        </div>
        <div className="mt-6 lg:mt-0">
          <button className="bg-amber text-white py-3 px-8 rounded-lg shadow hover:scale-105 transition-transform duration-200">
            Start Lesson
          </button>
        </div>
      </div>

      {/* Desktop Stats Grid */}
      {width > 768 ? (
        <div className="grid md:grid-cols-3 md:grid-rows-2 gap-8 bg-gray-50 py-10 px-4 lg:px-12 transition-all duration-700 ease-in-out transform hover:scale-105 opacity-0 animate-fadeIn">
          {/* XP Card */}
          <div className="bg-white p-6 flex justify-between mr-10 rounded-2xl shadow items-center">
            <FaStar className="text-9xl text-amber" />
            <div>
              <h1 className="text-3xl font-bold">240</h1>
              <p className="text-gray-500">XP</p>
            </div>
          </div>
          {/* Streak Card */}
          <div className="bg-white p-6 flex gap-4 rounded-2xl shadow items-center transition-all duration-700 ease-in-out transform hover:scale-105 opacity-0 animate-fadeIn">
            <FaSteam className="text-9xl text-amber" />
            <div>
              <h1 className="text-3xl font-bold">5</h1>
              <p className="text-gray-500">day streak</p>
            </div>
          </div>
          {/* Progress Card */}
          <div className="bg-white md:row-span-2 rounded-2xl shadow p-6 flex flex-col justify-between transition-all duration-700 ease-in-out transform hover:scale-105 opacity-0 animate-fadeIn">
            <h1 className="text-xl font-bold mb-4">Overall Progress</h1>
            <div className="w-full h-3 bg-amber rounded-full mb-6"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 items-center mt-4">
                <span className="text-2xl">👩‍🦱</span>
                <span className="font-semibold text-lg">Henry S.</span>
              </div>
            ))}
          </div>
          {/* Pet Card */}
          <div className="bg-white flex justify-between items-center rounded-2xl shadow p-6 transition-all duration-700 ease-in-out transform hover:scale-105 opacity-0 animate-fadeIn">
            <span className="text-9xl">🐕</span>
            <div>
              <div className="text-3xl font-semibold">Dog</div>
              <div className="text-amber text-2xl pt-10">Aja</div>
            </div>
          </div>
          {/* Challenge Card */}
          <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center justify-center transition-all duration-700 ease-in-out transform hover:scale-105 opacity-0 animate-fadeIn">
            <span className="text-3xl mb-2">⚡</span>
            <h1 className="text-2xl font-semibold text-center mb-4">
              Try today's Challenge
            </h1>
            <button className="w-full bg-amber py-2 text-white rounded-2xl shadow font-semibold hover:scale-105 transition-transform duration-200">
              Start Challenge
            </button>
          </div>
        </div>
      ) : (
        // Mobile Stats
        <div className="block lg:hidden bg-gray-50 px-4 py-6 transition-all duration-700 ease-in-out transform hover:scale-105 opacity-0 animate-fadeIn">
          <div className="flex justify-between gap-4">
            <div className="flex-1 p-4 rounded-2xl bg-amber flex flex-col items-center shadow">
              <FaStar className="text-4xl text-white" />
              <div className="text-xl text-white pt-2">
                240 <span className="text-base">XP</span>
              </div>
            </div>
            <div className="flex-1 p-4 rounded-2xl bg-amber flex flex-col items-center shadow">
              <FaSteam className="text-4xl text-white" />
              <div className="text-xl text-white pt-2">
                5 <span className="text-base">Streak</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Progress */}
      <div className="block md:hidden bg-white rounded-2xl shadow p-6 mt-6 transition-all duration-700 ease-in-out transform hover:scale-105 opacity-0 animate-fadeIn">
        <h1 className="text-xl font-bold mb-3">Overall Progress</h1>
        <div className="w-full h-3 bg-amber rounded-full mb-4"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 items-center mt-3">
            <span className="text-2xl">👩‍🦱</span>
            <span className="font-semibold text-lg">Henry S.</span>
          </div>
        ))}
      </div>

      {/* Mobile Top Learners */}
      <div className="my-8 bg-amber py-4 rounded-2xl block md:hidden shadow mt-6 transition-all duration-700 ease-in-out transform hover:scale-105 opacity-0 animate-fadeIn">
        <div className="text-center text-4xl">🏆</div>
        <p className="text-center text-white py-2 text-lg font-semibold">
          Top Learners This Week
        </p>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between items-center mt-3 px-4">
            <div className="flex gap-2 items-center">
              <span className="text-xl">👩‍🦱</span>
              <span className="font-semibold text-base text-white">
                Henry S.
              </span>
            </div>
            <span className="text-white font-semibold text-base">5 d</span>
          </div>
        ))}
      </div>

      {/* Mobile Challenge */}
      <div className="my-8 block md:hidden bg-white rounded-2xl shadow p-6 mt-6 transition-all duration-700 ease-in-out transform hover:scale-105 opacity-0 animate-fadeIn">
        <span className="text-4xl block text-center mb-2">⚡</span>
        <p className="text-center text-xl font-bold mb-4">
          Try today's Challenge
        </p>
        <button className="w-full bg-amber text-white py-3 rounded-2xl shadow font-semibold hover:scale-105 transition-transform duration-200">
          Start Challenge
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 grid-rows-2 gap-6 transition-all duration-700 ease-in-out transform hover:scale-105 opacity-0 animate-fadeIn">
        {/* Weekly Progress */}
        <div className="w-full max-w-md p-6 bg-white shadow rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Weekly Progress</h2>
          <div className="w-full bg-gray-200 h-5 rounded-full overflow-hidden mb-2">
            <div
              className="bg-yellow-500 h-5 transition-all duration-500 ease-in-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mb-4">
            {completedLessons} of {totalLessons} lessons completed
          </p>
          <button
            onClick={handleCompleteLesson}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
          >
            Complete Lesson
          </button>
        </div>

        {/* Top Learners (Desktop) */}
        <div className="bg-amber py-4 rounded-2xl hidden md:block shadow row-span-2 mx-4 transition-all duration-700 ease-in-out transform hover:scale-105 opacity-0 animate-fadeIn">
          <div className="text-center text-4xl">🏆</div>
          <p className="text-center text-white py-2 text-lg font-semibold">
            Top Learners This Week
          </p>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex justify-between items-center mt-3 px-4"
            >
              <div className="flex gap-2 items-center">
                <span className="text-xl">👩‍🦱</span>
                <span className="font-semibold text-base text-white">
                  Henry S.
                </span>
              </div>
              <span className="text-white font-semibold text-base">5 d</span>
            </div>
          ))}
        </div>

        {/* Explore Lessons */}
        <div className="bg-amber pt-4 px-2 rounded-2xl flex flex-col justify-between transition-all duration-700 ease-in-out transform hover:scale-105 opacity-0 animate-fadeIn">
          <div>
            <h1 className="text-3xl text-white font-semibold px-3">
              Explore more
            </h1>
            <p className="text-3xl text-white font-semibold px-3">Lessons</p>
          </div>
          <button className="bg-white text-amber mt-4 py-2 rounded-full w-full font-bold mb-5">
            Go to Lessons
          </button>
        </div>

        {/* Badges */}
        <div className="mt-8 transition-transform duration-300 hover:scale-105">
          <Badge />
        </div>
      </div>
    </DashboardLayout>
  );
};
export default Dashboard;
