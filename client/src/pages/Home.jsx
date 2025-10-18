import { Link } from "react-router-dom";
import Logo from "../assets/LogoBlue.png";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-sky-50 to-indigo-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-4 transition-colors duration-300">
      {/* Centered Card */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-3xl p-10 flex flex-col items-center text-center transition-colors duration-300">
        
        {/* Logo */}
        <img
          src={Logo}
          alt="NaVideo Logo"
          className="w-52 h-auto mb-6 object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
        />

        {/* Title */}
        <h1 className="text-5xl font-extrabold text-sky-700 dark:text-sky-400 mb-3 tracking-tight transition-colors duration-300">
          NaVideo
        </h1>

        {/* Tagline */}
        <p className="text-gray-500 dark:text-gray-300 text-lg mb-10 leading-relaxed max-w-md transition-colors duration-300">
          Connect instantly with high-quality video calls.
          <br />
          Simple, fast, and secure.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/create">
            <button className="bg-sky-600 text-white font-semibold px-8 py-3 rounded-lg shadow hover:bg-sky-700 dark:hover:bg-sky-500 transition-all duration-200">
              Create Meeting
            </button>
          </Link>

          <Link to="/join">
            <button className="border-2 border-sky-600 dark:border-sky-400 text-sky-600 dark:text-sky-400 font-semibold px-8 py-3 rounded-lg hover:bg-sky-600 dark:hover:bg-sky-500 hover:text-white transition-all duration-200">
              Join Meeting
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
