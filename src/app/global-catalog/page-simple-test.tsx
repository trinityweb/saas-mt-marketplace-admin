'use client';

import { useState, useEffect } from 'react';

export default function SimpleGlobalCatalogTest() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/pim/global-catalog?page=1&page_size=10');
        const data = await response.json();
        console.log('✅ API Response:', data);
        setProducts(data.items || []);
      } catch (error) {
        console.error('❌ Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Global Catalog Test</h1>
      <p>Productos encontrados: {products.length}</p>
      <div className="mt-4">
        {products.map((product: any, index: number) => (
          <div key={product.id || index} className="p-2 border-b">
            <h3 className="font-medium">{product.name}</h3>
            <p className="text-sm text-gray-600">Precio: ${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
