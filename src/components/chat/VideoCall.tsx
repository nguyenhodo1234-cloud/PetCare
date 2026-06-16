import { useState, useEffect, useRef, useCallback } from "react";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Minimize2,
  Maximize2,
} from "lucide-react";

// STUN servers for NAT traversal
const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

type CallStatus = "idle" | "calling" | "ringing" | "connected" | "ended";

interface VideoCallProps {
  socket: any;
  conversationId: number;
  currentUserName: string;
  remoteUserId: number;
  remoteUserName: string;
  onEnd: () => void;
  mode?: "caller" | "callee";
  incomingSignal?: any;
}

export default function VideoCall({
  socket,
  conversationId,
  currentUserName,
  remoteUserId,
  remoteUserName,
  onEnd,
  mode = "caller",
  incomingSignal,
}: VideoCallProps) {
  const [callStatus, setCallStatus] = useState<CallStatus>(
    mode === "callee" ? "ringing" : "calling",
  );
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [error, setError] = useState("");

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  // Dọn dẹp tài nguyên
  const cleanup = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((t) => t.stop());
      remoteStreamRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  }, []);

  // Bắt đầu cuộc gọi (caller)
  const startCall = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;

      // Thêm local tracks vào peer connection
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Xử lý remote stream
      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          const remoteStream = event.streams[0];
          remoteStreamRef.current = remoteStream;
          remoteVideoRef.current.srcObject = remoteStream;
        }
      };

      // Gửi ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice_candidate", {
            to: remoteUserId,
            candidate: event.candidate,
          });
        }
      };

      // Tạo offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("call_user", {
        to: remoteUserId,
        conversationId,
        signal: offer,
        callerName: currentUserName,
      });

      setCallStatus("calling");
    } catch (err: any) {
      console.error("Start call error:", err);
      if (err.name === "NotAllowedError") {
        setError("Vui lòng cấp quyền truy cập camera và micro");
      } else {
        setError("Không thể bắt đầu cuộc gọi. Kiểm tra camera/micro.");
      }
      cleanup();
    }
  }, [socket, remoteUserId, conversationId, currentUserName, cleanup]);

  // Nhận cuộc gọi (callee)
  const acceptCall = useCallback(
    async (incomingSignal: any) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const pc = new RTCPeerConnection(ICE_SERVERS);
        pcRef.current = pc;

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.ontrack = (event) => {
          if (remoteVideoRef.current) {
            const remoteStream = event.streams[0];
            remoteStreamRef.current = remoteStream;
            remoteVideoRef.current.srcObject = remoteStream;
          }
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice_candidate", {
              to: remoteUserId,
              candidate: event.candidate,
            });
          }
        };

        // Nhận offer và tạo answer
        await pc.setRemoteDescription(
          new RTCSessionDescription(incomingSignal),
        );
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("answer_call", {
          to: remoteUserId,
          signal: answer,
        });

        setCallStatus("connected");
      } catch (err: any) {
        console.error("Accept call error:", err);
        if (err.name === "NotAllowedError") {
          setError("Vui lòng cấp quyền truy cập camera và micro");
        } else {
          setError("Không thể kết nối cuộc gọi.");
        }
        cleanup();
      }
    },
    [socket, remoteUserId, cleanup],
  );

  // Kết thúc cuộc gọi
  const endCall = useCallback(() => {
    socket.emit("end_call", { to: remoteUserId });
    cleanup();
    setCallStatus("ended");
    setTimeout(onEnd, 500);
  }, [socket, remoteUserId, cleanup, onEnd]);

  // Từ chối cuộc gọi
  const rejectCall = useCallback(() => {
    socket.emit("reject_call", { to: remoteUserId });
    cleanup();
    setCallStatus("ended");
    setTimeout(onEnd, 500);
  }, [socket, remoteUserId, cleanup, onEnd]);

  // Toggle mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = isMuted;
        setIsMuted(!isMuted);
      }
    }
  };

  // Toggle camera
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = isVideoOff;
        setIsVideoOff(!isVideoOff);
      }
    }
  };

  // Lắng nghe socket events
  useEffect(() => {
    if (!socket) return;

    // Caller: nhận accepted
    const handleCallAccepted = async (data: { signal: any }) => {
      try {
        if (pcRef.current) {
          await pcRef.current.setRemoteDescription(
            new RTCSessionDescription(data.signal),
          );
        }
        setCallStatus("connected");
      } catch (err) {
        console.error("Set remote description error:", err);
      }
    };

    // Caller: bị từ chối
    const handleCallRejected = () => {
      cleanup();
      setCallStatus("ended");
      setTimeout(onEnd, 1000);
    };

    // Nhận kết thúc từ peer
    const handleCallEnded = () => {
      cleanup();
      setCallStatus("ended");
      setTimeout(onEnd, 500);
    };

    // Nhận ICE candidate từ peer
    const handleIceCandidate = (data: { candidate: any }) => {
      if (pcRef.current && data.candidate) {
        pcRef.current
          .addIceCandidate(new RTCIceCandidate(data.candidate))
          .catch(console.error);
      }
    };

    socket.on("call_accepted", handleCallAccepted);
    socket.on("call_rejected", handleCallRejected);
    socket.on("call_ended", handleCallEnded);
    socket.on("ice_candidate", handleIceCandidate);

    return () => {
      socket.off("call_accepted", handleCallAccepted);
      socket.off("call_rejected", handleCallRejected);
      socket.off("call_ended", handleCallEnded);
      socket.off("ice_candidate", handleIceCandidate);
    };
  }, [socket, cleanup, onEnd]);

  // Bắt đầu call khi mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (mode === "callee" && incomingSignal) {
      acceptCall(incomingSignal);
    } else {
      startCall();
    }
    return () => {
      cleanup();
    };
  }, []);

  // --- Giao diện Ringing (người nhận) ---
  if (callStatus === "ringing") {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center gap-6 animate-fade-in">
        <div className="w-24 h-24 bg-brand/20 rounded-full flex items-center justify-center animate-pulse">
          <Phone size={40} className="text-brand" />
        </div>
        <div className="text-center">
          <h2 className="text-white text-xl font-bold">{remoteUserName}</h2>
          <p className="text-white/60 text-sm mt-1">Đang gọi video...</p>
        </div>
        <div className="flex gap-4 mt-4">
          <button
            onClick={rejectCall}
            className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <PhoneOff size={28} className="text-white" />
          </button>
          <button
            onClick={() => {
              // acceptCall cần signal, nhưng trong ringing mode, signal đã được truyền qua props
              // We'll handle this in the IncomingCall wrapper
            }}
            className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
          >
            <Phone size={28} className="text-white" />
          </button>
        </div>
      </div>
    );
  }

  // --- Giao diện đang gọi (caller) ---
  if (callStatus === "calling") {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center gap-6">
        <div className="w-24 h-24 bg-brand/20 rounded-full flex items-center justify-center">
          <Phone size={40} className="text-brand animate-pulse" />
        </div>
        <div className="text-center">
          <h2 className="text-white text-xl font-bold">{remoteUserName}</h2>
          <p className="text-white/60 text-sm mt-1">Đang gọi...</p>
        </div>
        {error && (
          <p className="text-red-400 text-sm text-center max-w-xs">{error}</p>
        )}
        <button
          onClick={endCall}
          className="mt-4 w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
        >
          <PhoneOff size={28} className="text-white" />
        </button>
      </div>
    );
  }

  // --- Giao diện đang kết nối ---
  if (callStatus === "connected") {
    return (
      <div
        className={`fixed z-50 bg-gray-900 transition-all duration-300 ${
          isMinimized
            ? "bottom-4 right-4 w-72 h-48 rounded-xl shadow-2xl"
            : "inset-0"
        }`}
      >
        {/* Remote video (full screen hoặc thu nhỏ) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover ${isMinimized ? "rounded-xl" : ""}`}
        />

        {/* Local video (pip) */}
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className={`absolute bg-gray-800 rounded-xl border-2 border-white/20 object-cover ${
            isMinimized
              ? "bottom-2 right-2 w-16 h-12"
              : "bottom-20 right-4 w-32 h-48 sm:w-40 sm:h-56"
          } ${isVideoOff ? "hidden" : ""}`}
        />

        {/* Tên người dùng */}
        <div className="absolute top-4 left-4">
          <p className="text-white text-sm font-medium bg-black/40 px-3 py-1 rounded-full">
            {remoteUserName}
          </p>
        </div>

        {/* Thời gian gọi */}
        <CallTimer isMinimized={isMinimized} callStatus={callStatus} />

        {/* Controls */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/50 backdrop-blur-sm rounded-full px-4 py-3 ${
            isMinimized ? "bottom-2 scale-75" : "bottom-8"
          }`}
        >
          <button
            onClick={toggleMute}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isMuted ? "bg-red-500" : "bg-white/20 hover:bg-white/30"
            }`}
            title={isMuted ? "Bật mic" : "Tắt mic"}
          >
            {isMuted ? (
              <MicOff size={20} className="text-white" />
            ) : (
              <Mic size={20} className="text-white" />
            )}
          </button>

          <button
            onClick={toggleVideo}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isVideoOff ? "bg-red-500" : "bg-white/20 hover:bg-white/30"
            }`}
            title={isVideoOff ? "Bật camera" : "Tắt camera"}
          >
            {isVideoOff ? (
              <VideoOff size={20} className="text-white" />
            ) : (
              <Video size={20} className="text-white" />
            )}
          </button>

          <button
            onClick={endCall}
            className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            title="Kết thúc"
          >
            <PhoneOff size={24} className="text-white" />
          </button>

          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 transition-colors"
            title={isMinimized ? "Phóng to" : "Thu nhỏ"}
          >
            {isMinimized ? (
              <Maximize2 size={18} className="text-white" />
            ) : (
              <Minimize2 size={18} className="text-white" />
            )}
          </button>
        </div>

        {error && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-red-500 text-white text-sm px-4 py-2 rounded-lg">
            {error}
          </div>
        )}
      </div>
    );
  }

  return null;
}

// Component hiển thị thời gian gọi
function CallTimer({
  isMinimized,
  callStatus,
}: {
  isMinimized: boolean;
  callStatus: CallStatus;
}) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (callStatus !== "connected") return;
    const start = Date.now();
    const i = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(i);
  }, [callStatus]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  if (isMinimized) return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2">
      <p className="text-white text-sm bg-black/40 px-3 py-1 rounded-full tabular-nums">
        {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
      </p>
    </div>
  );
}

// --- Component Hiển thị cuộc gọi đến ---
interface IncomingCallProps {
  callerName: string;
  onAccept: () => void;
  onReject: () => void;
}

export function IncomingCall({
  callerName,
  onAccept,
  onReject,
}: IncomingCallProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center gap-6 animate-fade-in">
      <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center animate-pulse">
        <Phone size={40} className="text-green-500" />
      </div>
      <div className="text-center">
        <h2 className="text-white text-xl font-bold">{callerName}</h2>
        <p className="text-white/60 text-sm mt-1">Đang gọi video cho bạn...</p>
      </div>
      <div className="flex gap-4 mt-4">
        <button
          onClick={onReject}
          className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
        >
          <PhoneOff size={28} className="text-white" />
        </button>
        <button
          onClick={onAccept}
          className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
        >
          <Phone size={28} className="text-white" />
        </button>
      </div>
    </div>
  );
}
