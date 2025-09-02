import React from "react";
import SessionSearch from "../../../components/ui/sessionSearch";
import Session from "../../../components/ui/sessions";
export default function Sessionpage() {
  return (
    <div className="h-screen bg-[#181818] w-full text-white overflow-y-scroll">
      <div className="grid grid-cols-[300px_1fr] h-full  ">
        <aside className="h-full bg-[#232121] flex flex-col gap-1.5  p-2 border-r border-white/10">
          <SessionSearch />
          <Session />
        </aside>
      </div>
    </div>
  );
}
