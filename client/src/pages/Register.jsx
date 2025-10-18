import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const { login } = useUser();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed");
      } else {
        // ✅ Auto-login immediately
        const userData = {
          name: data.user.name,
          email: data.user.email,
          token: data.token,
        };
        login(userData);
        navigate("/", { replace: true });
      }
    } catch (err) {
      console.error("Register error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-sky-50 to-indigo-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-6 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-300">
        <h2 className="text-2xl font-bold text-sky-700 dark:text-sky-400 mb-2 transition-colors duration-300">
          Create Account
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 transition-colors duration-300">
          Sign up to get started
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-3 py-2 rounded transition-colors duration-300">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 text-sm text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-2 rounded transition-colors duration-300">
            {successMsg}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
              Name
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors duration-300"
              placeholder="Your full name"
              required
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors duration-300"
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors duration-300"
              placeholder="Choose a password"
              required
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
              Confirm password
            </span>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1 w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors duration-300"
              placeholder="Repeat password"
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg font-semibold transition-all duration-200 ${
              loading
                ? "bg-sky-300 dark:bg-sky-700 text-white"
                : "bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400 text-white"
            }`}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-sky-600 dark:text-sky-400 hover:underline transition-colors duration-300"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
