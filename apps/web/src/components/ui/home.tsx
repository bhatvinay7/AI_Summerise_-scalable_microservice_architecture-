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
   
   className="grid h-full grid-cols-[1fr] md:grid-cols-[310px_1fr] "
   animate={{
       gridTemplateColumns: state ? "300px 1fr" : "1fr",
    }}
    transition={{ duration:0.8, ease: "easeInOut" }}>
        {/* Sidebar */}

        <aside className={`${state ?"block" :"hidden"} absolute w-3/4 md:w-[310px] z-[39]  md:relative   transition-[w] delay-700 h-screen  bg-[#2a2b2a] flex flex-col gap-1.5  p-2 border-r border-white/15`}>
          <SessionSearch />
          <Session />
        </aside>

        {/* Chat Area */}
        <main className="h-full flex flex-col relative items-center">
         {!state && <div className='w-fit absolute inset-0 top-1 left-2 '>
          <SidebatToggle/>
          </div>
         }
          {/* Header */}
          <div className="sticky top-0 z-10 bg-[#0f1115]/80 backdrop-blur border-b border-white/10 px-4 py-3">
            {/* <div className="text-sm text-white/70">Conversation</div>
            <div className="text-lg font-semibold">{sampleConversations.find(x => x.id === activeChat)?.name}</div> */}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {/* <AnimatePresence>
             < MessageBuble/>
             </AnimatePresence> */}
          </div>

          <ChatWindow />
        </main>
      </motion.div>
             </AnimatePresence>
  )
}
