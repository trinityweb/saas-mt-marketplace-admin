"use client";

import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/shared-ui";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlanAdapter } from "@/lib/types/iam-api";
import { usePlans } from "@/hooks/use-plans";
import { Pencil, Trash2, Package, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/shared-ui";
import { CriteriaDataTable } from "@/components/ui/criteria-data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/shared-ui";
import { useHeader } from "@/components/layout/admin-layout";
import { Filter } from "@/components/ui/table-toolbar";
import { useTableCriteria } from "@/hooks/use-table-criteria";
import { Crown, Plus } from "lucide-react";

export default function PlansPage() {
  // Hooks
  const { 
    plans, 
    loading, 
    error, 
    totalCount, 
    currentPage, 
    pageSize,
    handleCreate: createPlan, 
    handleUpdate: updatePlan, 
    handleDelete: deletePlan,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange
  } = usePlans()
  const { setHeaderProps, clearHeaderProps } = useHeader()
  
  // Configurar header
  React.useEffect(() => {
    const headerIcon = <Crown className="w-5 h-5 text-white" />
    setHeaderProps({
      title: "Gestión de Planes",
      subtitle: "Administra planes de suscripción y características",
      backUrl: "/iam",
      backLabel: "Volver a IAM",
      icon: headerIcon
    })

    return () => {
      clearHeaderProps()
    }
  }, [setHeaderProps, clearHeaderProps])

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanAdapter | null>(null);

  // Hook para manejar criterios de búsqueda
  const criteriaState = useTableCriteria({
    defaultPageSize: 20
  });

  const handleEditPlan = (plan: PlanAdapter) => {
    setEditingPlan(plan);
    setIsDialogOpen(true);
  };

  const handleSubmitPlan = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      const planData = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        monthly_price: parseFloat(formData.get('monthly_price') as string),
        yearly_price: parseFloat(formData.get('yearly_price') as string),
        features: (formData.get('features') as string).split(',').map(f => f.trim()).filter(f => f)
      };

      if (editingPlan) {
        // Actualizar plan existente
        await updatePlan(editingPlan.id, planData);
      } else {
        // Crear nuevo plan
        await createPlan(planData);
      }
      
      setIsDialogOpen(false);
      setEditingPlan(null);
      (event.target as HTMLFormElement).reset();
    } catch (err) {
      console.error(err);
    }
  };

  // Filtros para planes
  const planFilters: Filter[] = useMemo(() => [
    {
      type: 'select',
      key: 'saas',
      placeholder: 'SaaS',
      value: criteriaState.criteria.saas || 'all',
      options: [
        { value: 'all', label: 'Todos los SaaS' },
        { value: 'marketplace', label: 'Marketplace' },
        { value: 'pim', label: 'PIM' },
        { value: 'iam', label: 'IAM' },
        { value: 'stock', label: 'Stock' }
      ],
      onChange: (value) => criteriaState.handleFilterChange('saas', value === 'all' ? undefined : value)
    }
  ], [criteriaState]);

  const columns: ColumnDef<PlanAdapter>[] = useMemo(() => [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Nombre
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const plan = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{plan.name}</span>
            <span className="text-sm text-muted-foreground">{plan.description}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "monthly_price",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Precio Mensual
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const price = parseFloat(row.getValue("monthly_price"));
        const formatted = new Intl.NumberFormat("es-ES", {
          style: "currency",
          currency: "EUR",
        }).format(price);
        return formatted;
      },
    },
    {
      accessorKey: "yearly_price",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Precio Anual
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const price = parseFloat(row.getValue("yearly_price"));
        const formatted = new Intl.NumberFormat("es-ES", {
          style: "currency",
          currency: "EUR",
        }).format(price);
        return formatted;
      },
    },
    {
      accessorKey: "saas",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          SaaS
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const saas = row.getValue("saas") as string;
        return (
          <Badge variant="outline">
            {saas}
          </Badge>
        );
      },
    },
    {
      accessorKey: "features",
      header: () => (
        <div className="font-semibold">
          Características
        </div>
      ),
      enableSorting: false,
      cell: ({ row }) => {
        const features = row.getValue("features") as string[];
        return (
          <div className="flex flex-wrap gap-1">
            {features?.slice(0, 2).map((feature, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            )) || 'Sin características'}
            {features?.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{features.length - 2} más
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const plan = row.original;
        return (
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleEditPlan(plan)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => deletePlan(plan.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ], [deletePlan]);

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      <CriteriaDataTable
        columns={columns}
        data={plans}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={pageSize}
        searchValue={criteriaState.criteria.search || ''}
        searchPlaceholder="Buscar planes..."
        buttonText="Crear Plan"
        loading={loading}
        filters={planFilters}
        fullWidth={true}
        onSearchChange={criteriaState.handleSearchChange}
        onCreateClick={() => {
          setEditingPlan(null);
          setIsDialogOpen(true);
        }}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSortChange={handleSortChange}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? 'Editar Plan' : 'Crear Nuevo Plan'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitPlan} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Nombre del plan"
                  defaultValue={editingPlan?.name || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  required
                  placeholder="Descripción del plan"
                  defaultValue={editingPlan?.description || ''}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthly_price">Precio Mensual (€)</Label>
                  <Input
                    id="monthly_price"
                    name="monthly_price"
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    defaultValue={editingPlan?.monthly_price || ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearly_price">Precio Anual (€)</Label>
                  <Input
                    id="yearly_price"
                    name="yearly_price"
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    defaultValue={editingPlan?.yearly_price || ''}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="features">Características (separadas por coma)</Label>
                <Textarea
                  id="features"
                  name="features"
                  placeholder="Característica 1, Característica 2, Característica 3"
                  defaultValue={editingPlan?.features?.join(', ') || ''}
                  rows={3}
                />
              </div>
            </div>
            {error && (
              <div className="text-sm text-red-500">
                {error}
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingPlan ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 