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
  FaClock,
  FaHeart,
  FaFire,
  FaArrowCircleLeft,
} from "react-icons/fa";
import { MainIdea } from "../components/LessonCards/MainIdea";
import { FillintheGapBestOption } from "../components/LessonCards/FillintheGapBestOption";
import { FillTheGap } from "../components/LessonCards/FillintheGap";
import MatchWords from "../components/LessonCards/MatchWords";
import TypeWhatYouHear from "../components/LessonCards/TypeWhatYouHear";
import RolePlayOptions from "../components/LessonCards/RolePlayOptions";
import { auth, db } from "../firebase/config/firebase";
import { doc, updateDoc, increment, onSnapshot } from "firebase/firestore";

const ChallengeDisplay = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const challengeConfig = location.state || {};

  // Challenge states
  const [currentLesson, setCurrentLesson] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(challengeConfig.timeLimit || 300);
  const [currentXP, setCurrentXP] = useState(20);
  const [lives, setLives] = useState(5);
  const [showModal, setShowModal] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(null);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [showCompletionSummary, setShowCompletionSummary] = useState(false);
  const [finalXP, setFinalXP] = useState(0);
  const [finalCoins, setFinalCoins] = useState(0);
  const [answeredMap, setAnsweredMap] = useState({});
  const [currentStreak, setCurrentStreak] = useState(0);

  const getRandomLesson = () => {
    const allLessons = Object.values(getAllLessons);
    const lessonsWithExercises = allLessons.filter(
      (lesson) => lesson.exercises && lesson.exercises.length > 0
    );

    if (lessonsWithExercises.length === 0) {
      console.error("No lessons with exercises found");
      return null;
    }

    const randomIndex = Math.floor(Math.random() * lessonsWithExercises.length);
    return lessonsWithExercises[randomIndex];
  };

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0 || challengeCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          completeChallenge(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, challengeCompleted]);

  // Load random lesson
  useEffect(() => {
    const lesson = getRandomLesson();
    if (lesson) {
      setCurrentLesson(lesson);
      setExercises(lesson.exercises);
    }

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
  }, []);

  const handleAnswer = async (isCorrect) => {
    if (answeredMap[currentExerciseIndex]) return;

    setAnsweredMap((prev) => ({
      ...prev,
      [currentExerciseIndex]: { isCorrect },
    }));

    setLastAnswerCorrect(isCorrect);
    setShowModal(true);

    if (isCorrect) {
      setCurrentStreak((prev) => prev + 1);
    } else {
      setCurrentXP((prev) => Math.max(0, prev - 2));
      setLives((prev) => prev - 1);
      setCurrentStreak(0);

      if (lives - 1 <= 0) {
        setTimeout(() => {
          completeChallenge(false);
        }, 1500);
        return;
      }
    }

    setTimeout(async () => {
      if (auth.currentUser && isCorrect) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        try {
          await updateDoc(userRef, {
            current_streak: increment(1),
          });
        } catch (error) {
          console.error("Error updating streak:", error);
        }
      }
    }, 0);
  };

  const handleNext = () => {
    setShowModal(false);

    if (currentExerciseIndex >= exercises.length - 1) {
      completeChallenge(true);
    } else {
      setCurrentExerciseIndex((prev) => prev + 1);
    }
  };

  const completeChallenge = async (success) => {
    setChallengeCompleted(true);

    const correctAnswers = Object.values(answeredMap).filter(
      (a) => a.isCorrect
    ).length;
    const totalQuestions = exercises.length;
    const accuracy =
      totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    let calculatedXP = 0;
    let calculatedCoins = 0;

    if (success) {
      // Fixed tiers based on accuracy
      if (accuracy === 100) {
        calculatedXP = 20; // Perfect score
      } else if (accuracy >= 80) {
        calculatedXP = 16; // Great score
      } else if (accuracy >= 60) {
        calculatedXP = 12; // Good score
      } else {
        calculatedXP = 8; // Passing score
      }

      calculatedCoins = Math.floor(calculatedXP / 2) + 2;
    } else {
      // Failure: scaled rewards
      calculatedXP = Math.floor(accuracy / 10); // 10% = 1 XP, 50% = 5 XP, etc.
      calculatedCoins = Math.floor(calculatedXP / 3);
    }

    setFinalXP(calculatedXP);
    setFinalCoins(calculatedCoins);
    setShowCompletionSummary(true);

    // ... rest of firebase code
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const currentExercise = exercises[currentExerciseIndex];
  const progressPercent =
    exercises.length > 0
      ? Math.round(((currentExerciseIndex + 1) / exercises.length) * 100)
      : 0;

  const renderCard = () => {
    if (!currentExercise) return <p>Loading challenge...</p>;

    const isAnswered = answeredMap[currentExerciseIndex];
    const shouldDisable = !!isAnswered;

    const props = {
      data: currentExercise,
      onAnswer: handleAnswer,
      disabled: shouldDisable,
      isAnswered: isAnswered,
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
        return <p>Unsupported challenge type</p>;
    }
  };

  // Game Over Screen (No Lives)
  if (lives <= 0 && !showCompletionSummary) {
    return (
      <div className="p-6 h-screen flex flex-col items-center justify-center text-center">
        <img src={mascot} style={{ width: "10rem" }} alt="" />
        <h2 className="text-2xl font-bold mb-4">Game Over</h2>
        <p>You've lost all your lives! Come back tomorrow.</p>
        <button
          onClick={() => navigate("/lessons/section/challenge")}
          className="bg-amber text-white font-semibold flex gap-4 items-center px-6 py-2 text-lg rounded-full my-3"
        >
          <FaArrowCircleLeft style={{ fontSize: "1rem" }} /> Go Back
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-amber text-white font-semibold flex gap-4 items-center px-6 py-2 text-lg rounded-full my-3"
        >
          <FaArrowCircleLeft style={{ fontSize: "1rem" }} /> Go to dashboard
        </button>
      </div>
    );
  }

  // Challenge Completion Summary
  if (showCompletionSummary && challengeCompleted) {
    const correctAnswers = Object.values(answeredMap).filter(
      (a) => a.isCorrect
    ).length;
    const totalQuestions = exercises.length;
    const accuracy =
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;
    const success = lives > 0 && currentExerciseIndex >= exercises.length - 1;

    return (
      <div className="p-6 h-screen flex flex-col items-center justify-center text-center bg-gray-100">
        <img src={mascot} style={{ width: "10rem" }} alt="" className="mb-6" />

        <h2 className="text-3xl font-bold mb-4 text-green-600">
          {success ? "Challenge Complete!" : "Challenge Failed!"}
        </h2>

        <p className="text-xl text-gray-800 mb-4">
          Accuracy: {correctAnswers}/{totalQuestions} ({accuracy}%)
        </p>

        <div className="flex justify-between item-center gap-6 mb-6">
          <div className="px-6 rounded-xl border border-amber flex flex-col justify-center items-center">
            <div className="text-xl text-amber">
              <FaExpand />
            </div>
            <p className="text-2xl font-bold text-black py-2">+{finalXP} XP</p>
            <p className="text-amber">gained</p>
          </div>

          <div className="px-6 rounded-xl border border-amber flex flex-col justify-center items-center">
            <div className="text-4xl text-red-600">
              <FaHeart />
            </div>
            <div className="flex-col">
              <p className="text-xl font-bold text-black py-2">{lives} ❤</p>
              <p className="text-amber">remaining</p>
            </div>
          </div>

          <div className="px-6 rounded-xl border border-amber flex flex-col justify-center items-center">
            <div className="text-xl text-amber">
              <FaCoins />
            </div>
            <div className="flex-col">
              <p className="text-2xl text-yellow-600 flex items-center">
                +{finalCoins} <FaCoins className="ml-2 text-amber" />
              </p>
              <p className="text-amber">gained</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate("/lessons/section/challenge")}
          className="bg-amber-500 text-white font-semibold flex items-center px-8 py-3 text-lg rounded-full shadow-lg transition duration-300 transform hover:scale-105"
        >
          Back to Challenges <FaArrowAltCircleRight className="ml-2" />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 relative">
      <GoBackBtn />

      {/* Header with Lives, XP, and Timer */}
      <div className="flex justify-between items-center pt-10 mb-4">
        <p className="font-semibold">❤ Lives: {lives}</p>

        <div className="text-center">
          <div
            className={`text-sm font-semibold px-3 py-1 rounded-full ${
              timeLeft < 60
                ? "bg-red-500 text-white animate-pulse"
                : "bg-green-500 text-white"
            }`}
          >
            <FaClock className="inline mr-1" />
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* Amber Progress Bar */}
      <div className="w-full bg-gray-300 h-2 rounded mb-4">
        <div
          className="bg-amber h-2 rounded transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Question Counter */}
      <div className="text-center mb-4">
        <p className="text-gray-600">
          Question {currentExerciseIndex + 1} of {exercises.length}
        </p>
      </div>

      {/* Exercise Card */}
      {renderCard()}

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
            <p className="text-lg mb-2">
              {lastAnswerCorrect
                ? "Great job! Streak increased!"
                : `-2 XP | ${lives} lives remaining`}
            </p>
            <button
              onClick={handleNext}
              className={`px-8 py-3 mt-4 rounded-full text-white font-bold text-lg shadow-lg transition duration-300 transform hover:scale-105 ${
                lastAnswerCorrect
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {currentExerciseIndex >= exercises.length - 1
                ? "Finish Challenge"
                : "Continue"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengeDisplay;
