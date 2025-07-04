import { cn } from "../utils/cn"

interface LoadingProps {
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
  fullScreen?: boolean
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-16 w-16",
  xl: "h-32 w-32"
}

export function Loading({ 
  className, 
  size = "xl", 
  fullScreen = true 
}: LoadingProps) {
  const spinner = (
    <div 
      className={cn(
        "animate-spin rounded-full border-b-2 border-primary",
        sizeClasses[size],
        className
      )} 
    />
  )

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {spinner}
      </div>
    )
  }

  return spinner
}