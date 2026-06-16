import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { useSelector } from "react-redux";
import type { RootState } from "../store";

let globalSocket: Socket | null = null;

export function getSocket(): Socket | null {
  return globalSocket;
}

export function useSocket(): Socket | null {
  const { user, token } = useSelector((s: RootState) => s.auth);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!user || !token) {
      setSocket(null);
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    const s = io("/", {
      query: { userId: user.id },
      auth: { token },
      transports: ["websocket", "polling"],
    });

    s.on("connect", () => {
      console.log("🔌 Socket connected:", s.id);
      setSocket(s);
      globalSocket = s;
    });

    s.on("disconnect", () => {
      console.log("🔌 Socket disconnected");
      setSocket(null);
      globalSocket = null;
    });

    // Nếu đã connect sẵn (reconnect)
    if (s.connected) {
      setSocket(s);
      globalSocket = s;
    }

    return () => {
      s.disconnect();
      setSocket(null);
      globalSocket = null;
    };
  }, [user?.id, token]);

  return socket;
}
