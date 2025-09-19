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
    <div className=" h-[vh] w-full overflow-hidden bg-[#484841] text-white ">
      <Home/>
    </div>
  );
}
