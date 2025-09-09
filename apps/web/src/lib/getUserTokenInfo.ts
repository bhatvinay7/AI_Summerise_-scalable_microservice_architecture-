import { cookies } from "next/headers";
async function getTokenInfo() {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get('token')?.value ?? null;
    console.log(cookieStore.get('token'))
    return token;
  } catch (error: any) {
    return null
  }
}

export default getTokenInfo;
