"use client";
import React from "react";
import { useState, useEffect } from "react";
import { getUserSessions, Response } from "../../utils/getUserSessions";
export default function Sessions() {
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [sampleConversations, setSampleConversations] = useState<Response[]>(
    []
  );

  useEffect(() => {
    async function fetch() {
      try {
        const response = await getUserSessions();
        setSampleConversations(response);
      } catch (error: any) {}
    }

    fetch();
  }, []);
  return (
    <div className=" h-[calc(100%-100px)] overflow-y-scroll z-[40] sticky top-24 flex flex-col items-center gap-1.5 p-6 m-2 space-y-2">

     {sampleConversations?.map((c: any, index: number) => (
        <div
          key={c.id}
          onClick={() => setActiveChat(c.id)}
          className={` w-19/20  px-4 flex flex-col min-h-10 rounded-md  transition shadow-md
                  ${
                    activeChat === c.id
                      ? " bg-[#3c3c3f]  border-gray-300/20 "
                      : " bg-[#1f2020] hover:bg-white/10 border-white/10 "
                  }
                `}
        >
          <div className="flex w-full flex-col items-start gap-1 p-1.5">
             <div className=" text-sm w-fit relative left-1.5 font-medium text-gray-300 ">
              {c.name}
            </div> 
            <div className="text-xs w-fit relative left-1.5 text-gray-300 truncate  ">
              {c.preview}
            </div> 
           </div>
        </div>
      ))
      
      }  


    </div>
  );
}
