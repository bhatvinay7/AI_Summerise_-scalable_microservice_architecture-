import express,{Request,Response} from "express";
import prisma from 'prisma'
const getSessionData=async(req:Request,res:Response)=>{
      try{
          const sessionId=req.params.sessionId
            if(!sessionId){
                return res.status(400).json({message:"Session ID is required"})
            }
            const sessionData=await prisma.session.findUnique({
                where:{
                    id:sessionId
                },
                select:{
                    id:true,
                    sessionName:true,
                    query:{
                        select:{
                            filelink:true,
                            createdAt:true,
                            userquery:true,
                            response:{
                                select:{
                                    id:true,
                                    llmResponse:true,
                                }
                            }
                            
                        }
                    },
                  

                }

            })
            return res.status(200).json({data:sessionData})
      }
      catch(error:any){
        return res.status(500).json({message:error.message})
      }

}

export default getSessionData