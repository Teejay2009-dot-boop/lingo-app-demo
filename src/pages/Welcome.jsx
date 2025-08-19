import { React, useRef, useEffect, useState } from "react";
import { NavBar } from "../components/Welcome/NavBar";
import HeroSection from "../components/Welcome/Hero";
import { HowItWorks } from "../components/Welcome/HowItWorks";
import { Features } from "../components/Welcome/Features";
import badgeAnim from "../animations/Gamified.json";
import kidAnim from "../animations/Mascot.json";
import voiceAnim from "../animations/TalkingChar.json";
import schoolAnim from "../animations/Education.json";
import FlashcardSlider from "../components/Welcome/FlashcardSlider";
import Pricing from "../components/Welcome/Pricing";
import Testimonials from "../components/Testimonials";
import FAQ from "../components/Welcome/FAQ";
import CallToAction from "../components/Welcome/CalltoAction";
import Footer from "../components/Welcome/Footer";
import BackToTopButton from "../components/Welcome/BackToTopButton";

const Welcome = ({onNavBarClick}) => {
  const navRef = useRef(null)
  const heroRef = useRef(null);
  const aboutRef = useRef(null);
  const pricingRef = useRef(null);

  

  return (
    <>
  <BackToTopButton/>
      <NavBar
        onHeroClick={() =>
          heroRef.current.scrollIntoView({
            behaviour: "smooth",
          })
        }
        onNavBarClick={() => navRef.current.scrollIntoView({behaviour: 'smooth'})}
        onAboutClick={() =>
          aboutRef.current.scrollIntoView({ behaviour: "smooth" })
        }
        onPricingClick={() =>
          pricingRef.current.scrollIntoView({ behaviour: "smooth" })
        }
      />
      <div ref={heroRef}>
        <HeroSection />
      </div>
      <div ref={aboutRef}>
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
      </div>

      <FlashcardSlider />
      <div ref={pricingRef}>
        <Pricing />
      </div>
      <Testimonials />
      <FAQ />
      <CallToAction />
      <Footer />
    </>
  );
};

export default Welcome;
