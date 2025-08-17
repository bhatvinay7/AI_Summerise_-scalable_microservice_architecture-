import { Request, Response } from "express";    
import prisma from "prisma";
const getSessions=async(req:Request,res:Response)=>{
     try{
     const sessions=await prisma.session.findMany({
         select:{
            id:true,
            createdAt:true,
            sessionName:true
         },
         where:{
            userId:req.body?.userId
         }
     })

     return res.status(200).json({data:sessions})
     }
     catch(error:any){
        return res.status(500).json({message:error.message  })
     }

}

export default getSessions
    