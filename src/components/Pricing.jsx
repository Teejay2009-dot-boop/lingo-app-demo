import React from "react";
import { FaCheck } from "react-icons/fa";

const plans = [
  {
    title: "Free Starter",
    price: "₦0",
    color: "bg-white",
    border: "border border-gray-200",
    features: [
      "Limited Yoruba Lessons",
      "Basic Flashcards",
      "No Progress Tracking",
    ],
  },
  {
    title: "Premium",
    price: "₦2,000/mo",
    color: "bg-amberSoft", // Standout bg
    border: "border-4 border-amber",
    features: [
      "All Yoruba Lessons",
      "Gamified Badges & Streaks",
      "Progress Tracking",
    ],
    highlight: true, // Marked as default standout
  },
  {
    title: "For Schools",
    price: "Custom",
    color: "bg-white",
    border: "border border-gray-200",
    features: ["Admin Dashboard", "Classroom Management", "Bulk Licenses"],
  },
];

const Pricing = () => {
  return (
    <section id="#pricing" className="py-16 px-6 md:px-20 bg-white">
      <h2 className="text-center text-4xl font-fredoka font-bold text-amber mb-12">
        Choose Your Plan
      </h2>

      <div className="grid lg:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`rounded-2xl shadow-xl p-8 text-center transition duration-300 hover:scale-105 ${
              plan.color
            } ${plan.border} ${
              plan.highlight ? "scale-105 shadow-2xl z-10" : ""
            }`}
          >
            <h3 className="text-2xl font-bold mb-2 text-gray-800">
              {plan.title}
            </h3>
            <p className="text-4xl font-bold text-amber mb-4">{plan.price}</p>
            <ul className="text-gray-700 text-left mb-6">
              {plan.features.map((feature, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 py-1 border-b border-gray-200 last:border-none"
                >
                  <FaCheck className="text-green-600 bg-white rounded-full shadow-sm p-1 text-[18px]" />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              className={`mt-4 px-6 py-2 rounded-xl text-white font-semibold ${
                plan.highlight
                  ? "bg-amber hover:bg-yellow-600"
                  : "bg-gray-700 hover:bg-gray-800"
              } transition`}
            >
              {plan.title === "Free Starter"
                ? "Get Started"
                : plan.title === "Premium"
                ? "Upgrade"
                : "Contact Us"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Pricing;
