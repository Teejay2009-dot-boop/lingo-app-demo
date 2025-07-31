import React from "react";

const Testimonials = () => {
  const reviews = [
    {
      name: "Ayo A.",
      comment:
        "LingoBud made learning Yoruba so fun! I use it every day in school.",
    },
    {
      name: "Miss Chiamaka (Teacher)",
      comment:
        "My students love the characters and flashcards. Very interactive!",
    },
    {
      name: "Tobi",
      comment:
        "The games and progress tracking keep me motivated to learn daily.",
    },
  ];

  return (
    <section className="bg-white py-16 px-4">
      <h2 className="text-3xl font-bold text-center text-amber font-fredoka mb-10">
        What People Are Saying
      </h2>
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        {reviews.map((review, idx) => (
          <div
            key={idx}
            className="bg-[#FFFBEA] p-6 py-12 rounded-xl shadow-md text-center"
          >
            <p className="text-lg italic mb-4">"{review.comment}"</p>
            <h4 className="font-bold text-amber">{review.name}</h4>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
