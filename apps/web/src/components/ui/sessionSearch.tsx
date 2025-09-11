import React from "react";
import { Search } from "lucide-react";
import SidebatToggle from "./sidebatToggle";
export default function SessionSearch() {
  
  return (
    <div className=" sticky w-full top-0 z-10 p-1 flex flex-col justify-center  border-b  border-white/10 bg-[#2a2b2a] ">
      <div className="  top-1 left-1 relative w-fit">

      <SidebatToggle/>
      </div>
      <div className=" flex items-center justify-center mx-auto h-16 w-full p-1.5    gap-1">
        
        <div className=" flex-1 relative instet-0  ">
          <div className="relative m-1 flex gap-1.5 p-0.5 items-center rounded-2xl  bg-[#2d2e2e] border  focus:ring-2 border-white/10 placeholder-white/40  focus:ring-white/20 focus:border-white/20 ">
            <Search className=" w-4 h-4  pointer-events-none " />

            <input
              type="text"
              placeholder="Search conversations"
              className="w-4/5    rounded-2xl pl-1  py-1 h-10 text-sm focus:outline-none "
            />
          </div>
        </div>
      </div>
    </div>
  );
}
