import { useEffect, useState } from "react";
import { getSalesReps } from "../api/salesReps";
import type { SalesRep } from "../api/types";
import { getProducts } from "../api/products";
import type { Product } from "../api/types";
import { getCustomers } from "../api/customers";
import type { Customer } from "../api/types";

interface UseOrderFormDataResult {
  salesReps: SalesRep[];
  isLoadingSalesReps: boolean;
  salesRepsError: string | null;

  products: Product[];
  isLoadingProducts: boolean;
  productsError: string | null;

  customers: Customer[];
  isLoadingCustomers: boolean;
  customersError: string | null;
}

function useOrderFormData(): UseOrderFormDataResult {
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [isLoadingSalesReps, setIsLoadingSalesReps] = useState(true);
  const [salesRepsError, setSalesRepsError] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true);
  const [customersError, setCustomersError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSalesReps() {
      try {
        setIsLoadingSalesReps(true);
        setSalesRepsError(null);

        const data = await getSalesReps();

        setSalesReps(data.filter((salesRep) => salesRep.active));
      } catch (err) {
        console.error("Error al cargar vendedoras:", err);
        setSalesRepsError("No fue posible cargar las vendedoras.");
      } finally {
        setIsLoadingSalesReps(false);
      }
    }

    loadSalesReps();
  }, []);

  useEffect(() => {
    async function loadProducts() {
      try {
        setIsLoadingProducts(true);
        setProductsError(null);

        const data = await getProducts();

        setProducts(data.filter((product) => product.available));
      } catch (err) {
        console.error("Error al cargar productos:", err);
        setProductsError("No fue posible cargar los productos.");
      } finally {
        setIsLoadingProducts(false);
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function loadCustomers() {
      try {
        setIsLoadingCustomers(true);
        setCustomersError(null);

        const data = await getCustomers();

        setCustomers(data);
      } catch (err) {
        console.error("Error al cargar clientes:", err);
        setCustomersError("No fue posible cargar los clientes.");
      } finally {
        setIsLoadingCustomers(false);
      }
    }

    loadCustomers();
  }, []);

  return {
    salesReps,
    isLoadingSalesReps,
    salesRepsError,
    products,
    isLoadingProducts,
    productsError,
    customers,
    isLoadingCustomers,
    customersError,
  };
}

export default useOrderFormData;
