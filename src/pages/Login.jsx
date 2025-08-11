import React, { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, updateDoc, getDoc, increment } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase/config/firebase";
import { useNavigate } from "react-router-dom";
import { NavBar } from "../components/NavBar";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) navigate("/dashboard");
    });
    return unsubscribe;
  }, [navigate]);

  const updateStreak = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    const today = new Date();
    const todayStr = today.toDateString();

    if (snap.exists()) {
      const data = snap.data();
      const lastLogin = data.last_login_date
        ? new Date(data.last_login_date)
        : null;

      if (!lastLogin) {
        await updateDoc(userRef, {
          streak_days: 0,
          last_login_date: todayStr,
        });
      } else {
        const diffDays = (today - lastLogin) / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
          await updateDoc(userRef, {
            streak_days: increment(1),
            last_login_date: todayStr,
          });
        } else if (diffDays > 1) {
          await updateDoc(userRef, {
            streak_days: 0,
            last_login_date: todayStr,
          });
        }
      }
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      await updateStreak();
    } catch (error) {
      console.error("Error during Google sign-in:", error);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        await updateStreak();
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        await setDoc(doc(db, "users", userCredential.user.uid), {
          email,
          username: name,
          xp: 0,
          coins: 0,
          lives: 5,
          max_lives: 5,
          streak_days: 0,
          streak_freezes: 0,
          xp_to_next_level: 100,
          total_lessons: 0,
          completed_lessons: [],
          title: "New Learner",
          createdAt: new Date(),
          last_login_date: new Date().toDateString(),
        });

        await sendEmailVerification(userCredential.user);
        await updateProfile(userCredential.user, { displayName: name });

        alert("Account created! Please verify your email.");
      }
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    }
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen grid bg-gray-100">
        <div className="flex items-center justify-center p-8 h-screen">
          <div className="w-full max-w-md">
            <div className="flex justify-center mb-6 space-x-4">
              <button
                onClick={() => setIsLogin(true)}
                className={`px-4 py-2 rounded-full font-semibold ${
                  isLogin
                    ? "bg-amber-500 text-amber"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`px-4 py-2 rounded-full font-semibold ${
                  !isLogin
                    ? "bg-amber-500 text-amber"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Signup
              </button>
            </div>

            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}

            <div className="relative h-[400px] overflow-hidden">
              {/* Login Form */}
              <div
                className={`absolute w-full transition-transform duration-300 ${
                  isLogin ? "translate-x-0" : "-translate-x-full"
                }`}
              >
                <form onSubmit={handleAuth} className="space-y-4">
                  <h2 className="text-2xl font-bold text-center mb-4 py-3">
                    Welcome Back!
                  </h2>
                  <div className="flex flex-col gap-7">
                    <input
                      type="email"
                      placeholder="Email"
                      className="w-full border px-4 py-3 rounded-full focus:ring-2 focus:ring-amber-500"
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      className="w-full border px-4 py-3 rounded-full focus:ring-2 focus:ring-amber-500"
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      onClick={signInWithGoogle}
                      type="button"
                      className="py-3 mx-auto bg-amber w-full rounded-full font-semibold text-white"
                    >
                      Sign in with Google
                    </button>
                    <button
                      type="submit"
                      className="w-full bg-gray-200 text-amber py-3 rounded-full font-semibold hover:bg-amber hover:text-white"
                    >
                      Log In
                    </button>
                  </div>
                </form>
              </div>

              {/* Signup Form */}
              <div
                className={`absolute w-full transition-transform duration-300 ${
                  isLogin ? "translate-x-full" : "translate-x-0"
                }`}
              >
                <form onSubmit={handleAuth} className="flex flex-col gap-">
                  <h2 className="text-2xl font-bold text-center mb-4">
                    Get Started
                  </h2>
                  <div className="flex flex-col gap-7">
                    <input
                      type="text"
                      placeholder="Username"
                      className="w-full border px-4 py-3 rounded-full focus:ring-2 focus:ring-amber-500"
                      onChange={(e) => setName(e.target.value)}
                      required={!isLogin}
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      className="w-full border px-4 py-3 rounded-full focus:ring-2 focus:ring-amber-500"
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <input
                      type="password"
                      placeholder="Password (min 6 characters)"
                      minLength="6"
                      className="w-full border px-4 py-3 rounded-full focus:ring-2 focus:ring-amber-500"
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-4 pt-4">
                    <button
                      type="submit"
                      className="w-full bg-gray-200 text-amber py-3 rounded-full font-semibold hover:bg-amber hover:text-white"
                    >
                      Create Account
                    </button>
                    <button
                      onClick={signInWithGoogle}
                      type="button"
                      className="py-3 mx-auto text-white font-semibold bg-amber w-full rounded-full hover:bg-gray-200 hover:text-amber"
                    >
                      Sign up with Google
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
