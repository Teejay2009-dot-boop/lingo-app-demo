import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { easeIn, motion } from "framer-motion";
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
} from "react-icons/fa";
import mascot from "../assets/IMG-20250724-WA0115-removebg-preview.png";
import { auth, db } from "../firebase/config/firebase";
import { doc, onSnapshot, updateDoc, increment } from "firebase/firestore";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import Confetti from "react-confetti";
import { div } from "framer-motion/client";
import { YAxis } from "recharts";

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
    icon: (
      <div className="flex">
        <FaHeart className="text-red-500" />
        {/* <FaHeart className="text-red-500" />
        <FaHeart className="text-red-500" />
        <FaHeart className="text-red-500" />
        <FaHeart className="text-red-500" /> */}
      </div>
    ),
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
    name: "XP Boost (30m)",
    icon: <FaStar className="text-green-400" />,
    cost: 5,
    action: { double_xp: 1 },
    description: "Double XP for 30 minutes",
  },
  {
    id: 5,
    name: "XP Boost (1h)",
    icon: <FaCocktail className="text-yellow-400" />,
    cost: 8,
    action: { double_xp: 1 },
    description: "Double XP for 1 hour",
  },
  {
    id: 6,
    name: "XP Boost (2h)",
    icon: <FaGamepad className="text-orange-400" />,
    cost: 10,
    action: { double_xp: 1 },
    description: "Double XP for 2 hours",
    bestValue: true,
  },
];

