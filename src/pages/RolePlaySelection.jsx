import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaLock,
  FaUnlock,
  FaStar,
  FaClock,
  FaCrown,
  FaShoppingCart,
  FaUtensils,
  FaMap,
  FaBalanceScale,
  FaBus,
  FaUserMd,
  FaBriefcase,
  FaUniversity,
  FaTools,
  FaChurch,
  FaRing,
  FaHome,
  FaUsers,
  FaHandshake,
  FaHeartbeat,
  FaCalendar,
  FaTimes,
} from "react-icons/fa";
import roleplayData from "../data/rolePlaying.json";
import { auth, db } from "../firebase/config/firebase";
import { doc, getDoc } from "firebase/firestore";

const RoleplaySelection = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [completedScenarios, setCompletedScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState(null);
  const [showModuleModal, setShowModuleModal] = useState(false);

  // Icons for different module types
  const moduleIcons = {
    utensils: FaUtensils,
    handshake: FaHandshake,
    "shopping-cart": FaShoppingCart,
    bus: FaBus,
    heartbeat: FaHeartbeat,
    calendar: FaCalendar,
    // Add more icons as needed
  };

  // Fallback icons for scenarios
  const scenarioIcons = {
    market_vegetables: FaShoppingCart,
    restaurant_jollof: FaUtensils,
    street_food: FaUtensils,
    supermarket_shopping: FaShoppingCart,
    dinner_party: FaUsers,
    formal_greeting: FaHandshake,
    informal_greeting: FaUsers,
    elder_respect: FaHandshake,
    business_intro: FaBriefcase,
    family_gathering: FaUsers,
    fabric_bargain: FaBalanceScale,
    electronics_purchase: FaShoppingCart,
    grocery_shopping: FaShoppingCart,
    return_item: FaShoppingCart,
    market_fresh_fish: FaShoppingCart,
    bus_commute: FaBus,
    taxi_negotiation: FaBus,
    airport_checkin: FaBus,
    directions_city: FaMap,
    okada_ride: FaBus,
    doctor_appointment: FaUserMd,
    pharmacy_purchase: FaUserMd,
    emergency_room: FaUserMd,
    dental_checkup: FaUserMd,
    first_aid_help: FaUserMd,
    wedding_reception: FaRing,
    birthday_party: FaCalendar,
    funeral_condolences: FaChurch,
    naming_ceremony: FaUsers,
    office_party: FaBriefcase,
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        try {
          const userRef = doc(db, "users", auth.currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            setUserData(data);

            // Extract completed roleplay scenarios
            const completed = data.completed_lessons || [];
            const roleplayCompleted = completed
              .filter((lesson) => lesson.startsWith("roleplay-"))
              .map((lesson) => lesson.replace("roleplay-", ""));
            setCompletedScenarios(roleplayCompleted);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const getModuleProgress = (module) => {
    const moduleScenarios = module.scenarios || [];
    const completedInModule = moduleScenarios.filter(scenario =>
      completedScenarios.includes(scenario.id)
    ).length;
    
    return {
      completed: completedInModule,
      total: moduleScenarios.length,
      percentage: moduleScenarios.length > 0 ? (completedInModule / moduleScenarios.length) * 100 : 0
    };
  };

  const getScenarioStatus = (scenarioId, scenarioIndex, module) => {
    // First scenario in module is always unlocked
    if (scenarioIndex === 0) return "unlocked";

    // Check if previous scenario is completed
    const previousScenario = module.scenarios[scenarioIndex - 1];
    if (previousScenario && completedScenarios.includes(previousScenario.id)) {
      return "unlocked";
    }

    // Check if this scenario is completed
    if (completedScenarios.includes(scenarioId)) {
      return "completed";
    }

    return "locked";
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "Advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleModuleClick = (module) => {
    setSelectedModule(module);
    setShowModuleModal(true);
  };

  const handleScenarioSelect = (scenario) => {
    navigate(`/lessons/section/roleplay/${scenario.id}`);
    setShowModuleModal(false);
  };

  const getModuleIcon = (iconName) => {
    const IconComponent = moduleIcons[iconName] || FaUsers;
    return <IconComponent className="text-2xl" />;
  };

  const getTotalCompletedScenarios = () => {
    return roleplayData.modules.reduce((total, module) => {
      return total + module.scenarios.filter(scenario => 
        completedScenarios.includes(scenario.id)
      ).length;
    }, 0);
  };

  const getTotalScenarios = () => {
    return roleplayData.modules.reduce((total, module) => {
      return total + (module.scenarios ? module.scenarios.length : 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading scenarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Back Button */}
            <Link
              to="/lessons/section"
              className="flex items-center text-yellow-600 hover:text-yellow-700 font-semibold"
            >
              <FaArrowLeft className="mr-2" />
              Back to Section
            </Link>

            {/* Page Title */}
            <h1 className="text-2xl font-bold text-gray-900">
              Roleplay Conversations
            </h1>

            {/* User Stats */}
            <div className="flex items-center space-x-4 text-sm">
              {userData && (
                <>
                  <div className="flex items-center space-x-1">
                    <FaStar className="text-yellow-500" />
                    <span className="font-semibold">{userData.xp || 0} XP</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="font-semibold text-green-600">
                      {getTotalCompletedScenarios()}/{getTotalScenarios()}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Category Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {roleplayData.category_name}
              </h2>
              <p className="text-gray-600 text-lg mb-4">
                {roleplayData.category_description}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <FaClock className="text-gray-400" />
                  <span>{roleplayData.estimated_total_time}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>{getTotalScenarios()} scenarios</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>{roleplayData.modules.length} modules</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Your Progress</span>
              <span>
                {getTotalCompletedScenarios()}/{getTotalScenarios()} completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-yellow-500 h-3 rounded-full transition-all duration-300"
                style={{
                  width: `${(getTotalCompletedScenarios() / getTotalScenarios()) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roleplayData.modules
            .sort((a, b) => a.order - b.order)
            .map((module) => {
              const progress = getModuleProgress(module);
              const isModuleStarted = progress.completed > 0;
              const isModuleCompleted = progress.completed === progress.total;

              return (
                <div
                  key={module.module_id}
                  onClick={() => handleModuleClick(module)}
                  className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-200 cursor-pointer transform hover:scale-105 ${
                    isModuleCompleted 
                      ? "border-green-200 ring-2 ring-green-200" 
                      : "border-yellow-200 hover:border-yellow-300 hover:shadow-md"
                  }`}
                >
                  <div className="p-6">
                    {/* Module Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`p-3 rounded-lg ${
                            isModuleCompleted ? "bg-green-50" : "bg-yellow-50"
                          }`}
                        >
                          {getModuleIcon(module.icon)}
                        </div>
                        <div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Module {module.order}
                          </span>
                        </div>
                      </div>

                      {/* Status Icon */}
                      <div className="text-2xl">
                        {isModuleCompleted ? (
                          <FaStar className="text-green-500" />
                        ) : isModuleStarted ? (
                          <FaUnlock className="text-yellow-500" />
                        ) : (
                          <FaUnlock className="text-yellow-500" />
                        )}
                      </div>
                    </div>

                    {/* Module Info */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {module.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {module.description}
                    </p>

                    {/* Module Progress */}
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{progress.completed}/{progress.total}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${progress.percentage}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Module Details */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <FaClock className="text-gray-400" />
                        <span>
                          {module.scenarios.length} scenario{module.scenarios.length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Completion Badge */}
                      {isModuleCompleted && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Module Modal */}
        {showModuleModal && selectedModule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl relative w-full max-w-2xl max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                      {getModuleIcon(selectedModule.icon)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">
                        {selectedModule.title}
                      </h3>
                      <p className="text-yellow-100 text-sm">
                        {selectedModule.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModuleModal(false)}
                    className="text-white hover:text-yellow-200 transition-colors"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Module Progress</span>
                    <span>
                      {getModuleProgress(selectedModule).completed}/
                      {getModuleProgress(selectedModule).total} completed
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-yellow-500 h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${getModuleProgress(selectedModule).percentage}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Scenarios List */}
                <div className="space-y-3">
                  {selectedModule.scenarios.map((scenario, index) => {
                    const status = getScenarioStatus(scenario.id, index, selectedModule);
                    const IconComponent = scenarioIcons[scenario.id] || FaUsers;
                    const isCompleted = completedScenarios.includes(scenario.id);

                    return (
                      <div
                        key={scenario.id}
                        onClick={() => status !== "locked" && handleScenarioSelect(scenario)}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          status === "locked"
                            ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                            : "border-yellow-200 bg-white hover:border-yellow-300 hover:shadow-md cursor-pointer"
                        } ${isCompleted ? "ring-2 ring-green-200" : ""}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1">
                            <div
                              className={`p-2 rounded-lg ${
                                status === "locked" 
                                  ? "bg-gray-100" 
                                  : isCompleted 
                                    ? "bg-green-100" 
                                    : "bg-yellow-100"
                              }`}
                            >
                              <IconComponent
                                className={`${
                                  status === "locked"
                                    ? "text-gray-400"
                                    : isCompleted
                                    ? "text-green-600"
                                    : "text-yellow-600"
                                }`}
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-semibold text-gray-900">
                                  {scenario.title}
                                </span>
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(
                                    scenario.difficulty
                                  )}`}
                                >
                                  {scenario.difficulty}
                                </span>
                                {scenario.premium && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    <FaCrown className="mr-1" />
                                    Premium
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-1">
                                {scenario.description}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <FaClock className="text-gray-400" />
                                  <span>{scenario.estimated_time}</span>
                                </div>
                                <span>{scenario.learning_objectives.length} objectives</span>
                              </div>
                            </div>
                          </div>

                          {/* Status Indicator */}
                          <div className="ml-4">
                            {status === "locked" && (
                              <FaLock className="text-gray-400 text-xl" />
                            )}
                            {status === "unlocked" && !isCompleted && (
                              <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                Start
                              </div>
                            )}
                            {isCompleted && (
                              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                Completed
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Locked Message */}
                        {status === "locked" && (
                          <div className="mt-2 p-2 bg-gray-100 rounded">
                            <p className="text-xs text-gray-600 text-center">
                              Complete previous scenario to unlock
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* How to Play Section */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            How to Play
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold text-lg">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Choose a Module
              </h4>
              <p className="text-gray-600 text-sm">
                Select from various real-life conversation modules like dining, shopping, or transportation.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold text-lg">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Select Scenario
              </h4>
              <p className="text-gray-600 text-sm">
                Pick specific scenarios within each module. Complete them in order to unlock next ones.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-yellow-600 font-bold text-lg">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Practice Conversations
              </h4>
              <p className="text-gray-600 text-sm">
                Engage in realistic dialogues, make choices, and learn cultural nuances.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleplaySelection;