import { apiFetch } from './client'
import type { Product, StrapiProduct, StrapiResponse } from './types'

function mapProduct(product: StrapiProduct): Product {
  return {
    id: product.documentId,
    name: product.nombre,
    price: product.precio,
    available: product.disponible,
  }
}

export async function getProducts(): Promise<Product[]> {
  const response = await apiFetch<StrapiResponse<StrapiProduct[]>>(
    '/products',
  )

  return response.data.map(mapProduct)
}