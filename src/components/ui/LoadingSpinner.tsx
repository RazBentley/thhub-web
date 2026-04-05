"use client";

import clsx from "clsx";

export function LoadingSpinner({
  size = "md",
  fullPage = false,
}: {
  size?: "sm" | "md" | "lg";
  fullPage?: boolean;
}) {
  const sizeClasses = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  const spinner = (
    <div
      className={clsx(
        "animate-spin rounded-full border-primary/30 border-t-primary",
        sizeClasses[size]
      )}
    />
  );

  if (fullPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        {spinner}
      </div>
    );
  }

  return spinner;
}
