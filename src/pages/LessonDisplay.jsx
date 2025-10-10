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
  FaFire,
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

  // NEW: Lesson XP starts at 20 and decreases with wrong answers
  const [currentLessonXP, setCurrentLessonXP] = useState(20);
  const [lives, setLives] = useState(5);
  const [userXP, setUserXP] = useState(0);
  const [coins, setCoins] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(null);
  const [answeredMap, setAnsweredMap] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
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
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [showCompletionSummary, setShowCompletionSummary] = useState(false);
  const [finalLessonXp, setFinalLessonXp] = useState(0);
  const [finalLessonCoins, setFinalLessonCoins] = useState(0);

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
        setUserXP(snap.data().xp ?? 0);
        setCoins(snap.data().coins ?? 0);
        setCurrentStreak(snap.data().current_streak ?? 0);
        setUser(snap.data());
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
          setCurrentIndex(0);
          setAnsweredMap({});
          setLessonCompleted(false);
          setShowCompletionSummary(false);
          // Reset lesson XP to 20 when starting new lesson
          setCurrentLessonXP(20);
        } else {
          console.error("Lesson not found:", lessonId);
          if (lessonId !== undefined) {
            navigate("/404");
          }
        }
      }
    }
  }, [moduleId, currentLessonIndex, navigate]);

  const handleAnswer = async (isCorrect) => {
    if (answeredMap[currentIndex]) return;

    // Update lesson XP for wrong answers
    if (!isCorrect) {
      setCurrentLessonXP((prev) => Math.max(0, prev - 2));
    }

    setAnsweredMap((prev) => ({ ...prev, [currentIndex]: { isCorrect } }));
    setShowModal(true);
    setLastAnswerCorrect(isCorrect);

    setTimeout(async () => {
      const userRef = doc(db, "users", auth.currentUser.uid);
      try {
        await updateDoc(userRef, {
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
    const totalQuestions = exercises.length;
    const wrongAnswers = totalQuestions - correctAnswers;
    const accuracy =
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;

    // Calculate base XP (20 minus 2 for each wrong answer)
    let baseXP = 20 - wrongAnswers * 2;
    baseXP = Math.max(0, baseXP); // Ensure XP doesn't go below 0

    // Calculate streak bonus for XP
    let streakBonusXP = 0;
    if (currentStreak >= 7) {
      streakBonusXP = 7;
    } else if (currentStreak >= 3) {
      streakBonusXP = 5;
    } else if (currentStreak >= 1) {
      streakBonusXP = 2;
    }

    // Calculate final XP (can exceed 20)
    const finalXP = baseXP + streakBonusXP;

    // NEW: Calculate coins according to the formula
    const baseCoin = 10;
    const accuracyBonusCoin = Math.floor(accuracy / 10);
    let coinReward = baseCoin + accuracyBonusCoin;

    // Calculate streak bonus for coins (same as XP streak bonus)
    let streakBonusCoin = 0;
    if (currentStreak >= 7) {
      streakBonusCoin = 7;
    } else if (currentStreak >= 3) {
      streakBonusCoin = 5;
    } else if (currentStreak >= 1) {
      streakBonusCoin = 2;
    }

    // Total coin reward
    const totalCoinReward = coinReward + streakBonusCoin;

    console.log("💰 XP Calculation:", {
      baseXP,
      wrongAnswers,
      streakBonusXP,
      finalXP,
    });

    console.log("💰 COINS Calculation:", {
      baseCoin,
      accuracyBonusCoin,
      coinReward,
      streakBonusCoin,
      totalCoinReward,
      accuracy,
    });

    // ✅ SET STATES FIRST
    setLessonCompleted(true);
    setFinalLessonXp(finalXP);
    setFinalLessonCoins(totalCoinReward);
    setShowCompletionSummary(true);

    // Then do Firestore updates
    const uid = auth.currentUser.uid;
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : {};

      // Get current accuracy stats
      const currentProgress = userData.progress || {};
      const currentTotalQuestions = currentProgress.total_questions || 0;
      const currentCorrectAnswers = currentProgress.correct_answers || 0;

      // Calculate new cumulative accuracy
      const newTotalQuestions = currentTotalQuestions + totalQuestions;
      const newCorrectAnswers = currentCorrectAnswers + correctAnswers;
      const newAccuracy =
        newTotalQuestions > 0
          ? Math.round((newCorrectAnswers / newTotalQuestions) * 100)
          : 0;

      // Update user with new XP and coins system
      await updateDoc(userRef, {
        xp: increment(finalXP),
        total_xp: increment(finalXP),
        weeklyXP: increment(finalXP),
        monthlyXP: increment(finalXP),
        coins: increment(totalCoinReward),
        total_lessons: increment(1),
        completed_lessons: arrayUnion(lesson.lesson_id),
        progress: {
          ...currentProgress,
          accuracy: newAccuracy,
          total_questions: newTotalQuestions,
          correct_answers: newCorrectAnswers,
          last_updated: new Date(),
        },
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
    console.log("Current Lesson XP:", currentLessonXP);
    console.log("====================");
  }, [
    currentIndex,
    answeredMap,
    lessonCompleted,
    showCompletionSummary,
    exercises.length,
    currentLessonXP,
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
      {/* Accuracy debug button */}
      <button
        onClick={async () => {
          const userRef = doc(db, "users", auth.currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            console.log("🔍 CURRENT FIREBASE ACCURACY:", data.progress);
            alert(`Current Accuracy: ${data.progress?.accuracy || 0}%`);
          }
        }}
        className="fixed top-4 right-4 bg-blue-500 text-white p-2 rounded z-50"
      >
        Check Accuracy
      </button>

      <GoBackBtn />
      <div className="flex justify-between items-center pt-10 mb-4">
        <p className="font-semibold">❤ Lives: {lives}</p>
        <div className="flex items-center gap-4">
          <p className="font-semibold flex items-center gap-1">
            <FaFire className="text-red-500" /> {currentStreak}
          </p>
          <p className="font-semibold">XP: {currentLessonXP}</p>
        </div>
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
            {!lastAnswerCorrect && (
              <p className="text-lg mb-2 text-red-600">-2 XP</p>
            )}
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
