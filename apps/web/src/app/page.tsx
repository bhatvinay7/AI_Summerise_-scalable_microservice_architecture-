import Home from '../components/ui/home'
import { getUserSessions, Response } from "../utils/getUserSessions";
import { cookies } from "next/headers";
export default async function Page() {
const cookieStore = await cookies();
const token=cookieStore.get('token')?.value as string
const sessions= await getUserSessions(token)
return (
    <div className=" h-[vh] w-full overflow-hidden bg-[#333331] text-white ">
      <Home
      props={{data:[],response:sessions}}
      />
    </div>
  );
}
