import React from "react";
import Home from '../../../components/ui/home'
import { cookies } from "next/headers";
import { getUserSessionData } from '../../../utils/getUserSessions';
import { getUserSessions, Response } from "../../../utils/getUserSessions";

export default async function Sessionpage({ params }: { params:Promise<{ sessionId: string }> }) {
  try{
    const session=await params
    const cookieStore = await cookies();  
    const token=cookieStore.get('token')?.value as string
    const response= await getUserSessionData(session.sessionId,token)
    const sessions= await getUserSessions(token)
    return (
      <div className="h-[vh] w-full overflow-hidden bg-[#333331] text-white">
        <Home
        props={{data:response as Response,response:sessions}}
        />
      </div>
    );
  }
  catch(error:any){
    console.log("error",error)
    return (
      <div className="h-[vh] w-full overflow-hidden flex justify-center items-center text-white">
      <p className="p-2 text-red-400 ">Requested session  not found</p>
      </div>
    );
  }
}
