import { NavBar } from "../components/NavBar";

import { useState, useEffect } from "react";
import { db } from "../firebase/config/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { div } from "framer-motion/client";

export const Progress = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setnewUser] = useState("");
  const [newXp, setnewXp] = useState(0);
  const [newCoin, setnewCoin] = useState(0);

  const userCollectionRef = collection(db, "Users");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getDocs(userCollectionRef);
        const filteredData = data.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        console.log(filteredData);

        setUsers(filteredData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();
  }, []);

  const createUser = async () => {
    addDoc(userCollectionRef, {
      Username: newUser,
      xp: newXp,
      coins: newCoin,
    }); 
  };
  return (
    <>
      <NavBar />

      <div className="flex flex-col justify-center items-center p-16 text-amber bg-gray-400 gap-10 font-semibold">
        <input
          type="text"
          placeholder="username"
          name=""
          id=""
          className="rounded-full p-1"
          onChange={(e) => {
            setnewUser(e.target.value);
          }}
        />
        <input
          type="number"
          placeholder="Xp"
          name=""
          id=""
          className="rounded-full p-1"
          onChange={(e) => {
            setnewXp(Number(e.target.value));
          }}
        />
        <input
          type="text"
          placeholder="coins"
          name=""
          id=""
          className="rounded-full p-1"
          onChange={(e) => {
            setnewXp(Number(e.target.value));
          }}
        />
        <button
          onClick={createUser()}
          className="bg-amber text-white px-9 shadow-lg hover:scale-105 transition-transform duration-300 ease-in py-2 rounded-full"
        >
          Create User
        </button>
      </div>

      {users.map((user) => (
        <div className="text-xl items-center flex flex-col">
          <h1>Title: {user.Username}</h1>
          <p className="font-bold">Xp: {user.xp}</p>
          {user.Coins}
        </div>
      ))}
    </>
  );
};
