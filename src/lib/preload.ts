// Precargar módulos pesados para mejorar la performance
export const preloadModules = () => {
  if (typeof window !== 'undefined') {
    // Precargar componentes de Radix UI más usados
    import('@radix-ui/react-dialog');
    import('@radix-ui/react-dropdown-menu');
    import('@radix-ui/react-select');
    
    // Precargar lucide-react
    import('lucide-react');
    
    // Precargar tanstack table
    import('@tanstack/react-table');
  }
};

// Llamar después de que la página principal cargue
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    // Dar tiempo para que la página se estabilice
    setTimeout(preloadModules, 1000);
  });
}