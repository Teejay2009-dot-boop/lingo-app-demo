import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Hero from "../components/Welcome/Hero";
import { NavBar } from "../components/Welcome/NavBar";
import { Features } from "../components/Welcome/Features"; // Changed to named import
import { HowItWorks } from "../components/Welcome/HowItWorks";
import FlashcardSlider from "../components/Welcome/FlashcardSlider";
import Pricing from "../components/Welcome/Pricing";
import badgeAnim from '../animations/Gamified.json'
import kidAnim from '../animations/Mascot.json'
import voiceAnim from '../animations/TalkingChar.json'
import schoolAnim from '../animations/Education.json'
import FAQ from "../components/Welcome/FAQ";
import Footer from "../components/Welcome/Footer";
import Testimonials from "../components/Testimonials";
import CalltoAction from "../components/Welcome/CalltoAction";
// import WelcomeHeader from "../components/Welcome/WelcomeHeader"; // Remove WelcomeHeader import

const Welcome = () => {
  console.log("Welcome component rendered."); // Added console log
  return (
    <div>
      <NavBar /> {/* Render NavBar here */}
      <Hero />
      <Features />
      <HowItWorks />
      <div data-aos="fade-down" data-aos-duration="2500" className="text-4xl lg:text-5xl font-bold text-amber my-10 text-center">
          Why Lingo-Bud?
        </div>
        <Features
          title="Gamified Learning"
          desc="Earn XP, keep streaks, and unlock fun badges while learning Yoruba in a playful way"
          animation={badgeAnim}
        />
        <Features
          title="Kid-Friendly Design"
          desc="Lingo-Bud is built with colorful graphics and friendly characters tokeep young learners excited and focused"
          animation={kidAnim}
          reverse
        />
        <Features
          title="Visual & Audio Learning"
          desc="Hear real Yoruba pronounciations and see fun illustrations to boost memory and speaking skills"
          animation={voiceAnim}
        />
        <Features
          title="Built for schools"
          desc="Use Lingo-Bud in class or at home! Perfect for educators and learners alike with progress tracking"
          animation={schoolAnim}
          reverse
        />
      <FlashcardSlider />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CalltoAction />
      <Footer />
    </div>
  );
};

export default Welcome;
