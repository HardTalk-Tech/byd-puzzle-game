"use client";

import { motion } from "motion/react";
import { CarWinkIcon } from "@/components/icons/CarWinkIcon";
import { ModalShell } from "@/components/modals/ModalShell";
import type { DuplicateMessage } from "@/content/messages";

interface DuplicateModalProps {
  message: DuplicateMessage;
  onOk: () => void;
}

/** This phone number has already played. */
export function DuplicateModal({ message, onOk }: DuplicateModalProps) {
  return (
    <ModalShell
      label={message.title}
      onOk={onOk}
      icon={
        <motion.div
          initial={{ scale: 0, y: 20 }}
          animate={{ scale: 1, y: [0, -10, 0] }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="h-[24cqw] w-[30cqw]"
        >
          <CarWinkIcon className="h-full w-full" />
        </motion.div>
      }
      title={<span className="gold-text">{message.title}</span>}
      body={message.body}
    />
  );
}
