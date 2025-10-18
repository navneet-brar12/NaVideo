import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../assets/squareIcon.png";
import { useUser } from "../context/UserContext";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useUser();

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/create", label: "Create Meeting" },
    { path: "/join", label: "Join Meeting" },
    { path: "/my-meetings", label: "My Meetings" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="w-full sticky top-0 z-50 border-b backdrop-blur-sm shadow-sm bg-white/80 border-gray-200 text-gray-900 dark:bg-gray-900/80 dark:border-gray-700 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src={Logo}
            alt="NaVideo Logo"
            className="h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
          />
          <span className="text-2xl font-extrabold tracking-tight text-sky-700 dark:text-sky-400">
            NaVideo
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex gap-6">
          {navLinks.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`font-medium transition ${
                location.pathname === path
                  ? "text-sky-600 border-b-2 border-sky-600 pb-1 dark:text-sky-400 dark:border-sky-400"
                  : "text-gray-600 hover:text-sky-600 dark:text-gray-300 dark:hover:text-sky-400"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right Section: Auth Buttons Only */}
        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-md border font-medium transition border-sky-600 text-sky-600 hover:bg-sky-50 dark:border-sky-400 dark:text-sky-400 dark:hover:bg-sky-900/30"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-md font-medium transition bg-sky-600 hover:bg-sky-700 text-white dark:bg-sky-500 dark:hover:bg-sky-600"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Hi, {user.name || "User"}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-md font-medium transition bg-rose-500 hover:bg-rose-600 text-white dark:bg-rose-600 dark:hover:bg-rose-700"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
