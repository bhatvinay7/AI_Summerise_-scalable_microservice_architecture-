"use client";
import {useState} from 'react'
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, SignInForm } from "../../lib/validation";
import { SignIn} from "../../utils/user";
import SuccessNotification from 'src/components/ui/SucessNotification';
export default function SignInPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
  });
  const [response,setResponse]=useState<{message:string|null}>({message:""})
  const [show,setShow]=useState<boolean>(false)
  const onSubmit = async (data: SignInForm) => {
    try {
      const response = await SignIn(data);
      setResponse(response)
      setShow(!show)
    } catch (error: any) {}
    finally{
      setTimeout(()=>{
      setShow(false)

      },5000)
    }
  };


  return (
    <div className="h-screen flex items-center justify-center p-3 bg-[hsl(0,1%,26%)]">
      < SuccessNotification
       message={response?.message}
       show={show}
       onClose={setShow}


      />
      <div className=" w-4/5  sm:w-lg relative m-5  p-4 h-72 flex justify-center items-center flex-col bg-[hsl(0,4%,30%)] shadow-md border border-white/10 rounded-sm  ">
        <h2 className=" text-2xl font-bold absolute pointer-events-none inset-0 left-3 m-4 p-2 text-[hsl(0,3%,76%)]">
          Sign In
        </h2>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="  w-9/10  flex flex-col items-center gap-y-3 p-2 "
        >
          <div className=" w-full p-3 ">
            <input
              type="email"
              placeholder="  Email"
              {...register("email")}
              className=" w-full p-3  h-10 outline-none ring-2 ring-blue-100  border rounded bg-[hsl(0,0%,95%)] text-[hsl(0,0%,20%)]"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>
          <div className="w-full">
            <input
              type="password"
              placeholder="  Password"
              {...register("password")}
              className="w-full p-3 h-10 outline-none ring-2 ring-blue-100 border rounded bg-[hsl(0,0%,95%)] text-[hsl(0,0%,20%)]"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>
          <button
            type="submit"
            className=" w-full p-3 h-10 rounded-lg bg-[hsl(0,0%,40%)] text-white font-semibold hover:bg-[hsl(0,2%,24%)] transition"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
