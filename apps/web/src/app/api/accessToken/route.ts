import {NextResponse,NextRequest } from "next/server";
import getTokenInfo from '../../../lib/getUserTokenInfo'
export async function GET(req:NextRequest){
    try{
        const token:string|null= await getTokenInfo() || (req.cookies.get("token")?.value ?? null)
        return NextResponse.json(token!,{status:200})

    }
    catch(error:any){
        console.log(error.message)
         return NextResponse.json(error.message,{status:500})
    }
}