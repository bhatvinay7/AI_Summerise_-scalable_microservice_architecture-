"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import ChatInput from "./chatInput";
import generateUUID from "../../utils/generateUniqueId";
import { useDispatch, useSelector } from "react-redux";
import { userInfo, getDetails } from "../../lib/redux/featuresSlice/userDetails";
import { useParams } from "next/navigation";

interface FileUpload {
  file: File | null;
  uploadedPercentage: number;
  isUploading: boolean;
  isUploadingCompleted: boolean;
  isWaiting: boolean;
  id: string;
}

interface ResponseMessage {
  sessionId: string;
  type: "notification" | "response";
  userId: number;
  response: string;
}

export default function ChatWindow() {
  const params = useParams();
  const userDetails = useSelector(userInfo);
  const dispatch = useDispatch();

  const [userQuery, setUserQuery] = useState<{ query: string | null }>({ query: null });
  const [updates, setUpdates] = useState<{ notification: string | null }>({ notification: "" });
  const [response, setResponse] = useState<ResponseMessage | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(
    params.sessionId ? (params.sessionId as string) : generateUUID()
  );

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    dispatch(getDetails() as any);
  }, [dispatch]);

  const connectWebSocket = useCallback(() => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WEBSOCKET_SERVER!);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      // Join session if needed
      ws.send(
        JSON.stringify({
          sessionId,
          join: true,
          userId: userDetails.userId,
          token: userDetails.token,
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const data: ResponseMessage = JSON.parse(event.data);
        if (data.type === "notification") {
          setUpdates({ notification: data.response });
        } else if (data.type === "response") {
          setResponse(data);
        }
      } catch (err) {
        console.error("Invalid message from WS:", err);
      }
    };

    ws.onerror = (err) => console.error("WebSocket error:", err);

    ws.onclose = (event) => {
      console.log("WebSocket closed, attempting reconnect...", event.reason);
      wsRef.current = null;
      reconnectTimeoutRef.current = setTimeout(connectWebSocket, 10000); // reconnect after 3s
    };
  }, [sessionId]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      wsRef.current?.close();
    };
  }, [connectWebSocket]);

  const sendMessage = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN && userQuery.query) {
      wsRef.current.send(
        JSON.stringify({
          sessionId: sessionId || generateUUID(),
          message: userQuery,
          userId: userDetails.userId,
          token: userDetails.token,
        })
      );
      setUserQuery({ query: "" });
    }
  };

  return (
    <div className="w-full relative flex flex-col items-center h-screen">
      <div className="w-full h-[calc(100vh-160px)] overflow-y-auto relative flex flex-col items-center top-14">
        {response?.response && (
          <div className="w-3/5 h-auto flex flex-col p-4 min-h-12 items-center rounded-md bg-[#252222] text-gray-300 relative">
            <p className="p-4 w-9/10 relative top-2 h-auto bg-white">{response.response}</p>
          </div>
        )}
      </div>

      <div className="w-full flex justify-center h-fit absolute z-39 bottom-10">
        <ChatInput
          props={{
            onChange: setUserQuery,
            sendMessage,
            sessionId,
            setSessionId,
            token: userDetails.token,
          }}
        />
      </div>
    </div>
  );
}
