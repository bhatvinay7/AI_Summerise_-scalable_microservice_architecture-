import { Request} from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from 'dotenv'

dotenv.config()
// use env var for secret or public key
const JWT_SECRET = process.env.REFRESH_TOKEN_SECRET 
export type user={
    userId?:number,
    email?:string,
    role?:string |null
    isVerified:boolean |null
}

export async function getUserDetails(req: Request) {
  try {
    // 1. Get token from headers
    const authHeader = req.headers["authorization"];

    const token = authHeader && authHeader.split(" ")[1] || req.cookies?.token;// Bearer <token>
    console.log(req.cookies)
    console.log(token)
    // 2. Verify token + digital signature
    const decoded = jwt.verify(token, JWT_SECRET!);

    // 3. Attach decoded payload to request

    const userDetails={...decoded as JwtPayload,isVerified:true}
   return  userDetails

    
  } catch (error:any) {
    return {isVerified:false}
  }
}

export default getUserDetails
