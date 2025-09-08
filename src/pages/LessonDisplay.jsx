import React, { useEffect, useState } from "react";
import { VocabularyCard } from "../components/LessonCards/VocabularyCard";
import AudioChoiceCard from "../components/LessonCards/AudioChoiceCard";
import GoBackBtn from "../components/GoBackBtn";
import { getAllLessons, getModules } from "../data/lessons"; // Updated import
import { useNavigate, useParams, Link } from "react-router-dom"; // Added Link to imports
import RolePlayTypeYourself from "../components/LessonCards/RolePlayTypeYourself";
import MatchImageToWord from "../components/LessonCards/MatchImageToWord";
import mascot from "../assets/IMG-20250724-WA0115-removebg-preview.png";
import {
  FaArrowAltCircleRight,
  FaArrowCircleLeft,
  FaCoins,
  FaHeart,
  FaFire,
} from "react-icons/fa";
import { MainIdea } from "../components/LessonCards/MainIdea";
import { FillintheGapBestOption } from "../components/LessonCards/FillintheGapBestOption";
import { FillTheGap } from "../components/LessonCards/FillintheGap";
import MatchWords from "../components/LessonCards/MatchWords";
import TypeWhatYouHear from "../components/LessonCards/TypeWhatYouHear";
import RolePlayOptions from "../components/LessonCards/RolePlayOptions";
import { auth, db } from "../firebase/config/firebase";
import {
  doc,
  updateDoc,
  increment,
  getDoc,
  onSnapshot,
  arrayUnion,
  setDoc,
} from "firebase/firestore";
import { ModuleCompletionModal } from "../components/ModuleCompletionModal"; // Import the new modal

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
  const [startTime, setStartTime] = useState(null);
  const [earnedXPPerQuestion, setEarnedXPPerQuestion] = useState([]);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [showModuleCompletionModal, setShowModuleCompletionModal] =
    useState(false); // New state
  const [xpBreakdown, setXpBreakdown] = useState({
    base: 0,
    accuracy: 0,
    streak: 0,
    speed: 0,
    total: 0,
  });

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
      navigate("/login"); // Redirect if not logged in or no module selected
      return;
    }

    const uid = auth.currentUser.uid;
    const userRef = doc(db, "users", uid);
    const moduleProgressRef = doc(db, `users/${uid}/progress`, moduleId);

    const unsubUser = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        setLives(snap.data().lives ?? 5);
        setXp(snap.data().xp ?? 0);
        setCoins(snap.data().coins ?? 0);
        setCurrentStreak(snap.data().current_streak ?? 0);
      }
    });

    // Fetch module-specific progress and set initial exercise index
    const unsubModuleProgress = onSnapshot(moduleProgressRef, (snap) => {
      if (snap.exists()) {
        const progressData = snap.data();
        const allAvailableLessons =
          getModules().find((m) => m.module_id === moduleId)?.lessons || [];
        const lastCompletedLessonId = progressData.lastLesson;

        // When module progress loads, we need to decide which lesson to show initially.
        // If the URL specifies a lessonIndex, use that. Otherwise, infer from lastCompletedLessonId.
        let initialLessonIndex = currentLessonIndex;
        if (currentLessonIndex === 0 && lastCompletedLessonId) {
          const inferredIndex =
            allAvailableLessons.indexOf(lastCompletedLessonId) + 1;
          initialLessonIndex = Math.min(
            inferredIndex,
            allAvailableLessons.length - 1
          );
        }

        // This block is for handling initial load or when Firestore progress updates.
        // The actual lesson data and exercises are loaded in the next useEffect.
        // We should not be resetting currentIndex here based on currentLessonIndex change.
        // The responsibility of resetting exercise index (currentIndex) and related states
        // for a *new lesson* in the module should be handled when the lesson data actually changes.

        // We will reset exercise-specific states only if no progress exists for this module or if explicitly starting fresh.
        if (currentLessonIndex === 0 && !snap.exists()) {
          setCurrentIndex(0);
          setAnsweredMap({});
          setEarnedXPPerQuestion([]);
          setLessonCompleted(false);
        }
      } else {
        // No progress yet, ensure all states are reset to start from the beginning of the module
        setCurrentIndex(0); // Start from the first exercise of the first lesson
        setAnsweredMap({});
        setEarnedXPPerQuestion([]);
        setLessonCompleted(false);
      }
    });

    return () => {
      unsubUser();
      unsubModuleProgress();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId, navigate, currentLessonIndex]); // Keep currentLessonIndex in dependencies

  // Load lesson data based on current module and index
  useEffect(() => {
    if (!moduleId) return;

    const modules = getModules();
    const module = modules.find((m) => m.module_id === moduleId);

    if (module) {
      setCurrentModule(module);
      // CORRECTED: Use currentLessonIndex (from URL) to get the lessonId from the module's lessons array
      const lessonId = module.lessons[currentLessonIndex];
      // Find the lesson by its lesson_id within getAllLessons values
      const fetchedLesson = Object.values(getAllLessons).find(
        (l) => l.lesson_id === lessonId
      );

      if (fetchedLesson) {
        setLesson(fetchedLesson);
        setExercises(fetchedLesson.exercises);
        setBaseXp(fetchedLesson.base_xp || 10);

        // Unconditionally reset exercise-related states when a new lesson (within a module) is loaded
        setCurrentIndex(0);
        setAnsweredMap({});
        setEarnedXPPerQuestion([]);
        setLessonCompleted(false);
      } else {
        console.error("Lesson not found:", lessonId);
        // Only navigate to 404 if lessonId is not undefined, otherwise it means currentLessonIndex is out of bounds for the module
        if (lessonId !== undefined) {
          navigate("/404"); // Or appropriate error page
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId, currentLessonIndex, navigate]); // currentLessonIndex is key to re-fetching lesson

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

    // Immediate UI update
    setAnsweredMap((prev) => ({ ...prev, [currentIndex]: { isCorrect } }));
    setEarnedXPPerQuestion((prev) => [...prev, questionXP]);
    setShowModal(true);
    setLastAnswerCorrect(isCorrect);

    // Deferred Firebase update
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
    if (!auth.currentUser || lessonCompleted || !lesson || !currentModule)
      return;

    const uid = auth.currentUser.uid;
    const userRef = doc(db, "users", uid);
    const moduleProgressRef = doc(db, `users/${uid}/progress`, moduleId);

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

    try {
      // Update user's general XP, coins, etc.
      await updateDoc(userRef, {
        xp: increment(finalXP),
        total_xp: increment(finalXP),
        weeklyXP: increment(finalXP),
        monthlyXP: increment(finalXP),
        coins: increment(coinsEarned),
        total_lessons: increment(1),
        last_active_date: new Date().toISOString(),
      });

      // Update streak - existing logic
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const lastActive = userSnap.data().last_active_date?.toDate();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let newStreak = userSnap.data().current_streak || 0;
        if (!lastActive || lastActive < today) {
          newStreak += 1;
          await updateDoc(userRef, {
            current_streak: newStreak,
            longest_streak: Math.max(
              userSnap.data().longest_streak || 0,
              newStreak
            ),
          });
        }
      }

      // Update module progress
      const moduleProgressSnap = await getDoc(moduleProgressRef);
      let completedLessonsInModule = 0;
      if (moduleProgressSnap.exists()) {
        completedLessonsInModule =
          moduleProgressSnap.data().completedLessons || 0;
      }

      const nextCompletedLessons = completedLessonsInModule + 1;

      await setDoc(
        moduleProgressRef,
        {
          completedLessons: nextCompletedLessons,
          lastLesson: lesson.lesson_id,
          moduleTitle: currentModule.title, // Store module title for display if needed
        },
        { merge: true }
      );

      setLessonCompleted(true);

      // Module progression logic
      const currentModuleLessons = currentModule.lessons;
      const nextLessonIndexInModule =
        currentModuleLessons.indexOf(lesson.lesson_id) + 1;

      if (nextCompletedLessons >= currentModuleLessons.length) {
        // All lessons in module completed
        setShowModuleCompletionModal(true);
      } else {
        // Move to the next lesson in the module
        navigate(`/lessons/module/${moduleId}/${nextLessonIndexInModule}`);
      }
    } catch (error) {
      console.error("Error completing lesson:", error);
    }
  };

  useEffect(() => {
    if (
      currentIndex >= exercises.length &&
      !lessonCompleted &&
      lesson &&
      currentModule
    ) {
      completeLesson();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, lessonCompleted, lesson, currentModule]); // Added lesson and currentModule as dependencies

  const handleNext = () => {
    setShowModal(false);
    // This will trigger the useEffect for lesson completion or next exercise
    setCurrentIndex((prev) => prev + 1);
    setLastAnswerCorrect(null);
  };

  const renderCard = () => {
    if (!currentExercise) return <p>Loading exercise...</p>;
    const isAnswered = answeredMap[currentIndex];
    const shouldDisable = showModal || !!isAnswered;

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
      </div>
    );
  }

  const isLessonComplete = currentIndex >= exercises.length;
  if (isLessonComplete) {
    const correctAnswers = Object.values(answeredMap).filter(
      (a) => a.isCorrect
    ).length;
    const perfectLesson = correctAnswers === exercises.length;
    const totalRawXP = earnedXPPerQuestion.reduce((sum, xp) => sum + xp, 0);
    const finalXP = Math.min(
      totalRawXP +
        (perfectLesson ? PERFECT_LESSON_BONUS : 0) +
        Math.floor(currentStreak / 7),
      MAX_XP_PER_LESSON
    );
    const coinsEarned = Math.floor(finalXP / 3) + (perfectLesson ? 2 : 0);

    return (
      <div className="min-h-screen flex flex-col items-center justify-around px-3 text-center py-6">
        <img src={mascot} alt="Completed" className="w-28 mb-6" />
        <h2 className="text-3xl font-bold text-amber mb-3">
          Lesson Complete 🎉
        </h2>

        <div className="streak-badge bg-white p-3 rounded-full shadow-md mb-4">
          🔥 {currentStreak}-day streak! | Earned: {finalXP}/30 XP
          {perfectLesson && (
            <span className="block text-green-500">+ Perfect Lesson!</span>
          )}
        </div>

        <div className="xp-details w-full max-w-md p-4 bg-white rounded-lg mb-6">
          <h3 className="font-bold mb-2">XP Breakdown</h3>
          <div className="flex justify-between">
            <span>Questions:</span>
            <span>{totalRawXP} XP</span>
          </div>
          {perfectLesson && (
            <div className="flex justify-between text-green-500">
              <span>Perfect Lesson:</span>
              <span>+{PERFECT_LESSON_BONUS} XP</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Streak Bonus:</span>
            <span>+{Math.floor(currentStreak / 7)} XP</span>
          </div>
          <div className="flex justify-between font-bold border-t pt-2">
            <span>Total Earned:</span>
            <span>{finalXP} XP</span>
          </div>
        </div>

        <div className="flex justify-center gap-5 rounded-full">
          <div className="border border-amber rounded-lg h-28 w-28 lg:h-32 lg:w-32 flex flex-col items-center justify-center">
            <p className="text-xl pb-5">XP</p>
            <p className="flex items-center text-amber justify-center text-2xl">
              {finalXP} <FaFire />
            </p>
          </div>
          <div className="p-8 items-center border border-amber h-28 w-28 lg:h-32 lg:w-32 rounded-lg justify-center flex flex-col gap-5">
            <p className="text-xl">Coins</p>
            <p className="flex items-center gap-1 text-amber justify-center text-2xl">
              {coins + coinsEarned} <FaCoins />
            </p>
          </div>
          <div className="py-7 px-4 border border-amber h-28 w-28 lg:h-32 lg:w-32 justify-center rounded-md flex flex-col gap-5">
            <p className="text-xl">Lives</p>
            <p className="flex items-center text-amber gap-1 justify-center text-2xl">
              {lives} <FaHeart />
            </p>
          </div>
        </div>

        <div className="flex justify-between gap-4 mt-6">
          <Link to="/dashboard">
            <button className="bg-amber text-white px-6 py-2 rounded-full hover:bg-amber-600 transition-all">
              Go to Dashboard
            </button>
          </Link>
          <Link to="/lessons/shop">
            <button className="bg-amber text-white px-6 py-2 rounded-full hover:bg-amber-600 transition-all">
              Go to Shop
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 relative">
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
      <div className="flex justify-between mt-6 max-w-[700px] mx-auto">
        <button
          onClick={() =>
            navigate(
              `/lessons/module/${moduleId}/${Math.max(
                0,
                currentLessonIndex - 1
              )}`
            )
          }
          disabled={currentLessonIndex === 0}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded disabled:opacity-50"
        >
          <FaArrowCircleLeft /> Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentIndex >= exercises.length}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          <FaArrowAltCircleRight /> Skip
        </button>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div
            className={`p-6 rounded-lg shadow-md text-center w-11/12 max-w-md border ${
              lastAnswerCorrect
                ? "bg-green-300 border-green-500"
                : "bg-red-300 border-red-500"
            }`}
          >
            <h2
              className={`text-2xl font-bold mb-4 ${
                lastAnswerCorrect ? "text-green-600" : "text-red-600"
              }`}
            >
              {lastAnswerCorrect ? "✔ Correct" : "❌ Incorrect!"}
            </h2>

            {lastAnswerCorrect && (
              <div className="xp-breakdown mb-4 text-left">
                <div className="flex justify-between">
                  <span>Base:</span>
                  <span>{xpBreakdown.base} XP</span>
                </div>
                <div className="flex justify-between">
                  <span>Accuracy:</span>
                  <span>
                    {xpBreakdown.accuracy > 0
                      ? `+${xpBreakdown.accuracy}`
                      : xpBreakdown.accuracy}{" "}
                    XP
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Streak Bonus:</span>
                  <span>
                    {xpBreakdown.streak > 0
                      ? `+${xpBreakdown.streak}`
                      : xpBreakdown.streak}{" "}
                    XP
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Speed Bonus:</span>
                  <span>
                    {xpBreakdown.speed > 0
                      ? `+${xpBreakdown.speed}`
                      : xpBreakdown.speed}{" "}
                    XP
                  </span>
                </div>
                <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                  <span>Total:</span>
                  <span>+{xpBreakdown.total} XP</span>
                </div>
              </div>
            )}

            <button
              onClick={handleNext}
              className={`px-6 py-2 mt-4 rounded text-white shadow-lg transition duration-300 ${
                lastAnswerCorrect
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
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
