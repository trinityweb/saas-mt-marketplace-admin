'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProductEdit } from '@/components/shared/product-components/product-edit';
import { ProductFormData } from '@/components/shared/product-components/types';

export default function CreateGlobalProductPage() {
  const router = useRouter();
  
  const [brands, setBrands] = useState<Array<{ id: string; name: string }>>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar brands y categories en paralelo
        const [brandsResponse, categoriesResponse] = await Promise.all([
          fetch('/api/pim/marketplace-brands?limit=1000'),
          fetch('/api/pim/marketplace-categories?limit=1000')
        ]);

        const [brandsData, categoriesData] = await Promise.all([
          brandsResponse.json(),
          categoriesResponse.json()
        ]);

        // Procesar brands
        const brandsOptions = (brandsData.brands || [])
          .map((brand: any) => ({
            id: brand.id || brand.name,
            name: brand.name
          }));
        setBrands(brandsOptions);

        // Procesar categories
        const categoriesOptions = (categoriesData.categories || [])
          .map((category: any) => ({
            id: category.id || category.name,
            name: category.name
          }));
        setCategories(categoriesOptions);

      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Función para crear el producto
  const handleSave = async (formData: ProductFormData) => {
    try {
      const createData = {
        name: formData.name,
        description: formData.description,
        brand: formData.brand,
        category: formData.category,
        ean: formData.ean,
        price: formData.price,
        is_active: formData.status === 'active',
        tags: formData.tags,
        quality_score: formData.quality_score,
        is_verified: formData.is_verified,
        source: formData.source || 'manual'
      };

      const response = await fetch('/api/pim/global-catalog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      // Éxito - el componente se encarga de mostrar el mensaje y redirigir
    } catch (error: any) {
      throw error; // El componente se encarga de manejar el error
    }
  };

  // Función para cancelar
  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProductEdit
      product={undefined} // No hay producto para crear uno nuevo
      onSave={handleSave}
      onCancel={handleCancel}
      brands={brands}
      categories={categories}
      readonly={false}
      mode="create"
    />
  );
} 