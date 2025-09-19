import {axiosPrivate} from '../lib/axios'
export  interface Response{
  id:string,
  sessionName:string,
  query:{
    userquery:string
    createdAt:string,
    fileLink:string|null, 
    response:{ id:number,
    llmResponse:string
  },
}[]
}

export interface Session{
  id:string,
  sessionName:string
}
export async function getUserSessions(token:string):Promise<Session[]>{
   
    const response=await axiosPrivate.get('/getUserSessions/session', {headers: {
    Cookie: `token=${token}`
  }})
      return (response as {data:Session[]}).data
}

export async function getUserSessionData(sessionId:string,token:string):Promise<Response>{
    if (!sessionId) throw new Error("Session ID is not provided");
    const response=await axiosPrivate.get(`/getUserSessions/getSessionData`, {headers: {
    Cookie: `token=${token};sessionId=${sessionId}`
  }})
      return (response as {data:Response}).data
}
