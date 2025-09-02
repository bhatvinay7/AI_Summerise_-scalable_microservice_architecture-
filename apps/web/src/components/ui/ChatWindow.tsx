"use client";
import React, { useRef } from "react";
import { WebSocket } from "ws";
import { useState, useEffect } from "react";
import ChatInput from "./chatInput";
import generateUUID from "../../utils/generateUniqueId";
import getUserDetails from "src/utils/userDetails";
import { useDispatch, useSelector } from "react-redux";
import { userInfo, getDetails} from '../../lib/redux/featuresSlice/userDetails';
import { useParams } from "next/navigation";

interface files {
  file: File| null;
  uploadedPercentage: number;
  isUploading: boolean
  isUploadingCompleted :boolean
  isWaiting:boolean
  id:string
}

export default function ChatWindow() {
  const params=useParams()
  const userDetails = useSelector(userInfo);
  const dispatch=useDispatch()
  const [userQuery, setUserQuery] = useState<{ query: string | null }>({
    query: null,
  });
  console.log(userDetails)
  const wsIntsance = useRef<WebSocket | null>(null);

  const [unqId, setSessionId] = useState<string | null>(params.sessionId as string ? params.sessionId as string :null);
  


  useEffect(()=>{
    dispatch(getDetails() as any) 


  },[dispatch])

  

  function SendMessage() {
    if (wsIntsance.current?.readyState == wsIntsance.current?.OPEN) {
      wsIntsance?.current?.send(
        JSON.stringify({
          messageId: !unqId ? generateUUID() : unqId,
          query: userQuery,
          userId: userDetails.userId,
        })
      );
    }
  }

  useEffect(() => {
    try {
      if (!wsIntsance.current) {
        const ws = new WebSocket("ws://localhost:8080");
        wsIntsance.current = ws;

        wsIntsance.current.onopen = () => {
          console.log("WebSocket opened");
        };

        wsIntsance.current.onmessage = (event) => {
          console.log("Message:", event.data);
        };

        wsIntsance.current.onerror = (event) => {
          console.log("Error Message:", event.message);
        };
      }
    } catch (error: any) {}

    return () => {
      wsIntsance.current?.close();
      wsIntsance.current = null;
    };
  }, []);

  return (
    <div className="w-full absolute bottom-20 flex justify-center">
      <ChatInput
        props={{
          onChange: setUserQuery,
          sendMessage: SendMessage,
          sessionId:unqId,
          setSessionId:setSessionId,
          token:userDetails.token

        }}
      />
    </div>
  );
}
