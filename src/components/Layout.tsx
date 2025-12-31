import React from "react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        "min-h-screen p-4 md:p-8 flex flex-col items-center justify-center",
        "bg-gradient-to-br from-[#667eea] to-[#764ba2]", // Dégradé violet/mauve
        className,
      )}
    >
      {children}
    </div>
  );
};

export default Layout;