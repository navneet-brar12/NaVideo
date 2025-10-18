import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import CreateMeeting from "./pages/CreateMeeting";
import JoinMeeting from "./pages/JoinMeeting";
import MeetingRoom from "./pages/MeetingRoom";
import MyMeetings from "./pages/MyMeetings";
import AdminPanel from "./pages/AdminPanel";
import PreJoin from "./pages/PreJoin";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ThemeToggle from "./components/ThemeToggle"; 

function App() {
  return (
    <div className="flex flex-col min-h-screen relative">
      <Header />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateMeeting />} />
          <Route path="/join" element={<JoinMeeting />} />
          <Route path="/meeting/:meetingId" element={<MeetingRoom />} />
          <Route path="/my-meetings" element={<MyMeetings />} />
          <Route path="/adminpanel" element={<AdminPanel />} />
          <Route path="/prejoin/:meetingId" element={<PreJoin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>

      <Footer />

      <ThemeToggle />
    </div>
  );
}

export default App;
