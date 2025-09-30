import React, { useEffect, useState } from "react";
import { VocabularyCard } from "../components/LessonCards/VocabularyCard";
import AudioChoiceCard from "../components/LessonCards/AudioChoiceCard";
import GoBackBtn from "../components/GoBackBtn";
import { getAllLessons, getSections } from "../data/lessons";
import { useNavigate, useParams, Link } from "react-router-dom";
import RolePlayTypeYourself from "../components/LessonCards/RolePlayTypeYourself";
import MatchImageToWord from "../components/LessonCards/MatchImageToWord";
import mascot from "../assets/IMG-20250724-WA0115-removebg-preview.png";
import {
  FaArrowAltCircleRight,
  FaArrowCircleLeft,
  FaCoins,
  FaHeart,
  FaExpand,
} from "react-icons/fa";
import { MainIdea } from "../components/LessonCards/MainIdea";
import { FillintheGapBestOption } from "../components/LessonCards/FillintheGapBestOption";
import { FillTheGap } from "../components/LessonCards/FillintheGap";
import MatchWords from "../components/LessonCards/MatchWords";
import TypeWhatYouHear from "../components/LessonCards/TypeWhatYouHear";
import RolePlayOptions from "../components/LessonCards/RolePlayOptions";
import { auth, db } from "../firebase/config/firebase";
import { updateStreak } from "../utils/streak";
import { getUserRank } from "../utils/rankSystem";
import {
  doc,
  updateDoc,
  increment,
  getDoc,
  onSnapshot,
  setDoc,
  arrayUnion,
} from "firebase/firestore";

