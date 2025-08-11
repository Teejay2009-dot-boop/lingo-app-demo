// import React, { use } from "react";
// import { useState, useEffect } from "react";
// import { db } from "./config/firebase";
// import { collection, getDocs } from "firebase/firestore";

// const TestFetch = () => {
//   const [users, setUsers] = useState([]);

//   const UsersList = collection(db, "Users");

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const data = await getDocs(UsersList);
//         console.log(data);
//       } catch (error) {
//         console.error("Error fetching users: ", error);
//       }
//     };

//     fetchUsers();
//   }, []);
//   return <div></div>;
// };

// export default TestFetch;
