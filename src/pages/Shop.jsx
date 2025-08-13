import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaCoins,
  FaHeart,
  FaStar,
  FaSnowflake,
} from "react-icons/fa";
import mascot from "../assets/IMG-20250724-WA0115-removebg-preview.png";
import { auth, db } from "../firebase/config/firebase";
import { doc, onSnapshot, updateDoc, increment } from "firebase/firestore";

const shopItems = [
  {
    id: 1,
    name: "Extra Life",
    icon: <FaHeart className="text-red-500" />,
    cost: 2,
    action: { lives: 1 },
  },
  {
    id: 2,
    name: "5 Lives",
    icon: <FaHeart className="text-red-500" />,
    cost: 5,
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
    icon: <FaStar className="text-yellow-400" />,
    cost: 5,
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
        <h1 className="text-2xl font-bold text-amber">Lingo Shop</h1>
        <img src={mascot} alt="Mascot" className="w-10" />
      </div>

      {/* Stats */}
      <div className="flex justify-around items-center mb-6 text-lg font-semibold">
        <p className="flex gap-2 items-center">
          <FaCoins className="text-yellow-500" /> {coins}
        </p>
        <p>⭐ XP: {xp}</p>
        <p>❤ Lives: {lives}</p>
      </div>

      {/* Message */}
      {message && (
        <div className="bg-white text-center p-3 mb-4 rounded shadow font-medium">
          {message}
        </div>
      )}

      {/* Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {shopItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow px-6 py-8 text-center border border-amber hover:scale-105 transition-transform duration-300"
          >
            <div className="text-5xl mb-3 flex justify-center">{item.icon}</div>
            <h3 className="font-bold text-xl mb-1">{item.name}</h3>
            <p className="text-sm text-gray-600 mb-3">Cost: {item.cost} 🪙</p>
            <button
              onClick={() => handlePurchase(item)}
              className="bg-amber text-white px-6 py-2 rounded-full hover:bg-amber-600 transition"
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
