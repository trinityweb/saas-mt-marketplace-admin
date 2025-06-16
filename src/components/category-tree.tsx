'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Edit, Eye, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MarketplaceCategory } from '@/lib/api';
import Link from 'next/link';

interface CategoryTreeProps {
  categories: MarketplaceCategory[];
  onViewDetails: (category: MarketplaceCategory) => void;
  onDelete: (categoryId: string) => void;
}

interface TreeNode extends MarketplaceCategory {
  children: TreeNode[];
}

export function CategoryTree({ categories, onViewDetails, onDelete }: CategoryTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Construir el árbol de categorías
  const buildTree = (categories: MarketplaceCategory[]): TreeNode[] => {
    const categoryMap = new Map<string, TreeNode>();
    const rootNodes: TreeNode[] = [];

    // Crear nodos para todas las categorías
    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    // Construir la jerarquía
    categories.forEach(category => {
      const node = categoryMap.get(category.id)!;
      
      if (category.parent_id && categoryMap.has(category.parent_id)) {
        const parent = categoryMap.get(category.parent_id)!;
        parent.children.push(node);
      } else {
        rootNodes.push(node);
      }
    });

    // Ordenar por sort_order
    const sortNodes = (nodes: TreeNode[]): TreeNode[] => {
      return nodes
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(node => ({
          ...node,
          children: sortNodes(node.children)
        }));
    };

    return sortNodes(rootNodes);
  };

  const toggleExpanded = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const expandAll = () => {
    const allIds = new Set(categories.map(c => c.id));
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  const renderNode = (node: TreeNode, depth: number = 0): React.ReactNode => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const paddingLeft = depth * 24;

    return (
      <div key={node.id} className="select-none">
        {/* Nodo principal */}
        <div 
          className="flex items-center gap-2 py-2 px-3 hover:bg-muted/50 rounded-lg group"
          style={{ paddingLeft: `${paddingLeft + 12}px` }}
        >
          {/* Botón expandir/contraer */}
          <div className="w-4 h-4 flex items-center justify-center">
            {hasChildren ? (
              <Button
                variant="ghost"
                size="sm"
                className="w-4 h-4 p-0 hover:bg-transparent"
                onClick={() => toggleExpanded(node.id)}
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </Button>
            ) : (
              <div className="w-3 h-3" />
            )}
          </div>

          {/* Información de la categoría */}
          <div className="flex-1 flex items-center gap-3 min-w-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{node.name}</span>
                <Badge 
                  variant="outline" 
                  className="text-xs"
                  style={{
                    backgroundColor: getLevelColor(node.level),
                    borderColor: getLevelColor(node.level),
                  }}
                >
                  L{node.level}
                </Badge>
                {!node.is_active && (
                  <Badge variant="secondary" className="text-xs">
                    Inactiva
                  </Badge>
                )}
              </div>
              {node.description && (
                <p className="text-xs text-muted-foreground truncate mt-1">
                  {node.description}
                </p>
              )}
            </div>

            {/* Información adicional */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <code className="bg-muted px-1 py-0.5 rounded text-xs">
                {node.slug}
              </code>
              {hasChildren && (
                <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs">
                  {node.children.length} sub
                </span>
              )}
            </div>

            {/* Menú de acciones */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => onViewDetails(node)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Detalles
                  </DropdownMenuItem>
                  <Link href={`/taxonomy/edit/${node.id}`}>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(node.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Nodos hijos */}
        {hasChildren && isExpanded && (
          <div className="ml-2">
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const getLevelColor = (level: number): string => {
    const colors = [
      '#3b82f6', // blue-500
      '#10b981', // emerald-500
      '#f59e0b', // amber-500
      '#ef4444', // red-500
      '#8b5cf6', // violet-500
    ];
    return colors[level % colors.length];
  };

  const tree = buildTree(categories);

  if (tree.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">
          No hay categorías para mostrar en vista de árbol
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controles del árbol */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {categories.length} categorías en {tree.length} raíces
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={expandAll}>
            Expandir Todo
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            Contraer Todo
          </Button>
        </div>
      </div>

      {/* Árbol de categorías */}
      <div className="border rounded-lg bg-card">
        <div className="p-4 space-y-1">
          {tree.map(node => renderNode(node))}
        </div>
      </div>

      {/* Leyenda */}
      <div className="text-xs text-muted-foreground space-y-1">
        <div className="font-medium">Leyenda:</div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-xs">L0</Badge>
            <span>Nivel de jerarquía</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs">2 sub</span>
            <span>Número de subcategorías</span>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="text-xs">Inactiva</Badge>
            <span>Categoría deshabilitada</span>
          </div>
        </div>
      </div>
    </div>
  );
} 