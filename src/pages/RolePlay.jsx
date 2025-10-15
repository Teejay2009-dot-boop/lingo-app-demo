import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaShoppingCart,
  FaUser,
  FaCoins,
  FaFire,
  FaExpand,
} from "react-icons/fa";
import roleplayData from "../data/rolePlaying.json";
import { auth, db } from "../firebase/config/firebase";
import { updateStreak } from "../utils/streak";
import {
  doc,
  updateDoc,
  increment,
  getDoc,
  arrayUnion,
} from "firebase/firestore";
// ADDED: Import the XP boost completion component
import LessonCompletionWithBoost from "../components/LessonCompletionWithBoost";

const RoleplayExercise = () => {
  const { scenarioId } = useParams();
  const navigate = useNavigate();

  const [currentScenario, setCurrentScenario] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [showCompletion, setShowCompletion] = useState(false);

  // XP and coins state
  const [currentLessonXP, setCurrentLessonXP] = useState(20);
  const [user, setUser] = useState(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [wrongAnswersCount, setWrongAnswersCount] = useState(0);
  const [finalLessonXp, setFinalLessonXp] = useState(0);
  const [finalLessonCoins, setFinalLessonCoins] = useState(0);

  // ADDED: XP Boost completion state
  const [showXpBoostCompletion, setShowXpBoostCompletion] = useState(false);
  const [boostMultiplier, setBoostMultiplier] = useState(1);

  useEffect(() => {
    // Find the scenario by ID
    const scenario = roleplayData.scenarios.find((s) => s.id === scenarioId);
    if (scenario) {
      setCurrentScenario(scenario);
      // Initialize conversation history with first message
      if (scenario.conversation_flow.length > 0) {
        const firstStep = scenario.conversation_flow[0];
        setConversationHistory([
          {
            speaker: firstStep.character_name,
            text: firstStep.character_dialogue,
            isUser: false,
            timestamp: new Date(),
          },
        ]);
      }
    }

    // Fetch user data
    if (auth.currentUser) {
      const uid = auth.currentUser.uid;
      const userRef = doc(db, "users", uid);
      getDoc(userRef).then((snap) => {
        if (snap.exists()) {
          const userData = snap.data();
          setUser(userData);
          setCurrentStreak(userData.current_streak || 0);

          // Check for active XP boost
          const hasXpBoost =
            userData?.active_xp_boost &&
            new Date(userData.active_xp_boost.expires_at.toDate()) > new Date();
          if (hasXpBoost) {
            setBoostMultiplier(userData.active_xp_boost.multiplier);
          }
        }
      });
    }
  }, [scenarioId]);

  // UPDATED: Complete lesson function with XP boost support
  const completeLesson = async () => {
    if (!auth.currentUser || !currentScenario) return;

    // Calculate base XP (20 minus 2 for each wrong answer)
    let baseXP = 20 - wrongAnswersCount * 2;
    baseXP = Math.max(0, baseXP);

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

    // Check for active XP boost
    const hasXpBoost =
      user?.active_xp_boost &&
      new Date(user.active_xp_boost.expires_at.toDate()) > new Date();
    const currentBoostMultiplier = hasXpBoost
      ? user.active_xp_boost.multiplier
      : 1;
    const bonusXP = hasXpBoost
      ? Math.floor(finalXP * (currentBoostMultiplier - 1))
      : 0;
    const totalXPWithBoost = finalXP + bonusXP;

    // Calculate coins according to the formula
    const totalQuestions = currentScenario.conversation_flow.filter(
      (step) => step.user_options && step.user_options.length > 0
    ).length;
    const correctAnswers = totalQuestions - wrongAnswersCount;
    const accuracy =
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;

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

    // Set final values
    setFinalLessonXp(hasXpBoost ? totalXPWithBoost : finalXP);
    setFinalLessonCoins(totalCoinReward);

    // Show appropriate completion screen
    if (hasXpBoost) {
      setShowXpBoostCompletion(true);
    } else {
      setShowCompletion(true);
    }

    // Update Firestore
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
        xp: increment(hasXpBoost ? totalXPWithBoost : finalXP),
        total_xp: increment(hasXpBoost ? totalXPWithBoost : finalXP),
        weeklyXP: increment(hasXpBoost ? totalXPWithBoost : finalXP),
        monthlyXP: increment(hasXpBoost ? totalXPWithBoost : finalXP),
        coins: increment(totalCoinReward),
        total_lessons: increment(1),
        completed_lessons: arrayUnion(`roleplay-${currentScenario.id}`),
        progress: {
          ...currentProgress,
          accuracy: newAccuracy,
          total_questions: newTotalQuestions,
          correct_answers: newCorrectAnswers,
          last_updated: new Date(),
        },
      });

      await updateStreak(uid);

      console.log("✅ Roleplay completed with:", {
        baseXP,
        wrongAnswersCount,
        streakBonusXP,
        finalXP,
        hasXpBoost,
        currentBoostMultiplier,
        totalXPWithBoost,
        totalCoinReward,
      });
    } catch (error) {
      console.error("❌ Firestore error:", error);
    }
  };

  const handleOptionSelect = (option) => {
    if (!currentScenario) return;

    const currentStepData = currentScenario.conversation_flow[currentStep];

    // Add user's choice to conversation history
    setConversationHistory((prev) => [
      ...prev,
      {
        speaker: "You",
        text: option.text,
        isUser: true,
        timestamp: new Date(),
      },
    ]);

    if (option.is_correct) {
      // Correct answer
      if (option.response) {
        // Show character response
        setConversationHistory((prev) => [
          ...prev,
          {
            speaker: currentStepData.character_name,
            text: option.response,
            isUser: false,
            timestamp: new Date(),
          },
        ]);
      }

      setTimeout(() => {
        if (option.next_step !== undefined) {
          const nextStepData =
            currentScenario.conversation_flow[option.next_step];
          setCurrentStep(option.next_step);

          // Add next character dialogue to history if not final step
          if (nextStepData.character_dialogue && !nextStepData.is_final) {
            setConversationHistory((prev) => [
              ...prev,
              {
                speaker: nextStepData.character_name,
                text: nextStepData.character_dialogue,
                isUser: false,
                timestamp: new Date(),
              },
            ]);
          }

          // Check if this is the final step
          if (nextStepData.is_final) {
            completeLesson();
          }
        }
      }, 1000);
    } else {
      // Wrong answer - show corrective response and update XP
      setWrongAnswersCount((prev) => prev + 1);
      setCurrentLessonXP((prev) => Math.max(0, prev - 2));

      if (option.response) {
        setConversationHistory((prev) => [
          ...prev,
          {
            speaker: currentStepData.character_name,
            text: option.response,
            isUser: false,
            timestamp: new Date(),
          },
        ]);
      }
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setShowCompletion(false);
    setShowXpBoostCompletion(false);
    setWrongAnswersCount(0);
    setCurrentLessonXP(20);
    setFinalLessonXp(0);
    setFinalLessonCoins(0);
    if (currentScenario && currentScenario.conversation_flow.length > 0) {
      const firstStep = currentScenario.conversation_flow[0];
      setConversationHistory([
        {
          speaker: firstStep.character_name,
          text: firstStep.character_dialogue,
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    }
  };

  const currentStepData = currentScenario?.conversation_flow[currentStep];

  // ADDED: XP Boost Completion Screen
  if (showXpBoostCompletion) {
    // Calculate base XP for display (without boost)
    const baseXP = Math.max(0, 20 - wrongAnswersCount * 2);
    const streakBonusXP =
      currentStreak >= 7
        ? 7
        : currentStreak >= 3
        ? 5
        : currentStreak >= 1
        ? 2
        : 0;
    const finalBaseXP = baseXP + streakBonusXP;

    return (
      <LessonCompletionWithBoost
        basicXP={finalBaseXP}
        boostMultiplier={boostMultiplier}
        onContinue={() => navigate("/lessons")}
        lessonTitle="Roleplay Complete! 🎭"
      />
    );
  }

  if (!currentScenario) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading scenario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Go Back Button */}
            <button
              onClick={() => navigate("/lessons/section")}
              className="flex items-center text-yellow-600 hover:text-yellow-700 font-semibold"
            >
              <FaArrowLeft className="mr-2" />
              Back to Challenges
            </button>

            {/* Scenario Info and XP Display */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <FaShoppingCart className="text-blue-500" />
                <span className="font-semibold text-gray-700">
                  {currentScenario.title}
                </span>
              </div>

              {/* XP and Streak Display */}
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <FaExpand className="text-green-500" />
                  <span className="font-semibold">{currentLessonXP} XP</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FaFire className="text-red-500" />
                  <span className="font-semibold">{currentStreak}</span>
                </div>
                {boostMultiplier > 1 && (
                  <div className="flex items-center space-x-1 bg-yellow-100 px-2 py-1 rounded-full">
                    <span className="text-yellow-700 font-bold text-xs">
                      {boostMultiplier}x XP Boost
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Restart Button */}
            <button
              onClick={handleRestart}
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              Restart
            </button>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full py-6 px-4 sm:px-6 lg:px-8">
        {/* Scenario Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 flex-shrink-0">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {currentScenario.title}
          </h1>
          <p className="text-gray-600 mb-4">{currentScenario.description}</p>
          <div className="flex flex-wrap gap-2">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {currentScenario.difficulty}
            </span>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              {currentScenario.estimated_time}
            </span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Conversation Area */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-4 flex-1 overflow-y-auto">
            <div className="space-y-4">
              {conversationHistory.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md rounded-lg p-4 ${
                      message.isUser
                        ? "bg-yellow-500 text-white"
                        : "bg-blue-500 text-white"
                    }`}
                  >
                    <div className="flex items-center mb-1">
                      <FaUser
                        className={`mr-2 ${
                          message.isUser ? "text-yellow-200" : "text-blue-200"
                        }`}
                      />
                      <span className="font-semibold text-sm">
                        {message.speaker}
                      </span>
                    </div>
                    <p className="text-sm">{message.text}</p>
                    <span className="text-xs opacity-70 block mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Options Area */}
          <div className="bg-white rounded-lg shadow-sm p-6 flex-shrink-0">
            {showCompletion ? (
              <ScenarioCompletion
                completionMessage={currentStepData?.completion_message}
                onRestart={handleRestart}
                onReturn={() => navigate("/lessons/section")}
                finalLessonXp={finalLessonXp}
                finalLessonCoins={finalLessonCoins}
                wrongAnswersCount={wrongAnswersCount}
                totalQuestions={
                  currentScenario.conversation_flow.filter(
                    (step) => step.user_options && step.user_options.length > 0
                  ).length
                }
              />
            ) : currentStepData && currentStepData.user_options.length > 0 ? (
              <ResponseOptions
                options={currentStepData.user_options}
                onOptionSelect={handleOptionSelect}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

// Component for response options
const ResponseOptions = ({ options, onOptionSelect }) => (
  <div className="space-y-3">
    <h3 className="font-semibold text-gray-700 mb-3">Your Response:</h3>
    {options.map((option, index) => (
      <button
        key={index}
        onClick={() => onOptionSelect(option)}
        className="w-full text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-4 transition-colors duration-200 hover:border-yellow-300"
      >
        <span className="text-yellow-600 font-medium">{option.text}</span>
      </button>
    ))}
  </div>
);

// Component for scenario completion
const ScenarioCompletion = ({
  completionMessage,
  onRestart,
  onReturn,
  finalLessonXp,
  finalLessonCoins,
  wrongAnswersCount,
  totalQuestions,
}) => {
  const correctAnswers = totalQuestions - wrongAnswersCount;
  const accuracy =
    totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0;

  return (
    <div className="text-center py-4">
      <div className="bg-green-100 border border-green-200 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-green-800 mb-2">
          Scenario Complete! 🎉
        </h3>
        <p className="text-green-700 mb-4">{completionMessage}</p>

        {/* XP and Coins Summary */}
        <div className="flex justify-center gap-6 mb-6">
          <div className="px-4 rounded-xl border border-green-300 flex flex-col justify-center items-center">
            <div className="text-xl text-green-600">
              <FaExpand />
            </div>
            <p className="text-2xl font-bold text-black py-2">
              +{finalLessonXp} XP
            </p>
            <p className="text-green-600 text-sm">gained</p>
          </div>
          <div className="px-4 rounded-xl border border-green-300 flex flex-col justify-center items-center">
            <div className="text-xl text-yellow-600">
              <FaCoins />
            </div>
            <p className="text-2xl font-bold text-black py-2">
              +{finalLessonCoins}
            </p>
            <p className="text-green-600 text-sm">coins</p>
          </div>
        </div>

        <div className="text-sm text-green-700 mb-4">
          Accuracy: {correctAnswers}/{totalQuestions} ({accuracy}%)
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={onRestart}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
          >
            Practice Again
          </button>
          <button
            onClick={onReturn}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
          >
            Back to Challenges
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleplayExercise;
