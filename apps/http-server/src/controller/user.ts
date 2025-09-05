import { Request, Response } from 'express';
const  prisma= require('prisma/client')
import jwt from 'jsonwebtoken';
const user=async (req:Request,res:Response)=>{
       try{
         const {username,password,email}=req.body
         if(!username || !password || !email){
           return res.status(400).json({message:"All fields are required"})
         }
          const existingUser = await prisma.user.findUnique({
            where: { email: email },
          });

          if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
          }
          const newUser=await prisma.user.create({
            data:{
              username:username,
              password:password,
              email:email
            }
          })

          res.status(201).json({message:"User created successfully",user:newUser})  
       }
       catch(error:any){
        console.log(error.message)
        console.error('Error in user controller:', error);
        res.status(500).json({message:error.message})
       }

}

const userLogin=async (req:Request,res:Response)=>{
       try{
           const {email,password}=req.body
           if(!email || !password){
             return res.status(400).json({message:"All fields are required"})
           }    

            const user=await prisma.user.findUnique({
              where:{email:email}
            })
            if(!user){
              return res.status(404).json({message:"User credentials are not  found"})
            }

            if(user.password !== password){
              return res.status(401).json({message:"Invalid credentials"})
            }

            const accessToken=jwt.sign(
              { userId: user.id, email: user.email },process.env.ACCESS_TOKEN_SECRET as string,
              { expiresIn: '1h' })
            const refreshToken=jwt.sign(
              { userId: user.id, email: user.email },process.env.REFRESH_TOKEN_SECRET as string,
              { expiresIn: '7d' })
            await prisma.user.update({
              where: { id: user.id },
              data: { refreshToken: refreshToken },
            });
            res.cookie('token',refreshToken,{httpOnly: true, secure: true, sameSite: 'strict' });
            res.status(200).json({message:"User logged in successfully",accessToken:accessToken})
       }
       catch(error:any){
        console.error('Error in userLogin controller:', error);
        res.status(500).json({message:error.message})
       }

}

export  {user,userLogin}
