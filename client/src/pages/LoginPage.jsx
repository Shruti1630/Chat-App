// src/pages/LoginPage.jsx
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { AuthContext } from "../context/AuthContext"; 

const LoginPage = () => {
  const navigate = useNavigate();

  const [currState, setCurrState] = useState("Sign up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);

  const onsubmitHandler = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    // STEP 1 → show bio field for signup
    if (currState === "Sign up" && !isDataSubmitted) {
      setIsDataSubmitted(true);
      setLoading(false);
      return;
    }

    try {
      const result = await login(
        currState === "Sign up" ? "signup" : "login",
        {
          name: fullName, // ✅ backend expects `name`
          email,
          password,
          bio,
        }
      );

      if (!result?.success) {
        setError(result?.error || "Authentication failed");
      } else {
        navigate("/chat"); // ✅ change if your route is different
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPassword("");
    setBio("");
    setError("");
    setIsDataSubmitted(false);
  };

  const toggleMode = () => {
    resetForm();
    setCurrState(currState === "Sign up" ? "Login" : "Sign up");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center p-6">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-12 w-full max-w-6xl">

        {/* LEFT SECTION */}
        <div className="text-center lg:text-left lg:w-1/2">
          <img
            src={assets.logo_big}
            alt="QuickChat Logo"
            className="w-64 mx-auto lg:mx-0 mb-8"
          />
          <h1 className="text-5xl font-bold text-white mb-4">
            Welcome to <span className="text-yellow-300">QuickChat</span>
          </h1>
          <p className="text-xl text-white/80 max-w-lg">
            Connect with friends instantly. Secure, fast, and easy-to-use messaging platform.
          </p>
        </div>

        {/* FORM SECTION */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 w-full max-w-md shadow-2xl">

          <h2 className="font-bold text-2xl text-white mb-6">
            {currState === "Sign up"
              ? isDataSubmitted
                ? "Complete Your Profile"
                : "Create Account"
              : "Welcome Back"}
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 text-red-200 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={onsubmitHandler} className="space-y-5">

            {currState === "Sign up" && !isDataSubmitted && (
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/20 text-white"
              />
            )}

            {!isDataSubmitted && (
              <>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/20 text-white"
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/20 text-white"
                />
              </>
            )}

            {currState === "Sign up" && isDataSubmitted && (
              <textarea
                placeholder="Bio (optional)"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={loading}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/20 text-white resize-none"
              />
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-white text-purple-700 font-semibold rounded-xl disabled:opacity-50"
            >
              {loading
                ? "Please wait..."
                : currState === "Sign up"
                ? isDataSubmitted
                  ? "Complete Signup"
                  : "Continue"
                : "Login"}
            </button>

            <p className="text-center text-white/80 text-sm">
              {currState === "Sign up"
                ? "Already have an account?"
                : "Don't have an account?"}
              <button
                type="button"
                onClick={toggleMode}
                className="ml-2 font-semibold underline"
              >
                {currState === "Sign up" ? "Login" : "Sign up"}
              </button>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
