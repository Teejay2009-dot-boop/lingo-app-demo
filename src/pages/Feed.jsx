import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc,
  where,
  getDocs,
} from "firebase/firestore";
import { db, auth } from "../firebase/config/firebase";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { Link } from "react-router-dom";
import {
  FaChartBar,
  FaHome,
  FaKeyboard,
  FaProcedures,
  FaTree,
} from "react-icons/fa";

const NotificationFeed = () => {
  const [notifications, setNotifications] = useState([]);

  // Function to mark a notification as read
  const markAsRead = async (notificationId) => {
    try {
      const notificationRef = doc(
        db,
        `users/${auth.currentUser.uid}/notifications`,
        notificationId
      );
      await updateDoc(notificationRef, {
        read: true,
        readAt: new Date(),
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Function to mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const notificationsRef = collection(
        db,
        `users/${auth.currentUser.uid}/notifications`
      );
      const unreadQuery = query(notificationsRef, where("read", "==", false));
      const snapshot = await getDocs(unreadQuery);

      const updatePromises = snapshot.docs.map((doc) =>
        updateDoc(doc.ref, {
          read: true,
          readAt: new Date(),
        })
      );

      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  useEffect(() => {
    if (!auth.currentUser) return;

    const notificationsRef = collection(
      db,
      `users/${auth.currentUser.uid}/notifications`
    );

    const q = query(notificationsRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(data);

      // Automatically mark all as read when page loads
      markAllAsRead();
    });

    return () => unsubscribe();
  }, []);

  // Separate read and unread notifications for styling
  const unreadNotifications = notifications.filter((notif) => !notif.read);
  const readNotifications = notifications.filter((notif) => notif.read);

  return (
    <>
      <DashboardLayout>
        <div className="bg-white rounded-xl pt-6 w-full max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-5xl pl-6 pb-10 lg:pb-5">
          <div className="flex justify-between items-center mb-4 pt-16 lg:pt-0">
            <h2 className="text-2xl font-bold text-gray-800">
              📢 Notifications
            </h2>
            {unreadNotifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="bg-amber-500 text-white px-3 py-1 rounded text-sm hover:bg-amber-600"
              >
                Mark all as read
              </button>
            )}
          </div>

          {notifications.length > 0 ? (
            <ul className="space-y-5 mb-16">
              {/* Show unread notifications first */}
              {unreadNotifications.map((notif) => (
                <li
                  key={notif.id}
                  className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4 flex items-start gap-3 hover:shadow-md transition cursor-pointer"
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className="text-amber-500 text-2xl">🔔</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {notif.title || "Notification"}
                      <span className="ml-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                        New
                      </span>
                    </p>
                    <p className="text-gray-600 text-sm">
                      {notif.message || "No message provided"}
                    </p>
                    {notif.timestamp?.toDate && (
                      <p className="text-xs text-gray-400 mt-1">
                        {notif.timestamp.toDate().toLocaleString()}
                      </p>
                    )}
                  </div>
                </li>
              ))}

              {/* Show read notifications */}
              {readNotifications.map((notif) => (
                <li
                  key={notif.id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-start gap-3 opacity-75"
                >
                  <div className="text-gray-400 text-2xl">🔔</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-600">
                      {notif.title || "Notification"}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {notif.message || "No message provided"}
                    </p>
                    {notif.timestamp?.toDate && (
                      <p className="text-xs text-gray-400 mt-1">
                        {notif.timestamp.toDate().toLocaleString()}
                        {notif.readAt?.toDate &&
                          ` • Read ${notif.readAt.toDate().toLocaleString()}`}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-10 text-gray-500">
              <span className="text-4xl block mb-3">📭</span>
              <p>No notifications yet</p>
            </div>
          )}
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
          <Link
            to={"/notifications"}
            className="flex flex-col items-center pt-3"
          >
            <FaTree className="text-2xl" />
            <p className="text-amber text-sm">Feed</p>
          </Link>

          <Link to={"/profile"} className="flex flex-col items-center pt-3">
            <FaProcedures className="text-2xl" />
            <p className="text-amber text-sm">Profile</p>
          </Link>
        </div>
      </DashboardLayout>
    </>
  );
};

export default NotificationFeed;
