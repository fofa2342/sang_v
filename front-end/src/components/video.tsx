// VideoDirect.tsx
import { useEffect, useRef } from 'react';

interface VideoDirectProps {
  peerConnection: RTCPeerConnection | null;
}

const VideoDirect = ({ peerConnection }: VideoDirectProps) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!peerConnection) return;

    let localStream: MediaStream | null = null;

    const onTrack = (event: RTCTrackEvent) => {
      const [stream] = event.streams;
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    };

    // Setup ontrack *before* adding any stream
    peerConnection.addEventListener('track', onTrack);

    navigator.mediaDevices.getUserMedia({
      video: { width: { min: 640 }, height: { min: 480 }, frameRate: { ideal: 15, max: 30 } },
      audio: true,
    })
    .then(stream => {
      localStream = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
    })
    .catch(err => {
      console.error('Erreur getUserMedia:', err);
      alert('Veuillez autoriser l’accès à la caméra et au micro.');
    });

    return () => {
      peerConnection.removeEventListener('track', onTrack);
      if (localStream) {
        localStream.getTracks().forEach(t => t.stop());
      }
      if (localVideoRef.current) {
        (localVideoRef.current.srcObject as MediaStream | null) = null;
      }
      if (remoteVideoRef.current) {
        (remoteVideoRef.current.srcObject as MediaStream | null) = null;
      }
    };
  }, [peerConnection]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        style={{
          width: '100%',
          height: 'auto',
          backgroundColor: 'black',
          borderRadius: '8px',
        }}
      />
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          width: '200px',
          height: 'auto',
          borderRadius: '8px',
          border: '2px solid white',
        }}
      />
    </div>
  );
};

export default VideoDirect;
