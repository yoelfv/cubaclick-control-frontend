import { apiFetch } from "./client";
import type { Product, StrapiProduct, StrapiResponse } from "./types";

function mapProduct(product: StrapiProduct): Product {
  return {
    id: product.documentId,
    name: product.nombre,
    price: Number(product.precio),
    available: product.disponible,
    saleUnit: product.saleUnit ?? "unit",
    categoria: product.categoria
      ? {
          id: product.categoria.documentId,
          name: product.categoria.nombre,
        }
      : null,
  };
}

export async function getProducts(): Promise<Product[]> {
  const allProducts: StrapiProduct[] = [];
  let page = 1;
  let pageCount = 1;
  const pageSize = 100;

  while (page <= pageCount) {
    const params = new URLSearchParams({
      "sort[0]": "nombre:asc",
      "pagination[page]": String(page),
      "pagination[pageSize]": String(pageSize),
      "populate[categoria]": "true",
    });

    const response = await apiFetch<StrapiResponse<StrapiProduct[]>>(
      `/products?${params.toString()}`,
    );

    allProducts.push(...response.data);

    // Leer el número total de páginas desde meta.pagination
    const meta = response.meta as
      { pagination?: { pageCount?: number } } | undefined;

    if (meta?.pagination?.pageCount) {
      pageCount = meta.pagination.pageCount;
    } else {
      pageCount = 1; // fallback si no hay meta
    }

    page += 1;
  }

  return allProducts.map(mapProduct);
}
