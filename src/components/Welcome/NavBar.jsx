import React, { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { href, Link } from "react-router-dom";

export const NavBar = ({onHeroClick, onPricingClick, onAboutClick}) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  
  return (
    <div className="relative z-50 top-0 fixed ">
      {/* Top Navbar */}
      <div className="bg-amber  text-white flex justify-between items-center shadow-lg px-4 py-3">
        <div className="font-bold font-fredoka text-3xl">LingoBud</div>

        <div className="hidden md:flex items-center gap-4">
          <ul className="flex items-center gap-7">
            <li className="text-lg sliding-underline">
              <button onClick={onHeroClick}>Home</button>
            </li>
            <li className="text-lg  sliding-underline">
              <button onClick={onAboutClick}>About</button>
            </li>
            <li className="text-lg sliding-underline">
              <button onClick={onPricingClick}>Pricing</button>
            </li>
          </ul>
          <Link to="/login">
            <button className="px-4 py-1 text-lg bg-white  hover:translate-y-[-2px] transition-transform text-amber font-semibold rounded-lg hover:bg-yellow-100  duration-300 ease-in">
              Login / SignUp
            </button>
          </Link>
          {/* <Link to="/login">
            <button className="px-4 hover:translate-y-[-2px] transition-transform py-1 text-lg bg-white text-amber font-semibold rounded-lg hover:bg-yellow-100  duration-300 ease-in">
              Sign Up
            </button>
          </Link> */}
        </div>

        <div
          onClick={toggleMenu}
          className="block md:hidden text-white text-3xl"
        >
          {isOpen ? (
            <FaTimes aria-label="Close menu" />
          ) : (
            <FaBars aria-label="Open menu" />
          )}
        </div>
      </div>

      {/* Sidebar Mobile Menu */}
      <div
        className={`fixed top-0 left-0 h-screen w-[70%] bg-white text-amber shadow-lg z-40 transform transition-transform duration-300 ease-in ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 text-3xl font-bold font-fredoka border-b">
          LingoBud
        </div>
        <ul className="flex flex-col mt-6">
          <li onClick={closeMenu} className="border-b px-4 py-3 text-underline">
            <p className="text-xl">
              <button onClick={onHeroClick}>Home</button>
            </p>
          </li>
          <li onClick={closeMenu} className="border-b px-4 py-3 text-underline">
            <p className="text-xl cursor-pointer">
              <button onClick={onAboutClick}>About</button>
            </p>
          </li>
          <li onClick={closeMenu} className="border-b px-4 py-3 text-underline">
          <p className="text-xl cursor-pointer">
              <button onClick={onPricingClick}>Pricing</button>
            </p>            
          </li>
          <li onClick={closeMenu} className="px-4 py-5">
            <Link to="/login">
              <button className="w-full bg-amber text-white py-2 rounded-lg text-lg font-semibold shadow hover:translate-y-[-2px] transition-all duration-300 ease-in">
                Login / Sign Up
              </button>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};
