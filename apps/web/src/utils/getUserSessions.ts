import {axiosPrivate} from '../lib/axios'
import getCookie from "../utils/getCookie";
export  interface Response{
  id:string,
  sessionName?:string |null,
  createdAt:string
}

export async function getUserSessions():Promise<Response[]>{
    const token=await getCookie('token')
    const response=await axiosPrivate.get('/getUserSessions/session', {headers: {
    Cookie: `token=${token}`
  }})
      return (response.data as {data:Response[]}).data
}

export async function getUserSessionData(sessionId:string):Promise<Response>{
    const token=await getCookie('token')
    if (!sessionId) throw new Error("Session ID is not provided");
    const response=await axiosPrivate.get(`/getUserSessions/getSessionData`, {headers: {
    Cookie: `token=${token}; sessionId=${sessionId}`
  }})
      return (response as {data:Response}).data
}
