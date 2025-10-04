import React, { useEffect, useState } from "react";
import { VocabularyCard } from "../components/LessonCards/VocabularyCard";
import AudioChoiceCard from "../components/LessonCards/AudioChoiceCard";
import GoBackBtn from "../components/GoBackBtn";
import { getAllLessons } from "../data/lessons";
import { useNavigate, useLocation } from "react-router-dom";
import RolePlayTypeYourself from "../components/LessonCards/RolePlayTypeYourself";
import MatchImageToWord from "../components/LessonCards/MatchImageToWord";
import mascot from "../assets/IMG-20250724-WA0115-removebg-preview.png";
import {
  FaArrowAltCircleRight,
  FaCoins,
  FaExpand,
  FaChartLine,
} from "react-icons/fa";
import { MainIdea } from "../components/LessonCards/MainIdea";
import { FillintheGapBestOption } from "../components/LessonCards/FillintheGapBestOption";
import { FillTheGap } from "../components/LessonCards/FillintheGap";
import MatchWords from "../components/LessonCards/MatchWords";
import TypeWhatYouHear from "../components/LessonCards/TypeWhatYouHear";
import RolePlayOptions from "../components/LessonCards/RolePlayOptions";
import { auth, db } from "../firebase/config/firebase";
import { doc, updateDoc, increment, onSnapshot } from "firebase/firestore";

