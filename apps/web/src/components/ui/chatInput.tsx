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
  };

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // reset first
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

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

      xhr.open("POST", `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/uploadFile/upload`);
      xhr.setRequestHeader("Authorization", `Bearer ${props.token}`);
      xhr.responseType = "json";
      xhr.send(formdata);

      xhr.addEventListener("load", () => {
        const response = xhr.response;
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
    console.log("hii");
    // if (!text && !file) return;
    console.log("hi here");
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
    <div className=" w-3/4 md:w-4/5 lg:w-1/2 h-auto border-white/20 flex flex-col px-4 py-5 space-y-3 gap-y-6 bg-[#2f2f2d] border placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 rounded-3xl  ">
      <div className={`${fileArray ? "flex" : "hidden"} gap-x-1`}>
        {fileArray?.map((each, index: number) => {
          return (
            <div
              key={index}
              className="p-1 w-12 h-12 rounded-2xl border border-white/10 flex justify-center relative items-center inset-2 bg-white/10 hover:bg-white/15"
            >
              {each.isUploading && (
                <LoaderCircle className="w-7 h-7 animate-spin delay-700 text-slate-200/60 z-[35] " />
              )}
              {each.isUploadingCompleted && (
                <Files className="w-6 h-6 absolute text-gray-300"></Files>
              )}
              {each.isWaiting && (
                <Ellipsis className="rounded-2xl inset-0  w-5 h-5 text-white/30   animate-pulse"></Ellipsis>
              )}
            </div>
          );
        })}
      </div>
    

      <div className="sticky bottom-16 flex flex-col left-0 w-full       min-h-10 h-auto  ">
        <div className="flex  w-full self-center h-auto relative justify-center overflow-auto inset-1.5  p-5 left-0.5 top-3 max-auto  mb-2  ">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              (setText(e.target.value), handleInput());
            }}
            rows={1}
            placeholder="Type a message…"
            className=" w-19/20   bg-[#2f2f2d] text-white/75  relative m-3 min-h-10  p-6 scrollBar max-h-52 resize-none  outline-none "
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
        </div>
      </div>
      <div className="  w-full flex relative my-3  p-3 bottom-3 ">
        <div className="flex items-center justify-between h-auto w-full mt-5 relative gap-1 p-4">
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
            className="shrink-0 inline-flex items-center my-auto justify-center relative inset-1 left-2 bottom-2 self-start w-10 h-10 rounded-xl border border-white/10 hover:bg-white/5 transition"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
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
            className="invisible"
            // onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />

          <button
            type="button"
            onClick={handleSend}
            className="shrink-0 inline-flex items-center justify-center relative w-[50px] p-4 ml-2  right-2 top-1  px-2 h-10 rounded-xl bg-[#2f2f2a] hover:bg-white/15 border border-white/10 transition"
          >
            <Send className="w-6 h-6" />
            {/* <span className="text-sm">Send</span> */}
          </button>
        </div>
      </div>
    </div>
  );
}
