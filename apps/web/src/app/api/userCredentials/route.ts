import getTokenInfo from "../../../lib/getUserTokenInfo";
import { NextResponse,NextRequest } from 'next/server';
import jwt from 'jsonwebtoken'
interface CustomJwtPayload{
    username:string,
    userId:number,
    picture?:string,
    email:string,
    role?:string
}
export async function GET(req:NextRequest){
   try{
        const token= await getTokenInfo()
        if(!token)
            return NextResponse.json({"message":"user is unauthorized",status:401})
        const decoded = jwt.verify(token!,process.env.REFRESH_TOKEN_SECRET!) as CustomJwtPayload
        
        return NextResponse.json({username:decoded.username ,userId:decoded.userId,email:decoded.email,token:token})
        
   }
   catch(error:any){
       console.log(error) 
       return NextResponse.json({message:`${error.message}`},{status:500})

   }
}