import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

const sizeMap = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-10 h-10",
};

export function LoadingSpinner({ size = "md", className = "", text }: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} data-testid="loading-spinner">
      <Loader2 className={`${sizeMap[size]} animate-spin text-primary`} />
      {text && <span className="text-muted-foreground">{text}</span>}
    </div>
  );
}

interface PageLoaderProps {
  text?: string;
}

export function PageLoader({ text = "Loading..." }: PageLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4" data-testid="page-loader">
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground text-sm">{text}</p>
    </div>
  );
}

interface ButtonSpinnerProps {
  className?: string;
}

export function ButtonSpinner({ className = "" }: ButtonSpinnerProps) {
  return (
    <Loader2 className={`w-4 h-4 animate-spin ${className}`} data-testid="button-spinner" />
  );
}
