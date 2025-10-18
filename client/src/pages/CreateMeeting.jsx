import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";

export default function CreateMeeting() {
  const [meetingId, setMeetingId] = useState("");
  const navigate = useNavigate();

  const handleCreate = () => {
    const newId = uuidv4().slice(0, 8); // short random ID
    setMeetingId(newId);
  };

  const handleJoin = () => {
    navigate(`/prejoin/${meetingId}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 px-4 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <h2 className="text-2xl font-bold mb-4 text-center text-indigo-700 dark:text-indigo-400 transition-colors duration-300">
          Create a New Meeting
        </h2>

        {!meetingId ? (
          <button
            onClick={handleCreate}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-all duration-200"
          >
            Generate Meeting ID
          </button>
        ) : (
          <div className="text-center">
            <p className="mb-3 text-gray-600 dark:text-gray-300 transition-colors duration-300">
              Your Meeting ID:
            </p>
            <p className="text-xl font-mono font-semibold mb-4 text-gray-800 dark:text-gray-100 transition-colors duration-300">
              {meetingId}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigator.clipboard.writeText(meetingId)}
                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
              >
                Copy ID
              </button>

              <button
                onClick={handleJoin}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-all duration-200"
              >
                Go to Meeting
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
