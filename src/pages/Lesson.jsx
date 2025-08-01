import React from "react";
import { NavBar } from "../components/NavBar";
import background from "../assets/Lesson-Night.jpg";
import data from "../data/lesson.json";
import island from "../assets/Rockremovebg-preview.png";
import users from "../data/user";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { Link } from "react-router-dom";
import { FaBell, FaCog, FaHeart, FaWallet, FaArrowCircleLeft } from "react-icons/fa";

export const Lesson = () => {
  return (
    <>
      <div className="min-h-screen bg-cover bg-center lesson-container">
        {/* Centered Content Goes Here */}
        
        <div className="text-amber flex fixed top-0 justify-between  p-3 w-full items-center text-2xl">
          <Link to={'/dashboard'}>
          <FaArrowCircleLeft/></Link>
       
          <FaCog />
          <div className="">
            <Link to={"/lessons/section"}>
             <button className=" bg-gray-900 border-amber border rounded-3xl  py-2 px-4">MoonStone</button></Link>
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
        <div className="flex items-center justify-center min-h-screen">
          <img src={island} alt="" />
        </div>
      </div>
    </>
  );
};
