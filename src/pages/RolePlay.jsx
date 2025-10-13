import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaHeart, FaArrowLeft, FaShoppingCart, FaUser } from "react-icons/fa";
import { auth, db } from "../firebase/config/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import roleplayData from "../data/rolePlaying.json";

const RoleplayExercise = () => {
  const { scenarioId } = useParams();
  const navigate = useNavigate();

  const [currentScenario, setCurrentScenario] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [userLives, setUserLives] = useState(0);
  const [userData, setUserData] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isCulturalNote, setIsCulturalNote] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);

  // Get real user data from Firebase
  useEffect(() => {
    if (!auth.currentUser) return;

    const userRef = doc(db, "users", auth.currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);
        setUserLives(data.lives || 0);
      }
    });

    return () => unsubscribe();
  }, []);

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
  }, [scenarioId]);

  const handleOptionSelect = (option) => {
    if (!currentScenario || userLives <= 0) return;

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
      // Correct answer - move to next step
      if (option.response) {
        // Show character response first
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

          // Add next character dialogue to history
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
        }
      }, 1500);
    } else {
      // Wrong answer - lose a life and show feedback
      setUserLives((prev) => Math.max(0, prev - 1));
      setFeedbackMessage(
        option.response || "That was not quite right. Try again!"
      );
      setIsCulturalNote(false);
      setShowFeedback(true);

      // Add character's corrective response to history
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

    // Show cultural note if available (only for correct answers with cultural notes)
    if (option.is_correct && option.cultural_note) {
      setFeedbackMessage(option.cultural_note);
      setIsCulturalNote(true);
      setShowFeedback(true);
    }
  };

  const handleContinue = () => {
    setShowFeedback(false);
    // If no lives left, end the game
    if (userLives <= 0) {
      navigate("/challenges");
    }
  };

  const currentStepData = currentScenario?.conversation_flow[currentStep];

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
              onClick={() => navigate("/challenges")}
              className="flex items-center text-yellow-600 hover:text-yellow-700 font-semibold"
            >
              <FaArrowLeft className="mr-2" />
              Back to Challenges
            </button>

            {/* Lives Display */}
            <div className="flex items-center space-x-2">
              <FaHeart
                className={`text-xl ${
                  userLives > 0 ? "text-red-500" : "text-gray-400"
                }`}
              />
              <span
                className={`font-semibold ${
                  userLives > 0 ? "text-gray-700" : "text-gray-400"
                }`}
              >
                {userLives} {userLives === 1 ? "Life" : "Lives"}
              </span>
            </div>

            {/* Scenario Info */}
            <div className="flex items-center space-x-4">
              <FaShoppingCart className="text-blue-500" />
              <span className="font-semibold text-gray-700">
                {currentScenario.title}
              </span>
            </div>
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

        {/* Main Content Area - Flex container for conversation and options */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Conversation Area - Scrollable */}
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

          {/* Options Area - Fixed at bottom */}
          <div className="bg-white rounded-lg shadow-sm p-6 flex-shrink-0">
            {userLives <= 0 ? (
              <div className="text-center py-4">
                <p className="text-red-600 font-semibold">
                  You're out of lives! Come back later.
                </p>
                <button
                  onClick={() => navigate("/challenges")}
                  className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
                >
                  Back to Challenges
                </button>
              </div>
            ) : currentStepData && currentStepData.user_options.length > 0 ? (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700 mb-3">
                  Your Response:
                </h3>
                {currentStepData.user_options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(option)}
                    className="w-full text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-4 transition-colors duration-200 hover:border-yellow-300"
                    disabled={userLives <= 0}
                  >
                    <span className="text-yellow-600 font-medium">
                      {option.text}
                    </span>
                  </button>
                ))}
              </div>
            ) : currentStepData?.is_final ? (
              <div className="text-center py-4">
                <div className="bg-green-100 border border-green-200 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-green-800 mb-2">
                    Scenario Complete! 🎉
                  </h3>
                  <p className="text-green-700 mb-4">
                    {currentStepData.completion_message}
                  </p>
                  <button
                    onClick={() => navigate("/challenges")}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
                  >
                    Back to Challenges
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Feedback Modal */}
        {showFeedback && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3
                className={`text-lg font-semibold mb-3 ${
                  isCulturalNote ? "text-blue-600" : "text-red-600"
                }`}
              >
                {isCulturalNote ? "💡 Cultural Note" : "❌ Incorrect"}
              </h3>
              <p className="text-gray-700 mb-4">{feedbackMessage}</p>
              <button
                onClick={handleContinue}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
              >
                {userLives > 0 ? "Continue" : "Return to Challenges"}
              </button>
            </div>
          </div>
        )}

        {/* Game Over Modal */}
        {userLives <= 0 && !currentStepData?.is_final && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
              <h3 className="text-2xl font-bold text-red-600 mb-3">
                Game Over! 💀
              </h3>
              <p className="text-gray-700 mb-4">
                You've run out of lives. Better luck next time!
              </p>
              <button
                onClick={() => navigate("/lessons/section")}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
              >
                Back to Challenges
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleplayExercise;
