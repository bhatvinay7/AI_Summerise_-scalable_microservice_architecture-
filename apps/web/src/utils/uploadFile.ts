import useAxiosIntercepter from '../lib/axiosIntercepter'

export  interface Response{
    fileLink:string
}

export async function uploadFile(formdata:FormData):Promise<Response>{
    const axiosPrivate=useAxiosIntercepter()
    const response=await axiosPrivate.post('/uploadFile/upload',formdata)
      return (response as {data:Response}).data

}