"use client";

import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/shared-ui";
import { Label } from "@/components/ui/label";
import { RoleAdapter } from "@/lib/types/iam-api";
import { useRoles } from "@/hooks/use-roles";
import { Pencil, Trash2, UserCheck, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/shared-ui";
import { CriteriaDataTable } from "@/components/ui/criteria-data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/shared-ui";
import { useHeader } from "@/components/layout/admin-layout";
import { Filter } from "@/components/ui/table-toolbar";
import { useTableCriteria } from "@/hooks/use-table-criteria";

export default function RolesPage() {
  // Hooks
  const { 
    roles, 
    loading, 
    error, 
    totalCount, 
    currentPage, 
    pageSize,
    handleCreate: createRole, 
    handleUpdate: updateRole, 
    handleDelete: deleteRole,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange
  } = useRoles()
  const { setHeaderProps, clearHeaderProps } = useHeader()
  
  // Configurar header
  React.useEffect(() => {
    const headerIcon = <UserCheck className="w-5 h-5 text-white" />
    setHeaderProps({
      title: "Gestión de Roles",
      subtitle: "Configuración de roles y permisos del sistema",
      backUrl: "/iam",
      backLabel: "Volver a IAM",
      icon: headerIcon
    })

    return () => {
      clearHeaderProps()
    }
  }, [setHeaderProps, clearHeaderProps])

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleAdapter | null>(null);

  // Hook para manejar criterios de búsqueda
  const criteriaState = useTableCriteria({
    defaultPageSize: 20
  });

  const handleEditRole = (role: RoleAdapter) => {
    setEditingRole(role);
    setIsDialogOpen(true);
  };

  const handleSubmitRole = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      if (editingRole) {
        // Actualizar rol existente
        await updateRole(editingRole.id, {
          name: formData.get('name') as string,
          description: formData.get('description') as string,
          saas: formData.get('saas') as string
        });
      } else {
        // Crear nuevo rol
        await createRole({
          name: formData.get('name') as string,
          description: formData.get('description') as string,
          saas: formData.get('saas') as string
        });
      }
      
      setIsDialogOpen(false);
      setEditingRole(null);
      (event.target as HTMLFormElement).reset();
    } catch (err) {
      console.error(err);
    }
  };

  // Filtros para roles
  const roleFilters: Filter[] = useMemo(() => [
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

  const columns: ColumnDef<RoleAdapter>[] = useMemo(() => [
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
        const role = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{role.name}</span>
            <span className="text-sm text-muted-foreground">ID: {role.id}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Descripción
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return (
          <span className="text-sm text-muted-foreground">
            {description || 'Sin descripción'}
          </span>
        );
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
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Creado
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const createdAt = row.getValue("created_at") as string;
        return (
          <span className="text-sm text-muted-foreground">
            {new Date(createdAt).toLocaleDateString()}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const role = row.original;
        return (
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleEditRole(role)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => deleteRole(role.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ], [deleteRole]);

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      <CriteriaDataTable
        columns={columns}
        data={roles}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={pageSize}
        searchValue={criteriaState.criteria.search || ''}
        searchPlaceholder="Buscar roles..."
        buttonText="Crear Rol"
        loading={loading}
        filters={roleFilters}
        fullWidth={true}
        onSearchChange={criteriaState.handleSearchChange}
        onCreateClick={() => {
          setEditingRole(null);
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
              {editingRole ? 'Editar Rol' : 'Crear Nuevo Rol'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitRole} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Nombre del rol"
                  defaultValue={editingRole?.name || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  name="description"
                  type="text"
                  required
                  placeholder="Descripción del rol"
                  defaultValue={editingRole?.description || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="saas">SaaS</Label>
                <Input
                  id="saas"
                  name="saas"
                  type="text"
                  required
                  placeholder="Identificador del SaaS"
                  defaultValue={editingRole?.saas || ''}
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
                {editingRole ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 