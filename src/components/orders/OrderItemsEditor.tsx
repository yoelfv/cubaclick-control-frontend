import type { Product } from "../../api/types";
import type { OrderItemForm } from "../../types/orderForm";
import { formatAmount } from "../../utils/format";

interface OrderItemsEditorProps {
  orderItems: OrderItemForm[];
  products: Product[];
  isLoadingProducts: boolean;
  productsError: string | null;
  onChange: (items: OrderItemForm[]) => void;
}

function OrderItemsEditor({
  orderItems,
  products,
  isLoadingProducts,
  productsError,
  onChange,
}: OrderItemsEditorProps) {
  const updateItem = (index: number, changes: Partial<OrderItemForm>) => {
    const newItems = [...orderItems];

    newItems[index] = {
      ...newItems[index],
      ...changes,
    };

    onChange(newItems);
  };

  const removeItem = (index: number) => {
    onChange(orderItems.filter((_, itemIndex) => itemIndex !== index));
  };

  const addItem = () => {
    onChange([
      ...orderItems,
      {
        productId: "",
        quantity: "1",
      },
    ]);
  };

  return (
    <>
      <div className="order-items">
        {orderItems.map((orderItem, index) => {
          const selectedProduct = products.find(
            (product) => product.id === orderItem.productId,
          );

          const selectedProductIds = orderItems
            .filter((_, itemIndex) => itemIndex !== index)
            .map((item) => item.productId)
            .filter(Boolean);

          const unitPrice = orderItem.unitPrice ?? selectedProduct?.price ?? 0;

          const subtotal =
            selectedProduct && orderItem.quantity !== ""
              ? unitPrice * Number(orderItem.quantity)
              : 0;

          // Agrupar productos por categoría
          const grouped: Record<string, Product[]> = {};
          for (const product of products) {
            if (product.categoria) {
              if (!grouped[product.categoria.name]) {
                grouped[product.categoria.name] = [];
              }
              grouped[product.categoria.name].push(product);
            }
          }

          // Ordenar categorías alfabéticamente
          const sortedCategories = Object.keys(grouped).sort((a, b) =>
            a.localeCompare(b, "es"),
          );

          return (
            <div className="order-item-row" key={index}>
              <label className="order-form-field order-item-product">
                <span>Producto</span>

                <select
                  value={orderItem.productId}
                  onChange={(event) =>
                    updateItem(index, {
                      productId: event.target.value,
                      unitPrice: undefined,
                    })
                  }
                >
                  <option value="" disabled>
                    {isLoadingProducts
                      ? "Cargando productos..."
                      : "Selecciona un producto"}
                  </option>

                  {!isLoadingProducts &&
                    !productsError &&
                    sortedCategories.map((categoryName) => (
                      <optgroup key={categoryName} label={categoryName}>
                        {grouped[categoryName]
                          .filter(
                            (product) =>
                              !selectedProductIds.includes(product.id) ||
                              product.id === orderItem.productId,
                          )
                          .map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name}
                              {product.saleUnit === "weight" ? " (libras)" : ""}
                            </option>
                          ))}
                      </optgroup>
                    ))}
                </select>

                {productsError && (
                  <small className="order-form-field-error">
                    {productsError}
                  </small>
                )}
              </label>

              <label className="order-form-field order-item-quantity">
                <span>
                  Cantidad
                  {selectedProduct?.saleUnit === "weight" ? " (libras)" : ""}
                </span>

                <input
                  type="number"
                  min={selectedProduct?.saleUnit === "weight" ? "0.01" : "1"}
                  step={selectedProduct?.saleUnit === "weight" ? "0.01" : "1"}
                  value={orderItem.quantity}
                  onChange={(event) => {
                    const value = event.target.value;

                    if (selectedProduct?.saleUnit === "weight") {
                      // Permitir decimales con hasta 2 decimales
                      if (value === "" || /^\d+(\.\d{0,2})?$/.test(value)) {
                        updateItem(index, { quantity: value });
                      }
                    } else {
                      // Solo enteros
                      if (value === "" || /^\d+$/.test(value)) {
                        updateItem(index, { quantity: value });
                      }
                    }
                  }}
                />
              </label>

              <div className="order-item-price">
                <span>Precio</span>
                <strong>{formatAmount(selectedProduct ? unitPrice : 0)}</strong>
                {selectedProduct?.saleUnit === "weight" && (
                  <small className="order-item-price-unit">/ lb</small>
                )}
              </div>

              <div className="order-item-subtotal">
                <span>Subtotal</span>
                <strong>{formatAmount(subtotal)}</strong>
              </div>

              <button
                type="button"
                className="order-item-remove"
                aria-label={`Eliminar producto ${index + 1}`}
                onClick={() => removeItem(index)}
              >
                Eliminar
              </button>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className="secondary-button order-add-item-button"
        onClick={addItem}
      >
        + Añadir producto
      </button>
    </>
  );
}

export default OrderItemsEditor;
