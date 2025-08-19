import React from "react";
import Lottie from "lottie-react";

export const Features = ({ title, desc, animation, reverse = false }) => {
  return (
    <section data-aos="fade-up" data-aos-duration="2000"
      className={`flex flex-col ${
        reverse ? "md:flex-row-reverse" : "md:flex-row"
      } items-center justify-between gap-10 py-16 px-6 md:px-20`}
    >
      <div>
        <Lottie animationData={animation} loop={true} />
      </div>
      <div className="text-xl md:text-2xl lg:text-3xl text-start">
        <h2 className="text-3xl font-bold py-3">{title}</h2>
        <p className="text-xl">{desc}</p>
      </div>
    </section>
  );
};
