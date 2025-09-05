import Home from '../components/ui/home'
export default function Page() {
  // const handleSend = ({ text, file }: { text: string; file: string }) => {
  //   const next = {
  //     id: Date.now(),
  //     side: "right",
  //     text: text || "",
  //     fileName: file,
  //   };

  return (
    <div className=" max-h-screen w-full overflow-hidden bg-[#2f2f2d] text-white ">
      <Home/>
    </div>
  );
}
