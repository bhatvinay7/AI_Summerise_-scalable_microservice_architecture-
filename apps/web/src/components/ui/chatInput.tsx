"use client";
import React from "react";
import { useState, useRef, useEffect } from "react";
import { Paperclip, Send, LoaderCircle, Ellipsis } from "lucide-react";
import { Files } from "lucide-react";
import generateUUID from "src/utils/generateUniqueId";
interface files {
  file: File | null;
  uploadedPercentage: number;
  isUploading: boolean;
  isWaiting: boolean;
  isUploadingCompleted: boolean;
  id: string;
}
export default function ChatInput({
  props,
}: {
  props: {
    onChange: React.Dispatch<React.SetStateAction<{ query: string | null }>>;
    sendMessage: () => void;
    sessionId: string | null;
    setSessionId: (sessionId: string) => void;
    token: string;
  };
}) {
  const [text, setText] = useState<string>("");
  const [currentFile, setCurrentFile] = useState<files | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [fileArray, setFileChange] = useState<files[]>([]);

  const handleSend = () => {
    props.sendMessage();
    setText("")
    if(textareaRef?.current){
      textareaRef.current.style.height ="auto"

    }
  };

useEffect(()=>{

  if (textareaRef.current) {
    textareaRef.current.style.height = "auto"; // reset first
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }

},[text])

  useEffect(() => {
  fileArray.forEach((file, i) => {
    if (file.isWaiting) {
      const formdata = new FormData();
      formdata.append("file", file.file as File);
      formdata.append("sessionId", props.sessionId!);
      formdata.append("fileId", file.id);

      // mark as uploading
      setFileChange(prev =>
        prev.map(f =>
          f.id === file.id ? { ...f, isUploading: true, isWaiting: false } : f
        )
      );

      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          console.log(`Upload progress: ${percentComplete.toFixed(2)}%`);
        }
      });

      xhr.open("POST", `${process.env.NEXT_PUBLIC_BACKEND_URL}/uploadFile/upload`);
      xhr.setRequestHeader("Authorization", `Bearer ${props.token}`);
      xhr.responseType = "json";
      xhr.send(formdata);

      xhr.addEventListener("load", () => {
        const response = xhr.response;
        if(response.SessionId){
          if(!localStorage.getItem("sessionId"))
            localStorage.setItem("sessionId",response.sessionId)
        }
        setFileChange(prev =>
          prev.map(f =>
            f.id === response?.fileId
              ? { ...f, isUploading: false, isUploadingCompleted: true }
              : f
          )
        );
      });

      xhr.addEventListener("error", () => {
        console.error("Upload failed!");
      });
    }
  });
}, [fileArray]);

  useEffect(() => {
   
    if (text !== "") props.onChange({ query: text });

    if (currentFile) {
      setFileChange((prev: files[]) =>
        prev?.length < 4 ? [...prev, currentFile as files] : prev
      );

      setCurrentFile(null);

      fileRef.current = null;
    }
  }, [text, currentFile]);

  return (
    <div className=" w-9/10 md:w-4/5 lg:w-9/20 h-auto relative border-white/20 min-h-6 sm:min-h-6 flex flex-col p-1 space-y-0.5 gap-y-1 bg-[#363838] border placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 rounded-md  ">
      <div className={`${fileArray ? "flex" : "hidden"} gap-x-1`}>
        {fileArray?.map((each, index: number) => {
          return (
            <div
              key={index}
              className="p-x-0.5 w-9 h-9 rounded-2xl border border-white/10 flex justify-center relative items-center inset-2 bg-white/10 hover:bg-white/15"
            >
              {each.isUploading && (
                <LoaderCircle className="w-7 h-7 animate-spin delay-700 text-slate-200/60 z-[35] " />
              )}
              {each.isUploadingCompleted && (
                <Files className="w-6 h-6 absolute text-gray-300"></Files>
              )}
              {each.isWaiting && (
                <Ellipsis className="rounded-2xl inset-0  w-4 h-4 text-white/30   animate-pulse"></Ellipsis>
              )}
            </div>
          );
        })}
      </div>
    

      <div className="sticky bottom-10 flex flex-col left-0 w-full   min-h-1 h-auto  ">
        <div className="flex  w-full self-center h-auto relative justify-center overflow-auto inset-1.5  p-1 left-0.5 top-2 max-auto    ">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              (setText(e.target.value));
            }}
            rows={1}
            placeholder="Type a message…"
            className=" w-19/20   bg-[#363838] text-white/45  relative  min-h-1  p-1 scrollBar max-h-52 resize-none  outline-none "
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
        </div>
      </div>
      <div className="  w-19/20 self-center flex relative   p-1 -bottom-1 ">
        <div className="flex items-center justify-between h-auto w-full  relative gap-1 ">
          <button
  type="button"
  disabled={fileArray.length == 3}
  onClick={() => {
    fileRef.current
      ? fileRef.current?.click()
      : ((fileRef.current = document.getElementById(
          "input"
        ) as HTMLInputElement),
        fileRef.current?.click());
  }}
  className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-white/10 bg-[#363838] hover:bg-white/10 transition"
  title="Attach file"
>
  <Paperclip className="w-5 h-5 text-white/80" />
</button>

<input
  id="input"
  aria-label="Upload file"
  ref={fileRef ? fileRef : null}
  type="file"
  max={3}
  accept=".pdf, .doc, .docx,.csv"
  onChange={() => {
    setCurrentFile({
      file: fileRef?.current?.files?.[0],
      uploadedPercentage: 0,
      isUploading: false,
      isWaiting: true,
      isUploadingCompleted: false,
      id: generateUUID(),
    } as files);
  }}
  className="hidden"
/>

<button
  aria-label="button"
  type="button"
  onClick={handleSend}
  className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#363838] hover:bg-white/15 border border-white/10 transition"
>
  <Send className="w-4 h-4  text-white/80" />
</button>


        </div>
      </div>
    </div>
  );
}
