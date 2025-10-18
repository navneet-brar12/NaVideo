import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const API_BASE = import.meta.env.VITE_API_URL ;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid credentials or server error.");
      } else if (data && data.user) {
        const userData = {
          name: data.user.name,
          email: data.user.email,
          token: data.token,
        };
        login(userData);
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-sky-50 to-indigo-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-md p-8 transition-colors duration-300">
        <h2 className="text-3xl font-bold text-center text-sky-700 dark:text-sky-400 mb-6 transition-colors duration-300">
          Login to NaVideo
        </h2>

        {error && (
          <p className="text-red-600 dark:text-red-400 text-center mb-4 bg-red-100 dark:bg-red-900/30 py-2 rounded transition-colors duration-300">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors duration-300"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors duration-300"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg font-semibold text-white transition-all duration-200 ${
              loading
                ? "bg-sky-300 dark:bg-sky-700"
                : "bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-gray-600 dark:text-gray-300 mt-4 transition-colors duration-300">
          Don’t have an account?{" "}
          <a
            href="/register"
            className="text-sky-600 dark:text-sky-400 hover:underline transition-colors duration-300"
          >
            Register here
          </a>
        </p>
      </div>
    </div>
  );
}
