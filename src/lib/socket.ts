"use client";

import { io } from "socket.io-client";
import { API_BASE_URL } from "@/lib/api/client";
import { getAccessToken } from "@/lib/auth/token-storage";

const socketUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

export const socket = io(socketUrl, {
  autoConnect: false,
  transports: ["websocket", "polling"],
  withCredentials: true,
});

export const connectSocket = () => {
  const accessToken = getAccessToken();

  if (accessToken) {
    socket.auth = { token: accessToken };
  }

  if (!socket.connected) {
    socket.connect();
  }
};
