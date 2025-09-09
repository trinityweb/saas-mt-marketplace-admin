// Redirigir a la versión optimizada por defecto
import OptimizedCurationPage from '@/components/curation/templates/optimized-curation-page';

export default function CurationPage() {
  return <OptimizedCurationPage />;
}

export const metadata = {
  title: 'Curación de Productos',
  description: 'Panel de curación optimizado con tabs semánticos y auto-refresh',
};