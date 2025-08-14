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
} from "react-icons/fa";
import { FaShop } from "react-icons/fa6";

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
    { label: "Lessons", icon: <FaBook />, to: "/lessons" },
    { label: "Flashcards", icon: <FaBrain />, to: "/flashcards" },
    { label: "Shop", icon: <FaShop />, to: "/lessons/shop" },
    { label: "Settings", icon: <FaCog />, to: "/settings" },
    {},
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
      <div className="hidden lg:flex lg:flex-col bg-amber text-white w-60 min-h-screen p-6 fixed">
        <h1 className="text-2xl font-bold mb-6">LingoBud</h1>
        <ul className="space-y-6 text-lg">
          {navItems.map((item, i) => (
            <Link to={item.to}>
              <li
                key={i}
                className="flex items-center gap-3 p-3 cursor-pointer hover:text-yellow-100"
              >
                {item.icon} {item.label}
              </li>
            </Link>
          ))}
          <Link to={"/"}>
            <button onClick={logout} className="flex gap-2 items-center pl-4">
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
        <ul className="space-y-6 text-lg">
          {navItems.map((item, i) => (
            <Link to={item.to}>
              <li
                key={i}
                className="flex items-center gap-3 p-3 cursor-pointer hover:text-yellow-100"
              >
                {item.icon} {item.label}
              </li>
            </Link>
          ))}
          <Link to={"/"}>
            <button onClick={logout} className="flex gap-2 items-center pl-4">
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
