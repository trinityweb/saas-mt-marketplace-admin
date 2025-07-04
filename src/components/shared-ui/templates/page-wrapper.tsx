import { ReactNode, memo } from 'react';
import { cn } from '@/components/shared-ui/utils/cn';

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
}

// Componente memoizado para evitar re-renders innecesarios
export const PageWrapper = memo(function PageWrapper({ 
  children, 
  className 
}: PageWrapperProps) {
  return (
    <div className={cn("container mx-auto py-6", className)}>
      {children}
    </div>
  );
});

// Componente para el contenido de la página con animación suave
export const PageContent = memo(function PageContent({ 
  children, 
  className 
}: PageWrapperProps) {
  return (
    <div className={cn(
      "space-y-6 animate-in fade-in-0 duration-200",
      className
    )}>
      {children}
    </div>
  );
});