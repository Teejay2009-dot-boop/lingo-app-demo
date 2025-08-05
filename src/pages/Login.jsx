import React, { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase/config/firebase"; // Ensure db is exported from your config
import loginImage from "../assets/IMG-20250724-WA0115-removebg-preview.png";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // Added for signup
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Auto-redirect if already logged in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) navigate("/dashboard");
    });
    return unsubscribe;
  }, [navigate]);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
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
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        // Add user to Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
          email,
          name,
          xp: 0,
          streak: 0,
          createdAt: new Date(),
        });

        // Send verification email
        await sendEmailVerification(userCredential.user);
        await updateProfile(userCredential.user, { displayName: name });

        alert("Account created! Please verify your email.");
      }
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-gray-100">
      {/* Form Container */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Toggle Buttons */}
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

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Forms */}
          <div className="relative h-[300px] overflow-hidden">
            <div
              className={`absolute w-full transition-transform duration-300 ${
                isLogin ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              {/* Login Form */}
              <form onSubmit={handleAuth} className="space-y-4">
                <h2 className="text-2xl font-bold text-center mb-4">
                  Welcome Back!
                </h2>
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-amber-500"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-amber-500"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button
                  onClick={signInWithGoogle}
                  className="py-2 mx-auto bg-amber w-full rounded-full"
                >
                  Sign in with Google
                </button>
                <button
                  type="submit"
                  className="w-full bg-amber-500 text-amber py-3 rounded-lg hover:bg-amber-600 transition-colors"
                >
                  Log In
                </button>
              </form>
            </div>

            <div
              className={`absolute w-full transition-transform duration-300 ${
                isLogin ? "translate-x-full" : "translate-x-0"
              }`}
            >
              {/* Signup Form */}
              <form onSubmit={handleAuth} className="flex flex-col gap-">
                <h2 className="text-2xl font-bold text-center mb-4">
                  Get Started
                </h2>
                <div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-amber-500"
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-amber-500"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Password (min 6 characters)"
                    minLength="6"
                    className="w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-amber-500"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div >
                  <button
                  type="submit"
                  className="w-full bg-amber-500 text-amber py-3 rounded-lg hover:bg-amber-600 transition-colors"
                >
                  Create Account
                </button>
                <button
                  onClick={signInWithGoogle}
                  className="py-2 mx-auto bg-amber w-full rounded-full"
                >
                  Sign in with Google
                </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Image Section */}
      <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-amber-400 to-amber-600">
        <img
          src={loginImage}
          alt="Language Learning"
          className="w-2/3 max-h-[70vh] object-contain animate-float"
        />
      </div>
    </div>
  );
};

export default Login;
