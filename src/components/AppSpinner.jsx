import { Spinner } from "@heroui/react";

export default function AppSpinner({ label = "Loading...", className = "" }) {
  return (
    <div className={`flex justify-center items-center w-full py-4 sm:py-6 md:py-8 ${className}`}>
      <Spinner
        variant="wave"
        color="#2979FF"
        classNames={{ label: "text-[#2979FF] mt-2 sm:mt-3 md:mt-4 text-xs sm:text-sm" }}
        label={label}
      />
    </div>
  );
} 