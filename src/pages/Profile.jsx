import { auth, db } from "../firebase/config/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import profilePic from "../assets/IMG-20250724-WA0123.jpg"

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubscribe = onSnapshot(
      doc(db, "users", auth.currentUser.uid),
      (doc) => {
        if (doc.exists()) setUser(doc.data());
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto relative">
        <div className="profile-background h-48 relative rounded-b-3xl">
          {/* <img
            src={user?.photoURL || "/default-avatar.png"}
            className="w-24 h-24 absolute bottom-0 left-[150px] rounded-full border-2 border-amber"
            alt="Profile"
          /> */}
        </div>
        <img
            src={user?.photoURL || profilePic}
            className="w-32 h-32 absolute top-28 left-[130px] sm:left-[130px] md:left-[320px] lg:left-[365px] rounded-full border-2 border-amber"
            alt="Profile"
          />
        <div className="flex items-center gap-6 mb-8">
          
          <div>
            <h1 className="text-3xl font-bold">{user?.username}</h1>
            <p className="text-amber">{user?.title}</p>
          </div>
        </div>


        <div className="text-3xl font-bold text-center pt-7 pb-2">Hey {user?.username || 'Joshua'}</div>

        <div className="text-center text-gray-700 font-semibold">🔶 Topaz</div>

        <div className="flex justify-around">
          <div className="border flex flex-col gap-12 py-2 px-8 md:py-3 md:px-16 rounded-2xl border-amber justify-center my-4">
            <p className="text-xl text-amber font-semibold">Level</p>
            <p className="text-center md:text-xl">{user?.level || '15'}</p>
          </div>
          <div className="border flex w-28 flex-col gap-12 py-2 px-8 rounded-2xl border-amber justify-center my-4 md:py-3 md:w-40 text-center">
            <p className="mx-auto text-4xl ">🔥</p>
            <p className="text-center md:text-xl">{user?.level || '15'}</p>
          </div>
          <div className="border flex flex-col gap-12 py-2 px-8 rounded-2xl border-amber justify-center my-4 md:py-3 md:px-16 ">
            <p className="text-xl text-amber font-semibold">XP</p>
            <p className="text-center md:text-xl">{user?.xp || '800'}</p>
          </div>
        </div>

        <div className="text-2xl font-semibold px-8 py-5">Badges</div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">Stats</h2>
            <div className="space-y-3">
              <p>
                <span className="font-medium">Level:</span> {user?.level}21
              </p>
              <p>
                <span className="font-medium">Rank: </span> {user?.level}Ruby
                Master
              </p>
              <p>
                <span className="font-medium">Total XP:</span> {user?.xp}
              </p>
              <p>
                <span className="font-medium">Streak:</span>{" "}
                {user?.current_streak} 10 days
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">Achievements</h2>
            {/* Add badges/achievements here */}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
