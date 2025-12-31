import { Pill } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { icon: "w-6 h-6", text: "text-lg" },
  md: { icon: "w-8 h-8", text: "text-xl" },
  lg: { icon: "w-10 h-10", text: "text-2xl" },
};

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const { icon, text } = sizeMap[size];

  return (
    <div className={`flex items-center gap-2 ${className}`} data-testid="logo">
      <div className="relative">
        <div className="bg-primary rounded-lg p-1.5 flex items-center justify-center">
          <Pill className={`${icon} text-primary-foreground`} />
        </div>
        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-accent rounded-full" />
      </div>
      {showText && (
        <span className={`${text} font-bold text-foreground`}>
          Pharma<span className="text-accent">Care</span>
          <span className="font-normal text-muted-foreground">+</span>
        </span>
      )}
    </div>
  );
}
