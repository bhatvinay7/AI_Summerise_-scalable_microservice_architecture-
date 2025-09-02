"use client";
import {useState} from 'react'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, SignUpForm } from "../../lib/validation";
import {SignUp } from "../../utils/user";
import SuccessNotification from "src/components/ui/SucessNotification";
export default function SignUpPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
  });
  const [response,setResponse]=useState<{message:string|null}>({message:""})
  const [show,setShow]=useState<boolean>(false)
  const onSubmit = async (data: SignUpForm) => {
    try {
      const response = await SignUp(data);
      setResponse(response)
    } catch (error: any) {}
     finally{
      setTimeout(()=>{
      setShow(false)

      },5000)
    }
  };

  return (
    <div className="h-screen flex items-center min-w-[200px] justify-center bg-[hsl(0,1%,26%)]">
      <SuccessNotification
       message={response?.message}
       show={show}
       onClose={setShow}

      />
      <div className=" w-4/5  sm:w-md relative inset-0 top-0  p-2  h-80 flex justify-center items-center flex-col bg-[hsl(0,4%,30%)] shadow-md border border-white/10 rounded-sm gap-y-2 ">
        <h2 className=" inline-block text-xl md:text-2xl font-bold relative pointer-events-none inset-0 self-baseline   left-4  p-2 mb-5 text-[hsl(0,3%,76%)]">
          Sign Up
        </h2>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className=" relative  w-9/10 h-auto mt-6  flex flex-col items-center gap-y-3 p-2 "
        >
          <div className=" w-full p-3 ">
            <input
              type="text"
              placeholder="  Name"
              {...register("username")}
              className="w-full  h-10 outline-none ring-2 ring-blue-200 ring-offset-1 p-2 border rounded bg-[hsl(0,0%,95%)] text-[hsl(0,0%,20%)]"
            />
            {errors.username && (
              <p className="text-red-400 text-sm">{errors.username.message}</p>
            )}
          </div>
          <div className=" w-full p-3 ">
            <input
              type="email"
              placeholder="  Email"
              {...register("email")}
              className="w-full p-2 h-10 border outline-none  rounded ring-2 ring-blue-200 ring-offset-1 bg-[hsl(0,0%,95%)] text-[hsl(0,0%,20%)]"
            />
            {errors.email && (
              <p className="text-red-400 text-sm">{errors.email.message}</p>
            )}
          </div>
          <div className=" w-full p-3 ">
            <input
              type="  password"
              placeholder="  Password"
              {...register("password")}
              className="w-full p-2 border h-10 outline-none ring-2 ring-blue-200 ring-offset-1 rounded bg-[hsl(0,0%,95%)] text-[hsl(0,0%,20%)]"
            />
            {errors.password && (
              <p className="text-red-400 text-sm">{errors.password.message}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded-lg  h-10 bg-[hsl(0,0%,40%)] transition-colors text-white font-semibold hover:bg-[hsl(0,3%,23%)] "
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
