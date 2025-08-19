import React from "react";
import Slider from "react-slick";
import { motion } from "framer-motion";

import sliderImg from "../../assets/IMG-20250724-WA0115-removebg-preview.png";
import sliderImgtwo from "../../assets/girlwithbg.jpg";
import sliderImgthree from "../../assets/IMG-20250724-WA0115.jpg";
import sliderImgfour from "../../assets/IMG-20250724-WA0123.jpg";

function FlashcardSlider() {
  const flashcards = [
    { image: sliderImg, english: "Apple", yoruba: "Àpù" },
    { image: sliderImgtwo, english: "Book", yoruba: "Ìwé" },
    { image: sliderImgthree, english: "Dog", yoruba: "Ajá" },
    { image: sliderImgfour, english: "Girl", yoruba: "Ọmọbìnrin" },
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    pauseOnHover: true,
  };

  const variants = {
    inital: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  };

  return (
    <section className="w-full bg-[#FFFDE7] py-16 px-2 overflow-hidden">
      <h2 className="text-3xl font-fredoka font-bold text-amber text-center mb-10">
        Learn a Yoruba Word
      </h2>

      <Slider {...settings}>
        {flashcards.map((card, index) => (
          <motion.div
            variants={variants}
            animate="animate"
            initial="initial"
            exit="exit"
            key={index}
            className="w-full flex justify-center"
          >
            <div className="bg-white rounded-xl shadow-xl p-10 w-full max-w-5xl flex flex-col md:flex-row items-center justify-center gap-10 mx-auto">
              <img
                src={card.image}
                alt={card.english}
                className="w-40 h-40 object-contain"
              />
              <div className="text-center md:text-left">
                <h3 className="text-3xl font-semibold mb-2">{card.english}</h3>
                <p className="text-4xl font-bold text-amber">{card.yoruba}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </Slider>
    </section>
  );
}

export default FlashcardSlider;
