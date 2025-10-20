import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ScheduleMeeting() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const navigate = useNavigate();

  const handleSchedule = async (e) => {
    e.preventDefault();

    if (!date || !time) {
      alert("Please select both date and time.");
      return;
    }

    try {
      const scheduledAt = new Date(`${date}T${time}`);
      const ownerId = "temporaryUserId123"; // replace later with logged-in user ID if auth added

      const res = await axios.post(`${API_BASE}/api/scheduled-meetings/create`, {
        title,
        description,
        scheduledAt,
        ownerId,
      });

      if (res.data.success) {
        alert("Meeting scheduled successfully!");
        navigate("/my-meetings");
      }
    } catch (error) {
      console.error("Error scheduling meeting:", error);
      alert("Failed to schedule meeting.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 w-full max-w-md border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-6 text-center">
          Schedule a Meeting
        </h2>

        <form onSubmit={handleSchedule} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Meeting Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border rounded-lg p-3 dark:bg-gray-700 dark:text-white"
          />

          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border rounded-lg p-3 dark:bg-gray-700 dark:text-white"
          />

          <div className="flex gap-3">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 border rounded-lg p-3 dark:bg-gray-700 dark:text-white"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="flex-1 border rounded-lg p-3 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold mt-4 transition-all"
          >
            Schedule Meeting
          </button>
        </form>
      </div>
    </div>
  );
}
