"use client";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";


type SuccessNotificationProps = {
  message: string|null;
  show: boolean;
  onClose?: (show:boolean) => void;
};

export default function SuccessNotification({
  message,
  show,
  onClose,
}: SuccessNotificationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-5 right-5 z-50"
        >
          <div className="flex items-center gap-3 bg-[hsl(0,2%,10%)]  border h-16 border-white/20 text-white/60 px-5 py-3 rounded-2xl shadow-lg">
            <CheckCircle2 className="w-5 h-5" />
            <p className="text-sm font-medium">{message}</p>
            {onClose && (
              <button
                className="ml-3 mr-2 text-white/60 hover:text-red-200"
                onClick={()=>onClose(!show)}
              >
                ✕
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
