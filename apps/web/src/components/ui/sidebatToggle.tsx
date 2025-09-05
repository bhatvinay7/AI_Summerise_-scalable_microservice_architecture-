import React from 'react'
// import { MoveLeft ,MoveRight} from "lucide-react";
import { FiSidebar } from "react-icons/fi";
import { useSelector,useDispatch } from "react-redux";
import { sideBarState,toggleSidebar } from "../../lib/redux/featuresSlice/slideBarSlice";
export default function SidebatToggle() {
  const state=useSelector(sideBarState)
  const dispatch=useDispatch()
//   useEffect(()=>{
// },[state,dispatch])

function changeWindow(){
    
    dispatch(toggleSidebar(!state))
  }
  return (
    <div className='w-fit h-fit z-40 '>
         {state?  <FiSidebar  onClick={()=>{changeWindow()}} className="w-6 h-6 text-white/30 " /> :<FiSidebar  onClick={()=>{changeWindow()}} className="w-6 h-6 text-white/30 " /> }
      
    </div>
  )
}
