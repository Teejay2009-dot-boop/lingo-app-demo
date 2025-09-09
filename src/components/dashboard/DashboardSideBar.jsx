import React, { useState } from "react";
import { auth } from "../../firebase/config/firebase";
import { signOut } from "firebase/auth";
import { Link, useLocation } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaHome,
  FaBook,
  FaBrain,
  FaCog,
  FaSignOutAlt,
  FaBell,
  FaDotCircle,
} from "react-icons/fa";
import { FaShop } from "react-icons/fa6";
import { Dropdown } from "./DropDown";
import { label } from "framer-motion/client";

const DashboardSidebar = () => {
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", icon: <FaHome />, to: "/dashboard" },
    { label: "Learn", icon: <FaBook />, to: "/lessons" },
    // { label: "Flashcards", icon: <FaBrain />, to: "/flashcards" },
    { label: "Shop", icon: <FaShop />, to: "/lessons/shop" },
    { label: "Profile", icon: <FaCog />, to: "/profile" },
    { label: "Feed", icon: <FaBell />, to: "/notifications" },
  ];

  const location = useLocation();
  if (location.pathname === "/" || location.pathname === "/welcome") {
    return null;
  }

  return (
    <>
      {/* Hamburger for small screens */}
      <div className="lg:hidden flex justify-between bg-white p-3 shadow-md  fixed w-full z-50">
        <h1 className="text-amber text-2xl font-bold">Lingo-Bud</h1>
        <div className="flex gap-5 justify-between">
          <div className="text-xl">
            <FaBell className="text-3xl cursor-pointer pt-1 text-amber" />
          </div>
          <div>
            <FaBars
              className="text-3xl text-amber cursor-pointer"
              onClick={() => setIsOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Sidebar - always visible on large screens */}
      <div className="hidden lg:flex lg:flex-col bg-amber text-white w-60 min-h-screen px-6 fixed">
        <h1 className="text-2xl font-bold mb-2 mt-10 pl-3">LingoBud</h1>
        <ul className="text-lg py-10">
          {navItems.map((item, i) => (
            <Link to={item.to} key={i}>
              <li className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:text-yellow-100">
                {item.icon} {item.label}
              </li>
            </Link>
          ))}
          <div className="pl-3">
            <Dropdown />
          </div>
          <Link to={"/"}>
            <button
              onClick={logout}
              className="flex gap-2 py-4 items-center pl-4"
            >
              {" "}
              <FaSignOutAlt /> LogOut
            </button>
          </Link>
        </ul>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed top-0 left-0 w-[50%] h-screen bg-amber text-white p-6 z-50 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">LingoBud</h1>
          <FaTimes
            className="text-2xl cursor-pointer"
            onClick={() => setIsOpen(false)}
          />
        </div>
        <ul className=" text-lg">
          {navItems.map((item, i) => (
            <Link to={item.to} key={i}>
              <li className="flex items-center gap-1 px-3 py-2 cursor-pointer hover:text-yellow-100">
                {item.icon} {item.label}
              </li>
            </Link>
          ))}
          <div className="pl-3">
            <Dropdown />
          </div>
          <Link to={"/"}>
            <button
              onClick={logout}
              className="flex gap-2 items-center py-4 pl-3"
            >
              {" "}
              <FaSignOutAlt /> LogOut
            </button>
          </Link>
        </ul>
      </div>
    </>
  );
};

export default DashboardSidebar;
