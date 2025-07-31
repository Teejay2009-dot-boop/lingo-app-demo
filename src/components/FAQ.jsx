import React, { useState } from "react";

const faqs = [
  {
    question: "Is LingoBud free?",
    answer:
      "Yes! You can get started for free. Premium gives more features like badges and advanced quizzes.",
  },
  {
    question: "Is this app only for Yoruba?",
    answer: "Currently yes, but we plan to add other Nigerian languages soon!",
  },
  {
    question: "Do I need to install anything?",
    answer:
      "No. You can use LingoBud directly from your browser or mobile app.",
  },
  {
    question: "Can children use this app?",
    answer:
      "Yes! LingoBud was designed for young learners with fun visuals and simple navigation.",
  },
  {
    question: "How is my progress tracked?",
    answer:
      "We use Firebase to track lessons, streaks, and scores automatically with your account.",
  },
  {
    question: "Can I use LingoBud offline?",
    answer:
      "Not yet, but we're working on limited offline support in future versions.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-[#FFFDE7] py-16 px-4">
      <h2 className="text-3xl font-bold text-center text-amber font-fredoka mb-10">
        Frequently Asked Questions
      </h2>
      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <button
              className="w-full text-left font-semibold text-lg text-amber px-4 py-3 flex justify-between items-center"
              onClick={() => toggle(index)}
            >
              {item.question}
              <span className="ml-4 text-amber">
                {openIndex === index ? "▲" : "▼"}
              </span>
            </button>
            <div
              className={`px-4 transition-all duration-500 ease-in-out ${
                openIndex === index
                  ? "max-h-40 py-2"
                  : "max-h-0 overflow-hidden"
              }`}
            >
              <p className="text-gray-700">{item.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
