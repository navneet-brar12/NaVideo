# NaVideo — Real-Time Video Calling Web App 

NaVideo is a **real-time video conferencing web application** built using **React**, **Node.js**, **Express**, **MongoDB**, **WebRTC**, and **Socket.IO**.  
It allows multiple participants to **join a virtual meeting**, **chat**, **toggle camera/mic**, and **share their screen**.

---

## Live Demo

- **Frontend (React + Tailwind):** [https://na-video-frontend.vercel.app](https://na-video-frontend.vercel.app)
- **Backend (Express + Socket.IO):** [https://na-video.vercel.app](https://na-video.vercel.app)

---

## Features

**Join or Create Meeting** — Start or join using a unique meeting ID  
**Real-Time Audio/Video** — Peer-to-peer streaming via WebRTC  
**Screen Sharing** — Share your screen seamlessly  
**Instant Chat** — Real-time text chat with auto-scroll  
**Toggle Camera & Mic** — Enable/disable audio and video anytime  
**Responsive Design** — Works perfectly on desktop and mobile  
**Secure JWT-based Auth (Optional)** — User login/register system ready  
**Deployed** — Fully deployed frontend & backend (Vercel)

---

## Tech Stack

**Frontend:**
- React.js (Vite)
- Tailwind CSS
- Socket.IO Client
- Lucide React Icons

**Backend:**
- Node.js + Express
- Socket.IO (WebSocket signaling)
- MongoDB + Mongoose
- JWT Authentication
- dotenv, bcryptjs

**WebRTC:**
- Peer-to-peer video/audio connections
- STUN/TURN servers for NAT traversal

  ## Run Locally

> Folder structure:
> ```
> /NaVideo
>   /server    # backend (Express + Socket.IO)
>   /client    # frontend (React + Tailwind)
> ```

### Clone repository
```bash
git clone https://github.com/<your-username>/NaVideo.git
cd NaVideo

**###Backend Setup**
cd server
npm install

**###Frontend Setup**
cd client
npm run dev

**.env file example**
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
STUN_SERVER_1=stun:stun.l.google.com:19302
STUN_SERVER_2=stun:stun1.l.google.com:19302
TURN_SERVER=turn:navideo.metered.live:80
TURN_USERNAME=your_turn_username
TURN_PASSWORD=your_turn_password


---