const LessonDisplay = () => {
  const { moduleId, lessonIndex: lessonIndexParam } = useParams();
  const navigate = useNavigate();
  const currentLessonIndex = parseInt(lessonIndexParam, 10) || 0;

  const [currentModule, setCurrentModule] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [baseXp, setBaseXp] = useState(10);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [lives, setLives] = useState(5);
  const [xp, setXp] = useState(0);
  const [coins, setCoins] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(null);
  const [answeredMap, setAnsweredMap] = useState({});
  const [currentStreak, setCurrentStreak] = useState(0);
  const [user, setUser] = useState(null);

  // Get real rank using rank system
  const realRank = user
    ? getUserRank({
        level: user.level || 1,
        accuracy: user.progress?.accuracy || 0,
        streak: user.current_streak || 0,
        lessons: user.lessons || 0,
      })
    : "Moonstone";
  const [startTime, setStartTime] = useState(null);
  const [earnedXPPerQuestion, setEarnedXPPerQuestion] = useState([]);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [xpBreakdown, setXpBreakdown] = useState({
    base: 0,
    accuracy: 0,
    streak: 0,
    speed: 0,
    total: 0,
  });
  const [showCompletionSummary, setShowCompletionSummary] = useState(false);
  const [finalLessonXp, setFinalLessonXp] = useState(0);
  const [finalLessonCoins, setFinalLessonCoins] = useState(0);

  const MAX_XP_PER_LESSON = 30;
  const IDEAL_TIME_PER_QUESTION = 10;
  const PERFECT_LESSON_BONUS = 5;

  const currentExercise = exercises[currentIndex];
  const progressPercent =
    exercises.length > 0
      ? Math.round((currentIndex / exercises.length) * 100)
      : 0;

  // Reset timer when question changes
  useEffect(() => {
    setStartTime(Date.now());
  }, [currentIndex]);

  // Fetch user data and module progress
  useEffect(() => {
    if (!auth.currentUser || !moduleId) {
      navigate("/login");
      return;
    }

    const uid = auth.currentUser.uid;
    const userRef = doc(db, "users", uid);

    const unsubUser = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        setLives(snap.data().lives ?? 5);
        setXp(snap.data().xp ?? 0);
        setCoins(snap.data().coins ?? 0);
        setCurrentStreak(snap.data().current_streak ?? 0);
      }
    });

    // Fetch module progress
    const moduleProgressRef = doc(db, `users/${uid}/progress`, moduleId);
    const unsubModuleProgress = onSnapshot(moduleProgressRef, (snap) => {
      if (snap.exists()) {
        const progressData = snap.data();
        const allAvailableLessons = [];
        const sections = getSections();
        for (const section of sections) {
          const foundModule = section.modules.find(
            (m) => m.module_id === moduleId
          );
          if (foundModule) {
            allAvailableLessons.push(
              ...foundModule.lessons.map((lesson) => lesson.lesson_id)
            );
            break;
          }
        }

        const lastCompletedLessonId = progressData.lastLesson;
        let initialLessonIndex = currentLessonIndex;
        if (currentLessonIndex === 0 && lastCompletedLessonId) {
          const inferredIndex =
            allAvailableLessons.indexOf(lastCompletedLessonId) + 1;
          initialLessonIndex = Math.min(
            inferredIndex,
            allAvailableLessons.length - 1
          );
        }
      }
    });

    return () => {
      unsubUser();
      unsubModuleProgress();
    };
  }, [moduleId, navigate, currentLessonIndex]);

  // Load lesson data based on current module and index
  useEffect(() => {
    if (moduleId) {
      // Normal lesson mode
      const sections = getSections();
      let module = null;
      for (const section of sections) {
        module = section.modules.find((m) => m.module_id === moduleId);
        if (module) break;
      }

      if (module) {
        setCurrentModule(module);
        const lessonId = module.lessons[currentLessonIndex]?.lesson_id;
        const fetchedLesson = Object.values(getAllLessons).find(
          (l) => l.lesson_id === lessonId
        );

        if (fetchedLesson) {
          setLesson(fetchedLesson);
          setExercises(fetchedLesson.exercises);
          setBaseXp(fetchedLesson.base_xp || 10);
          setCurrentIndex(0);
          setAnsweredMap({});
          setEarnedXPPerQuestion([]);
          setLessonCompleted(false);
          setShowCompletionSummary(false);
        } else {
          console.error("Lesson not found:", lessonId);
          if (lessonId !== undefined) {
            navigate("/404");
          }
        }
      }
    }
  }, [moduleId, currentLessonIndex, navigate]);

  const calculateQuestionXP = (isCorrect, timeTaken) => {
    const base = Math.min(baseXp, 2);
    const accuracy = isCorrect ? 1.0 : 0.5;
    const streakBonus = 1 + Math.min(currentStreak * 0.02, 0.5);
    const timeRatio = IDEAL_TIME_PER_QUESTION / Math.max(1, timeTaken);
    const speedFactor = Math.min(1.2, Math.max(0.8, timeRatio));

    const breakdown = {
      base: base,
      accuracy: Math.round(base * accuracy),
      streak: Math.round(base * (streakBonus - 1)),
      speed: Math.round(base * (speedFactor - 1)),
      total: Math.round(base * accuracy * streakBonus * speedFactor),
    };

    setXpBreakdown(breakdown);
    return breakdown.total;
  };

  const handleAnswer = async (isCorrect) => {
    if (answeredMap[currentIndex]) return;

    const timeTaken = (Date.now() - startTime) / 1000;
    const questionXP = calculateQuestionXP(isCorrect, timeTaken);

    setAnsweredMap((prev) => ({ ...prev, [currentIndex]: { isCorrect } }));
    setEarnedXPPerQuestion((prev) => [...prev, questionXP]);
    setShowModal(true);
    setLastAnswerCorrect(isCorrect);

    setTimeout(async () => {
      const userRef = doc(db, "users", auth.currentUser.uid);
      try {
        await updateDoc(userRef, {
          xp: increment(questionXP),
          total_xp: increment(questionXP),
          weeklyXP: increment(questionXP),
          monthlyXP: increment(questionXP),
          ...(!isCorrect && { lives: increment(-1) }),
        });
      } catch (error) {
        console.error("Error updating progress:", error);
      }
    }, 0);
  };

  const completeLesson = async () => {
    if (!auth.currentUser || lessonCompleted || !lesson || !currentModule) {
      console.log("❌ CANNOT COMPLETE - Missing requirements");
      return;
    }

    console.log("🎯 completeLesson() CALLED - Starting...");

    // Calculate values
    const correctAnswers = Object.values(answeredMap).filter(
      (a) => a.isCorrect
    ).length;
    const perfectBonus =
      correctAnswers === exercises.length ? PERFECT_LESSON_BONUS : 0;
    const streakBonus = Math.floor(currentStreak / 7);
    const totalRawXP = earnedXPPerQuestion.reduce((sum, xp) => sum + xp, 0);
    const finalXP = Math.min(
      totalRawXP + perfectBonus + streakBonus,
      MAX_XP_PER_LESSON
    );
    const coinsEarned = Math.floor(finalXP / 3) + (perfectBonus ? 2 : 0);

    console.log("💰 Calculated:", { finalXP, coinsEarned });

    // ✅ SET STATES FIRST - BEFORE ANY ASYNC OPERATIONS
    console.log("🎉 SETTING COMPLETION STATES...");
    setLessonCompleted(true);
    setFinalLessonXp(finalXP);
    setFinalLessonCoins(coinsEarned);
    setShowCompletionSummary(true);
    console.log("✅ STATES SHOULD BE SET NOW!");

    // Then do Firestore updates (they can happen in background)
    const uid = auth.currentUser.uid;
    try {
      console.log("📝 Starting Firestore updates...");

      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        xp: increment(finalXP),
        total_xp: increment(finalXP),
        weeklyXP: increment(finalXP),
        monthlyXP: increment(finalXP),
        coins: increment(coinsEarned),
        total_lessons: increment(1),
        completed_lessons: arrayUnion(lesson.lesson_id),
      });

      await updateStreak(uid);

      const moduleProgressRef = doc(db, `users/${uid}/progress`, moduleId);
      const moduleProgressSnap = await getDoc(moduleProgressRef);
      let completedLessonsInModule = moduleProgressSnap.exists()
        ? moduleProgressSnap.data().completedLessons || 0
        : 0;

      const nextCompletedLessons = completedLessonsInModule + 1;

      await setDoc(
        moduleProgressRef,
        {
          completedLessons: nextCompletedLessons,
          lastLesson: lesson.lesson_id,
          moduleTitle: currentModule.title,
        },
        { merge: true }
      );

      console.log("✅ All Firestore updates completed");
    } catch (error) {
      console.error("❌ Firestore error:", error);
    }
  };

  const handleNext = () => {
    setShowModal(false);
    setLastAnswerCorrect(null);

    console.log(
      "🔄 HandleNext - currentIndex:",
      currentIndex,
      "/",
      exercises.length
    );

    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      console.log("🏁 Last question - checking completion...");
      const allQuestionsAnswered =
        Object.keys(answeredMap).length === exercises.length;

      if (allQuestionsAnswered && !lessonCompleted) {
        console.log("🚀 Calling completeLesson from handleNext");
        completeLesson();
      } else {
        console.log("❌ Cannot complete:", {
          allQuestionsAnswered,
          lessonCompleted,
          answeredCount: Object.keys(answeredMap).length,
          exercisesLength: exercises.length,
        });
      }
    }
  };

  // Debug state changes
  useEffect(() => {
    console.log(
      "📊 STATE UPDATE - lessonCompleted:",
      lessonCompleted,
      "showCompletionSummary:",
      showCompletionSummary
    );
  }, [lessonCompleted, showCompletionSummary]);

  // Debug useEffect - add this to track state changes
  useEffect(() => {
    console.log("🔍 LESSON DEBUG:", {
      showCompletionSummary,
      lessonCompleted,
      currentIndex,
      exercisesLength: exercises.length,
      answeredCount: Object.keys(answeredMap).length,
      allQuestionsAnswered:
        Object.keys(answeredMap).length === exercises.length,
      isLastQuestion: currentIndex >= exercises.length - 1,
    });
  }, [
    showCompletionSummary,
    lessonCompleted,
    currentIndex,
    exercises.length,
    answeredMap,
  ]);

  // Debug when completeLesson is called
  useEffect(() => {
    if (lessonCompleted) {
      console.log(
        "🎉 LESSON COMPLETED - Show completion should be:",
        showCompletionSummary
      );
    }
  }, [lessonCompleted, showCompletionSummary]);

  // Debug useEffect
  useEffect(() => {
    console.log("=== LESSON DEBUG ===");
    console.log("Exercises length:", exercises.length);
    console.log("Current index:", currentIndex);
    console.log("Answered questions:", Object.keys(answeredMap).length);
    console.log("Lesson completed:", lessonCompleted);
    console.log("Show completion summary:", showCompletionSummary);
    console.log("====================");
  }, [
    currentIndex,
    answeredMap,
    lessonCompleted,
    showCompletionSummary,
    exercises.length,
  ]);

  const renderCard = () => {
    if (!currentExercise) return <p>Loading exercise...</p>;
    const isAnswered = answeredMap[currentIndex];
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
        return <p>Unsupported card type</p>;
    }
  };

  if (lives <= 0) {
    return (
      <div className="p-6 h-screen flex flex-col items-center justify-center text-center">
        <img src={mascot} style={{ width: "10rem" }} alt="" />
        <h2 className="text-2xl font-bold mb-4">Game Over</h2>
        <p>You've lost all your lives! Come back tomorrow.</p>
        <Link to="/lessons/section/learn">
          <button className="bg-amber text-white font-semibold flex gap-4 items-center px-6 py-2 text-lg rounded-full my-3">
            <FaArrowCircleLeft style={{ fontSize: "1rem" }} /> Go Back
          </button>
        </Link>
        <Link to="/dashboard">
          <button className="bg-amber text-white font-semibold flex gap-4 items-center px-6 py-2 text-lg rounded-full my-3">
            <FaArrowCircleLeft style={{ fontSize: "1rem" }} /> Go to dashboard
          </button>
        </Link>
      </div>
    );
  }

  // Normal Lesson Completion Summary
  if (showCompletionSummary && lessonCompleted) {
    console.log("🎉 Rendering completion summary...");
    const correctAnswers = Object.values(answeredMap).filter(
      (a) => a.isCorrect
    ).length;
    const totalQuestions = exercises.length;
    const accuracy =
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;

    return (
      <div className="p-6 h-screen flex flex-col items-center justify-center text-center bg-gray-100">
        <img src={mascot} style={{ width: "10rem" }} alt="" className="mb-6" />
        <h2 className="text-3xl font-bold mb-4 text-green-600">
          Lesson Complete!
        </h2>
        <p className="text-xl text-gray-800 mb-4">
          Accuracy: {correctAnswers}/{totalQuestions} ({accuracy}%)
        </p>
        <div className="flex justify-between item-center gap-6 mb-6">
          <div className="px-6 rounded-xl border border-amber flex flex-col justify-center items-center">
            <div className="text-xl text-amber">
              <FaExpand />
            </div>
            <p className="text-2xl font-bold text-black py-2">
              +{finalLessonXp} XP
            </p>
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
                +{finalLessonCoins} <FaCoins className="ml-2 text-amber" />
              </p>
              <p className="text-amber">gained</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate("/lessons")}
          className="bg-amber-500 text-white font-semibold flex items-center px-8 py-3 text-lg rounded-full shadow-lg transition duration-300 transform hover:scale-105"
        >
          Go to Lesson Map <FaArrowAltCircleRight className="ml-2" />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 relative">
      {/* Test button - ALWAYS show this for now */}
      <button
        onClick={() => {
          console.log("🧪 FORCING completion screen");
          setShowCompletionSummary(true);
          setLessonCompleted(true);
          setFinalLessonXp(25);
          setFinalLessonCoins(10);
        }}
        className="fixed bottom-4 right-4 bg-green-500 text-white p-2 rounded z-50"
      >
        Test Completion
      </button>
      {/* Debug button */}
      <button
        onClick={() => {
          console.log("🔧 Manual completion trigger");
          completeLesson();
        }}
        className="fixed bottom-4 left-4 bg-red-500 text-white p-2 rounded z-50"
      >
        Debug: Complete Lesson
      </button>

      <GoBackBtn />
      <div className="flex justify-between items-center pt-10 mb-4">
        <p className="font-semibold">❤ Lives: {lives}</p>
        <p className="font-semibold">XP: {xp}</p>
      </div>
      <div className="w-full bg-gray-300 h-2 rounded mb-4">
        <div
          className="bg-amber h-2 rounded transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      {renderCard()}

      {/* REMOVED THE BUTTONS SECTION - No more Skip/Previous buttons */}

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
            <button
              onClick={handleNext}
              className={`px-8 py-3 mt-4 rounded-full text-white font-bold text-lg shadow-lg transition duration-300 transform hover:scale-105 ${
                lastAnswerCorrect
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {currentIndex >= exercises.length - 1
                ? "Finish Lesson"
                : "Continue"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonDisplay;
