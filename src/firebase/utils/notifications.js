import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  where,
  deleteDoc,
} from "firebase/firestore";

const MAX_NOTIFICATIONS = 100;
const WARNING_THRESHOLD = 90;

export const addNotification = async (uid, notificationData) => {
  if (!uid) {
    console.error("User ID is required to add a notification.");
    return;
  }

  const notificationsRef = collection(db, `users/${uid}/notifications`);
  const q = query(
    notificationsRef,
    orderBy("timestamp", "desc"),
    limit(MAX_NOTIFICATIONS)
  );
  const snapshot = await getDocs(q);

  if (snapshot.docs.length >= MAX_NOTIFICATIONS) {
    console.warn("Notification inbox is full. Cannot add new notification.");
    // Optionally add a system notification or handle this case as needed
    return;
  }

  if (snapshot.docs.length === WARNING_THRESHOLD) {
    // Add a system notification for almost full inbox
    await addDoc(notificationsRef, {
      message:
        "⚠️ Your notification inbox is almost full. Please delete older notifications.",
      type: "system",
      timestamp: serverTimestamp(),
      read: false,
    });
  }

  await addDoc(notificationsRef, {
    ...notificationData,
    timestamp: serverTimestamp(),
    read: false,
  });
};
