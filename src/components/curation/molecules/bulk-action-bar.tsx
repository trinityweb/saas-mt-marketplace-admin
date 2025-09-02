'use client';

import { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Send, 
  Trash2, 
  Tag, 
  FolderOpen,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/shared-ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/shared-ui';
import { Badge } from '@/components/shared-ui';
import { BrandSelector } from './brand-selector';
import { CategorySelector } from './category-selector';
import { MarketplaceBrand, MarketplaceCategory } from '@/lib/api';
import { cn } from '@/lib/utils';

interface BulkActionBarProps {
  selectedCount: number;
  onApprove?: () => void;
  onReject?: () => void;
  onSendToAI?: () => void;
  onChangeBrand?: (brandId: string, brand?: MarketplaceBrand) => void;
  onChangeCategory?: (categoryId: string, category?: MarketplaceCategory) => void;
  onDelete?: () => void;
  loading?: boolean;
  className?: string;
}

export function BulkActionBar({
  selectedCount,
  onApprove,
  onReject,
  onSendToAI,
  onChangeBrand,
  onChangeCategory,
  onDelete,
  loading = false,
  className
}: BulkActionBarProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBrandDialog, setShowBrandDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const handleBrandChange = (brandId: string, brand?: MarketplaceBrand) => {
    setSelectedBrand(brandId);
    if (onChangeBrand) {
      onChangeBrand(brandId, brand);
    }
    setShowBrandDialog(false);
  };

  const handleCategoryChange = (categoryId: string, category?: MarketplaceCategory) => {
    setSelectedCategory(categoryId);
    if (onChangeCategory) {
      onChangeCategory(categoryId, category);
    }
    setShowCategoryDialog(false);
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      <div className={cn(
        'flex items-center justify-between p-4 bg-muted/50 border rounded-lg animate-in slide-in-from-top-2',
        className
      )}>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">
            {selectedCount} producto{selectedCount !== 1 ? 's' : ''} seleccionado{selectedCount !== 1 ? 's' : ''}
          </span>
          <Badge variant="secondary">{selectedCount}</Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Acciones principales */}
          {onApprove && (
            <Button
              size="sm"
              variant="default"
              onClick={onApprove}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Aprobar
            </Button>
          )}

          {onReject && (
            <Button
              size="sm"
              variant="destructive"
              onClick={onReject}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Rechazar
            </Button>
          )}

          {onSendToAI && (
            <Button
              size="sm"
              variant="secondary"
              onClick={onSendToAI}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Enviar a AI
            </Button>
          )}

          {/* Menú de más acciones */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                size="sm" 
                variant="outline"
                disabled={loading}
              >
                Más acciones
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones en lote</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {onChangeBrand && (
                <DropdownMenuItem 
                  onClick={() => setShowBrandDialog(true)}
                  disabled={loading}
                >
                  <Tag className="h-4 w-4 mr-2" />
                  Cambiar marca
                </DropdownMenuItem>
              )}
              
              {onChangeCategory && (
                <DropdownMenuItem 
                  onClick={() => setShowCategoryDialog(true)}
                  disabled={loading}
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Cambiar categoría
                </DropdownMenuItem>
              )}
              
              {(onChangeBrand || onChangeCategory) && onDelete && (
                <DropdownMenuSeparator />
              )}
              
              {onDelete && (
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive"
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente {selectedCount} producto{selectedCount !== 1 ? 's' : ''}. 
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (onDelete) onDelete();
                setShowDeleteDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de cambio de marca */}
      <AlertDialog open={showBrandDialog} onOpenChange={setShowBrandDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cambiar marca</AlertDialogTitle>
            <AlertDialogDescription>
              Selecciona la nueva marca para los {selectedCount} producto{selectedCount !== 1 ? 's' : ''} seleccionado{selectedCount !== 1 ? 's' : ''}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <BrandSelector
              value={selectedBrand}
              onValueChange={handleBrandChange}
              placeholder="Seleccionar nueva marca..."
              allowCreate={true}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de cambio de categoría */}
      <AlertDialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cambiar categoría</AlertDialogTitle>
            <AlertDialogDescription>
              Selecciona la nueva categoría para los {selectedCount} producto{selectedCount !== 1 ? 's' : ''} seleccionado{selectedCount !== 1 ? 's' : ''}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <CategorySelector
              value={selectedCategory}
              onValueChange={handleCategoryChange}
              placeholder="Seleccionar nueva categoría..."
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}