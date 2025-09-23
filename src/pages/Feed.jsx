import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase/config/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  updateDoc,
  doc,
  writeBatch,
  where,
  serverTimestamp,
} from "firebase/firestore";
import {FaCoins,
  FaFire,
  FaChartBar,
  FaProcedures,
  FaKeyboard,
  FaTree,
  FaHome,} from "react-icons/fa";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import NavBar from "../components/dashboard/NavBar";
import { useNavigate } from "react-router-dom";
import NotificationFeed from "../components/NotificationFeed";

const Feed = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/login");
      return;
    }

    const uid = auth.currentUser.uid;
    const notificationsRef = collection(db, `users/${uid}/notifications`);
    const q = query(notificationsRef, orderBy("timestamp", "desc"), limit(100));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const fetchedNotifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(fetchedNotifications);
      setLoading(false);

      // Mark all fetched notifications as read
      const batch = writeBatch(db);
      fetchedNotifications.forEach((notification) => {
        if (!notification.read) {
          const notificationDocRef = doc(notificationsRef, notification.id);
          batch.update(notificationDocRef, { read: true });
        }
      });
      await batch.commit();
    });

    return unsubscribe;
  }, [navigate]);

  const handleDeleteOldNotifications = async () => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const notificationsRef = collection(db, `users/${uid}/notifications`);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const q = query(notificationsRef, where("timestamp", "<", thirtyDaysAgo));
    const snapshot = await getDocs(q);

    const batch = writeBatch(db);
    snapshot.docs.forEach((d) => {
      batch.delete(doc(notificationsRef, d.id));
    });
    await batch.commit();
  };

  const handleClearAllNotifications = async () => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const notificationsRef = collection(db, `users/${uid}/notifications`);

    const q = query(notificationsRef, limit(100)); // Fetch up to 100 to delete
    const snapshot = await getDocs(q);

    const batch = writeBatch(db);
    snapshot.docs.forEach((d) => {
      batch.delete(doc(notificationsRef, d.id));
    });
    await batch.commit();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <NavBar />
        <div className="p-8 text-center flex items-center justify-center text-xl h-screen">
          Loading notifications...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <NavBar />
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Your Notifications
        </h1>
        <div className="flex space-x-4 mb-6">
          <button
            onClick={handleDeleteOldNotifications}
            className="bg-red-500 text-white py-2 px-4 rounded-full shadow hover:bg-red-600 transition duration-300"
          >
            Delete Old Notifications
          </button>
          <button
            onClick={handleClearAllNotifications}
            className="bg-gray-500 text-white py-2 px-4 rounded-full shadow hover:bg-gray-600 transition duration-300"
          >
            Clear All
          </button>
        </div>
        <NotificationFeed notifications={notifications} />
      </div>

      <div className="fixed bottom-0 left-0 w-full h-16 flex items-center text-amber justify-around bg-gray-100 lg:hidden">
        <Link to={"/lessons"} className="flex flex-col items-center pt-3">
          <FaHome className="text-2xl" />
          <p className="text-amber text-sm">Home</p>
        </Link>
        <Link to={"/leaderboard"} className="flex flex-col items-center pt-3">
          <FaChartBar className="text-2xl" />
          <p className="text-amber text-sm">Ranking</p>
        </Link>
        <Link to={"/dashboard"} className="flex flex-col items-center pt-3">
          <FaKeyboard className="text-2xl " />
           <p className="text-amber text-sm">Dashboard</p>
        </Link>
        <Link to={"/notifications"} className="flex flex-col items-center pt-3">
          <FaTree className="text-2xl" />
          <p className="text-amber text-sm">Feed</p>
        </Link>

        <Link to={"/profile"} className="flex flex-col items-center pt-3">
          <FaProcedures className="text-2xl" />
          <p className="text-amber text-sm">Profile</p>
        </Link>
      </div>
    </DashboardLayout>
  );
};

export default Feed;