const PracticeDisplay = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { practiceType, practiceName } = location.state || {};

  // Practice states
  const [currentExercise, setCurrentExercise] = useState(null);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(null);
  const [practiceStats, setPracticeStats] = useState({
    correct: 0,
    incorrect: 0,
    accuracy: 0,
  });
  const [sessionXP, setSessionXP] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());

  // Get all exercises filtered by type
  const getFilteredExercises = () => {
    const allLessons = Object.values(getAllLessons);
    const allExercises = allLessons.flatMap((lesson) => lesson.exercises || []);

    if (practiceType === "mixed") {
      return allExercises;
    }

    // Map practice types to exercise types
    const typeMapping = {
      vocabulary: ["vocabulary", "match_words", "match_image_to_word"],
      listening: ["tap_what_you_hear", "type_what_you_hear"],
      role_playing: ["role_play_options", "role_play_type_yourself"],
      speaking: ["type_what_you_hear", "role_play_type_yourself"], // Assuming these involve speaking
    };

    const allowedTypes = typeMapping[practiceType] || [practiceType];
    return allExercises.filter((exercise) =>
      allowedTypes.includes(exercise.type)
    );
  };

  // Get random exercise from filtered list
  const getRandomExercise = () => {
    const filteredExercises = getFilteredExercises();
    if (filteredExercises.length === 0) {
      console.warn("No exercises found for practice type:", practiceType);
      return null;
    }
    const randomIndex = Math.floor(Math.random() * filteredExercises.length);
    return filteredExercises[randomIndex];
  };

  // Load first random question
  useEffect(() => {
    const exercise = getRandomExercise();
    if (exercise) {
      setCurrentExercise(exercise);
    } else {
      console.error("No exercises available for this practice type");
    }

    // Listen for user data to get current streak
    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      const userRef = doc(db, "users", uid);
      const unsubUser = onSnapshot(userRef, (snap) => {
        if (snap.exists()) {
          setCurrentStreak(snap.data().current_streak ?? 0);
        }
      });
      return () => unsubUser();
    }
  }, [practiceType]);

  const calculateQuestionXP = (isCorrect, timeTaken) => {
    const base = 2; // Base XP for practice
    const accuracy = isCorrect ? 1.0 : 0.2; // Less penalty for wrong answers in practice
    const streakBonus = 1 + Math.min(currentStreak * 0.02, 0.3);
    const timeRatio = 15 / Math.max(1, timeTaken); // More relaxed time for practice
    const speedFactor = Math.min(1.3, Math.max(0.9, timeRatio));

    return Math.round(base * accuracy * streakBonus * speedFactor);
  };

  const handleAnswer = async (isCorrect) => {
    const timeTaken = (Date.now() - startTime) / 1000;
    const questionXP = calculateQuestionXP(isCorrect, timeTaken);

    setLastAnswerCorrect(isCorrect);
    setShowModal(true);
    setTotalAnswered((prev) => prev + 1);

    // Update stats
    setPracticeStats((prev) => ({
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      incorrect: !isCorrect ? prev.incorrect + 1 : prev.incorrect,
      accuracy:
        prev.correct +
        ((isCorrect ? 1 : 0) / (prev.correct + prev.incorrect + 1)) * 100,
    }));

    if (isCorrect) {
      setScore((prev) => prev + 1);
      setSessionXP((prev) => prev + questionXP);
    }

    // Update streak locally for next question calculation
    if (isCorrect) {
      setCurrentStreak((prev) => prev + 1);
    } else {
      setCurrentStreak(0);
    }

    // Update Firestore
    setTimeout(async () => {
      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        try {
          await updateDoc(userRef, {
            xp: increment(questionXP),
            total_xp: increment(questionXP),
            weeklyXP: increment(questionXP),
            monthlyXP: increment(questionXP),
            ...(isCorrect && { current_streak: increment(1) }),
            ...(!isCorrect && { current_streak: 0 }),
            practice_sessions: increment(1),
          });
        } catch (error) {
          console.error("Error updating practice progress:", error);
        }
      }
    }, 0);
  };

  const handleNext = () => {
    setShowModal(false);
    setStartTime(Date.now());

    const nextExercise = getRandomExercise();
    if (nextExercise) {
      setCurrentExercise(nextExercise);
    } else {
      console.error("No more exercises available");
    }
  };

  const exitPractice = () => {
    navigate("/lessons/section/practice");
  };

  const renderCard = () => {
    if (!currentExercise) {
      return (
        <div className="text-center p-8">
          <p className="text-xl text-gray-600">
            No exercises available for {practiceName} practice.
          </p>
          <button
            onClick={exitPractice}
            className="mt-4 bg-amber-500 text-white px-6 py-2 rounded-lg bg-amber hover:bg-yellow-600 transition-colors"
          >
            Return to Practice Selection
          </button>
        </div>
      );
    }

    const props = {
      data: currentExercise,
      onAnswer: handleAnswer,
      disabled: false,
      isAnswered: false,
    };

    switch (currentExercise.type) {
      case "vocabulary":
        return <VocabularyCard {...props} />;
      case "tap_what_you_hear":
        return <AudioChoiceCard {...props} />;
      case "main_idea":
        return <MainIdea {...props} />;
      case "fill_gap_best_option":
        return <FillintheGapBestOption {...props} />;
      case "fill_the_gap":
        return <FillTheGap {...props} />;
      case "match_words":
        return <MatchWords {...props} />;
      case "type_what_you_hear":
        return <TypeWhatYouHear {...props} />;
      case "role_play_type_yourself":
        return <RolePlayTypeYourself {...props} />;
      case "match_image_to_word":
        return <MatchImageToWord {...props} />;
      case "role_play_options":
        return <RolePlayOptions {...props} />;
      default:
        return <p>Unsupported exercise type: {currentExercise.type}</p>;
    }
  };

  const accuracy =
    totalAnswered > 0
      ? Math.round((practiceStats.correct / totalAnswered) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-gray-100 p-6 relative">
      <GoBackBtn />

      {/* Practice Header */}
      <div className="flex justify-between items-center pt-10 mb-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-amber-600">
            {practiceName} Practice
          </h1>
          <p className="text-gray-600">Practice mode - No time limit</p>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            Score: {score}
          </div>
          <div className="text-sm text-gray-600">
            Streak: {currentStreak} | Accuracy: {accuracy}%
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex justify-between items-center text-sm">
          <div className="text-center">
            <div className="font-semibold text-green-600">
              {practiceStats.correct}
            </div>
            <div className="text-gray-500">Correct</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-red-600">
              {practiceStats.incorrect}
            </div>
            <div className="text-gray-500">Incorrect</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-blue-600">{totalAnswered}</div>
            <div className="text-gray-500">Total</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-purple-600">+{sessionXP}</div>
            <div className="text-gray-500">XP Earned</div>
          </div>
        </div>
      </div>

      {/* Question Display */}
      <div className="mb-6">{renderCard()}</div>

      {/* Practice Controls */}
      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={exitPractice}
          className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Exit Practice
        </button>

        {!showModal && (
          <button
            onClick={handleNext}
            className="bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors"
          >
            Skip Question
          </button>
        )}
      </div>

      {/* Answer Feedback Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
          <div
            className={`p-6 rounded-lg shadow-md text-center w-full max-w-sm mx-auto border ${
              lastAnswerCorrect
                ? "bg-green-100 border-green-300 text-green-800"
                : "bg-red-100 border-red-300 text-red-800"
            }`}
          >
            <h2
              className={`text-3xl font-bold mb-4 ${
                lastAnswerCorrect ? "text-green-600" : "text-red-600"
              }`}
            >
              {lastAnswerCorrect ? "✔ Correct!" : "❌ Incorrect!"}
            </h2>
            <p className="text-lg mb-4">
              {lastAnswerCorrect
                ? `Great job! +${calculateQuestionXP(true, 0)} XP`
                : "Keep practicing!"}
            </p>
            <button
              onClick={handleNext}
              className={`px-8 py-3 mt-2 rounded-full text-white font-bold text-lg shadow-lg transition duration-300 transform hover:scale-105 ${
                lastAnswerCorrect
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              Next Question
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeDisplay;
