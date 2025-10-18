import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Mic, MicOff, Camera, CameraOff, Video } from "lucide-react";

export default function PreJoin() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [name, setName] = useState("");
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [localStream, setLocalStream] = useState(null);

  // Start initial preview
  useEffect(() => {
    let stream;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Error accessing media devices:", err);
        alert("Please allow camera and microphone permissions to continue.");
      }
    })();

   
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Toggle Mic
  const toggleMic = () => {
    if (!localStream) return;
    const audioTracks = localStream.getAudioTracks();
    if (audioTracks.length === 0) return;

    const enabled = !audioTracks[0].enabled;
    audioTracks.forEach((t) => (t.enabled = enabled));
    setMicOn(enabled);
  };

  // Toggle Camera
  const toggleCamera = async () => {
    if (!localStream) return;

    if (cameraOn) {
      // Turn camera off
      localStream.getVideoTracks().forEach((t) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
      setCameraOn(false);
    } else {
      // Turn camera back on
      try {
        const newVideoStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        const newStream = new MediaStream([
          ...localStream.getAudioTracks(),
          ...newVideoStream.getVideoTracks(),
        ]);
        // stop old tracks
        localStream.getTracks().forEach((t) => t.stop());
        setLocalStream(newStream);
        if (videoRef.current) videoRef.current.srcObject = newStream;
        setCameraOn(true);
      } catch (err) {
        console.error("Error turning camera back on:", err);
        alert("Unable to access camera again. Please check permissions.");
      }
    }
  };

  // Join Meeting
  const handleJoin = () => {
    if (!name.trim()) {
      alert("Please enter your name before joining.");
      return;
    }

    // Stop preview before joining
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
    }

    const queryParams = new URLSearchParams({
      name,
      mic: micOn ? "1" : "0",
      cam: cameraOn ? "1" : "0",
    }).toString();

    navigate(`/meeting/${meetingId}?${queryParams}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-sky-50 to-indigo-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-6 py-10 transition-colors duration-300">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 p-8 flex flex-col items-center transition-colors duration-300">
        {/* Video Preview */}
        <div className="relative bg-gray-900 dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg w-full aspect-video mb-6">
          {cameraOn ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500">
              <Video className="w-12 h-12 opacity-60" />
            </div>
          )}

          {!micOn && (
            <div className="absolute bottom-2 right-2 bg-rose-600 text-white p-2 rounded-full shadow-md">
              <MicOff className="w-4 h-4" />
            </div>
          )}
        </div>

        <h2 className="text-2xl font-bold text-sky-700 dark:text-sky-400 mb-2 transition-colors duration-300">
          Ready to join the meeting?
        </h2>
        <p className="text-gray-500 dark:text-gray-300 mb-6 transition-colors duration-300">
          Meeting ID: {meetingId}
        </p>

        {/* Name Input */}
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 mb-4 text-gray-700 dark:text-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors duration-300"
        />

        {/* Mic + Camera Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <button
            onClick={toggleMic}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold shadow-md transition-all duration-200 ${
              micOn
                ? "bg-sky-600 hover:bg-sky-700 text-white"
                : "bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-600"
            }`}
          >
            {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            {micOn ? "Mute Mic" : "Unmute Mic"}
          </button>

          <button
            onClick={toggleCamera}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold shadow-md transition-all duration-200 ${
              cameraOn
                ? "bg-sky-600 hover:bg-sky-700 text-white"
                : "bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-600"
            }`}
          >
            {cameraOn ? (
              <Camera className="w-5 h-5" />
            ) : (
              <CameraOff className="w-5 h-5" />
            )}
            {cameraOn ? "Turn Off Camera" : "Turn On Camera"}
          </button>
        </div>

        {/* Join Button */}
        <button
          onClick={handleJoin}
          className="w-full bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-200"
        >
          Join Meeting
        </button>
      </div>
    </div>
  );
}
