import React, { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, setDoc, updateDoc, getDoc, increment } from "firebase/firestore";
import { auth, db } from "../firebase/config/firebase";
import { useNavigate } from "react-router-dom";
import { NavBar } from "../components/Welcome/NavBar";
import { defaultUser, LEVEL_CONFIG } from "../data/defaultUser"; // Import the new defaults

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Initialize Google provider
  const googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: "select_account", // Forces account selection
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) navigate("/dashboard");
    });
    return unsubscribe;
  }, [navigate]);

  // Updated streak system with level progression
  const updateStreakOnLogin = async (user) => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      const snap = await getDoc(userRef);
      if (!snap.exists()) return;

      const userData = snap.data();
      let lastActive = userData.last_active_date
        ? new Date(userData.last_active_date)
        : null;
      if (lastActive) lastActive.setHours(0, 0, 0, 0);

      let newStreak = userData.current_streak || 0;
      let streakChanged = false;

      if (!lastActive) {
        // First login
        newStreak = 1;
        streakChanged = true;
      } else {
        const diffDays = Math.floor(
          (today - lastActive) / (1000 * 60 * 60 * 24)
        );
        if (diffDays === 1) {
          newStreak += 1;
          streakChanged = true;
        } else if (diffDays > 1) {
          newStreak = 1;
          streakChanged = true;
        }
      }

      const updates = {
        last_active_date: today.toISOString(),
      };

      if (streakChanged) {
        updates.current_streak = newStreak;
        updates.streak_days = increment(
          newStreak > userData.current_streak ? 1 : -userData.current_streak
        );

        // Check for level up based on streak
        const currentLevel = LEVEL_CONFIG.find(
          (l) => l.level === userData.level
        );
        const nextLevel = LEVEL_CONFIG.find(
          (l) => l.level === userData.level + 1
        );

        if (
          nextLevel &&
          userData.xp >= nextLevel.xp_required &&
          newStreak >= nextLevel.streak_required
        ) {
          updates.level = nextLevel.level;
          updates.level_name = nextLevel.name;
          updates.title = nextLevel.title;
          updates.xp_to_next_level =
            LEVEL_CONFIG[nextLevel.level + 1]?.xp_required || 0;
        }
      }

      await updateDoc(userRef, updates);
    } catch (err) {
      console.error("Error updating streak:", err);
    }
  };

  // Initialize new user with level progression data
  const initializeNewUser = async (user, additionalData = {}) => {
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
      ...defaultUser,
      ...additionalData,
      email: user.email,
      username: additionalData.username || user.displayName || "New User",
      last_active_date: new Date().toISOString(),
      avatar: user.photoURL || defaultUser.avatar,
    });
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);

      // Check if user is new (first time sign-in)
      const isNewUser =
        result.user.metadata.creationTime ===
        result.user.metadata.lastSignInTime;

      if (isNewUser) {
        await initializeNewUser(result.user, {
          displayName: result.user.displayName || name,
        });
      }

      await updateStreakOnLogin(result.user);
    } catch (error) {
      console.error("Google auth error:", error);
      setError(getFriendlyAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  const getFriendlyAuthError = (error) => {
    switch (error.code) {
      case "auth/popup-closed-by-user":
        return "You closed the sign-in window";
      case "auth/account-exists-with-different-credential":
        return "Account already exists with different method";
      case "auth/cancelled-popup-request":
        return "Sign in was cancelled";
      default:
        return error.message.replace("Firebase: ", "");
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        await updateStreakOnLogin(auth.currentUser);
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        await initializeNewUser(userCredential.user, {
          username: name,
        });

        await sendEmailVerification(userCredential.user);
        await updateProfile(userCredential.user, { displayName: name });

        alert("Account created! Please verify your email.");
      }
    } catch (err) {
      setError(getFriendlyAuthError(err));
    } finally {
      setLoading(false);
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
                    ? "bg-amber-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`px-4 py-2 rounded-full font-semibold ${
                  !isLogin
                    ? "bg-amber-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Signup
              </button>
            </div>

            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-center">
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
                      disabled={loading}
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      className="w-full border px-4 py-3 rounded-full focus:ring-2 focus:ring-amber-500"
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <button
                      onClick={handleGoogleAuth}
                      type="button"
                      disabled={loading}
                      className="py-3 mx-auto bg-amber w-full rounded-full font-semibold text-white hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        "Processing..."
                      ) : (
                        <>
                          <img
                            src="https://www.google.com/favicon.ico"
                            alt="Google"
                            className="w-5 h-5"
                          />
                          Sign in with Google
                        </>
                      )}
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gray-200 text-amber py-3 rounded-full font-semibold hover:bg-amber hover:text-white disabled:opacity-50"
                    >
                      {loading ? "Loading..." : "Log In"}
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
                      disabled={loading}
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      className="w-full border px-4 py-3 rounded-full focus:ring-2 focus:ring-amber-500"
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <input
                      type="password"
                      placeholder="Password (min 6 characters)"
                      minLength="6"
                      className="w-full border px-4 py-3 rounded-full focus:ring-2 focus:ring-amber-500"
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="flex flex-col gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gray-200 text-amber py-3 rounded-full font-semibold hover:bg-amber hover:text-white disabled:opacity-50"
                    >
                      {loading ? "Creating account..." : "Create Account"}
                    </button>
                    <button
                      onClick={handleGoogleAuth}
                      type="button"
                      disabled={loading}
                      className="py-3 mx-auto text-white font-semibold bg-amber w-full rounded-full hover:bg-gray-200 hover:text-amber disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        "Processing..."
                      ) : (
                        <>
                          <img
                            src="https://www.google.com/favicon.ico"
                            alt="Google"
                            className="w-5 h-5"
                          />
                          Sign up with Google
                        </>
                      )}
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
