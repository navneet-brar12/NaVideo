export default function MyMeetings() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-sky-50 to-indigo-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300 px-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-2xl p-10 text-center transition-colors duration-300">
        <h1 className="text-4xl font-extrabold text-sky-700 dark:text-sky-400 mb-4 transition-colors duration-300">
          My Meetings
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg transition-colors duration-300">
          You don’t have any meetings yet. Create one to get started!
        </p>
      </div>
    </div>
  );
}
