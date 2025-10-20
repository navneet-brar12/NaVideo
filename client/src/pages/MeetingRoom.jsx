import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import {
  Mic,
  MicOff,
  Camera,
  CameraOff,
  MessageSquare,
  LogOut,
  MonitorUp,
  MonitorDown,
} from "lucide-react";

const SOCKET_SERVER =
  import.meta.env.MODE === "production"
    ? "https://na-video.vercel.app"
    : "http://localhost:5000";
const RTC_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    // Add TURN here if you have one
  ],
};

export default function MeetingRoom() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // --- PreJoin preferences ---
  const params = new URLSearchParams(location.search);
  const userName = params.get("name") || "You";
  const micPref = params.get("mic") === "1";
  const camPref = params.get("cam") === "1";

  // refs
  const localVideoRef = useRef(null);
  const screenVideoRef = useRef(null);
  const socketRef = useRef(null);
  const pcsRef = useRef({}); // peerId -> RTCPeerConnection
  const remoteStreamsRef = useRef({}); // peerId -> MediaStream
  const remoteVideoRefs = useRef({}); // peerId -> <video> element
  const chatEndRef = useRef(null);
  const screenTrackRef = useRef(null);
  const localStreamRef = useRef(null); // mirrors state fast

  // state
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [micOn, setMicOn] = useState(micPref);
  const [cameraOn, setCameraOn] = useState(camPref);
  const [sharingScreen, setSharingScreen] = useState(false);
  const [participants, setParticipants] = useState([]); // { socketId, userName }
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatOpen, setChatOpen] = useState(true);

  // keep ref in sync with state (fast access in callbacks)
  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  // chat auto-scroll
  useEffect(() => {
    try {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch {}
  }, [messages]);

  // small helper
  const formatTime = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  // attachers (clear srcObject when stream is null)
  const attachLocalStream = (stream) => {
    if (!localVideoRef.current) return;
    try {
      localVideoRef.current.srcObject = stream ?? null;
    } catch {}
  };
  const attachScreenStream = (stream) => {
    if (!screenVideoRef.current) return;
    try {
      screenVideoRef.current.srcObject = stream ?? null;
    } catch {}
  };

  // ---------- Peer helpers ----------
  const closePeerConnection = (peerId) => {
    const pc = pcsRef.current[peerId];
    if (pc) {
      try {
        pc.ontrack = null;
        pc.onicecandidate = null;
        pc.onnegotiationneeded = null;
        pc.onconnectionstatechange = null;
        pc.close();
      } catch {}
      delete pcsRef.current[peerId];
    }

    const rs = remoteStreamsRef.current[peerId];
    if (rs) {
      try {
        rs.getTracks()?.forEach((t) => t.stop());
      } catch {}
      delete remoteStreamsRef.current[peerId];
    }

    if (remoteVideoRefs.current[peerId]) {
      try {
        remoteVideoRefs.current[peerId].srcObject = null;
      } catch {}
      delete remoteVideoRefs.current[peerId];
    }

    setParticipants((prev) => prev.filter((p) => p.socketId !== peerId));
  };

  const createPeerConnection = (peerId) => {
    if (pcsRef.current[peerId]) return pcsRef.current[peerId];

    const pc = new RTCPeerConnection(RTC_CONFIG);
    pcsRef.current[peerId] = pc;

    // handle incoming tracks
    pc.ontrack = (event) => {
      let incomingStream = null;
      if (event.streams && event.streams[0]) {
        incomingStream = event.streams[0];
      } else {
        incomingStream = remoteStreamsRef.current[peerId] || new MediaStream();
        if (event.track) {
          try {
            const exists = incomingStream.getTracks().some((t) => t.id === event.track.id);
            if (!exists) incomingStream.addTrack(event.track);
          } catch {}
        }
      }

      remoteStreamsRef.current[peerId] = incomingStream;

      // attach to video element if exists
      const vid = remoteVideoRefs.current[peerId];
      if (vid) {
        try {
          vid.srcObject = incomingStream;
          vid.muted = false;
          vid.volume = 1;
          vid.play?.().catch(() => {});
        } catch {}
      }

      setParticipants((prev) => {
        if (prev.find((p) => p.socketId === peerId)) return prev;
        return [...prev, { socketId: peerId, userName: "Participant" }];
      });
    };

    // ICE
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit("signal", {
          to: peerId,
          from: socketRef.current.id,
          data: { type: "candidate", candidate: event.candidate },
        });
      }
    };

    // handle renegotiation requests (when addTrack is called)
    pc.onnegotiationneeded = async () => {
      try {
        // create offer and send (only if we're the initiator for this pair)
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socketRef.current?.emit("signal", {
          to: peerId,
          from: socketRef.current.id,
          data: { type: "offer", sdp: pc.localDescription },
        });
      } catch (err) {
        console.warn("negotiationneeded error:", err);
      }
    };

    pc.onconnectionstatechange = () => {
      try {
        if (["failed", "disconnected", "closed"].includes(pc.connectionState)) {
          closePeerConnection(peerId);
        }
      } catch {}
    };

    // add existing local tracks (if present) - avoid duplicates by checking existing senders
    const currentLocal = localStreamRef.current;
    if (currentLocal) {
      for (const t of currentLocal.getTracks()) {
        try {
          const existing = pc.getSenders().find((s) => s.track?.kind === t.kind);
          if (existing && existing.replaceTrack) {
            existing.replaceTrack(t);
          } else if (!existing) {
            pc.addTrack(t, currentLocal);
          }
        } catch {}
      }
    }

    // if there's an active screen track, attach it too (use screenTrackRef)
    const screenTrack = screenTrackRef.current;
    if (screenTrack) {
      try {
        const existing = pc.getSenders().find((s) => s.track?.kind === screenTrack.kind);
        if (existing && existing.replaceTrack) {
          existing.replaceTrack(screenTrack);
        } else {
          pc.addTrack(screenTrack, screenStream ?? new MediaStream([screenTrack]));
        }
      } catch (e) {
        console.warn("add screen track error", e);
      }
    }

    return pc;
  };

  // Replace or add track for all peers (robust)
  const replaceTrackForAllPeers = (newTrack, kind) => {
    Object.values(pcsRef.current).forEach((pc) => {
      try {
        // Replace all matching senders (not just the first)
        const senders = pc.getSenders().filter((s) => s.track?.kind === kind);
        if (senders.length > 0) {
          senders.forEach((sender) => {
            try {
              if (newTrack && sender.replaceTrack) {
                sender.replaceTrack(newTrack);
              } else if (!newTrack && sender.replaceTrack) {
                // Try setting to null — fallback to removeTrack if not supported
                try {
                  sender.replaceTrack(null);
                } catch (err) {
                  try {
                    pc.removeTrack(sender);
                  } catch {}
                }
              }
            } catch (e) {
              console.warn("replaceTrack sender error:", e);
            }
          });
        } else if (newTrack) {
          // No existing sender of this kind — add track attached to actual local stream (if usable)
          try {
            const attachStream = localStreamRef.current ?? (newTrack ? new MediaStream([newTrack]) : null);
            if (attachStream) pc.addTrack(newTrack, attachStream);
          } catch (e) {
            console.warn("addTrack fallback failed", e);
          }
        }
      } catch (e) {
        console.warn("replaceTrackForAllPeers error", e);
      }
    });
  };

  // wait for local stream (used before creating offers)
  const waitForLocalStream = (timeout = 3000) =>
    new Promise((resolve) => {
      const start = Date.now();
      const check = () => {
        if (localStreamRef.current) return resolve(true);
        if (Date.now() - start > timeout) return resolve(false);
        setTimeout(check, 100);
      };
      check();
    });

  // ---------- Signaling ----------
  const handleSignal = async ({ from, data }) => {
    if (!from || !data) return;
    const pc = pcsRef.current[from] || createPeerConnection(from);
    try {
      if (data.type === "offer") {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socketRef.current?.emit("signal", {
          to: from,
          from: socketRef.current.id,
          data: { type: "answer", sdp: pc.localDescription },
        });
      } else if (data.type === "answer") {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
      } else if (data.type === "candidate") {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (err) {
          console.warn("addIceCandidate failed:", err);
        }
      }
    } catch (err) {
      console.error("handleSignal error:", err);
    }
  };

  // ---------- Socket init (single) ----------
  useEffect(() => {
    if (socketRef.current) return; // guard for StrictMode / remounts

    const s = io(SOCKET_SERVER, { transports: ["websocket", "polling"] });
    socketRef.current = s;

    s.on("connect", () => {
      console.log("Socket connected:", s.id);
      s.emit("join-meeting", { meetingId, userName });
    });

    s.on("signal", handleSignal);

    s.on("joined-room", async (data) => {
      // filter out self and merge participants
      const others = (data.participants || []).filter((p) => p.socketId !== s.id);
      setParticipants((prev) => {
        const map = new Map(prev.map((p) => [p.socketId, p]));
        for (const p of others) {
          if (!map.has(p.socketId)) map.set(p.socketId, p);
        }
        return Array.from(map.values());
      });

      // create offers (ensure local stream)
      const haveLocal = await waitForLocalStream(3000);
      for (const p of others) {
        try {
          const pc = createPeerConnection(p.socketId);
          // ensure current local tracks are attached to this PC (safe add/replace)
          const cur = localStreamRef.current;
          if (cur) {
            for (const t of cur.getTracks()) {
              const sender = pc.getSenders().find((sdr) => sdr.track?.kind === t.kind);
              if (sender && sender.replaceTrack) {
                sender.replaceTrack(t);
              } else {
                try {
                  pc.addTrack(t, cur);
                } catch {}
              }
            }
          }

          // deterministic initiator: create offer only when our id < remote id
          if (s.id && p.socketId && s.id < p.socketId) {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socketRef.current?.emit("signal", {
              to: p.socketId,
              from: socketRef.current.id,
              data: { type: "offer", sdp: pc.localDescription },
            });
          }
        } catch (err) {
          console.error("offer creation error:", err);
        }
      }
    });

    s.on("user-joined", async ({ socketId, userName: name }) => {
      if (socketId === s.id) return;
      setParticipants((prev) =>
        prev.find((p) => p.socketId === socketId)
          ? prev
          : [...prev, { socketId, userName: name }]
      );

      // deterministic initiator: only the peer with smaller socket id starts the offer
      if (s.id && socketId && s.id < socketId) {
        setTimeout(async () => {
          try {
            await waitForLocalStream(3000);
            const pc = createPeerConnection(socketId);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socketRef.current?.emit("signal", {
              to: socketId,
              from: socketRef.current.id,
              data: { type: "offer", sdp: pc.localDescription },
            });
          } catch (err) {
            console.error("user-joined offer error:", err);
          }
        }, 200);
      }
    });

    s.on("user-left", ({ socketId }) => {
      closePeerConnection(socketId);
    });

    // chat dedupe: avoid showing immediate duplicate if we optimistic pushed
    s.on("new-message", ({ sender, message, timestamp }) => {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (
          last &&
          last.sender === sender &&
          last.text === message &&
          Math.abs(new Date(last.time) - new Date(timestamp)) < 1200
        ) {
          return prev;
        }
        return [...prev, { sender, text: message, time: timestamp }];
      });
    });

    // cleanup on unmount
    return () => {
      try {
        if (socketRef.current?.connected) {
          socketRef.current.emit("leave-meeting", { meetingId });
          socketRef.current.disconnect();
        }
      } catch {}
      socketRef.current = null;
      Object.keys(pcsRef.current).forEach(closePeerConnection);
      try {
        localStreamRef.current?.getTracks()?.forEach((t) => t.stop());
      } catch {}
      try {
        screenStream?.getTracks()?.forEach((t) => t.stop());
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // ---------- Initial media ----------
  useEffect(() => {
    (async () => {
      try {
        const constraints = {};
        if (camPref) constraints.video = true;
        if (micPref) constraints.audio = true;

        if (Object.keys(constraints).length > 0) {
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          localStreamRef.current = stream;
          setLocalStream(stream);
          attachLocalStream(stream);
          // propagate tracks to active peer connections
          for (const track of stream.getTracks()) {
            replaceTrackForAllPeers(track, track.kind);
          }
        }
      } catch (err) {
        console.warn("Initial getUserMedia error:", err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When state localStream changes, attach + replace senders
  useEffect(() => {
    attachLocalStream(localStream);
    if (!localStream) return;
    localStreamRef.current = localStream;
    for (const track of localStream.getTracks()) {
      replaceTrackForAllPeers(track, track.kind);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localStream]);

  // When screenStream changes, attach + replace senders
  useEffect(() => {
    attachScreenStream(screenStream);
    screenTrackRef.current = screenStream ? screenStream.getVideoTracks()[0] : null;
    if (!screenStream) {
      // if screen stopped, ensure peers no longer get screen video
      replaceTrackForAllPeers(null, "video");
      return;
    }
    for (const track of screenStream.getTracks()) {
      replaceTrackForAllPeers(track, track.kind);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenStream]);

  // --------- Actions ---------
  const createOfferForPeer = async (peerId) => {
    try {
      const pc = createPeerConnection(peerId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current?.emit("signal", {
        to: peerId,
        from: socketRef.current.id,
        data: { type: "offer", sdp: pc.localDescription },
      });
    } catch (err) {
      console.error("createOfferForPeer error:", err);
    }
  };

  const toggleMic = async () => {
    try {
      // If have audio tracks -> toggle enabled
      if (localStreamRef.current && localStreamRef.current.getAudioTracks().length > 0) {
        const tracks = localStreamRef.current.getAudioTracks();
        const next = !tracks[0].enabled;
        tracks.forEach((t) => (t.enabled = next));
        setMicOn(next);
        return;
      }

      // request mic and add
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const newAudioTrack = micStream.getAudioTracks()[0];
      if (!newAudioTrack) return;

      const newLocal = localStreamRef.current ? localStreamRef.current : new MediaStream();
      try {
        newLocal.addTrack(newAudioTrack);
      } catch {}

      localStreamRef.current = newLocal;
      setLocalStream(newLocal);
      attachLocalStream(newLocal);
      replaceTrackForAllPeers(newAudioTrack, "audio");
      setMicOn(true);
    } catch (err) {
      console.error("toggleMic error:", err);
    }
  };

  const toggleCamera = async () => {
    try {
      if (cameraOn) {
        // stop video tracks and remove from localStream
        try {
          localStreamRef.current?.getVideoTracks()?.forEach((t) => t.stop());
        } catch {}
        // ensure peers stop receiving video
        replaceTrackForAllPeers(null, "video");

        const audio = localStreamRef.current ? localStreamRef.current.getAudioTracks() : [];
        const newStream = audio.length ? new MediaStream([...audio]) : null;

        localStreamRef.current = newStream;
        setLocalStream(newStream);
        // clear local video element to release device
        if (localVideoRef.current) {
          try {
            localVideoRef.current.srcObject = newStream ?? null;
          } catch {}
        }
        setCameraOn(false);
        return;
      }

      // turn camera on
      const vs = await navigator.mediaDevices.getUserMedia({ video: true });
      const newVideoTrack = vs.getVideoTracks()[0];
      if (!newVideoTrack) return;

      const audioTracks = localStreamRef.current ? localStreamRef.current.getAudioTracks() : [];
      const combined = new MediaStream([...audioTracks, newVideoTrack]);

      // stop old video tracks if any
      try {
        localStreamRef.current?.getVideoTracks()?.forEach((t) => t.stop());
      } catch {}

      localStreamRef.current = combined;
      setLocalStream(combined);
      attachLocalStream(combined);
      replaceTrackForAllPeers(newVideoTrack, "video");
      setCameraOn(true);
    } catch (err) {
      console.error("toggleCamera error:", err);
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (sharingScreen) {
        try {
          screenStream?.getTracks()?.forEach((t) => t.stop());
        } catch {}
        replaceTrackForAllPeers(null, "video");
        screenTrackRef.current = null;
        setScreenStream(null);
        setSharingScreen(false);
        attachScreenStream(null);
        return;
      }

      const s = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      if (!s) return;
      setScreenStream(s);
      attachScreenStream(s);
      setSharingScreen(true);

      const track = s.getVideoTracks()[0];
      screenTrackRef.current = track;

      // Add screen track to all pcs (best-effort) - will trigger onnegotiationneeded if needed
      Object.values(pcsRef.current).forEach((pc) => {
        try {
          // prefer replace if existing sender
          const sender = pc.getSenders().find((sdr) => sdr.track?.kind === track.kind);
          if (sender && sender.replaceTrack) {
            sender.replaceTrack(track);
          } else {
            pc.addTrack(track, s);
          }
        } catch (e) {
          console.warn("pc.addTrack screen error", e);
        }
      });

      track.onended = () => {
        try {
          replaceTrackForAllPeers(null, "video");
        } catch {}
        setSharingScreen(false);
        setScreenStream(null);
        screenTrackRef.current = null;
        attachScreenStream(null);
      };
    } catch (err) {
      console.error("toggleScreenShare error:", err);
    }
  };

  // chat send (optimistic + dedupe)
  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit("send-message", {
          meetingId,
          sender: userName,
          message: input,
        });
      }
      // optimistic push
      const now = new Date().toISOString();
      setMessages((prev) => [...prev, { sender: userName, text: input, time: now }]);
      setInput("");
    } catch (err) {
      console.error("handleSend error:", err);
    }
  };

  const leaveMeeting = () => {
    try {
      if (socketRef.current?.connected) {
        socketRef.current.emit("leave-meeting", { meetingId });
        socketRef.current.disconnect();
      }
    } catch {}
    socketRef.current = null;
    Object.keys(pcsRef.current).forEach(closePeerConnection);
    try {
      localStreamRef.current?.getTracks()?.forEach((t) => t.stop());
    } catch {}
    try {
      screenStream?.getTracks()?.forEach((t) => t.stop());
    } catch {}
    setLocalStream(null);
    navigate("/");
  };

  // render remote videos
  const renderRemoteVideos = () =>
    participants.map((p) => {
      const peerId = p.socketId;
      // don't render our own id just in case (defensive)
      if (socketRef.current?.id === peerId) return null;
      if (!remoteVideoRefs.current[peerId]) remoteVideoRefs.current[peerId] = null;
      return (
        <div
          key={peerId}
          className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-md flex items-center justify-center"
        >
          <video
            ref={(el) => {
              remoteVideoRefs.current[peerId] = el;
              const stream = remoteStreamsRef.current[peerId];
              if (el && stream instanceof MediaStream) {
                try {
                  el.srcObject = stream;
                  el.muted = false;
                  el.volume = 1;
                  el.play?.().catch(() => {});
                } catch {}
              }
            }}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md">
            {p.userName || "Participant"}
          </div>
        </div>
      );
    });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-sky-50 to-indigo-100 p-4 md:p-6">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between mb-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-sky-700">Meeting Room</h1>
        <p className="text-gray-500 font-medium text-sm md:text-base">Meeting ID: {meetingId}</p>
      </div>

        {/* Main Video Area */}
<div className="flex-grow flex flex-col md:flex-row gap-4 w-full max-w-7xl mx-auto relative">
  {sharingScreen ? (
    // --- SCREEN SHARING LAYOUT (Google Meet style, responsive) ---
    <div className="relative w-full h-[80vh] bg-black rounded-2xl overflow-hidden shadow-lg flex items-center justify-center">
      {/* Large screen share video */}
      <video
        ref={screenVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-contain bg-black transition-all duration-300"
      />

      {/* Floating bottom tiles */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-3 px-4 py-3 bg-black/30 backdrop-blur-md rounded-2xl shadow-xl transition-all duration-300 max-w-[95%]">
        {/* Local user (You) */}
        {cameraOn && (
          <div className="relative">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-28 sm:w-32 h-20 rounded-xl border-2 border-white/70 shadow-md object-cover transition-all duration-300"
            />
            {!micOn && (
              <div className="absolute bottom-1 right-1 bg-rose-600 text-white p-1 rounded-full">
                <MicOff className="w-3 h-3" />
              </div>
            )}
          </div>
        )}

        {/* Remote participants */}
        {participants.length > 0 &&
          participants.map((p) => {
            const peerId = p.socketId;
            if (socketRef.current?.id === peerId) return null;
            if (!remoteVideoRefs.current[peerId]) remoteVideoRefs.current[peerId] = null;
            return (
              <div key={peerId} className="relative">
                <video
                  ref={(el) => {
                    remoteVideoRefs.current[peerId] = el;
                    const stream = remoteStreamsRef.current[peerId];
                    if (el && stream instanceof MediaStream) {
                      try {
                        el.srcObject = stream;
                        el.muted = false;
                        el.volume = 1;
                        el.play?.().catch(() => {});
                      } catch {}
                    }
                  }}
                  autoPlay
                  playsInline
                  className="w-28 sm:w-32 h-20 rounded-xl border-2 border-white/70 shadow-md object-cover transition-all duration-300"
                />
                <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">
                  {p.userName || "Participant"}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  ) : (
    // --- NORMAL GRID LAYOUT (for when not sharing screen) ---
    <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-md flex items-center justify-center">
        <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        {!cameraOn && (
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
            <p className="text-gray-300 font-semibold">Camera Off</p>
          </div>
        )}
        {!micOn && (
          <div className="absolute bottom-2 right-2 bg-rose-600 text-white p-2 rounded-full shadow-md">
            <MicOff className="w-4 h-4" />
          </div>
        )}
        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md">
          {userName} (You)
        </div>
      </div>

      {renderRemoteVideos()}
    </div>
  )}



        
        {/* Chat panel */}
{chatOpen && (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 w-full md:w-80 md:min-w-[20rem] flex flex-col overflow-hidden">
    {/* Chat header */}
    <div className="bg-sky-600 text-white font-semibold py-3 px-4 flex justify-between items-center">
      <span>Chat</span>
      <button
        onClick={() => setChatOpen(false)}
        className="text-white text-lg font-bold hover:opacity-80"
      >
        ×
      </button>
    </div>

    {/* Chat messages area */}
<div className="relative flex-grow max-h-[65vh] overflow-y-auto px-4 py-3 flex flex-col gap-2 scroll-smooth">
      {/* optional visual fade (like Meet) */}
      <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />

      {messages.map((msg, i) => {
        const isUser = msg.sender === userName || msg.sender === "You";
        return (
          <div key={i} className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
            <div
              className={`px-4 py-2 rounded-2xl text-sm shadow-sm ${
                isUser
                  ? "bg-sky-600 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-800 rounded-bl-none"
              }`}
            >
              {!isUser && (
                <p className="text-xs font-semibold text-gray-600 mb-1">{msg.sender}</p>
              )}
              <p>{msg.text}</p>
              <p className="text-[10px] text-gray-400 mt-1 text-right">
                {formatTime(msg.time)}
              </p>
            </div>
          </div>
        );
      })}

      {/* Auto-scroll target */}
      <div ref={chatEndRef} />

      {/* bottom fade for aesthetic */}
      <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />
    </div>

    {/* Input box */}
    <form
      onSubmit={handleSend}
      className="border-t border-gray-200 p-3 flex items-center gap-2"
    >
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
        className="flex-grow border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
      />
      <button
        type="submit"
        className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg font-medium transition"
      >
        Send
      </button>
    </form>
  </div>
)}

      </div>

      {/* Controls */}
      <div className="mt-6 flex flex-wrap gap-4 justify-center pb-6">
        <button onClick={toggleMic} className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold shadow-md transition ${micOn ? "bg-sky-600 text-white hover:bg-sky-700" : "bg-gray-300 text-gray-700 hover:bg-gray-400"}`}>
          {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          {micOn ? "Mute" : "Unmute"}
        </button>

        <button onClick={toggleCamera} className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold shadow-md transition ${cameraOn ? "bg-sky-600 text-white hover:bg-sky-700" : "bg-gray-300 text-gray-700 hover:bg-gray-400"}`}>
          {cameraOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
          {cameraOn ? "Camera On" : "Camera Off"}
        </button>

        <button onClick={toggleScreenShare} className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold shadow-md transition ${sharingScreen ? "bg-rose-500 text-white hover:bg-rose-600" : "bg-green-500 text-white hover:bg-green-600"}`}>
          {sharingScreen ? <MonitorDown className="w-5 h-5" /> : <MonitorUp className="w-5 h-5" />}
          {sharingScreen ? "Stop Sharing" : "Share Screen"}
        </button>

        <button onClick={() => setChatOpen((p) => !p)} className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold shadow-md bg-indigo-500 text-white hover:bg-indigo-600 transition">
          <MessageSquare className="w-5 h-5" />
          {chatOpen ? "Close Chat" : "Open Chat"}
        </button>

        <button onClick={leaveMeeting} className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold shadow-md bg-rose-500 text-white hover:bg-rose-600 transition">
          <LogOut className="w-5 h-5" />
          Leave
        </button>
      </div>
    </div>
  );
}
