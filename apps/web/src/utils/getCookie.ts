import { cookies } from "next/headers";

export async function getCookie(name:string){ 
    const cookieStore = await cookies();
    const token = cookieStore.get(name)?.value || null;
    return token
}
export default getCookie