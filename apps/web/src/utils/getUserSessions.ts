import useAxiosIntercepter from '../lib/axiosIntercepter'
export  interface Response{
   id:string,
   sessionName?:string |null,
   createdAt:string
}

export async function getUserSessions():Promise<Response[]>{
    const axiosPrivate=useAxiosIntercepter()
    const response=await axiosPrivate.get('/api/getUserSessions/session')
      return (response.data as {data:Response[]}).data
}

export async function getUserSessionData(sessionId:number):Promise<Response>{
    const axiosPrivate=useAxiosIntercepter()
    const response=await axiosPrivate.get(`/api/getUserSessions/getSessionData/${sessionId}`)
      return (response as {data:Response}).data
}
