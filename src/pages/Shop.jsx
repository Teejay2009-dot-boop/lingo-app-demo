import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaCoins, FaHeart, FaStar } from "react-icons/fa";
import mascot from "../assets/IMG-20250724-WA0115-removebg-preview.png";

const initialItems = [
  { id: 1, name: "Extra Life", icon: <FaHeart />, cost: 50 },
  { id: 2, name: "Double XP (30 min)", icon: <FaStar />, cost: 100 },
  { id: 3, name: "Cool Hat", icon: "🎩", cost: 75 },
  { id: 4, name: "Cool Coins", icon: "💰", cost: 75 },
];

const Shop = () => {
  const [coins, setCoins] = useState(120);
  const [xp, setXp] = useState(200);
  const [inventory, setInventory] = useState([]);
  const [message, setMessage] = useState("");

  const handlePurchase = (item) => {
    if (coins < item.cost) {
      setMessage("❌ Not enough coins!");
      return;
    }

    setCoins((prev) => prev - item.cost);
    setInventory((prev) => [...prev, item]);
    setMessage(`✅ Purchased ${item.name}!`);
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
        <p>🪙 Coins: {coins}</p>
        <p>⭐ XP: {xp}</p>
        <p>🎒 Items: {inventory.length}</p>
      </div>

      {/* Message */}
      {message && (
        <div className="bg-white text-center p-3 mb-4 rounded shadow text-green-700 font-medium">
          {message}
        </div>
      )}

      {/* Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {initialItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded shadow px-4 pb-28 pt-12 text-center border border-amber"
          >
            <div className="text-4xl mb-2">{item.icon}</div>
            <h3 className="font-bold text-lg mb-1">{item.name}</h3>
            <p className="text-sm text-gray-600 mb-2">Cost: {item.cost} 🪙</p>
            <button
              onClick={() => handlePurchase(item)}
              className="bg-amber text-white px-4 py-2 rounded-full hover:bg-amber-600 transition"
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
