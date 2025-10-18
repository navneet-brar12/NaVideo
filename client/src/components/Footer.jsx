export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-r from-white via-sky-50 to-indigo-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 py-6 text-center text-gray-600 dark:text-gray-300">
        <p className="text-sm">
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold text-sky-700 dark:text-sky-400">
            NaVideo
          </span>
          . All rights reserved.
        </p>
      </div>
    </footer>
  );
}
