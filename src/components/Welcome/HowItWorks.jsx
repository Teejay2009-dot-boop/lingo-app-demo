import React from "react";

export const HowItWorks = () => {
  const steps = [
    {
      icon: "📘",
      title: "Learn",
      desc: "Start with simple Yoruba words and phrases designed just for kids. Learn with pictures, sounds, and characters you'll all love!",
    },
    {
      icon: "🎯",
      title: "Play",
      desc: "Answer fun questions and quizzes to test your skills. Every correct answer earns you xp and helps you level up!",
    },
    {
      icon: "🏅",
      title: "Acheive",
      desc: "Keep Learning every day to bild streaks, unlock badges, and become a yoruba language master!",
    },
  ];

  return (
    <section id="#about" className="bg-white px-4 md:px-20 py-10 text-center ">
      <h2 data-aos="fade-up" data-aos-duration="2500" className="text-amber text-3xl md:text-4xl lg:text-5xl font-fredoka font-bold">
        How It Works
      </h2>
      <div className="grid md:grid-cols-3 py-4 gap-8 ">
        {steps.map((step, index) => (
          <div
            key={index}
            data-aos="fade-up" data-aos-duration="2500"
            data-aos-delay="500"
            className="bg-[#fff8e1] p-10 rounded-xl shadow-md hover:scale-105 transition-all ease-in duration-200 cursor-pointer"
          >
            <div className="text-5xl">{step.icon}</div>
            <div className="text-2xl font-bold text-amber py-4">
              {step.title}
            </div>
            <div className="text-gray-700">{step.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
};
