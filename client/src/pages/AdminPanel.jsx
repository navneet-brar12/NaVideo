import { useState } from "react";

export default function AdminPanel() {
  // Sample data (to be replaced with backend data later)
  const [meetings] = useState([
    { id: "a1b2c3", host: "Amolak", participants: 4, status: "Active", time: "10:00 AM" },
    { id: "x9y8z7", host: "Naman", participants: 2, status: "Ended", time: "9:30 AM" },
    { id: "k4l5m6", host: "Riya", participants: 3, status: "Active", time: "11:15 AM" },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-indigo-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-6 py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Page Title */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-sky-700 dark:text-sky-400 mb-2 transition-colors duration-300">
            Admin Panel
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg transition-colors duration-300">
            Manage meetings, monitor sessions, and view platform statistics.
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
            <h2 className="text-gray-500 dark:text-gray-400 text-sm mb-1">
              Total Meetings
            </h2>
            <p className="text-3xl font-bold text-sky-700 dark:text-sky-400">23</p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
            <h2 className="text-gray-500 dark:text-gray-400 text-sm mb-1">
              Active Meetings
            </h2>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {meetings.filter((m) => m.status === "Active").length}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
            <h2 className="text-gray-500 dark:text-gray-400 text-sm mb-1">
              Participants Online
            </h2>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {meetings.reduce(
                (sum, m) => sum + (m.status === "Active" ? m.participants : 0),
                0
              )}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
            <h2 className="text-gray-500 dark:text-gray-400 text-sm mb-1">
              Ended Meetings
            </h2>
            <p className="text-3xl font-bold text-rose-600 dark:text-rose-400">
              {meetings.filter((m) => m.status === "Ended").length}
            </p>
          </div>
        </div>

        {/* Active Meetings Table */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 p-8 overflow-x-auto transition-colors duration-300">
          <h2 className="text-2xl font-bold text-sky-700 dark:text-sky-400 mb-6 transition-colors duration-300">
            Recent Meetings
          </h2>
          <table className="min-w-full text-sm text-gray-600 dark:text-gray-300">
            <thead>
              <tr className="bg-sky-50 dark:bg-gray-800 text-sky-700 dark:text-sky-400 text-left transition-colors duration-300">
                <th className="py-3 px-4 rounded-tl-lg">Meeting ID</th>
                <th className="py-3 px-4">Host</th>
                <th className="py-3 px-4">Participants</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 rounded-tr-lg">Time</th>
              </tr>
            </thead>
            <tbody>
              {meetings.map((meeting, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-sky-50 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  <td className="py-3 px-4 font-mono">{meeting.id}</td>
                  <td className="py-3 px-4">{meeting.host}</td>
                  <td className="py-3 px-4">{meeting.participants}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        meeting.status === "Active"
                          ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                          : "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300"
                      }`}
                    >
                      {meeting.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">{meeting.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Buttons (Admin Actions) */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
          <button className="bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400 text-white px-6 py-3 rounded-lg shadow font-semibold transition-all duration-200">
            Refresh Data
          </button>
          <button className="bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-500 text-white px-6 py-3 rounded-lg shadow font-semibold transition-all duration-200">
            End All Active Meetings
          </button>
        </div>
      </div>
    </div>
  );
}
