'use client'
import React from 'react'
import { motion, AnimatePresence } from "framer-motion";
import ChatInput from "./chatInput";
import MessageBuble from "./MessageBuble";
import Session from "./sessions";
import ChatWindow from "./ChatWindow";
import SessionSearch from "./sessionSearch";
import SidebatToggle from "./sidebatToggle";
import { useSelector} from 'react-redux';
import { sideBarState } from '../../lib/redux/featuresSlice/slideBarSlice';
export default function Home() {
  const state=useSelector(sideBarState)
  return (
    <AnimatePresence >

   <motion.div
   
   className="grid max-h-screen grid-cols-[1fr] md:grid-cols-[310px_1fr] items-start "
   animate={{
       gridTemplateColumns: state ? "300px 1fr" : "1fr",
    }}
    transition={{ duration:0.8, ease: "easeInOut" }}>
        {/* Sidebar */}

        <aside className={`${state ?"block absolute sm:sticky " :"hidden"}  top-0 w-full p-1 md:w-[310px] z-[44]   transition-[w] delay-700 h-screen  bg-[#2a2b2a] flex flex-col gap-1.5   border-r border-white/15`}>
          <SessionSearch />
          <div className='w-full h-[calc(100%-100px)] overflow-y-scroll sticky  top-24' >
          <Session />

          </div>  
        </aside>

        {/* Chat Area */}
        <main className=" h-screen flex w-full overflow-x-hidden relative items-center justify-center  ">
         {!state && <div className='w-fit absolute z-[38] inset-0 top-1 left-2 '>
          <SidebatToggle/>
          </div>
         }
          {/* Header */}
          {/* <div className="sticky top-0 z-10 bg-[#0f1115]/80 h-[calc(100vh-100px) relative bottom-30 backdrop-blur border-b border-white/10 px-4 py-3">
            {/* <div className="text-sm text-white/70">Conversation</div>
            <div className="text-lg font-semibold">{sampleConversations.find(x => x.id === activeChat)?.name}</div> */}
          {/* </div> */} 

          {/* Messages */}
          {/* <div className="flex-1  h-[calc(100vh-200px) relative bottom-30 overflow-y-auto px-4 py-4">
            {/* <AnimatePresence>
             < MessageBuble/>
             </AnimatePresence> */}
          {/* </div> */} 

          <ChatWindow />
        </main>
      </motion.div>
             </AnimatePresence>
  )
}
