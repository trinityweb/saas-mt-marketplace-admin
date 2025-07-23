"use client"

// Simple toast hook that uses console.log as fallback
import * as React from "react"

interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

function useToast() {
  const toast = React.useCallback(({ title, description, variant = "default" }: ToastProps) => {
    const message = `${title ? `${title}: ` : ''}${description || ''}`;
    
    if (variant === "destructive") {
      console.error(`❌ ${message}`);
      // You can also use a more sophisticated notification library here
      alert(`Error: ${message}`);
    } else {
      console.log(`✅ ${message}`);
      // You can also use a more sophisticated notification library here
      alert(`Success: ${message}`);
    }
  }, []);

  return { toast };
}

export { useToast }; 