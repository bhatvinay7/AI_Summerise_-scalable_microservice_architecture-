import axios from '../lib/axios'

export interface userDetails{
      userId:number,
      email:string,
      username:string

}
export default async function getUserDetails():Promise<userDetails>{
    const response=await axios.get('/api/userCredentials')
    return (response as {data:userDetails}).data 

}