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
  const [currentExercise, setCurrentExercise] = useState(null);
  const [timeLeft, setTimeLeft] = useState(challengeConfig.timeLimit || 60);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(null);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [showCompletionSummary, setShowCompletionSummary] = useState(false);
  const [finalXP, setFinalXP] = useState(0);
  const [finalCoins, setFinalCoins] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [currentStreak, setCurrentStreak] = useState(0);

  // Get all possible exercises for random selection
  const getAllExercises = () => {
    const allLessons = Object.values(getAllLessons);
    return allLessons.flatMap((lesson) => lesson.exercises || []);
  };

  // Get random exercise
  const getRandomExercise = () => {
    const allExercises = getAllExercises();
    const randomIndex = Math.floor(Math.random() * allExercises.length);
    return allExercises[randomIndex];
  };

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0 || challengeCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          completeChallenge();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, challengeCompleted]);

  // Load first random question
  useEffect(() => {
    setCurrentExercise(getRandomExercise());

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
  }, []);

  const calculateQuestionXP = (isCorrect, timeTaken) => {
    const base = 3; // Higher base XP for challenges
    const accuracy = isCorrect ? 1.0 : 0.3;
    const streakBonus = 1 + Math.min(currentStreak * 0.03, 0.6);
    const timeRatio = 8 / Math.max(1, timeTaken); // Faster ideal time for challenges
    const speedFactor = Math.min(1.5, Math.max(0.7, timeRatio));

    return Math.round(base * accuracy * streakBonus * speedFactor);
  };

  const handleAnswer = async (isCorrect) => {
    const timeTaken = (Date.now() - startTime) / 1000;
    const questionXP = calculateQuestionXP(isCorrect, timeTaken);

    setLastAnswerCorrect(isCorrect);
    setShowModal(true);
    setTotalAnswered((prev) => prev + 1);

    if (isCorrect) {
      setScore((prev) => prev + 1);
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
          });
        } catch (error) {
          console.error("Error updating progress:", error);
        }
      }
    }, 0);
  };

  const handleNext = () => {
    setShowModal(false);
    setStartTime(Date.now());
    setCurrentExercise(getRandomExercise());
  };

  const completeChallenge = async () => {
    setChallengeCompleted(true);

    // Calculate final rewards
    const accuracy = totalAnswered > 0 ? score / totalAnswered : 0;
    const timeBonus = Math.floor(timeLeft / 5); // Bonus for remaining time
    const streakBonus = Math.floor(currentStreak / 3);
    const calculatedXP = Math.min(
      score * 4 + accuracy * 20 + timeBonus + streakBonus,
      75 // Higher max XP for challenges
    );
    const calculatedCoins = Math.floor(calculatedXP / 2);

    setFinalXP(calculatedXP);
    setFinalCoins(calculatedCoins);
    setShowCompletionSummary(true);

    // Update Firestore with final challenge rewards
    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      try {
        const userRef = doc(db, "users", uid);
        await updateDoc(userRef, {
          xp: increment(calculatedXP),
          total_xp: increment(calculatedXP),
          weeklyXP: increment(calculatedXP),
          monthlyXP: increment(calculatedXP),
          coins: increment(calculatedCoins),
          challenges_completed: increment(1),
        });
      } catch (error) {
        console.error("Error updating challenge completion:", error);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const renderCard = () => {
    if (!currentExercise) return <p>Loading challenge...</p>;

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
        return <p>Unsupported challenge type</p>;
    }
  };

  // Challenge Completion Summary
  if (showCompletionSummary && challengeCompleted) {
    const accuracy =
      totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0;

    return (
      <div className="p-6 h-screen flex flex-col items-center justify-center text-center bg-gray-100">
        <img src={mascot} style={{ width: "10rem" }} alt="" className="mb-6" />
        <h2 className="text-3xl font-bold mb-4 text-blue-600">
          Challenge Complete!
        </h2>
        <p className="text-xl text-gray-800 mb-2">
          Final Score: {score} correct answers
        </p>
        <p className="text-lg text-gray-600 mb-2">
          Answered: {totalAnswered} questions
        </p>
        <p className="text-lg text-gray-600 mb-4">Accuracy: {accuracy}%</p>

        <div className="flex justify-center gap-6 mb-6">
          <div className="px-6 rounded-xl border border-blue-500 flex flex-col justify-center items-center">
            <div className="text-xl text-blue-500">
              <FaExpand />
            </div>
            <p className="text-2xl font-bold text-black py-2">+{finalXP} XP</p>
            <p className="text-blue-500">challenge XP</p>
          </div>
          <div className="px-6 rounded-xl border border-yellow-500 flex flex-col justify-center items-center">
            <div className="text-xl text-yellow-500">
              <FaCoins />
            </div>
            <div className="flex-col">
              <p className="text-2xl text-yellow-600 flex items-center">
                +{finalCoins} <FaCoins className="ml-2 text-yellow-500" />
              </p>
              <p className="text-yellow-500">coins earned</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate("/lessons/section/challenge")}
          className="bg-blue-500 text-white font-semibold flex items-center px-8 py-3 text-lg rounded-full shadow-lg transition duration-300 transform hover:scale-105"
        >
          Back to Challenges <FaArrowAltCircleRight className="ml-2" />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 relative">
      <GoBackBtn />

      {/* Challenge Header - Timer and Score */}
      <div className="flex justify-center items-center  pt-10 mb-6">
        <div className="flex items-center justify-center gap-4">
          
          {/* <div className="text-lg font-semibold">
            Difficulty:{" "}
            <span className="text-amber-600">
              {challengeConfig.difficulty || "Unknown"}
            </span>
          </div> */}
        </div>

        <div
            className={`text-2xl font-bold px-8 py-2 rounded-2xl ${
              timeLeft < 20
                ? "bg-red-500 text-white animate-pulse"
                : "bg-green-500 text-white"
            }`}
          >
            
            {formatTime(timeLeft)}
          </div>

        {/* <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            Score: {score}
          </div>
          <div className="text-sm text-gray-600">Streak: {currentStreak}</div>
        </div> */}
      </div>

      {/* Question Display */}
      {renderCard()}

      {/* Skip Button */}
      {!showModal && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleNext}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Skip Question
          </button>
        </div>
      )}

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
              {lastAnswerCorrect ? "Great job!" : "Keep trying!"}
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

export default ChallengeDisplay;
