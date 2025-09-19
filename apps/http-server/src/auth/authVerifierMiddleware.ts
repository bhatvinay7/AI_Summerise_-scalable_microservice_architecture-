import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { PrismaClient } from "@prisma/client/extension";
const prisma:PrismaClient =require("prisma/client");
import dotenv from 'dotenv'
dotenv.config()
// use env var for secret or public key
const JWT_SECRET = process.env.REFRESH_TOKEN_SECRET 
type user={
    userId:number,
    email:string,
    role?:string |null
}
export interface AuthRequest extends Request {
  user?:user | JwtPayload; // decoded payload
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // 1. Get token from headers
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1] || req.cookies?.token;// Bearer <token>
    console.log(req.cookies)

    if (!token) {
      return res.status(401).json({ message: "Access token missing" });
    }

    // 2. Verify token + digital signature
    const decoded = jwt.verify(token, JWT_SECRET!);

    // 3. Attach decoded payload to request
    req.user = decoded as user
    if(!req.user?.userId){
      return res.status(403).json({ message: "Invalid token payload" });
    }
    const user=prisma.user.findUnique({
      where:{
        id:req.user?.userId
      }
    })
    if(!user){
      return res.status(403).json({ message: "User not found" });
    }
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}

export default authMiddleware;
