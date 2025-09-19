"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import {Ellipsis,Dot} from 'lucide-react'
import ChatInput from "./chatInput";
import generateUUID from "../../utils/generateUniqueId";
import { useDispatch, useSelector } from "react-redux";
import MarkdownIt from "markdown-it";


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
  queryId:string
}

interface ChatMessage {
  sessionId: string;
  query: { userquery: string; id: number };
  response: { llmResponse: string };
}

export default function ChatWindow({props}:{props:{data:any}}) {
  const md = new MarkdownIt({
    html: false,        
    linkify: true,    
    typographer: true,
  });
  const params = useParams();
  const userDetails = useSelector(userInfo);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentChatHistory, setcurrentChatHistory] = useState<
    ResponseMessage[]
  >([]);
  const [socketState,setSocketState]=useState<string|null>(null)
  const [queryId,setQueryId]=useState<string>()
  const dispatch = useDispatch();

  const [userQuery, setUserQuery] = useState<{ query: string | null }>({
    query: "null",
  });
  const [updates, setUpdates] = useState<{ notification: string | null }>({notification:null});
  const [response, setResponse] = useState<ResponseMessage | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(
    params.sessionId ? (params.sessionId as string) : generateUUID()
  );
  const [timeOut,setTimeOut]=useState<boolean>(true)

  const wsRef = useRef<WebSocket | null>(null);
  // const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(()=>{
       let timeOut= setTimeout(()=>{
        if(socketState==="connected"){
          setTimeOut(false)

       }

      },3000)
       
      return()=>{
        clearTimeout(timeOut)
      }
  },[socketState])

  useEffect(() => {
    dispatch(getDetails() as any);
  }, [dispatch]);

   useEffect(() => {
    if (params.sessionId) {
      setSessionId(params.sessionId as string);
    } else {
      const stored = localStorage.getItem("sessionId");
      if (stored) {
        setSessionId(stored);
      }
    }
  }, []);

  const connectWebSocket = useCallback(() => {
    if (!userDetails.token) return;
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WEBSOCKET_SERVER!);
    wsRef.current = ws;

    ws.onopen = () => {
    setSocketState("connected")
    };

    ws.onmessage = (event) => {
      try {
        const data: ResponseMessage = JSON.parse(event.data);
        console.log("Received message:", data);
        if (data.type == MessageType.Notification) {
          setUpdates({ notification: data.response?.llmResponse as string });

        } else if (data.type == MessageType.Response) {
          setcurrentChatHistory((prev) => {
            // Find the index of the message with the same queryId
            const index = prev.findIndex(
              (msg) => msg.queryId === data.queryId
            );
            if (index !== -1) {
              // update the current sessionId
              if(localStorage.getItem("sessionId")){
                localStorage.setItem("sessionId",data?.sessionId!)
              }

              const updated = [...prev];
              const chat=updated.find((chat)=>chat.queryId===data.queryId) 
              if(chat){
               const updateChat={...chat,sessionId: data.sessionId,
                query: {
                  ...chat.query,
                  id: data?.query.id as number,
                } as { userquery: string; id: number },
                response: { llmResponse: data?.response?.llmResponse ?? null }, // update message
              }
            
              const chats=updated.filter((chat)=>chat.queryId!==data.queryId)
              return [...chats,updateChat] as ResponseMessage[];
            } 

            }
            return prev;
          });
        }
      } catch (err:any) {
        setSocketState("errror")
      }
    };

    ws.onerror = (err) =>{ console.error("WebSocket error:", err)
     setSocketState("errror") 
    }
    ws.onclose = (event) => {
      setSocketState("disconnected")
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
    setQueryId(generateUUID()) 
    if (wsRef.current?.readyState === WebSocket.OPEN && userQuery.query) {
      wsRef.current.send(
        JSON.stringify({
          sessionId: sessionId || generateUUID(),
          message: userQuery.query,
          userId: userDetails.userId,
          token: userDetails.token,
          join:true,
          queryId:queryId
        })
      );
      setcurrentChatHistory((prev) => {
        const updated = [
          ...prev,
          {
            sessionId: sessionId,
            userId: userDetails.userId as number,
            query: { userquery: userQuery.query, id: null },
            response: { llmResponse: null }, // update message later when response comes
            queryId:queryId as string
          },
        ];

        return updated;
      });
      setUserQuery({ query: "" });
    }
  };

  return (
    <div className=" w-full relative flex flex-col items-center   h-screen">
      {
        socketState  ?
      <div aria-labelledby={socketState} className=" w-fit h-fit absolute rounded-full right-2 top-2 bg-black/45   text-center ">
      {socketState==="connected"?<Dot className="text-green-700 w-5 h-5 animate-ping"/>:socketState==="disconnected"?<Dot className="text-red-900 w-8 h-8 animate-ping"/>:socketState==="errror"?"Error in connection":<Dot className="text-yellow-400 w-8 h-8 animate-spin"/>}
      </div>:<></>
      }
      <div className=" w-full h-[calc(100vh-140px)]  relative  flex flex-col items-center overflow-auto top-0 bottom-[60px]">
        <div className=" relative w-full sm:max-w-1/2 self-center   top-14  flex flex-col items-center  p-2">
          {currentChatHistory?.map((each: ResponseMessage) => {
        return (
          <div
            key={each?.query?.id}
            className="w-full h-auto min-h-62  flex flex-col scrollBar  overflow-auto  items-center gap-y-4 p-3 "
          >

            <div className=" max-w-[75%] min-w-[40px] relative scrollBar overflow-x-auto  self-end right-0 rounded-xl bg-[#424252] text-white  px-4 py-2 shadow-md">
              {each.query.userquery}
            </div>

            {each.response?.llmResponse ? (
              <div className="w-full flex flex-col ">
                <div className=" w-full self-start rounded-sm bg-[#292727]  text-gray-200 px-4 py-3 shadow-md" dangerouslySetInnerHTML={{ __html: md.render(each.response?.llmResponse) }} />
              </div>
            ) :each.query.userquery ? (
              <Ellipsis className="text-white/40 animate-pulse self-start w-6 h-6" />
            ):<></>}
          </div>
        );
      })}
       
      {socketState && timeOut ? <div className="w-fit self-start flex gap-1 items-center p-1.5 rounded-sm text-black/50 text-sm bg-black/60"><p className="text-white">{socketState}</p><Ellipsis className=" w-3 h-3 text-white/75  "></Ellipsis></div>:<></>}
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
