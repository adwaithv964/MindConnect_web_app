/**
 * useWebRTC — Manages the full WebRTC lifecycle for a consultation session.
 *
 * Key design decisions:
 *  • Pre-adds audio+video sendrecv TRANSCEIVERS on peer connection creation,
 *    so the SDP always has m-lines and ICE negotiation starts immediately —
 *    even before either user enables their camera.
 *  • Uses replaceTrack() (not addTrack) when camera is enabled, which requires
 *    no SDP renegotiation.
 *  • Monitors iceConnectionState (more reliable than connectionState) for the
 *    peerConnected flag.
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
    const pcRef = useRef(null);          // RTCPeerConnection
    const localStreamRef = useRef(null);          // Local MediaStream
    const pendingCandidates = useRef([]);         // Buffered ICE candidates

    const [videoOn, setVideoOn] = useState(false);
    const [micOn, setMicOn] = useState(false);
    const [isConnected, setIsConnected] = useState(false);  // Socket connected
    const [peerConnected, setPeerConnected] = useState(false); // WebRTC ICE connected

    // ── Helper: find transceiver by kind ─────────────────────────────────────
    const getTransceiver = (pc, kind) =>
        pc.getTransceivers().find(t => t.receiver?.track?.kind === kind);

    // ── Create RTCPeerConnection with pre-wired sendrecv transceivers ─────────
    // Adding transceivers BEFORE creating the offer ensures the SDP always has
    // audio and video m-lines, so ICE negotiation starts even with camera off.
    const createPeerConnection = useCallback(() => {
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }
        const pc = new RTCPeerConnection(ICE_SERVERS);
        pcRef.current = pc;

        // Pre-wire sendrecv transceivers → SDP will have audio + video sections
        pc.addTransceiver('audio', { direction: 'sendrecv' });
        pc.addTransceiver('video', { direction: 'sendrecv' });

        // If camera is already on, replace null tracks immediately
        if (localStreamRef.current) {
            for (const track of localStreamRef.current.getTracks()) {
                const t = getTransceiver(pc, track.kind);
                if (t) t.sender.replaceTrack(track);
            }
        }

        // Remote tracks → show in remote video element
        pc.ontrack = (event) => {
            console.log('[WebRTC] received remote track:', event.track.kind);
            if (remoteVideoRef.current) {
                let stream = remoteVideoRef.current.srcObject;
                if (!stream) {
                    stream = new MediaStream();
                    remoteVideoRef.current.srcObject = stream;
                }
                stream.addTrack(event.track);
            }
        };

        // ICE candidates → relay through signaling server
        pc.onicecandidate = (event) => {
            if (event.candidate && socketRef.current) {
                socketRef.current.emit('ice-candidate', sessionId, event.candidate);
            }
        };

        // ICE connection state — most reliable indicator of P2P connectivity
        pc.oniceconnectionstatechange = () => {
            const state = pc.iceConnectionState;
            console.log('[WebRTC] ICE state:', state);
            if (state === 'connected' || state === 'completed') {
                setPeerConnected(true);
            } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
                setPeerConnected(false);
                if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
            }
        };

        pc.onconnectionstatechange = () => {
            const state = pc.connectionState;
            console.log('[WebRTC] Connection state:', state);
            if (state === 'connected') setPeerConnected(true);
            if (state === 'failed' || state === 'closed') setPeerConnected(false);
        };

        return pc;
    }, [sessionId]);

    // ── Flush buffered ICE candidates once remote description is set ──────────
    const flushPendingCandidates = useCallback(async () => {
        const pc = pcRef.current;
        if (!pc || !pc.remoteDescription) return;
        while (pendingCandidates.current.length > 0) {
            const c = pendingCandidates.current.shift();
            try { await pc.addIceCandidate(new RTCIceCandidate(c)); }
            catch (e) { console.warn('[ICE] Failed to add candidate', e); }
        }
    }, []);

    // ── Main effect: socket + signaling ──────────────────────────────────────
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

        // Second peer joined → we are the initiator, create offer
        socket.on('user-joined', async ({ userId: remoteId }) => {
            console.log('[WebRTC] Peer joined, sending offer to', remoteId);
            const pc = createPeerConnection();
            try {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                socket.emit('offer', sessionId, pc.localDescription);
            } catch (e) { console.error('[WebRTC] createOffer failed:', e); }
        });

        // Received offer → send answer
        socket.on('offer', async (offer) => {
            console.log('[WebRTC] Received offer, sending answer');
            const pc = createPeerConnection();
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(offer));
                await flushPendingCandidates();
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit('answer', sessionId, pc.localDescription);
            } catch (e) { console.error('[WebRTC] handleOffer failed:', e); }
        });

        // Received answer → complete handshake
        socket.on('answer', async (answer) => {
            console.log('[WebRTC] Received answer');
            const pc = pcRef.current;
            if (!pc) return;
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
                await flushPendingCandidates();
            } catch (e) { console.error('[WebRTC] setRemoteDesc(answer) failed:', e); }
        });

        // ICE candidate from remote peer
        socket.on('ice-candidate', async (candidate) => {
            const pc = pcRef.current;
            if (!pc) return;
            if (pc.remoteDescription) {
                try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); }
                catch (e) { console.warn('[ICE] addIceCandidate failed:', e); }
            } else {
                pendingCandidates.current.push(candidate);
            }
        });

        // Remote hung up
        socket.on('hang-up', () => {
            console.log('[WebRTC] Remote hang-up');
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
            pendingCandidates.current = [];
        };
    }, [sessionId, userId, createPeerConnection, flushPendingCandidates]);

    // ── Toggle camera ─────────────────────────────────────────────────────────
    const toggleVideo = useCallback(async () => {
        if (!videoOn) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                const track = stream.getVideoTracks()[0];

                if (!localStreamRef.current) localStreamRef.current = new MediaStream();
                const existing = localStreamRef.current.getVideoTracks()[0];
                if (existing) {
                    existing.stop();
                    localStreamRef.current.removeTrack(existing);
                }
                localStreamRef.current.addTrack(track);

                // Show local preview
                if (localVideoRef.current && localVideoRef.current.srcObject !== localStreamRef.current) {
                    localVideoRef.current.srcObject = localStreamRef.current;
                }

                // Replace null tracks in the existing peer connection
                if (pcRef.current) {
                    const t = getTransceiver(pcRef.current, 'video');
                    if (t) await t.sender.replaceTrack(track);
                }

                setVideoOn(true);
            } catch (e) {
                console.error('[Camera] Access denied:', e);
            }
        } else {
            // Replace video track with null and stop hardware recording light
            if (localStreamRef.current) {
                const track = localStreamRef.current.getVideoTracks()[0];
                if (track) {
                    track.stop();
                    localStreamRef.current.removeTrack(track);
                }
            }
            if (pcRef.current) {
                const t = getTransceiver(pcRef.current, 'video');
                if (t && t.sender.track) await t.sender.replaceTrack(null);
            }
            setVideoOn(false);
        }
    }, [videoOn]);

    // ── Toggle mic ────────────────────────────────────────────────────────────
    const toggleMic = useCallback(async () => {
        if (!micOn) {
            // Turning ON
            let track = localStreamRef.current?.getAudioTracks()[0];
            if (!track) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    track = stream.getAudioTracks()[0];
                    if (!localStreamRef.current) localStreamRef.current = new MediaStream();
                    localStreamRef.current.addTrack(track);

                    if (localVideoRef.current && localVideoRef.current.srcObject !== localStreamRef.current) {
                        localVideoRef.current.srcObject = localStreamRef.current;
                    }
                    if (pcRef.current) {
                        const t = getTransceiver(pcRef.current, 'audio');
                        if (t) await t.sender.replaceTrack(track);
                    }
                } catch (e) {
                    console.error('[Mic] Access denied:', e);
                    return;
                }
            } else {
                track.enabled = true;
            }
            setMicOn(true);
        } else {
            // Mute mic - rather than stopping it completely, just disable track
            const track = localStreamRef.current?.getAudioTracks()[0];
            if (track) track.enabled = false;
            setMicOn(false);
        }
    }, [micOn]);

    // ── Hang up ───────────────────────────────────────────────────────────────
    const hangUp = useCallback(() => {
        if (socketRef.current) socketRef.current.emit('hang-up', sessionId);
        if (pcRef.current) {
            pcRef.current.getTransceivers().forEach(t => { try { t.stop(); } catch { } });
            pcRef.current.close();
            pcRef.current = null;
        }
        localStreamRef.current?.getTracks().forEach(t => t.stop());
        localStreamRef.current = null;
        if (localVideoRef.current) localVideoRef.current.srcObject = null;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        setVideoOn(false);
        setMicOn(false);
        setPeerConnected(false);
    }, [sessionId]);

    return {
        localVideoRef, remoteVideoRef,
        isConnected, peerConnected,
        videoOn, micOn,
        toggleVideo, toggleMic, hangUp
    };
}
