/**
 * useWebRTC — Manages the full WebRTC lifecycle for a consultation session.
 *
 * Responsibilities:
 *  • Connects to the socket.io signaling server
 *  • Joins the room for the given sessionId
 *  • Creates/negotiates RTCPeerConnection (offer → answer → ICE)
 *  • Exposes localStream, remoteStream, and control functions
 *
 * Usage:
 *   const { localVideoRef, remoteVideoRef, isConnected, peerConnected,
 *           videoOn, micOn, toggleVideo, toggleMic, hangUp } = useWebRTC(sessionId, userId);
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SIGNAL_SERVER = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

// Google STUN + OpenRelay free TURN — works across different networks (mobile data, different WiFi)
const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        // Free public TURN relay — handles strict NATs and mobile carrier networks
        {
            urls: 'turn:openrelay.metered.ca:80',
            username: 'openrelayproject',
            credential: 'openrelayproject'
        },
        {
            urls: 'turn:openrelay.metered.ca:443',
            username: 'openrelayproject',
            credential: 'openrelayproject'
        },
        {
            urls: 'turn:openrelay.metered.ca:443?transport=tcp',
            username: 'openrelayproject',
            credential: 'openrelayproject'
        }
    ]
};

export function useWebRTC(sessionId, userId) {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const socketRef = useRef(null);
    const pcRef = useRef(null);           // RTCPeerConnection
    const localStreamRef = useRef(null);  // Local MediaStream
    const pendingCandidates = useRef([]); // ICE candidates buffered before remoteDesc is set

    const [videoOn, setVideoOn] = useState(false);
    const [micOn, setMicOn] = useState(true);
    const [isConnected, setIsConnected] = useState(false);   // Socket connected
    const [peerConnected, setPeerConnected] = useState(false); // WebRTC peer connected

    // ── Create / reset the RTCPeerConnection ─────────────────────────────────
    const createPeerConnection = useCallback(() => {
        if (pcRef.current) {
            pcRef.current.close();
        }
        const pc = new RTCPeerConnection(ICE_SERVERS);
        pcRef.current = pc;

        // Add any existing local tracks to the new peer connection
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current);
            });
        }

        // When we receive remote tracks → attach to remote video element
        pc.ontrack = (event) => {
            const [remoteStream] = event.streams;
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream;
            }
            setPeerConnected(true);
        };

        // Send ICE candidates through the signaling server
        pc.onicecandidate = (event) => {
            if (event.candidate && socketRef.current) {
                socketRef.current.emit('ice-candidate', sessionId, event.candidate);
            }
        };

        pc.onconnectionstatechange = () => {
            const state = pc.connectionState;
            console.log('[WebRTC] Connection state:', state);
            if (state === 'connected') setPeerConnected(true);
            if (state === 'disconnected' || state === 'failed' || state === 'closed') {
                setPeerConnected(false);
                if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
            }
        };

        return pc;
    }, [sessionId]);

    // ── Apply buffered ICE candidates ────────────────────────────────────────
    const flushPendingCandidates = useCallback(async () => {
        const pc = pcRef.current;
        if (!pc || !pc.remoteDescription) return;
        while (pendingCandidates.current.length > 0) {
            const c = pendingCandidates.current.shift();
            try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch (e) { console.warn('[ICE] Failed to add candidate', e); }
        }
    }, []);

    // ── Main effect: connect socket + set up signaling handlers ──────────────
    useEffect(() => {
        if (!sessionId || !userId) return;

        const socket = io(SIGNAL_SERVER, { transports: ['websocket', 'polling'] });
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('[Socket.io] Connected, joining room:', sessionId);
            setIsConnected(true);
            socket.emit('join-room', sessionId, userId);
        });

        socket.on('disconnect', () => setIsConnected(false));

        // ── A new peer just joined → WE are the existing peer, create the offer
        socket.on('user-joined', async ({ userId: remoteUserId }) => {
            console.log('[WebRTC] Remote user joined, creating offer for', remoteUserId);
            const pc = createPeerConnection();
            try {
                const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
                await pc.setLocalDescription(offer);
                socket.emit('offer', sessionId, pc.localDescription);
            } catch (e) { console.error('[WebRTC] createOffer failed', e); }
        });

        // ── We received an offer → set remote desc + send answer
        socket.on('offer', async (offer) => {
            console.log('[WebRTC] Received offer, creating answer');
            const pc = createPeerConnection();
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(offer));
                await flushPendingCandidates();
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit('answer', sessionId, pc.localDescription);
            } catch (e) { console.error('[WebRTC] handleOffer failed', e); }
        });

        // ── We received an answer → complete the offer/answer handshake
        socket.on('answer', async (answer) => {
            console.log('[WebRTC] Received answer');
            const pc = pcRef.current;
            if (!pc) return;
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
                await flushPendingCandidates();
            } catch (e) { console.error('[WebRTC] setRemoteDescription(answer) failed', e); }
        });

        // ── ICE candidate from the remote peer
        socket.on('ice-candidate', async (candidate) => {
            const pc = pcRef.current;
            if (!pc) return;
            if (pc.remoteDescription) {
                try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); }
                catch (e) { console.warn('[ICE] addIceCandidate failed', e); }
            } else {
                // Buffer until remoteDescription is set
                pendingCandidates.current.push(candidate);
            }
        });

        // ── Remote peer hung up
        socket.on('hang-up', () => {
            console.log('[WebRTC] Remote hang-up received');
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
            setPeerConnected(false);
        });

        socket.on('peer-disconnected', () => {
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
            setPeerConnected(false);
        });

        return () => {
            socket.disconnect();
            pcRef.current?.close();
            localStreamRef.current?.getTracks().forEach(t => t.stop());
            socketRef.current = null;
            pcRef.current = null;
        };
    }, [sessionId, userId, createPeerConnection, flushPendingCandidates]);

    // ── Toggle local video ───────────────────────────────────────────────────
    const toggleVideo = useCallback(async () => {
        if (!videoOn) {
            try {
                // Request camera + mic
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                localStreamRef.current = stream;

                // Attach to local <video>
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                // If a peer connection already exists, add the tracks
                if (pcRef.current) {
                    stream.getTracks().forEach(track => {
                        pcRef.current.addTrack(track, stream);
                    });
                }

                setVideoOn(true);
                setMicOn(true);
            } catch (e) {
                console.error('[Camera] Access denied or unavailable', e);
            }
        } else {
            // Stop all tracks
            localStreamRef.current?.getTracks().forEach(t => t.stop());
            localStreamRef.current = null;
            if (localVideoRef.current) localVideoRef.current.srcObject = null;
            setVideoOn(false);
        }
    }, [videoOn]);

    // ── Toggle microphone ───────────────────────────────────────────────────
    const toggleMic = useCallback(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(t => { t.enabled = !micOn; });
        }
        setMicOn(v => !v);
    }, [micOn]);

    // ── Hang up (local action + signal remote) ───────────────────────────────
    const hangUp = useCallback(() => {
        if (socketRef.current) socketRef.current.emit('hang-up', sessionId);
        localStreamRef.current?.getTracks().forEach(t => t.stop());
        localStreamRef.current = null;
        if (localVideoRef.current) localVideoRef.current.srcObject = null;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        pcRef.current?.close();
        pcRef.current = null;
        setVideoOn(false);
        setPeerConnected(false);
    }, [sessionId]);

    return { localVideoRef, remoteVideoRef, isConnected, peerConnected, videoOn, micOn, toggleVideo, toggleMic, hangUp };
}
