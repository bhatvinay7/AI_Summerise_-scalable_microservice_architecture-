"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import {Ellipsis} from 'lucide-react'
import ChatInput from "./chatInput";
import generateUUID from "../../utils/generateUniqueId";
import { useDispatch, useSelector } from "react-redux";
import {
  userInfo,
  getDetails,
} from "../../lib/redux/featuresSlice/userDetails";
import { useParams } from "next/navigation";

interface FileUpload {
  file: File | null;
  uploadedPercentage: number;
  isUploading: boolean;
  isUploadingCompleted: boolean;
  isWaiting: boolean;
  id: string;
}

enum MessageType {
  Notification = "notification",
  Response = "response",
}
interface ResponseMessage {
  sessionId: string | null;
  type?: MessageType | null;
  userId?: number;
  query: { userquery: string | null; id: number | null };
  response?: { llmResponse: string | null };
}

interface ChatMessage {
  sessionId: string;
  query: { userquery: string; id: number };
  response: { llmResponse: string };
}

export default function ChatWindow() {
  const params = useParams();
  const userDetails = useSelector(userInfo);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentChatHistory, setcurrentChatHistoey] = useState<
    ResponseMessage[]
  >([]);
  const dispatch = useDispatch();

  const [userQuery, setUserQuery] = useState<{ query: string | null }>({
    query: "null",
  });
  const [updates, setUpdates] = useState<{ notification: string | null }>({
    notification: "",
  });
  const [response, setResponse] = useState<ResponseMessage | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(
    params.sessionId ? (params.sessionId as string) : generateUUID()
  );

  const wsRef = useRef<WebSocket | null>(null);
  // const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    dispatch(getDetails() as any);
  }, [dispatch]);

  const connectWebSocket = useCallback(() => {
    if (!userDetails.token) return;
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WEBSOCKET_SERVER!);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      // Join session if needed
      // ws.send(
      //   JSON.stringify({
      //     sessionId,
      //     join: true,
      //     userId: userDetails.userId,
      //     token: userDetails.token,
      //   })
      // );
    };

    ws.onmessage = (event) => {
      try {
        const data: ResponseMessage = JSON.parse(event.data);
        if (data.type === MessageType.Notification) {
          setUpdates({ notification: data.type });
        } else if (data.type === MessageType.Response) {
          setcurrentChatHistoey((prev) => {
            // Find the index of the message with the same sessionId
            const index = prev.findIndex(
              (msg) => msg.query?.id === data.query.id
            );
            if (index !== -1) {
              // If found, update the existing message
              const updated = [...prev];
              updated[index] = {
                ...updated[index],
                sessionId: data.sessionId,
                query: {
                  ...updated[index]?.query,
                  id: data?.query.id as number,
                } as { userquery: string; id: number },
                response: { llmResponse: data?.response?.llmResponse ?? null }, // update message
              };
              return updated as ResponseMessage[];
            }
            return prev;
          });
        }
      } catch (err) {
        console.error("Invalid message from WS:", err);
      }
    };

    ws.onerror = (err) => console.error("WebSocket error:", err);

    ws.onclose = (event) => {
      console.log("WebSocket closed, attempting reconnect...", event.reason);
      wsRef.current = null;
      // reconnectTimeoutRef.current = setTimeout(connectWebSocket, 10000); // reconnect after 3s
    };
  }, [sessionId, userDetails]);

  useEffect(() => {
    connectWebSocket();
    setInterval(() => {
      if (!wsRef?.current) {
        connectWebSocket();
      }
    }, 2000);
    return () => {
      wsRef.current?.close();
    };
  }, [connectWebSocket]);

  const sendMessage = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN && userQuery.query) {
      wsRef.current.send(
        JSON.stringify({
          sessionId: sessionId || generateUUID(),
          message: userQuery.query,
          userId: userDetails.userId,
          token: userDetails.token,
        })
      );
      setcurrentChatHistoey((prev) => {
        const updated = [
          ...prev,
          {
            sessionId: sessionId,
            userId: userDetails.userId as number,
            query: { userquery: userQuery.query, id: null },
            response: { llmResponse: null }, // update message
          },
        ];

        return updated;
      });
      setUserQuery({ query: "" });
    }
  };

  return (
    <div className=" w-full relative flex flex-col items-center h-screen">
      <div className=" w-full h-[calc(100vh-140px)] overflow-y-auto  flex flex-col items-center place- top-14">
        <div className=" relative w-4/5 sm:w-3/5 self-center top-14 flex flex-col items-center  p-2">
          {currentChatHistory?.map((each: ResponseMessage) => {
            return (
              <div
                key={each?.query?.id}
                className="w-full h-auto min-h-40 flex flex-col relative  items-center gap-y-3 space-y-5 "
              >
                <div className=" w-fit  self-end h-auto   rounded-xl  place-content-center bg-white/20  text-black/45 p-2 ">
                {each.query.userquery}
                </div>
                { each.response?.llmResponse ?
                <div className="w-full h-auto flex flex-col p-4 min-h-12 items-center rounded-md bg-[#4b4747] text-gray-300/75 relative">
                  <p className="p-4 w-9/10 relative top-2 h-auto ">
                    {each.response?.llmResponse}
                  </p>
                </div>
          :<Ellipsis className="text-white/20 animate-pulse self-start w-4 h-4"/>}
              </div>
            
            );
          })}
        </div>
      </div>

      <div className="w-full flex justify-center h-fit absolute z-39 bottom-4">
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
