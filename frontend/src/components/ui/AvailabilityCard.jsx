import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export const AvailabilityCard = ({
  title = "Free Slots Available",
  slots,
  selectedSlotId,
  onSlotSelect,
  className,
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div
      className={cn(
        "w-full max-w-md rounded-xl border bg-white text-slate-900 shadow-lg mx-auto",
        className
      )}
    >
      <div className="p-6">
        <h3 className="text-lg font-semibold tracking-tight text-center">{title}</h3>
      </div>
      <motion.div
        className="grid grid-cols-3 gap-2 p-4 pt-0 sm:grid-cols-3 sm:gap-4 sm:p-6 sm:pt-0"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {slots.map((slot) => (
          <motion.button
            key={slot.id}
            onClick={() => onSlotSelect(slot.id)}
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-pressed={slot.id === selectedSlotId}
            className={cn(
              "flex aspect-square flex-col items-center justify-center rounded-lg border text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              slot.id === selectedSlotId
                ? "bg-blue-600 text-white shadow-md border-blue-600"
                : "bg-white hover:bg-slate-100 hover:text-slate-900 border-slate-200"
            )}
          >
            <span className="text-2xl font-bold leading-none">
              {slot.day}
            </span>
            <span
              className={cn(
                "mt-1 text-xs text-center px-1 leading-tight",
                slot.id === selectedSlotId
                  ? "text-blue-100"
                  : "text-slate-500"
              )}
            >
              {slot.month}
            </span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};
