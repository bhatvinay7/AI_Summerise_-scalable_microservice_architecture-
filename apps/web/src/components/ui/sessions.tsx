import React from "react";
import Link from "next/link";
import { getUserSessions, Response } from "../../utils/getUserSessions";
import { useParams } from "next/navigation";
export default async function Sessions() {
  try{
  const params = useParams();  
  const response = await getUserSessions();

  return (
    <div className=" h-auto  z-[40] sticky top-24 flex flex-col items-center gap-1.5 p-1.5  space-y-1">

     {response?.map((c: any, index: number) => (
        <Link
          href={`/session/${c.id}`}
          key={c.id}
          className={` w-full  px-1.5 flex flex-col min-h-10 rounded-md  transition shadow-md
                  ${
                    params?.sessionid == c.id
                      ? " bg-[#3c3c3f]  border-gray-300/20 "
                      : " bg-[#1f2020] hover:bg-white/10 border-white/10 "
                  }
                `}
        >
          <div className="flex w-full flex-col items-start gap-1 p-1.5">
             <div className=" text-sm w-fit relative font-medium truncate text-gray-300 ">
              {c?.sessionName}
            </div> 
            
           </div>
        </Link>
      ))
      
      }  


    </div>
  )
  }
  catch(error:any){
  return(  
  <div className=" h-[vh] z-[40] sticky top-24 flex flex-col items-center bg-slate-900 animate-ping gap-1.5 p-1.5  space-y-1">
  </div>
  )
  }
  
}
