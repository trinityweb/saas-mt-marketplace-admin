'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProductEdit } from '@/components/shared/product-components/product-edit';
import { BaseProduct, ProductFormData } from '@/components/shared/product-components/types';
import { GlobalCatalogProduct } from '@/lib/api/pim';

// Función para mapear GlobalCatalogProduct a BaseProduct
const mapToBaseProduct = (product: GlobalCatalogProduct): BaseProduct => ({
  id: product.id,
  name: product.name,
  description: product.description,
  brand: product.brand,
  category: product.category,
  ean: product.ean,
  price: product.price,
  quality_score: product.quality_score,
  is_verified: product.is_verified,
  is_active: product.is_active,
  source: product.source,
  image_url: product.image_url,
  image_urls: product.image_urls,
  tags: product.tags,
  metadata: product.metadata,
  created_at: product.created_at,
  updated_at: product.updated_at
});

export default function EditGlobalProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;
  
  const [product, setProduct] = useState<BaseProduct | null>(null);
  const [brands, setBrands] = useState<Array<{ id: string; name: string }>>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    if (!productId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar producto, brands y categories en paralelo
        const [productResponse, brandsResponse, categoriesResponse] = await Promise.all([
          fetch(`/api/pim/global-catalog/${productId}`),
          fetch('/api/pim/marketplace-brands?limit=1000'),
          fetch('/api/pim/marketplace-categories?limit=1000')
        ]);

        if (!productResponse.ok) {
          throw new Error(`Error ${productResponse.status}: ${productResponse.statusText}`);
        }

        const [productData, brandsData, categoriesData] = await Promise.all([
          productResponse.json(),
          brandsResponse.json(),
          categoriesResponse.json()
        ]);

        const mappedProduct = mapToBaseProduct(productData);
        setProduct(mappedProduct);

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
  }, [productId]);

  // Función para guardar el producto
  const handleSave = async (formData: ProductFormData) => {
    try {
      const updateData = {
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
        source: formData.source
      };

      const response = await fetch(`/api/pim/global-catalog/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
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

  if (!product) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Producto no encontrado</h2>
          <p className="text-gray-600">El producto solicitado no existe o no está disponible.</p>
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
      product={product}
      onSave={handleSave}
      onCancel={handleCancel}
      brands={brands}
      categories={categories}
      readonly={false}
      mode="edit"
    />
  );
} 