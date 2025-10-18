import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/api/users/login", {
        email,
        password,
      });

      if (response.data && response.data.user) {
        const userData = {
          name: response.data.user.name,
          email: response.data.user.email,
          token: response.data.token,
        };

        login(userData);
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      setError("Invalid credentials or server error.");
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
            className="w-full bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400 text-white font-semibold py-2 rounded-lg transition-all duration-200"
          >
            Login
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
