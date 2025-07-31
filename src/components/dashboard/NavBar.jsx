import React from "react";
import { FaBell } from "react-icons/fa";
import users from "../../data/user";

const NavBar = () => {
  return (
    <div className="hidden lg:block bg-gray-50">
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
  );
};

export default NavBar;
