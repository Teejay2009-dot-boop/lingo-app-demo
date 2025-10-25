import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaCoins,
  FaHeart,
  FaStar,
  FaSnowflake,
  FaGamepad,
  FaCocktail,
  FaCheck,
  FaTimes,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaBolt,
} from "react-icons/fa";
import mascot from "../assets/IMG-20250724-WA0115-removebg-preview.png";
import { auth, db } from "../firebase/config/firebase";
import {
  doc,
  onSnapshot,
  updateDoc,
  increment,
  getDoc,
  arrayUnion,
} from "firebase/firestore";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import Confetti from "react-confetti";

const shopItems = [
  {
    id: 1,
    name: "Extra Life",
    icon: <FaHeart className="text-red-500" />,
    cost: 12,
    action: { lives: 1 },
    maxQuantity: 5,
    description: "Get one additional life",
  },
  {
    id: 2,
    name: "5 Lives Pack",
    icon: <FaHeart className="text-red-500" />,
    cost: 60,
    action: { lives: 5 },
    maxQuantity: 1,
    description: "Complete life refill (max 5)",
    popular: true,
  },
  {
    id: 3,
    name: "Streak Freeze",
    icon: <FaSnowflake className="text-blue-400" />,
    cost: 10,
    action: { streak_freezes: 1 },
    description: "Protect your streak for one day",
  },
  {
    id: 4,
    name: "XP Boost (30min)",
    icon: <FaBolt className="text-yellow-500" />,
    cost: 15,
    type: "30min_50%",
    description: "50% more XP for 30 minutes",
  },
  {
    id: 5,
    name: "XP Boost (45min)",
    icon: <FaBolt className="text-yellow-500" />,
    cost: 25,
    type: "45min_75%",
    description: "75% more XP for 45 minutes",
    bestValue: true,
  },
];

