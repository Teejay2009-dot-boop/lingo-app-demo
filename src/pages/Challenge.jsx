import React from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";
import { ClockLoader } from "react-spinners";
import chrip from "../assets/IMG-20250724-WA0123-removebg-preview.png";

const Challenge = () => {
  const navigate = useNavigate();

  // Challenge configurations
  const challenges = [
    {
      id: "hard",
      time: 50,
      difficulty: "Hard",
      color: "red",
      speed: 3,
      description: "50 seconds - Fast paced!",
    },
    {
      id: "medium",
      time: 60,
      difficulty: "Medium",
      color: "yellow",
      speed: 2,
      description: "1 minute - Balanced challenge",
    },
    {
      id: "easy",
      time: 90,
      difficulty: "Easy",
      color: "orange",
      speed: 1,
      description: "1 minute 30 seconds - Relaxed pace",
    },
    {
      id: "very-easy",
      time: 120,
      difficulty: "Very Easy",
      color: "green",
      speed: 0.5,
      description: "2 minutes - Perfect for beginners",
    },
  ];

  const startChallenge = (challenge) => {
    // Navigate to your LessonDisplay with challenge parameters
    navigate(`/lessons/challenge/${challenge.id}`, {
      state: {
        challengeMode: true,
        timeLimit: challenge.time,
        difficulty: challenge.difficulty,
      },
    });
  };

  return (
    <>
      <DashboardLayout>
        <div className="pt-14 lg:pt-0 p-4">
          <button
            onClick={() => navigate(-1)}
            className="p-3 text-amber text-2xl rounded-lg"
          >
            <FaArrowLeft />
          </button>

          <p className="flex align-top justify-center text-amber text-3xl font-bold mb-6">
            Challenge Mode
          </p>

          <div className="challenge-container flex justify-center mb-8">
            <img src={chrip} style={{ width: "10rem" }} alt="" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                onClick={() => startChallenge(challenge)}
                className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200 hover:shadow-lg border-2 border-transparent hover:border-amber-300"
              >
                <div className="text-6xl mb-4">
                  <ClockLoader
                    speedMultiplier={challenge.speed}
                    color={challenge.color}
                  />
                </div>
                <p className="text-xl text-center font-semibold mb-1">
                  {challenge.time} seconds
                </p>
                <p
                  className={`text-lg font-medium mb-2 ${
                    challenge.difficulty === "Hard"
                      ? "text-red-500"
                      : challenge.difficulty === "Medium"
                      ? "text-yellow-500"
                      : challenge.difficulty === "Easy"
                      ? "text-orange-500"
                      : "text-green-500"
                  }`}
                >
                  {challenge.difficulty}
                </p>
                <p className="text-gray-500 text-center text-sm">
                  {challenge.description}
                </p>
                <button className="mt-4 bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors">
                  Start Challenge
                </button>
              </div>
            ))}
          </div>

          {/* Challenge Instructions */}
          <div className="mt-8 bg-amber-50 rounded-lg p-6 max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-amber-700 mb-3">
              How Challenges Work:
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Answer as many questions as possible before time runs out</li>
              <li>XP is calculated based on speed and accuracy</li>
              <li>Time bonus added to your final score</li>
              <li>Challenge ends automatically when timer reaches zero</li>
            </ul>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default Challenge;
