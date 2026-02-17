"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../../context/authContext";

export default function Home() {
  const { user, loading } = useAuth();
  const videoRef = useRef(null);
  const localStreamRef = useRef(null);
  const [ws, setWs] = useState(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [error, setError] = useState(null);
  const [viewerCount, setViewerCount] = useState(0);

  // Keep a map of viewerId -> peerConnection
  const peerConnections = useRef({});

  useEffect(() => {
    if (!user || loading) return;

    const startBroadcast = async () => {
      try {
        setError(null);
        
        // Get user media first
        const localStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true,
        });
        
        localStreamRef.current = localStream;
        if (videoRef.current) {
          videoRef.current.srcObject = localStream;
        }

        // Connect to WebSocket
        const socket = new WebSocket("ws://localhost:5000/api/live");
        setWs(socket);

        socket.onopen = () => {
          console.log("Connected to signaling server as broadcaster");
          socket.send(JSON.stringify({ 
            type: "register-broadcaster", 
            user: user._id 
          }));
          setIsBroadcasting(true);
        };

        socket.onmessage = async (message) => {
          try {
            const data = JSON.parse(message.data);
            console.log("Received message:", data.type);

            if (data.type === "viewer-wants-to-join") {
              const viewerId = data.viewerId;
              console.log(`New viewer joining: ${viewerId}`);
              
              // Create a new PeerConnection for this viewer
              const pc = new RTCPeerConnection({
                iceServers: [
                  { urls: "stun:stun.l.google.com:19302" }
                ]
              });

              // Add local tracks to the peer connection
              localStream.getTracks().forEach((track) => {
                console.log(`Adding track: ${track.kind} - ${track.label}`);
                pc.addTrack(track, localStream);
              });

              // Handle ICE candidates
              pc.onicecandidate = (event) => {
                if (event.candidate) {
                  socket.send(JSON.stringify({
                    type: "candidate",
                    candidate: event.candidate,
                    to: viewerId,
                  }));
                }
              };

              // Handle connection state changes
              pc.onconnectionstatechange = () => {
                console.log(`Peer connection state for ${viewerId}:`, pc.connectionState);
                if (pc.connectionState === 'connected') {
                  setViewerCount(prev => prev + 1);
                } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                  setViewerCount(prev => Math.max(0, prev - 1));
                  delete peerConnections.current[viewerId];
                  pc.close();
                }
              };

              // Create and send offer
              const offer = await pc.createOffer({
                offerToReceiveAudio: false,
                offerToReceiveVideo: false
              });
              await pc.setLocalDescription(offer);
              console.log(`Created offer for viewer ${viewerId}`);

              // Save the peer connection
              peerConnections.current[viewerId] = pc;

              // Send offer to viewer
              socket.send(JSON.stringify({
                type: "offer",
                offer,
                to: viewerId,
              }));
            }

            if (data.type === "answer") {
              const viewerId = data.from;
              const pc = peerConnections.current[viewerId];
              if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
                console.log(`Answer processed for viewer ${viewerId}`);
              }
            }

            if (data.type === "candidate") {
              const viewerId = data.from;
              const pc = peerConnections.current[viewerId];
              if (pc) {
                await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
              }
            }
          } catch (error) {
            console.error("Error processing message:", error);
          }
        };

        socket.onerror = (error) => {
          console.error("WebSocket error:", error);
          setError("Connection error occurred");
        };

        socket.onclose = () => {
          console.log("WebSocket connection closed");
          setIsBroadcasting(false);
        };

      } catch (error) {
        console.error("Error starting broadcast:", error);
        setError(`Failed to start broadcast: ${error.message}`);
      }
    };

    startBroadcast();

    // Cleanup function
    return () => {
      // Close all peer connections
      Object.values(peerConnections.current).forEach(pc => {
        pc.close();
      });
      peerConnections.current = {};

      // Stop local stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }

      // Close WebSocket
      if (ws) {
        ws.send(JSON.stringify({ type: "end-broadcast" }));
        ws.close();
      }
    };
  }, [user, loading]);

  const stopBroadcast = () => {
    if (ws) {
      ws.send(JSON.stringify({ type: "end-broadcast" }));
      ws.close();
    }
    
    // Close all peer connections
    Object.values(peerConnections.current).forEach(pc => {
      pc.close();
    });
    peerConnections.current = {};

    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }

    setIsBroadcasting(false);
    setViewerCount(0);
  };

  if (loading || !user) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {!isBroadcasting ? (
        <p className="text-lg">Starting broadcast...</p>
      ) : (
        <div className="text-center">
          <div className="mb-4">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">
              🔴 LIVE
            </span>
            <span className="ml-3 text-gray-600">
              {viewerCount} viewer{viewerCount !== 1 ? 's' : ''}
            </span>
          </div>
          
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-[600px] max-w-full rounded-lg shadow-lg mb-4"
          />
          
          <div className="space-x-4">
            <button
              onClick={stopBroadcast}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg"
            >
              Stop Broadcast
            </button>
          </div>
        </div>
      )}
    </div>
  );
}