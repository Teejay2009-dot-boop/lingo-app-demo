import React from "react";
import { Link } from "react-router-dom";
import Lottie from "lottie-react";
import welcomeAnim from "../animations/Welcome Screen.json"; // Replace with your Lottie file
import welcomeChar from "../assets/IMG-20250724-WA0123-removebg-preview.png";
// import characterImg from "../assets/characters/mascot1.png"; // Replace with actual image

function HeroSection() {
  return (
    <section id="#Home" className="min-h-[90vh] flex flex-col-reverse md:flex-row items-center justify-between px-6 md:px-10 py-5 bg-[#FFFBEA]">
      {/* Left Text */}
      <div className="text-center md:text-left space-y-6 max-w-xl">
        <h1 className="text-4xl md:text-5xl font-fredoka font-bold text-amber leading-tight">
          Learn Yoruba the Fun Way!
        </h1>
        <p className="text-gray-700 text-lg md:text-xl">
          Master the Yoruba language through games, characters, and interactive
          lessons. Built just for you!
        </p>
        <Link to="/login">
          <button className="bg-amber my-2 text-white px-6 py-3 rounded-xl text-lg font-semibold  transition-all shadow-md  hover:translate-y-[-2px] duration-400 ease-in hover:bg-yellow-600">
            Get Started
          </button>
        </Link>
      </div>
      {/* Right Animation or Image */}
      <div className="">
        {/* Uncomment one of these depending on what you're using */}
        {/* <Lottie animationData={welcomeAnim} loop={true} /> */}
        <img src={welcomeChar} alt="" className="" />
      </div>
    </section>
  );
}

export default HeroSection;
