import React from "react";
import Lottie from "lottie-react";
import users from "../../data/user";
import welcomeAnim from "../../animations/Dashboard.json"; // Replace with your actual file

const WelcomeBanner = ({}) => {
  return (
    <>
      <div className="flex">
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-amber font-fredoka">
              👋 Welcome back, {users.name}!
            </h2>
            <p className="text-gray-700 mt-2 text-lg">
              You're on a{" "}
              <span className="text-amber font-semibold">
                {users.streak}-day streak
              </span>
              ! Keep it up! 🔥
            </p>
          </div>

          <div className="w-32 md:w-40 mt-4 md:mt-0">
            <Lottie animationData={welcomeAnim} loop={true} />
          </div>
        </div>
        div.text-3xl
      </div>
    </>
  );
};

export default WelcomeBanner;