// STREAK FREEZE LOGIC FUNCTIONS
const checkAndApplyStreakFreeze = async (uid) => {
  if (!uid) return false;

  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return false;

    const userData = userSnap.data();
    const currentStreak = userData.current_streak || 0;
    const streakFreezes = userData.streak_freezes || 0;
    const lastLessonDate = userData.last_lesson_date?.toDate();
    const today = new Date();

    // If user has no streak or no freezes, nothing to do
    if (currentStreak === 0 || streakFreezes === 0) return false;

    // Check if user missed a day (last lesson was more than 1 day ago but less than 2 days)
    if (lastLessonDate) {
      const timeDiff = today.getTime() - lastLessonDate.getTime();
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

      // If user missed exactly one day (between 1 and 2 days ago)
      if (daysDiff > 1 && daysDiff <= 2) {
        // Apply streak freeze automatically
        await updateDoc(userRef, {
          streak_freezes: increment(-1),
          streak_freeze_used: arrayUnion(new Date()),
          streak_freeze_applied: new Date(),
        });

        console.log("✅ Streak freeze applied automatically");
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("Error applying streak freeze:", error);
    return false;
  }
};

const getStreakFreezeStatus = (userData) => {
  if (!userData) return { hasFreezes: false, count: 0, status: "No freezes" };

  const streakFreezes = userData.streak_freezes || 0;
  const lastFreezeApplied = userData.streak_freeze_applied?.toDate();
  const today = new Date();

  let status = "";
  if (streakFreezes === 0) {
    status = "No streak freezes available";
  } else if (lastFreezeApplied) {
    const timeSinceLastFreeze = today.getTime() - lastFreezeApplied.getTime();
    const hoursSinceLastFreeze = timeSinceLastFreeze / (1000 * 60 * 60);

    if (hoursSinceLastFreeze < 24) {
      status = `Freeze active (used ${Math.floor(hoursSinceLastFreeze)}h ago)`;
    } else {
      status = `${streakFreezes} freeze${streakFreezes !== 1 ? "s" : ""} ready`;
    }
  } else {
    status = `${streakFreezes} freeze${streakFreezes !== 1 ? "s" : ""} ready`;
  }

  return {
    hasFreezes: streakFreezes > 0,
    count: streakFreezes,
    status,
  };
};

const Shop = () => {
  const [coins, setCoins] = useState(0);
  const [xp, setXp] = useState(0);
  const [lives, setLives] = useState(0);
  const [streakFreezes, setStreakFreezes] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [message, setMessage] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef(null);

  // Handle window resize for confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch user data live from Firestore
  useEffect(() => {
    if (!auth.currentUser) return;

    const unsub = onSnapshot(
      doc(db, "users", auth.currentUser.uid),
      async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCoins(data.coins || 0);
          setXp(data.xp || 0);
          setLives(data.lives || 0);
          setStreakFreezes(data.streak_freezes || 0);
          setCurrentStreak(data.current_streak || 0);

          // Check and apply streak freeze automatically if needed
          await checkAndApplyStreakFreeze(auth.currentUser.uid);
        }
      }
    );
    return () => unsub();
  }, []);

  // UPDATED PURCHASE HANDLER WITH STREAK FREEZE LOGIC
  const handlePurchase = async (item) => {
    // Check for life limits
    if (item.action?.lives) {
      if (item.id === 1 && lives >= 5) {
        setMessage("❌ Maximum lives (5) reached!");
        return;
      }
      if (item.id === 2 && lives >= 5) {
        setMessage("❌ You already have maximum lives!");
        return;
      }
      if (lives + item.action.lives > 5) {
        const canBuy = 5 - lives;
        setMessage(
          `❌ You can only buy ${canBuy} more life${canBuy !== 1 ? "s" : ""}`
        );
        return;
      }
    }

    if (coins < item.cost) {
      setMessage("❌ Not enough coins!");
      return;
    }

    try {
      const userRef = doc(db, "users", auth.currentUser.uid);

      // Handle XP boost activation
      if (item.type?.includes("min_")) {
        const duration =
          item.type === "30min_50%" ? 30 * 60 * 1000 : 45 * 60 * 1000;
        const expiresAt = new Date(Date.now() + duration);

        await updateDoc(userRef, {
          coins: increment(-item.cost),
          active_xp_boost: {
            type: item.type,
            multiplier: item.type === "30min_50%" ? 1.5 : 1.75,
            expires_at: expiresAt,
            activated_at: new Date(),
          },
        });

        setMessage(`✅ ${item.name} activated! Enjoy extra XP!`);
      } else {
        // Handle other items including streak freezes
        let updateData = { coins: increment(-item.cost) };

        if (item.action?.lives) {
          updateData.lives = increment(item.action.lives);
        }

        if (item.action?.streak_freezes) {
          updateData.streak_freezes = increment(item.action.streak_freezes);

          // Add purchase history for streak freezes
          updateData.streak_freeze_purchases = arrayUnion({
            purchased_at: new Date(),
            cost: item.cost,
            type: "single_freeze",
          });
        }

        await updateDoc(userRef, updateData);

        if (item.action?.streak_freezes) {
          setMessage(
            `✅ Purchased ${item.name}! It will activate automatically if you miss a day.`
          );
        } else {
          setMessage(`✅ Purchased ${item.name}!`);
        }
      }

      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (error) {
      console.error("Purchase error:", error);
      setMessage("❌ Purchase failed");
    }
  };

  const getRemainingLives = () => {
    return Math.max(0, 5 - lives);
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === shopItems.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? shopItems.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Get streak freeze status for display
  const freezeStatus = getStreakFreezeStatus({
    streak_freezes: streakFreezes,
    streak_freeze_applied: null, // You might want to track this in your user data
  });

  // Get visible items for the slider - responsive
  const getVisibleItems = () => {
    if (windowSize.width < 1024) {
      return [shopItems[currentIndex]];
    }

    const items = [];
    const totalItems = shopItems.length;

    items.push(shopItems[currentIndex]);

    const prevIndex = currentIndex === 0 ? totalItems - 1 : currentIndex - 1;
    items.unshift(shopItems[prevIndex]);

    const nextIndex = currentIndex === totalItems - 1 ? 0 : currentIndex + 1;
    items.push(shopItems[nextIndex]);

    return items;
  };

  const visibleItems = getVisibleItems();
  const isMobile = windowSize.width < 1024;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-100 p-6 relative">
        {showConfetti && (
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={200}
          />
        )}

        {/* Header */}
        <div className="flex justify-around items-center mt-16 mb-6 lg:mt-2">
          <h1 className="text-4xl md:text-5xl pb-1 font-bold font-fredoka text-amber text-center">
            Shop
          </h1>
        </div>

        {/* Stats */}
        <div className="flex justify-between items-center mb-6 text-lg font-semibold bg-white p-3 rounded-full shadow-md">
          <div className="flex items-center gap-4">
            {/* Streak Freeze Status */}
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              <FaSnowflake className="text-blue-400" />
              <span className="text-blue-700 text-sm">
                {freezeStatus.count} Freeze{freezeStatus.count !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Current Streak */}
            <div className="flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
              <FaStar className="text-orange-500" />
              <span className="text-orange-700 text-sm">
                {currentStreak} Day{currentStreak !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <p className="flex gap-2 items-center text-amber text-2xl px-4 rounded-full">
            <FaCoins /> {coins}
          </p>
        </div>

        {/* Streak Freeze Info Banner */}
        {streakFreezes > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 mx-6 lg:mx-20">
            <div className="flex items-center gap-3">
              <FaSnowflake className="text-blue-400 text-xl" />
              <div>
                <h3 className="font-semibold text-blue-800">
                  Streak Freeze Active!
                </h3>
                <p className="text-blue-600 text-sm">
                  You have {streakFreezes} freeze
                  {streakFreezes !== 1 ? "s" : ""}.
                  {currentStreak > 0
                    ? ` Your ${currentStreak}-day streak is protected if you miss a day.`
                    : " Buy more to protect your future streaks!"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Message */}
        {message && (
          <div
            className={`bg-white text-center p-3 mb-4 mx-6 lg:mx-20 rounded-full shadow-md font-medium flex items-center justify-center gap-2 ${
              message.startsWith("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message.startsWith("✅") ? <FaCheck /> : <FaTimes />}
            {message.replace(/[✅❌]/g, "")}
          </div>
        )}

        <p className="text-2xl text-black py-2 font-semibold pl-1 mb-4">
          Items
        </p>

        {/* Responsive Slider Container */}
        <div
          className={`relative ${
            isMobile ? "max-w-md" : "max-w-6xl"
          } mx-auto mb-8`}
        >
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-2 lg:left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110 border border-gray-200"
          >
            <FaChevronLeft className="text-amber text-xl" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-2 lg:right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110 border border-gray-200"
          >
            <FaChevronRight className="text-amber text-xl" />
          </button>

          {/* Responsive Slider */}
          <div
            className={`relative ${isMobile ? "h-96 px-4" : "h-80 px-16"}`}
            ref={sliderRef}
          >
            {/* Mobile/Tablet - Single Card */}
            {isMobile ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  {(() => {
                    const item = shopItems[currentIndex];
                    const canBuyLife = !item.action?.lives || lives < 5;
                    const canAfford = coins >= item.cost;
                    const isDisabled =
                      (item.action?.lives && lives >= 5) || !canAfford;

                    return (
                      <div
                        className={`bg-white rounded-2xl shadow-xl w-full h-full flex flex-col items-center text-center border-2 transition-all duration-300 mx-auto relative overflow-hidden ${
                          isDisabled
                            ? "border-gray-200 opacity-80"
                            : "border-amber hover:border-amber-600 hover:shadow-2xl"
                        } ${item.popular ? "ring-2 ring-yellow-400" : ""} ${
                          item.bestValue ? "ring-2 ring-blue-400" : ""
                        }`}
                      >
                        {item.popular && (
                          <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-sm font-bold px-4 py-2 rounded-bl-2xl rounded-tr-2xl">
                            POPULAR
                          </div>
                        )}
                        {item.bestValue && (
                          <div className="absolute top-0 right-0 bg-blue-400 text-blue-900 text-sm font-bold px-4 py-2 rounded-bl-2xl rounded-tr-2xl">
                            BEST VALUE
                          </div>
                        )}

                        {/* Streak Freeze Special Info */}
                        {item.id === 3 && (
                          <div className="absolute top-0 left-0 bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-br-2xl rounded-tl-2xl">
                            AUTO-ACTIVATES
                          </div>
                        )}

                        <div className="p-6 w-full h-full flex flex-col items-center justify-center">
                          <div className="text-6xl mb-6 flex justify-center">
                            {item.icon}
                          </div>
                          <h3 className="font-bold text-2xl mb-4">
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className="text-gray-600 mb-6 text-base">
                              {item.description}
                            </p>
                          )}

                          {/* Additional info for streak freezes */}
                          {item.id === 3 && (
                            <p className="text-blue-600 text-sm mb-4 bg-blue-50 px-3 py-2 rounded-lg">
                              Automatically protects your streak if you miss a
                              day
                            </p>
                          )}

                          <p className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <span
                              className={
                                canAfford ? "text-amber" : "text-gray-400"
                              }
                            >
                              {item.cost}
                            </span>
                            <FaCoins
                              className={
                                canAfford ? "text-yellow-500" : "text-gray-400"
                              }
                            />
                          </p>

                          {item.action?.lives && lives >= 5 && (
                            <p className="text-red-500 text-sm mb-4">
                              Maximum lives reached
                            </p>
                          )}
                          {!canAfford && (
                            <p className="text-red-500 text-sm mb-4">
                              Need {item.cost - coins} more coins
                            </p>
                          )}

                          <button
                            onClick={() => handlePurchase(item)}
                            disabled={isDisabled}
                            className={`px-6 py-3 rounded-full font-semibold transition-all duration-200 w-full max-w-64 text-base ${
                              isDisabled
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-amber text-white hover:bg-amber-600 hover:scale-105 transform"
                            }`}
                          >
                            {isDisabled ? "Cannot Purchase" : "Purchase Now"}
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>
              </AnimatePresence>
            ) : (
              /* Desktop - Three Cards */
              <div className="flex items-center justify-center gap-4 h-full">
                {visibleItems.map((item, index) => {
                  const isCenter = item.id === shopItems[currentIndex].id;
                  const canBuyLife = !item.action?.lives || lives < 5;
                  const canAfford = coins >= item.cost;
                  const isDisabled =
                    (item.action?.lives && lives >= 5) || !canAfford;

                  return (
                    <motion.div
                      key={item.id}
                      className={`flex-shrink-0 transition-all duration-300 ${
                        isCenter
                          ? "w-80 scale-110 z-10"
                          : "w-64 scale-90 opacity-80"
                      }`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{
                        opacity: isCenter ? 1 : 0.8,
                        scale: isCenter ? 1.1 : 0.9,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <div
                        className={`bg-white rounded-2xl shadow-lg h-full flex flex-col items-center text-center border-2 transition-all duration-300 relative overflow-hidden ${
                          isDisabled
                            ? "border-gray-200 opacity-80"
                            : "border-amber hover:border-amber-600 hover:shadow-xl"
                        } ${item.popular ? "ring-2 ring-yellow-400" : ""} ${
                          item.bestValue ? "ring-2 ring-blue-400" : ""
                        } ${isCenter ? "cursor-default" : "cursor-pointer"}`}
                        onClick={() =>
                          !isCenter &&
                          goToSlide(
                            shopItems.findIndex((si) => si.id === item.id)
                          )
                        }
                      >
                        {item.popular && (
                          <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-2xl rounded-tr-2xl">
                            POPULAR
                          </div>
                        )}
                        {item.bestValue && (
                          <div className="absolute top-0 right-0 bg-blue-400 text-blue-900 text-xs font-bold px-3 py-1 rounded-bl-2xl rounded-tr-2xl">
                            BEST VALUE
                          </div>
                        )}

                        {/* Streak Freeze Special Info */}
                        {item.id === 3 && (
                          <div className="absolute top-0 left-0 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-br-2xl rounded-tl-2xl">
                            AUTO-ACTIVATES
                          </div>
                        )}

                        <div className="p-6 w-full flex flex-col items-center justify-between h-full">
                          <div className="flex flex-col items-center">
                            <div className="text-5xl mb-4 flex justify-center">
                              {item.icon}
                            </div>
                            <h3 className="font-bold text-xl mb-2">
                              {item.name}
                            </h3>
                            {item.description && (
                              <p className="text-gray-600 mb-4 text-sm">
                                {item.description}
                              </p>
                            )}

                            {/* Additional info for streak freezes */}
                            {item.id === 3 && (
                              <p className="text-blue-600 text-xs mb-2 bg-blue-50 px-2 py-1 rounded">
                                Automatically protects your streak
                              </p>
                            )}
                          </div>

                          <div className="w-full">
                            <p className="text-lg font-semibold mb-4 flex items-center justify-center gap-1">
                              <span
                                className={
                                  canAfford ? "text-amber" : "text-gray-400"
                                }
                              >
                                {item.cost}
                              </span>
                              <FaCoins
                                className={
                                  canAfford
                                    ? "text-yellow-500"
                                    : "text-gray-400"
                                }
                              />
                            </p>

                            {item.action?.lives && lives >= 5 && (
                              <p className="text-red-500 text-sm mb-2">
                                Maximum lives reached
                              </p>
                            )}
                            {!canAfford && (
                              <p className="text-red-500 text-sm mb-2">
                                Need {item.cost - coins} more coins
                              </p>
                            )}

                            {isCenter && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePurchase(item);
                                }}
                                disabled={isDisabled}
                                className={`px-6 py-3 rounded-full font-semibold transition-all duration-200 w-full text-base ${
                                  isDisabled
                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    : "bg-amber text-white hover:bg-amber-600 hover:scale-105 transform"
                                }`}
                              >
                                {isDisabled
                                  ? "Cannot Purchase"
                                  : "Purchase Now"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-6 lg:mt-8 space-x-3">
            {shopItems.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? "bg-amber scale-125"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Life counter helper */}
        {lives < 5 && (
          <div className="text-center text-lg text-gray-600 mb-8">
            You can purchase up to {getRemainingLives()} more{" "}
            {getRemainingLives() === 1 ? "life" : "lives"}
          </div>
        )}

        {/* How Streak Freezes Work Section */}
        <div className="bg-white rounded-2xl p-6 mx-6 lg:mx-20 mb-8 shadow-md">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaSnowflake className="text-blue-400" />
            How Streak Freezes Work
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
                <p>
                  <strong>Automatic Protection:</strong> Freezes activate
                  automatically when you miss a day
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
                <p>
                  <strong>No Streak Loss:</strong> Your current {currentStreak}
                  -day streak stays protected
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-1 flex-shrink-0"></div>
                <p>
                  <strong>One Freeze Per Day:</strong> Each freeze protects one
                  missed day
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-1 flex-shrink-0"></div>
                <p>
                  <strong>Stackable:</strong> Buy multiple freezes for extended
                  protection
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Subscriptions Section (Unchanged) */}
        <div>
          <h1 className="text-2xl p-2 font-semibold">Subscriptions</h1>
          <div className="grid md:grid-cols-2 gap-6">
            {/* BASIC SUBSCRIPTION */}
            <div className="relative w-full m-4 bg-white p-4 shadow-md mx-1 px-1 rounded-2xl">
              <div className="absolute top-0 bg-green-500 font-semibold right-0 rounded-tr-xl m-r-2 px-3">
                FREE
              </div>
              <div className="px-2 py-2">
                <h1 className="text-2xl font-semibold">Basic</h1>
                <div className="flex flex-col py-1">
                  <div className="flex gap-1 items-center">
                    <FaCheckCircle className="text-white rounded-full text-sm bg-green-500" />
                    <p className="text-sm">Limited Yoruba Lessons</p>
                  </div>
                  <div className="flex gap-1 items-center">
                    <FaCheckCircle className="text-white rounded-full text-sm bg-green-500" />
                    <p className="text-sm">Limited Lives</p>
                  </div>
                  <div className="flex gap-1 items-center">
                    <FaCheckCircle className="text-white rounded-full text-sm bg-green-500" />
                    <p className="text-sm">No Progress Tracking</p>
                  </div>
                  <div className="flex gap-1 items-center">
                    <FaCheckCircle className="text-white rounded-full text-sm bg-green-500" />
                    <p className="text-sm">Ads</p>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-4 right-3 bg-amber text-sm py-1 flex items-center font-semibold px-5 rounded-full">
                Get
              </div>
            </div>

            {/* ADVANCE SUBSCRIPTION */}
            <div className="relative w-full m-4 bg-white p-4 mx-1 px-1 rounded-2xl shadow-md">
              <div className="absolute top-0 bg-blue-500 font-semibold right-0 rounded-tr-xl m-r-2 px-3">
                POPULAR
              </div>
              <div className="px-2 py-2">
                <h1 className="text-2xl font-semibold">Advance</h1>
                <div className="flex gap-3">
                  <div className="flex flex-col py-1">
                    <div className="flex gap-1 items-center">
                      <FaCheckCircle className="text-white rounded-full text-sm bg-green-500" />
                      <p className="text-sm">Basic Priviledges</p>
                    </div>
                    <div className="flex gap-1 items-center">
                      <FaCheckCircle className="text-white rounded-full text-sm bg-green-500" />
                      <p className="text-sm">Unlimited Lives</p>
                    </div>
                    <div className="flex gap-1 items-center">
                      <FaCheckCircle className="text-white rounded-full text-sm bg-green-500" />
                      <p className="text-sm">No Ads</p>
                    </div>
                    <div className="flex gap-1 items-center">
                      <FaCheckCircle className="text-white rounded-full text-sm bg-green-500" />
                      <p className="text-sm">Explain my Answers</p>
                    </div>
                  </div>
                  <div className="flex flex-col py-1">
                    <div className="flex gap-1 items-center">
                      <FaCheckCircle className="text-white rounded-full text-sm bg-green-500" />
                      <p className="text-sm">Advance Lessons</p>
                    </div>
                    <div className="flex gap-1 items-center">
                      <FaCheckCircle className="text-white rounded-full text-sm bg-green-500" />
                      <p className="text-sm">Offline Mode</p>
                    </div>
                  </div>
                </div>
              </div>
              <motion.button
                initial={{ transform: -10 }}
                animate={{ transform: 0 }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className="absolute bottom-1 right-3 bg-amber text-sm py-[1px] flex items-center font-semibold px-5 rounded-full shadow-xl cursor-pointer"
              >
                Get
              </motion.button>
            </div>

            {/* MAX LEVEL SUBSCRIPTION */}
            <div className="relative w-full m-4 border p-4 mx-1 bg-white px-1 rounded-2xl">
              <div className="absolute top-0 bg-red-500 font-semibold right-0 rounded-tr-xl m-r-2 px-3">
                PREMIUM
              </div>
              <div className="px-2 py-2">
                <h1 className="text-2xl font-semibold">Max</h1>
                <div className="flex flex-col py-1">
                  <div className="flex gap-1 items-center">
                    <FaCheckCircle className="text-white rounded-full text-sm bg-green-500" />
                    <p className="text-sm">Advanced Priviledges</p>
                  </div>
                  <div className="flex gap-1 items-center">
                    <FaCheckCircle className="text-white rounded-full text-sm bg-green-500" />
                    <p className="text-sm">AI Tutor</p>
                  </div>
                  <div className="flex gap-1 items-center">
                    <FaCheckCircle className="text-white rounded-full text-sm bg-green-500" />
                    <p className="text-sm">AI live mode</p>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-1 right-3 bg-amber text-sm py-[1px] flex items-center font-semibold px-5 rounded-full">
                Get
              </div>
            </div>

            {/* SCHOOL SUBSCRIPTION */}
            <div className="relative w-full m-4 border p-4 bg-white mx-1 px-1 rounded-2xl shadow-md">
              <div className="absolute top-0 bg-blue-500 font-semibold right-0 rounded-tr-xl m-r-2 px-3">
                POPULAR
              </div>
              <div className="px-2 py-2">
                <h1 className="text-2xl font-semibold">For Schools</h1>
                <div className="flex gap-3">
                  <div className="flex flex-col py-1">
                    <div className="flex gap-1 items-center">
                      <FaCheckCircle className="text-white rounded-full text-sm bg-green-500" />
                      <p className="text-sm">Basic Priviledges</p>
                    </div>
                    <div className="flex gap-1 items-center">
                      <FaCheckCircle className="text-white rounded-full text-sm bg-green-500" />
                      <p className="text-sm">Unlimited Lives</p>
                    </div>
                    <div className="flex gap-1 items-center">
                      <FaCheckCircle className="text-white rounded-full text-sm bg-green-500" />
                      <p className="text-sm">No Ads</p>
                    </div>
                    <div className="flex gap-1 items-center">
                      <FaCheckCircle className="text-white rounded-full text-sm bg-green-500" />
                      <p className="text-sm">Explain my Answers</p>
                    </div>
                  </div>
                  <div className="flex flex-col py-1">
                    <div className="flex gap-1 items-center">
                      <FaCheckCircle className="text-white rounded-full text-sm bg-green-500" />
                      <p className="text-sm">Advance Lessons</p>
                    </div>
                    <div className="flex gap-1 items-center">
                      <FaCheckCircle className="text-white rounded-full text-sm bg-green-500" />
                      <p className="text-sm">Offline Mode</p>
                    </div>
                  </div>
                </div>
              </div>
              <motion.button
                initial={{ transform: -10 }}
                animate={{ transform: 0 }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className="absolute bottom-1 right-3 bg-amber text-sm py-[1px] flex items-center font-semibold px-5 rounded-full shadow-xl cursor-pointer"
              >
                Get
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Shop;
