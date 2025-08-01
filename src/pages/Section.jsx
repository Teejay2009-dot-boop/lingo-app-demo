import React from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";

import { FaBell } from "react-icons/fa";
import users from "../data/user";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";

const Section = () => {
  const { sectionId } = useParams();
  return (
    <DashboardLayout>
      <div className="hidden lg:block bg-gray-50 pt-3 pb-3">
        <div className="">
          <div className="flex gap-10 justify-end mr-9">
            <FaBell className="text-3xl cursor-pointer pt-1 text-amber" />
            <div className="text-xl flex gap-3">
              <div>👩‍🦰</div>
              <div>{users.name}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 grid-rows-2  p-4 gap-7">
        <Link to={`/lessons/section/learn`}>
          <div className="section-one border flex justify-center cursor-pointer items-center rounded-3xl shadow-lg translate-y-0.5 hover:translate-y-0 transition duration-300 ease-in ">
            <p className="text-white font-bold text-6xl py-20 lg:py-24">
              Lessons
            </p>
          </div>
        </Link>
        <div className="section-one border flex justify-center cursor-pointer items-center rounded-3xl shadow-lg translate-y-0.5 hover:translate-y-0 transition duration-300 ease-in">
          <p className="text-white font-bold text-6xl py-20">Practice</p>
        </div>
        <div className="section-one border flex justify-center cursor-pointer items-center rounded-3xl shadow-lg translate-y-0.5 hover:translate-y-0 transition duration-300 ease-in">
          <p className="text-white font-bold text-6xl py-20">Challenge</p>
        </div>
        <div className="section-one border flex justify-center cursor-pointer items-center rounded-3xl shadow-lg translate-y-0.5 hover:translate-y-0 transition duration-300 ease-in py-26 px-18">
          <p className="text-white font-bold text-6xl py-20 lg:py-24">Quiz</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Section;
