import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Hero from "../components/Welcome/Hero";
import { NavBar } from "../components/Welcome/NavBar";
import { Features } from "../components/Welcome/Features"; // Changed to named import
import { HowItWorks } from "../components/Welcome/HowItWorks";
import FlashcardSlider from "../components/Welcome/FlashcardSlider";
import Pricing from "../components/Welcome/Pricing";
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
