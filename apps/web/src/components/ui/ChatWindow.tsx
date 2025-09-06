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
  interface response{
    sessionId:string,
    type:string,
    userId:number,
    response:string
  }

  const wsIntsance = useRef<WebSocket | null>(null);
  const [updates,setUpdates]=useState<{notification:string|null}>({notification:""})
  const [response,setResponse]=useState<response|null>(null)
  const [unqId, setSessionId] = useState<string | null>(params.sessionId as string ? params.sessionId as string :null);
  


  useEffect(()=>{
    dispatch(getDetails() as any) 


  },[dispatch])

  

  function SendMessage() {
    console.log("nflkdlhgl")
    if (wsIntsance.current?.readyState == wsIntsance.current?.OPEN) {
      console.log("nflkdlhgl")
   
      setUserQuery({query:""})
      wsIntsance?.current?.send(
        JSON.stringify({
          messageId: !unqId ? generateUUID() : unqId,
          query: userQuery,
          userId: userDetails.userId,
          token:userDetails.token
        })
      );
    }
  }

  useEffect(() => {
    try {
      if (!wsIntsance.current) {
        const ws = new WebSocket(process.env.NEXT_PUBLIC_WEBSOCKET_SERVER!);
        wsIntsance.current = ws;

        wsIntsance.current.onopen = () => {
          console.log("WebSocket opened");
        };

        wsIntsance.current.onmessage = (event) => {
          console.log("Message:", event.data);
          const response=JSON.parse(event.data as string) as response
          setUpdates({notification:null})
          setResponse(null)
          if(response.type=="notification"){
            setUpdates({notification:response.response as string})
          }
          if(response.type=="response"){
            setResponse(response as response)
          }
          setResponse(JSON.parse(event.data as string)as response)
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
    <div className=" w-full  relative  top-0 flex flex-col items-center  h-screen z-37   ">

     <div className=" w-full h-[calc(100vh-160px)]  overflow-y-auto  relative   top-14 flex flex-col  items-center ">
     {response?.response && <div className=" w-3/5 h-auto flex flex-col p-4 min-h-12 items-center rounded-md  bg-[#252222]  text-gray-300    relative ">

           <p className=" p-4 w-9/10 relative top-2 h-auto bg-white ">
            {response && response.response}  
           </p>


      </div>
}

     </div>
     <div className=" w-full flex justify-center  h-fit absolute z-39 bottom-10">

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
    </div>
  );
}
