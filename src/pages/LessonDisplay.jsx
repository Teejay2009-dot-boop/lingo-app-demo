import React, { useState } from "react";
import { VocabularyCard } from "../components/LessonCards/VocabularyCard";
import lessonData from "../data/lesson.json";
import GoBackBtn from "../components/GoBackBtn";
import { FaCheck } from "react-icons/fa";

const LessonDisplay = () => {
  const lesson = lessonData.lesson_1;
  const exercises = lesson.exercises;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [lives, setLives] = useState(5);
  const [showModal, setShowModal] = useState(false);
  const [xp, setXp] = useState(0);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(null);

  const currentExercise = exercises[currentIndex];

  const handleAnswer = (isCorrect) => {
    setShowModal(true);
    setLastAnswerCorrect(isCorrect);

    if (!isCorrect) {
      setLives((prev) => Math.max(0, prev - 1));
    } else {
      setXp((prev) => prev + lesson.base_xp);
    }
  };

  const handleNext = () => {
    setShowModal(false);
    setCurrentIndex((prev) => prev + 1);
    setLastAnswerCorrect(null);
  };

  const renderCard = () => {
    switch (currentExercise.type) {
      case "vocabulary":
        return (
          <VocabularyCard
            data={currentExercise}
            onAnswer={handleAnswer}
            disabled={showModal}
          />
        );
      default:
        return <p>Unsupported card type</p>;
    }
  };

  const progressPercent = Math.round((currentIndex / exercises.length) * 100);

  if (lives <= 0) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Game Over</h2>
        <p>You’ve lost all your lives! Come back tomorrow.</p>
      </div>
    );
  }

  if (currentIndex >= exercises.length) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Lesson Complete 🎉</h2>
        <p>Total XP Earned: {xp}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 relative">
      <GoBackBtn />

      {/* Top Info */}
      <div className="flex justify-between items-center pt-10 mb-4">
        <p className="font-semibold">XP: {xp}</p>
        <p className="font-semibold">Lives: {lives}</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-300 h-2 rounded mb-4">
        <div
          className="bg-green-500 h-2 rounded transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {/* Render Card */}
      {renderCard()}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className={lastAnswerCorrect ? 'bg-green-200 border border-green-500 p-6 rounded-lg shadow-md text-center w-11/12 max-w-md' : 'bg-red-300 p-6 rounded-lg shadow-md text-center w-11/12 max-w-md border border-red-500 py-10'}>
            <h2
              className={`text-2xl font-bold mb-4 ${
                lastAnswerCorrect ? "text-green-600" : "text-red-600"
              }`}
            >
              {lastAnswerCorrect ? `✔ Correct` : "❌ Incorrect!"}
            </h2>
            <button
              onClick={handleNext}
              className={lastAnswerCorrect ? 'bg-green-600 text-white px-6 py-2 mt-4 rounded hover:bg-amber-600 transition duration-300 shadow-lg translate-y-[-1px] hover:translate-y-0' : 'bg-red-600  text-white px-6 py-2 mt-4 rounded hover:bg-amber-600 transition ease-in duration-300 shadow-lg translate-y-[-1px] hover:translate-y-0'}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonDisplay;
