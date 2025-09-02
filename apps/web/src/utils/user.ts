import {axiosPublic} from "../lib/axios";

export interface userSignup {
  username: string;
  password: string;
  email: string;
}
export interface message {
  message: string;
}
export interface userSignIn {

  password: string;
  email: string;
}
 async function SignUp(formdata: userSignup): Promise<message> {
  const response = await axiosPublic.post("/api/user/signup", formdata);
  return (response as { data: message }).data;
}

async function SignIn(formdata: userSignIn): Promise<message> {
  const response = await axiosPublic.post("/api/user/signin", formdata);
  return (response as { data: message }).data;
}

export {SignUp, SignIn}
