import dotenv from 'dotenv'
dotenv.config()
import jwt, { JwtPayload } from 'jsonwebtoken'
export function verifyAuth(token:string){
    try{

        if(!token){
          throw new Error("user is not authenticated ")
        }
        const decode=jwt.verify(token!,process.env.REFRESH_TOKEN_SECRET!) as JwtPayload
        return decode

    }
    catch(error:any){
        throw new Error("user is not authenticated ,credentials are wrong")
    }
}