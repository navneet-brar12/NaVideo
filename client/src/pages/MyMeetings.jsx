import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function MyMeetings() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const navigate = useNavigate();

  // Fetch scheduled meetings
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/scheduled-meetings`);
        if (res.data.success) {
          setMeetings(res.data.meetings);
        }
      } catch (err) {
        console.error("Error fetching meetings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  // Join Meeting
  const handleJoin = (meetingId) => {
    navigate(`/prejoin/${meetingId}`);
  };

  // Delete Meeting
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this meeting?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/scheduled-meetings/${id}`);
      setMeetings((prev) => prev.filter((m) => m._id !== id));
      alert("Meeting deleted successfully!");
    } catch (err) {
      console.error("Error deleting meeting:", err);
      alert("Failed to delete meeting.");
    }
  };

  // Copy Meeting Link
  const handleCopyLink = (meetingId) => {
    const meetingLink = `https://na-video-frontend.vercel.app/prejoin/${meetingId}`;
    navigator.clipboard.writeText(meetingLink);
    setCopiedId(meetingId);
    setTimeout(() => setCopiedId(null), 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-sky-50 to-indigo-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300 px-4">
        <p className="text-sky-600 dark:text-sky-400 font-medium">Loading your meetings...</p>
      </div>
    );
  }

  if (!meetings.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-sky-50 to-indigo-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-4">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-2xl p-10 text-center">
          <h1 className="text-4xl font-extrabold text-sky-700 dark:text-sky-400 mb-4">
            My Meetings
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            You don’t have any meetings yet. Schedule one to get started!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-indigo-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-6 py-10 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-extrabold text-sky-700 dark:text-sky-400 mb-8 text-center">
          My Scheduled Meetings
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetings.map((meeting) => (
            <div
              key={meeting._id}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col justify-between transition-transform transform hover:-translate-y-1 hover:shadow-xl duration-300"
            >
              <div>
                <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                  {meeting.title || "Untitled Meeting"}
                </h2>

                {meeting.description && (
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    {meeting.description}
                  </p>
                )}

                {meeting.dateTime && (
                  <p className="text-gray-700 dark:text-gray-400 mb-2">
                    <strong>Date:</strong>{" "}
                    {new Date(meeting.dateTime).toLocaleString()}
                  </p>
                )}

                <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                  Meeting ID:{" "}
                  <span className="font-mono">{meeting.meetingId}</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center mt-4 relative">
                <button
                  onClick={() => handleJoin(meeting.meetingId)}
                  className="bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 transition-all duration-200"
                >
                  Join
                </button>

                <div className="relative">
                  <button
                    onClick={() => handleCopyLink(meeting.meetingId)}
                    className="bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-all duration-200"
                  >
                    Copy Link
                  </button>
                  {copiedId === meeting.meetingId && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-black/70 text-white px-2 py-1 rounded-md shadow-md">
                      Link Copied!
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(meeting._id)}
                  className="bg-rose-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700 transition-all duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