const Shop = () => {
  const [coins, setCoins] = useState(0);
  const [xp, setXp] = useState(0);
  const [lives, setLives] = useState(0);
  const [message, setMessage] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

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
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCoins(data.coins || 0);
          setXp(data.xp || 0);
          setLives(data.lives || 0);
        }
      }
    );
    return () => unsub();
  }, []);

  const handlePurchase = async (item) => {
    // Check for life limits
    if (item.action.lives) {
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

      // Prepare Firestore update
      let updateData = { coins: increment(-item.cost) };
      if (item.action.lives) updateData.lives = increment(item.action.lives);
      if (item.action.streak_freezes)
        updateData.streak_freezes = increment(item.action.streak_freezes);
      if (item.action.double_xp)
        updateData.double_xp = increment(item.action.double_xp);

      await updateDoc(userRef, updateData);

      setMessage(`✅ Purchased ${item.name}!`);
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
          {/* <Link to="/lessons" className="hover:scale-110 transition-transform">
            <FaArrowLeft className="text-2xl text-amber" />
          </Link> */}
          <h1 className="text-4xl md:text-5xl pb-1 font-bold font-fredoka text-amber text-center">
            Shop
          </h1>
          {/* <img
            src={mascot}
            alt="Mascot"
            className="w-10 cursor-pointer animate-bounce hover:animate-spin"
          /> */}
        </div>

        {/* Stats */}
        <div className="flex justify-end items-center mb-6 text-lg font-semibold bg-white p-3 rounded-full shadow-md">
          <p className="flex gap-2 items-center  text-amber text-2xl px-4  rounded-full ">
            <FaCoins /> {coins}
          </p>

          {/* <p className="flex items-center gap-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-full">
          ⭐ {xp} XP
        </p>
        <p className="flex items-center gap-1 bg-red-50 text-red-600 px-4 py-2 rounded-full">
          <FaHeart /> {lives}/5
          {lives < 5 && (
            <span className="text-xs ml-1">
              (+{getRemainingLives()} available)
            </span>
          )}
        </p> */}
        </div>

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

        <p className="text-2xl text-black py-2 font-semibold pl-1">Items</p>

        {/* Items */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mx-auto max-w-6xl">
          {shopItems.map((item) => {
            const canBuyLife = !item.action.lives || lives < 5;
            const canAfford = coins >= item.cost;
            const isDisabled = (item.action.lives && lives >= 5) || !canAfford;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-xl shadow w-full flex flex-col items-center text-center border-2 transition-all duration-300 mx-auto cursor-pointer relative overflow-hidden ${
                  isDisabled
                    ? "border-gray-200 opacity-80"
                    : "border-amber hover:border-amber-600 hover:shadow-lg"
                } ${item.popular ? "ring-2 ring-yellow-400" : ""} ${
                  item.bestValue ? "ring-2 ring-blue-400" : ""
                }`}
              >
                {item.popular && (
                  <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-bl-md">
                    POPULAR
                  </div>
                )}
                {item.bestValue && (
                  <div className="absolute top-0 right-0 bg-blue-400 text-blue-900 text-xs font-bold px-2 py-1 rounded-bl-md">
                    BEST VALUE
                  </div>
                )}

                <div className="p-6 w-full flex flex-col items-center">
                  <div className="text-5xl mb-4 flex justify-center">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-2xl mb-2">{item.name}</h3>
                  {item.description && (
                    <p className="text-gray-600 mb-4 text-sm">
                      {item.description}
                    </p>
                  )}
                  <p className="text-lg font-semibold mb-4 flex items-center gap-1">
                    <span
                      className={canAfford ? "text-amber" : "text-gray-400"}
                    >
                      {item.cost}
                    </span>
                    <FaCoins
                      className={
                        canAfford ? "text-yellow-500" : "text-gray-400"
                      }
                    />
                  </p>

                  {item.action.lives && lives >= 5 && (
                    <p className="text-red-500 text-sm mb-2">
                      Maximum lives reached
                    </p>
                  )}
                  {!canAfford && (
                    <p className="text-red-500 text-sm mb-2">
                      Need {item.cost - coins} more coins
                    </p>
                  )}

                  <button
                    onClick={() => handlePurchase(item)}
                    disabled={isDisabled}
                    className={`px-0 py-2 rounded-full font-semibold transition-all duration-200 w-full max-w-48 ${
                      isDisabled
                        ? "bg-gray-200 text-gray-500 px-0 text-sm cursor-not-allowed text-center"
                        : "bg-amber text-white hover:bg-amber-600 hover:scale-105"
                    }`}
                  >
                    {isDisabled ? "No Coins" : "Purchase"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Life counter helper */}
        {lives < 5 && (
          <div className="mt-8 text-center text-sm text-gray-600">
            You can purchase up to {getRemainingLives()} more{" "}
            {getRemainingLives() === 1 ? "life" : "lives"}
          </div>
        )}

        <div>
          <h1 className="text-2xl p-2 font-semibold">Subscriptions</h1>
          <div className="grid md:grid-cols-2 gap-6 ">
            {/* BASIC SUBSCRIPTION */}

            <div className=" relative w-full m-4 bg-white p-4 shadow-md mx-1 px-1 rounded-2xl">
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

            <div className=" relative w-full m-4 bg-white p-4 mx-1  px-1 rounded-2xl shadow-md ">
              <div className="absolute top-0 bg-blue-500  font-semibold right-0 rounded-tr-xl m-r-2 px-3">
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
                className="absolute bottom-1 right-3 bg-amber text-sm py-[1px] flex items-center font-semibold px-5 rounded-full shadow-xl cursor-pointer "
              >
                Get
              </motion.button>
            </div>

            {/* MAX LEVEL SUBSCRIPTION */}

            <div className=" relative w-full m-4 border p-4 mx-1 bg-white px-1 rounded-2xl">
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

            <div className=" relative w-full m-4 border p-4 bg-white mx-1  px-1 rounded-2xl shadow-md ">
              <div className="absolute top-0 bg-blue-500  font-semibold right-0 rounded-tr-xl m-r-2 px-3">
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
                className="absolute bottom-1 right-3 bg-amber text-sm py-[1px] flex items-center font-semibold px-5 rounded-full shadow-xl cursor-pointer "
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
