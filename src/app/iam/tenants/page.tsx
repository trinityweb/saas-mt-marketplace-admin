"use client";

import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TenantAdapter } from "@/lib/types/iam-api";
import { useTenants } from "@/hooks/use-tenants";
import { Pencil, Trash2, Building, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CriteriaDataTable } from "@/components/ui/criteria-data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { useHeader } from "@/components/layout/admin-layout";
import { Filter } from "@/components/ui/table-toolbar";
import { useTableCriteria } from "@/hooks/use-table-criteria";

export default function TenantsPage() {
  // Hooks
  const { 
    tenants, 
    loading, 
    error, 
    totalCount, 
    currentPage, 
    pageSize,
    handleCreate: createTenant, 
    handleUpdate: updateTenant, 
    handleDelete: deleteTenant,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange
  } = useTenants()
  const { setHeaderProps, clearHeaderProps } = useHeader()
  
  // Configurar header
  React.useEffect(() => {
    const headerIcon = <Building className="w-5 h-5 text-white" />
    setHeaderProps({
      title: "Gestión de Tenants",
      subtitle: "Administra los tenants y organizaciones de la plataforma",
      backUrl: "/iam",
      backLabel: "Volver a IAM",
      icon: headerIcon
    })

    return () => {
      clearHeaderProps()
    }
  }, [setHeaderProps, clearHeaderProps])

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<TenantAdapter | null>(null);

  // Hook para manejar criterios de búsqueda
  const criteriaState = useTableCriteria({
    defaultPageSize: 20
  });

  const handleEditTenant = (tenant: TenantAdapter) => {
    setEditingTenant(tenant);
    setIsDialogOpen(true);
  };

  const handleSubmitTenant = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      if (editingTenant) {
        // Actualizar tenant existente
        await updateTenant(editingTenant.id, {
          Name: formData.get('name') as string,
          EmailUserKey: formData.get('email_user_key') as string,
          PlanID: formData.get('plan_id') as string
        });
      } else {
        // Crear nuevo tenant
        await createTenant({
          name: formData.get('name') as string,
          email_key: formData.get('email_user_key') as string,
          plan_id: formData.get('plan_id') as string
        });
      }
      
      setIsDialogOpen(false);
      setEditingTenant(null);
      (event.target as HTMLFormElement).reset();
    } catch (err) {
      console.error(err);
    }
  };

  // Filtros para tenants
  const tenantFilters: Filter[] = useMemo(() => [
    {
      type: 'select',
      key: 'status',
      placeholder: 'Estado',
      value: criteriaState.criteria.status || 'all',
      options: [
        { value: 'all', label: 'Todos los estados' },
        { value: 'active', label: 'Activos' },
        { value: 'inactive', label: 'Inactivos' },
        { value: 'suspended', label: 'Suspendidos' }
      ],
      onChange: (value) => criteriaState.handleFilterChange('status', value === 'all' ? undefined : value)
    },
    {
      type: 'select',
      key: 'type',
      placeholder: 'Tipo',
      value: criteriaState.criteria.type || 'all',
      options: [
        { value: 'all', label: 'Todos los tipos' },
        { value: 'standard', label: 'Estándar' },
        { value: 'premium', label: 'Premium' },
        { value: 'enterprise', label: 'Enterprise' }
      ],
      onChange: (value) => criteriaState.handleFilterChange('type', value === 'all' ? undefined : value)
    }
  ], [criteriaState]);

  const columns: ColumnDef<TenantAdapter>[] = useMemo(() => [
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
        const tenant = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{tenant.name}</span>
            <span className="text-sm text-muted-foreground">{tenant.slug}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return (
          <Badge variant="outline">
            {type}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variant = status === 'active' ? 'default' : 'secondary';
        return (
          <Badge variant={variant}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "user_count",
      header: "Usuarios",
      cell: ({ row }) => {
        const tenant = row.original;
        return (
          <span>
            {tenant.user_count} / {tenant.max_users}
          </span>
        );
      },
    },
    {
      accessorKey: "plan_id",
      header: "Plan",
      cell: ({ row }) => {
        const tenant = row.original;
        return (
          <span className="text-sm">
            {tenant.plan?.name || tenant.plan_id}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const tenant = row.original;
        return (
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleEditTenant(tenant)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => deleteTenant(tenant.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ], [deleteTenant]);

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      <CriteriaDataTable
        columns={columns}
        data={tenants}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={pageSize}
        searchValue={criteriaState.criteria.search || ''}
        searchPlaceholder="Buscar tenants..."
        buttonText="Crear Tenant"
        loading={loading}
        filters={tenantFilters}
        onSearchChange={criteriaState.handleSearchChange}
        onCreateClick={() => {
          setEditingTenant(null);
          setIsDialogOpen(true);
        }}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSortChange={handleSortChange}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTenant ? 'Editar Tenant' : 'Crear Nuevo Tenant'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitTenant} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Nombre del tenant"
                  defaultValue={editingTenant?.name || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email_user_key">Email Key</Label>
                <Input
                  id="email_user_key"
                  name="email_user_key"
                  type="text"
                  required
                  placeholder="ejemplo.com"
                  defaultValue={editingTenant?.owner_id || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan_id">Plan ID</Label>
                <Input
                  id="plan_id"
                  name="plan_id"
                  type="text"
                  required
                  placeholder="ID del plan"
                  defaultValue={editingTenant?.plan_id || ''}
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
                {editingTenant ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 