import { motion } from "framer-motion";
import React from "react";

import { Link } from "react-router-dom";

const CallToAction = () => {
  return (
    <section className="bg-white py-16 px-6 text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-4 font-fredoka text-amber">
        Ready to Start Learning Yoruba?
      </h2>
      <p className="text-gray-700 text-lg mb-6">
        Build your language skills with fun lessons, streaks, and flashcards.
      </p>
      <Link to="/login">
        <motion.button initial={{scale:0}} animate={{scale:1.2}} transition={{duration:Infinity}} data-aos="fade-up" data-aos-duration="2000" className="bg-amber text-white font-bold py-3 px-6 rounded-xl text-lg shadow hover:bg-[#d5a900] transition">
          Get Started
        </motion.button>
      </Link>
    </section>
  );
};

export default CallToAction;
