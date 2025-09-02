'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/shared-ui';
import { Badge } from '@/components/shared-ui';
import { Button } from '@/components/shared-ui';
import { 
  Package, 
  Edit, 
  Trash2, 
  Eye, 
  Star, 
  Calendar,
  Tag,
  ShoppingCart,
  ImageIcon,
  MoreVertical,
  Heart,
  Share2,
  CheckCircle,
  Award
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface GlobalCatalogProduct {
  id: string;
  name: string;
  sku?: string;
  status?: string;
  description?: string;
  brand?: string;
  category?: string;
  price?: number;
  image_url?: string;
  tags?: string[];
  quality_score?: number;
  is_verified?: boolean;
  source?: string;
  created_at: string;
  updated_at: string;
}

interface ModernProductCardProps {
  product: GlobalCatalogProduct;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onVerify?: (id: string) => void;
  onFavorite?: (id: string) => void;
  className?: string;
}

export function ModernProductCard({
  product,
  variant = 'default',
  showActions = true,
  onView,
  onEdit,
  onDelete,
  onVerify,
  onFavorite,
  className
}: ModernProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getQualityColor = (score: number) => {
    if (score >= 8) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 6) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (score >= 4) return 'bg-orange-100 text-orange-800 border-orange-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getQualityLabel = (score: number) => {
    if (score >= 8) return 'Excelente';
    if (score >= 6) return 'Buena';
    if (score >= 4) return 'Regular';
    return 'Baja';
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  };

  const isCompact = variant === 'compact';
  const isDetailed = variant === 'detailed';

  return (
    <Card
      className={cn(
        'group transition-all duration-300 hover:shadow-lg border-0 shadow-sm',
        'hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1',
        isCompact && 'h-auto',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header con imagen */}
      <div className={cn(
        'relative overflow-hidden rounded-t-lg',
        isCompact ? 'h-32' : 'h-48'
      )}>
        {!imageError && product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
        )}
        
        {/* Overlay con acciones rápidas */}
        <div className={cn(
          'absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 flex items-center justify-center gap-2',
          isHovered && 'opacity-100'
        )}>
          {showActions && (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="bg-white/90 hover:bg-white text-gray-700 h-8 w-8 p-0"
                onClick={() => onView?.(product.id)}
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="bg-white/90 hover:bg-white text-gray-700 h-8 w-8 p-0"
                onClick={() => onEdit?.(product.id)}
              >
                <Edit className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>

        {/* Badges de estado */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.is_verified && (
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verificado
            </Badge>
          )}
          {product.quality_score && (
            <Badge 
              variant="secondary" 
              className={cn(
                'text-xs font-medium border',
                getQualityColor(product.quality_score)
              )}
            >
              <Award className="w-3 h-3 mr-1" />
              {getQualityLabel(product.quality_score)}
            </Badge>
          )}
        </div>

        {/* Favorite button */}
        {showActions && (
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/90 hover:bg-white text-gray-700"
            onClick={() => onFavorite?.(product.id)}
          >
            <Heart className="w-4 h-4" />
          </Button>
        )}
      </div>

      <CardContent className="p-4">
        {/* SKU */}
        {product.sku && (
          <div className="flex items-center gap-1 mb-2">
            <Tag className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-500 font-mono">{product.sku}</span>
          </div>
        )}

        {/* Title */}
        <h3 className={cn(
          'font-semibold text-gray-900 line-clamp-2 mb-2',
          isCompact ? 'text-sm' : 'text-base'
        )}>
          {product.name}
        </h3>

        {/* Brand */}
        {product.brand && (
          <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
        )}

        {/* Description - solo en vista detallada */}
        {isDetailed && product.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {product.description}
          </p>
        )}

        {/* Price */}
        {product.price && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-green-600">
              {formatPrice(product.price)}
            </span>
          </div>
        )}

        {/* Quality Score */}
        {product.quality_score && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-gray-600">Calidad:</span>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'w-3 h-3',
                    i < product.quality_score! / 2
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  )}
                />
              ))}
              <span className="text-sm text-gray-600 ml-1">
                {product.quality_score.toFixed(1)}
              </span>
            </div>
          </div>
        )}

        {/* Source */}
        {product.source && (
          <div className="mb-3">
            <Badge
              variant="outline"
              className="text-xs px-2 py-0.5 bg-gray-50 text-gray-600 border-gray-200"
            >
              {product.source}
            </Badge>
          </div>
        )}

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs px-2 py-0.5 bg-gray-50 text-gray-600 border-gray-200"
              >
                {tag}
              </Badge>
            ))}
            {product.tags.length > 3 && (
              <Badge
                variant="outline"
                className="text-xs px-2 py-0.5 bg-gray-50 text-gray-600 border-gray-200"
              >
                +{product.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer con acciones */}
        {showActions && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>
                {new Date(product.created_at).toLocaleDateString('es-AR')}
              </span>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onView?.(product.id)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Ver detalles
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(product.id)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {!product.is_verified && (
                  <DropdownMenuItem onClick={() => onVerify?.(product.id)}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verificar producto
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onFavorite?.(product.id)}>
                  <Heart className="w-4 h-4 mr-2" />
                  Agregar a favoritos
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartir
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete?.(product.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 