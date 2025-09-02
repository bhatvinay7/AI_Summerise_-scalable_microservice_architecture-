"use client";
import React from "react";
import { motion } from "framer-motion";
export default function MessageBuble() {
  function MessageBubble({
    side = "left",
    text,
    fileName,
  }: {
    side?: string;
    text?: string;
    fileName?: string;
  }) {
    const isRight = side === "right";
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className={`w-full flex mb-3
        ${isRight ? "justify-end" : "justify-start"}
      `}
      >
        <div
          className={`
          "max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-md",
          ${
            isRight
              ? "bg-[#1f2937] text-white border border-white/10"
              : "bg-[#0b0f17] text-white border border-white/10"
          }
        `}
        >
          {text && (
            <p className="leading-relaxed whitespace-pre-wrap">{text}</p>
          )}
          {fileName && (
            <div className="mt-2 text-xs text-white/70 border-t border-white/10 pt-2">
              Attached:{" "}
              <span className="font-medium text-white">{fileName}</span>
            </div>
          )}
        </div>
      </motion.div>
    );
  }
}
