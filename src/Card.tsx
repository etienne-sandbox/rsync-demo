import { ComponentPropsWithRef } from "react";
import { twMerge } from "tailwind-merge";

export function Card({ children, className, ...props }: ComponentPropsWithRef<"div">) {
  return (
    <div className={twMerge("bg-white rounded-md shadow-md overflow-hidden", className)} {...props}>
      {children}
    </div>
  );
}
