import { cookies } from "next/headers";
async function getTokenInfo() {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get("token")?.value!;
    return token;
  } catch (error: any) {}
}

export default getTokenInfo;
