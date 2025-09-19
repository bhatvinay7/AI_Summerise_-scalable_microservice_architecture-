import { Request, Response } from "express";    
const prisma =require("prisma/client")
import getUserDetails,{user} from "@/auth/getUserDetailAuth";
const getSessions=async(req:Request,res:Response)=>{
     try{
     const user:user=await getUserDetails(req)
     if(!user?.isVerified){
        return res.status(403).json({message:"unauthorized request"})
     } 
     const sessions=await prisma.session.findMany({
         select:{
            id:true,
            sessionName:true
         },
         where:{
            userId:user.userId
         }
     })

     return res.status(200).json({sessions})
     }
     catch(error:any){
        return res.status(500).json({message:error.message  })
     }

}

export default getSessions
    