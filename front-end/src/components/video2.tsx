// components/RemoteVideo.tsx
import { useEffect, useRef } from 'react';

export default function RemoteVideo({ peerConnection }: { peerConnection: RTCPeerConnection }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    peerConnection.ontrack = (event) => {
      if (ref.current) ref.current.srcObject = event.streams[0];
    };
  }, [peerConnection]);

  return (
  <video ref={ref} autoPlay playsInline style={{ width: 300 }} />
  )
}
