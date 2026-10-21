import { apiFetch } from "./client";
import type { Product, StrapiProduct, StrapiResponse } from "./types";

function mapProduct(product: StrapiProduct): Product {
  return {
    id: product.documentId,
    name: product.nombre,
    price: product.precio,
    available: product.disponible,
    categoria: product.categoria
      ? {
          id: product.categoria.documentId,
          name: product.categoria.nombre,
        }
      : null,
  };
}

export async function getProducts(): Promise<Product[]> {
  const params = new URLSearchParams({
    "sort[0]": "nombre:asc",
    "pagination[pageSize]": "100",
    "populate[categoria]": "true",
  });

  const response = await apiFetch<StrapiResponse<StrapiProduct[]>>(
    `/products?${params.toString()}`,
  );

  return response.data.map(mapProduct);
}
