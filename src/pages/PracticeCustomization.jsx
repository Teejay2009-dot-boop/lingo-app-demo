import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaPlay, FaCoins, FaHeart, FaStar } from "react-icons/fa";

const PracticeCustomization = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { practiceType, practiceName } = location.state || {};

  // Customization options
  const [difficulty, setDifficulty] = useState("beginner");
  const [exerciseCount, setExerciseCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState(5);

  // Options for each category
  const difficultyOptions = [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "expert", label: "Expert" }
  ];

  const exerciseOptions = [
    { value: 10, label: "10 Exercises" },
    { value: 20, label: "20 Exercises" },
    { value: 30, label: "30 Exercises" },
    { value: 40, label: "40 Exercises" }
  ];

  const timeOptions = [
    { value: 5, label: "5 minutes" },
    { value: 10, label: "10 minutes" },
    { value: 15, label: "15 minutes" },
    { value: 20, label: "20 minutes" }
  ];

  const handleStartPractice = () => {
    navigate("/practice/display", {
      state: {
        practiceType,
        practiceName,
        difficulty,
        exerciseCount,
        timeLimit
      }
    });
  };

  const OptionCard = ({ title, options, selectedValue, onSelect }) => (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={`p-4 rounded-xl border-2 transition-all duration-200 font-semibold text-lg
              ${selectedValue === option.value
                ? "border-yellow-500 bg-yellow-50 text-yellow-700 shadow-md"
                : "border-gray-200 bg-gray-50 text-gray-700 hover:border-yellow-400 hover:bg-yellow-25"
              }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="p-3 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
            >
              <FaArrowLeft className="text-xl" />
            </button>
            
            <div className="flex items-center gap-6 text-lg">
              <div className="flex items-center gap-2">
                <FaCoins className="text-yellow-500" />
                <span className="font-semibold">1,250</span>
              </div>
              <div className="flex items-center gap-2">
                <FaHeart className="text-red-500" />
                <span className="font-semibold">5/5</span>
              </div>
              <div className="flex items-center gap-2 text-amber-600">
                <FaStar className="text-amber-500" />
                <span className="font-semibold">2,450</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Practice Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {practiceName || "Practice Session"}
          </h1>
          <p className="text-lg text-gray-600">
            Customize your practice session
          </p>
        </div>

        {/* Customization Cards */}
        <div className="max-w-2xl mx-auto">
          <OptionCard
            title="Difficulty Level"
            options={difficultyOptions}
            selectedValue={difficulty}
            onSelect={setDifficulty}
          />

          <OptionCard
            title="Number of Exercises"
            options={exerciseOptions}
            selectedValue={exerciseCount}
            onSelect={setExerciseCount}
          />

          <OptionCard
            title="Time Limit"
            options={timeOptions}
            selectedValue={timeLimit}
            onSelect={setTimeLimit}
          />
        </div>

        {/* Session Summary */}
        <div className="max-w-2xl mx-auto bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
            Session Summary
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-gray-600">Difficulty</div>
              <div className="text-lg font-bold text-gray-800 capitalize">
                {difficulty}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Exercises</div>
              <div className="text-lg font-bold text-gray-800">
                {exerciseCount}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Time Limit</div>
              <div className="text-lg font-bold text-gray-800">
                {timeLimit} min
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Start Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleStartPractice}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-4 rounded-2xl font-bold text-xl shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3"
          >
            <FaPlay className="text-lg" />
            Start Practice Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default PracticeCustomization;