import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
};

const variants = {
  primary:
    "border-cyan/50 bg-cyan/15 text-white shadow-glow hover:border-cyan/80 hover:bg-cyan/20",
  secondary:
    "border-line bg-white/[0.04] text-silver hover:border-silver/30 hover:bg-white/[0.07]",
  ghost: "border-transparent bg-transparent text-silver/70 hover:bg-white/[0.05] hover:text-white",
  danger: "border-danger/50 bg-danger/10 text-white hover:bg-danger/15"
};

export function Button({ className = "", variant = "secondary", loading, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-55 ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}
