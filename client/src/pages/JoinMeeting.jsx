import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function JoinMeeting() {
  const [meetingId, setMeetingId] = useState("");
  const navigate = useNavigate();

  const handleJoinMeeting = (e) => {
    e.preventDefault();
    if (!meetingId.trim()) {
      alert("Please enter a valid meeting ID.");
      return;
    }
    navigate(`/prejoin/${meetingId.trim()}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-sky-50 to-indigo-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-4 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-md p-8 flex flex-col items-center text-center transition-colors duration-300">
        <h1 className="text-4xl font-extrabold text-sky-700 dark:text-sky-400 mb-4 transition-colors duration-300">
          Join Meeting
        </h1>
        <p className="text-gray-500 dark:text-gray-300 mb-8 transition-colors duration-300">
          Enter a meeting ID to join a call instantly.
        </p>

        <form onSubmit={handleJoinMeeting} className="w-full">
          <input
            type="text"
            placeholder="Enter Meeting ID"
            value={meetingId}
            onChange={(e) => setMeetingId(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 mb-6 text-gray-700 dark:text-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors duration-300"
          />

          <button
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400 text-white font-semibold py-3 rounded-lg shadow-md transition-all duration-200"
          >
            Join Meeting
          </button>
        </form>
      </div>
    </div>
  );
}
