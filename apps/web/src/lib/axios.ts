import axios from "axios";

export default axios.create({
  baseURL: process.env.NEXT_PUBLIC_FRONTEND_URL!,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const axiosPrivate = axios.create({
  baseURL: "https://api.chatt.services",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
console.log(process.env.NEXT_PUBLIC_BACKEND_URL)
export const axiosPublic= axios.create({
  baseURL:"https://api.chatt.services",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

