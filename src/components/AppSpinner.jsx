import { Spinner } from "@heroui/react";

export default function AppSpinner({ label = "Loading...", className = "" }) {
  return (
    <div className={`flex justify-center items-center w-full py-8 ${className}`}>
      <Spinner
        variant="wave"
        color="#2979FF"
        classNames={{ label: "text-[#2979FF] mt-4" }}
        label={label}
      />
    </div>
  );
} 