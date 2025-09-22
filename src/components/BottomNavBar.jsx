import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaUser, FaChartBar, FaBell } from "react-icons/fa";

const BottomNavBar = () => {
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", icon: <FaHome />, to: "/dashboard" },
    { label: "Profile", icon: <FaUser />, to: "/profile" },
    { label: "Leaderboard", icon: <FaChartBar />, to: "/leaderboard" },
    { label: "Feed", icon: <FaBell />, to: "/notifications" },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-black text-white lg:hidden z-50 shadow-lg">
      <nav className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className={`flex flex-col items-center justify-center text-xs font-medium w-1/4 h-full
              ${
                location.pathname === item.to
                  ? "text-amber-500"
                  : "text-gray-400"
              }
              hover:text-amber-300 transition-colors duration-200`}
          >
            <div className="text-xl mb-1">{item.icon}</div>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default BottomNavBar;

