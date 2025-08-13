import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaCoins,
  FaHeart,
  FaStar,
  FaSnowflake,
  FaGamepad,
  FaCocktail
} from "react-icons/fa";
import mascot from "../assets/IMG-20250724-WA0115-removebg-preview.png";
import { auth, db } from "../firebase/config/firebase";
import { doc, onSnapshot, updateDoc, increment } from "firebase/firestore";

const shopItems = [
  {
    id: 1,
    name: "Extra Life",
    icon: <FaHeart className="text-red-500" />,
    cost: 4,
    action: { lives: 1 },
  },
  {
    id: 2,
    name: "5 Lives",
    icon: <FaHeart className="text-red-500" />,
    cost: 20,
    action: { lives: 5 },
  },
  {
    id: 3,
    name: "Streak Freeze",
    icon: <FaSnowflake className="text-blue-400" />,
    cost: 3,
    action: { streak_freezes: 1 },
  },
  {
    id: 4,
    name: "Double XP Boost",
    icon: <FaStar className="text-green-400" />,
    cost: 5,
    action: { double_xp: 1 },
  },
  {
    id: 5,
    name: "Double XP Boost",
    icon: <FaCocktail className="text-yellow-400" />,
    cost: 8,
    action: { double_xp: 1 },
  },
  {
    id: 6,
    name: "Double XP Boost",
    icon: <FaGamepad className="text-orange-400" />,
    cost: 10,
    action: { double_xp: 1 },
  },
];

const Shop = () => {
  const [coins, setCoins] = useState(0);
  const [xp, setXp] = useState(0);
  const [lives, setLives] = useState(0);
  const [message, setMessage] = useState("");

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
    } catch (error) {
      console.error("Purchase error:", error);
      setMessage("❌ Purchase failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Link to="/lessons">
          <FaArrowLeft className="text-2xl text-amber" />
        </Link>
        <h1 className="text-4xl md:text-5xl pb-6 font-bold font-fredoka text-amber">Lingo Shop</h1>
        <img src={mascot} alt="Mascot" className="w-10 cursor-pointer animate-bounce" />
      </div>

      {/* Stats */}
      <div className="flex justify-around items-center mb-6 text-lg font-semibold">
        <p className="flex gap-2 items-center bg-amber text-white px-3 py-1 rounded-full">
          <FaCoins className="" /> {coins}
        </p>
        <p>⭐ XP: {xp}</p>
        <p>❤ Lives: {lives}</p>
      </div>

      {/* Message */}
      {message && (
        <div className="bg-white text-center p-3 mb-4 mx-6 lg:mx-20 rounded-full shadow-md font-medium">
          {message}
        </div>
      )}

      {/* Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto">
        {shopItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow w-80 h-96 flex flex-col items-center justify-center text-center border border-amber hover:translate-y-[-2px] hover:shadow-[0_0_20px_rgba(255,193,7,0.6)] transition-all  duration-300 mx-auto cursor-pointer"
          >
            <div className="text-5xl mb-3 flex justify-center">{item.icon}</div>
            <h3 className="font-bold text-2xl mt-3 mb-1">{item.name}</h3>
            <p className="text-lg text-gray-600 mb-3 mt-3 flex  items-center gap-1">Cost: {item.cost} <FaCoins/></p>
            <button
              onClick={() => handlePurchase(item)}
              className="bg-amber text-white px-10 py-2 rounded-full hover:bg-amber-600 transition m-10 hover:translate-y-[-2px] ease-in duration-300 font-semibold hover:bg-yellow-600"
            >
              Buy
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shop;
