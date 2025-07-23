'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ProductView } from '@/components/shared/product-components/product-view';
import { BaseProduct } from '@/components/shared/product-components/types';
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

export default function ViewGlobalProductPage() {
  const params = useParams();
  const productId = params?.id as string;
  
  const [product, setProduct] = useState<BaseProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar producto
  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/pim/global-catalog/${productId}`);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const mappedProduct = mapToBaseProduct(data);
        setProduct(mappedProduct);

      } catch (err: any) {
        console.error('Error fetching product:', err);
        setError(err.message || 'Error al cargar el producto');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

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
        </div>
      </div>
    );
  }

  return (
    <ProductView
      product={product}
      mode="view"
      showVerificationBadge={true}
      showQualityScore={true}
      showSource={true}
      readonly={false}
    />
  );
}
