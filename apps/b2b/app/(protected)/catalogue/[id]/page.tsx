'use client';

import { use } from 'react';
import { ProductDetail } from '@/apps/b2b/components/ProductDetail';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ProductDetail productId={id} />;
}
