import React from "react";
import Home from '../../../components/ui/home'
import { useParams } from 'next/navigation';
import { getUserSessionData } from '../../../utils/getUserSessions';
export default async function Sessionpage() {
  try{
    const params = useParams();
    const response= await getUserSessionData(params.sessionId as string)
    return (
      <div className="h-[vh] w-full overflow-hidden bg-[#2f2f2d] text-white">
        <Home
        props={{data:response}}
        />
      </div>
    );
  }
  catch(error:any){
    return (
      <div className="h-[vh] w-full overflow-hidden flex justify-center bg-[#2f2f2d] text-white">
      <p className="p-2 text-red-400 ">Requested session  not found</p>
      </div>
    );
  }
}
