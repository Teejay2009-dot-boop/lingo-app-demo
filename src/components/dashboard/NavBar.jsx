import React from "react";
import { FaBell } from "react-icons/fa";
import users from "../../data/user";
import { Link } from "react-router-dom";
import { useState,useEffect } from "react";
import Dashboard from "../../pages/Dashboard";

const NavBar = () => {
const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);


  return (
    <div className="hidden lg:block bg-gray-50">
      <div className="">
        <div className="flex gap-10 justify-end mr-9">
          <Link to="/notifications" className="relative">
              <FaBell className="text-3xl hover:translate-y-[-2px] transition-transform duration-500 cursor-pointer pt-1 text-amber" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadNotificationCount}
                </span>
              )}
            </Link>
          <div className="text-xl flex gap-3">
            <div>👩‍🦰</div>
            <div>{users.name}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
