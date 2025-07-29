// App.tsx
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import AppBar from "./components/AppBar";
import VideoDirect from "./components/video";
import RemoteVideo from "./components/video2";
import webrtc from "./assets/images/webrtc.png";
import "./App.css";

const socket: Socket = io("http://localhost:5000", {
  transports: ["websocket"],
});
const configuration = {
  iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
};
const pc = new RTCPeerConnection(configuration);

export default function App() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    pc.onicecandidate = ({ candidate }) => {
      if (candidate) socket.emit("ice-candidate", candidate);
    };
    pc.ontrack = () => {};
    socket.on("offer", async (offer) => {
      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", answer);
    });
    socket.on("answer", async (answer) => {
      await pc.setRemoteDescription(answer);
      setConnected(true);
    });
    socket.on("ice-candidate", (candidate) => {
      pc.addIceCandidate(candidate).catch(console.error);
    });
  }, []);

  return (
    <div>
      <AppBar logo={webrtc} />
      <div style={{ display: "flex", gap: "10px" }}>
        <VideoDirect peerConnection={pc} />
        <RemoteVideo peerConnection={pc} />
      </div>
    </div>
  );
}
