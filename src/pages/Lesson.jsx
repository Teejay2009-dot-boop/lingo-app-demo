import React from "react";
import { NavBar } from "../components/NavBar";
import background from "../assets/Lesson-Night.jpg";
import data from "../data/lesson.json";
import island from "../assets/Rockremovebg-preview.png";
import users from "../data/user";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { Link } from "react-router-dom";
import mascot from "../assets/IMG-20250724-WA0115-removebg-preview.png";
import { Navigate } from "react-router-dom";
import {
  FaBell,
  FaCog,
  FaHeart,
  FaWallet,
  FaArrowCircleLeft,
  FaRobot,
  FaShopify,
  FaGamepad,
} from "react-icons/fa";

export const Lesson = () => {
  return (
    <>
      <div className=" bg-cover bg-center lesson-container">
        {/* Centered Content Goes Here */}
        <div className="text-amber flex fixed top-0 justify-between  p-3 w-full items-center text-2xl">
          <Link to={"/dashboard"}>
            <FaArrowCircleLeft />
          </Link>

          <FaCog />
          <div className="">
            <Link to={"/lessons/section"}>
              <button className=" bg-gray-900 border-amber border rounded-3xl  py-2 px-4">
                MoonStone
              </button>
            </Link>
          </div>
          <FaWallet />
          <FaBell />
          {/* <div className="gap-6 hidden lg:block ">
            <div>{users.streak}
              🔥
            </div>
            <div >
              {data.lesson_1.base_xp} <span className="text-sm text-amber">XP</span>
            </div>
            <div>
              {users.progress} <span className="text-sm text-amber">Coins</span>
            </div>
          </div> */}
        </div>

        <div className="flex items-center justify-center min-h-screen px-4">
          <img
            src={island}
            alt="island"
            className="w-full max-w-md object-contain"
          />
        </div>
        <div className=" fixed top-1/2 transform -translate-y-1/2 left-0 border border-amber bg-gray-900 flex flex-col py-3 h-64 px-2 text-3xl rounded-full ml-2 lg:ml-6 justify-around text-amber">
          <Link to={"/chat"}>
            <FaRobot className="cursor-pointer hover:text-white tranition ease-in duration-300" />
          </Link>
          <Link to={"/lessons/shop"}>
            <FaShopify className="cursor-pointer hover:text-white tranition ease-in duration-300" />
          </Link>
          <FaGamepad className="cursor-pointer hover:text-white tranition ease-in duration-300" />
        </div>
        <div className=" text-amber fixed bottom-0 right-0 items-start">
          <Link to={"/chat"}>
            <button className=" ease-in duration-100 hover:scale-110 transition-transform">
              <img src={mascot} style={{ width: "10rem" }} alt="" />
            </button>
          </Link>
        </div>
      </div>
    </>
  );
};
