import { Request, Response } from "express";    
const prisma =require("prisma/client")
const getSessions=async(req:Request,res:Response)=>{
     try{
     const sessions=await prisma.session.findMany({
         select:{
            id:true,
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
    