import { useEffect, useState } from "react";
import {
  createOrder,
  getOrderById,
  updateOrder,
  cancelOrder,
} from "../api/orders";
import { findCustomer, createCustomer } from "../api/customers";
import useOrderFormData from "../hooks/useOrderFormData";
import type { OrderItemForm } from "../types/orderForm";
import OrderItemsEditor from "../components/orders/OrderItemsEditor";
import PersonFields from "../components/orders/PersonFields";
import CustomerFields from "../components/orders/CustomerFields";
import PaymentStatusField from "../components/orders/PaymentStatusField";
import RemittanceField from "../components/orders/RemittanceField";
import OrderSummary from "../components/orders/OrderSummary";
import OrderBasicInfo from "../components/orders/OrderBasicInfo";
import {
  calculateProductsTotal,
  calculateOrderTotal,
} from "../utils/orderTotals";
import { validateOrderForm } from "../utils/orderValidation";
import FormMessage from "../components/common/FormMessage";
import ConfirmDialog from "../components/common/ConfirmDialog";
import LoadingState from "../components/common/LoadingState";

interface OrderFormPageProps {
  onBack: () => void;
  orderId: string | null;
}

function OrderFormPage({ onBack, orderId }: OrderFormPageProps) {
  const [orderItems, setOrderItems] = useState<OrderItemForm[]>([
    {
      productId: "",
      quantity: "1",
    },
  ]);
  const [remittance, setRemittance] = useState("");
  const [date, setDate] = useState("");
  const [salesRepId, setSalesRepId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "paid">(
    "pending",
  );
  const [formMessage, setFormMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoadingOrder, setIsLoadingOrder] = useState(orderId !== null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);

  const {
    salesReps,
    isLoadingSalesReps,
    salesRepsError,
    products,
    isLoadingProducts,
    productsError,
    customers,
    isLoadingCustomers,
    customersError,
  } = useOrderFormData();

  const productsTotal = calculateProductsTotal(orderItems, products);
  const orderTotal = calculateOrderTotal(productsTotal, remittance);

  useEffect(() => {
    if (!orderId) {
      return;
    }

    async function loadOrder(id: string) {
      try {
        setIsLoadingOrder(true);

        const order = await getOrderById(id);

        setDate(order.date);
        setIsCancelled(order.cancelled);
        setSalesRepId(order.salesRep.id);

        setCustomerName(order.customer.name);
        setCustomerPhone(order.customer.phone);

        setRecipientName(order.recipientName);
        setRecipientPhone(order.recipientPhone);

        setRemittance(order.remittance > 0 ? String(order.remittance) : "");

        setPaymentStatus(order.paymentStatus);

        setOrderItems(
          order.orderItems.map((item) => ({
            productId: item.product.id,
            quantity: String(item.quantity),
            unitPrice: item.unitPrice,
          })),
        );

        setIsDirty(false);
      } catch (error) {
        console.error("Error al cargar el pedido:", error);

        setFormMessage({
          type: "error",
          message: "No fue posible cargar el pedido.",
        });
      } finally {
        setIsLoadingOrder(false);
      }
    }

    loadOrder(orderId);
  }, [orderId]);

  async function handleSaveOrder() {
    setFormMessage(null);

    const error = validateOrderForm({
      date,
      salesRepId,
      customerName,
      customerPhone,
      recipientName,
      recipientPhone,
      orderItems,
      remittance,
    });

    if (error) {
      setFormMessage({
        type: "error",
        message: error,
      });
      return;
    }

    try {
      const normalizedCustomerName = customerName.trim();
      const normalizedCustomerPhone = customerPhone.trim();

      let customer = await findCustomer(
        normalizedCustomerName,
        normalizedCustomerPhone,
      );

      if (!customer) {
        customer = await createCustomer(
          normalizedCustomerName,
          normalizedCustomerPhone,
        );
      }

      const items = orderItems
        .filter((item) => item.productId !== "")
        .map((item) => ({
          product: item.productId,
          quantity: Number(item.quantity),
        }));

      const orderData = {
        customer: customer.id,
        recipientName: recipientName.trim(),
        recipientPhone: recipientPhone.trim(),
        remittance: Number(remittance || 0),
        paymentStatus,
        items,
      };

      if (orderId) {
        const result = await updateOrder(orderId, orderData);

        console.log("Pedido actualizado correctamente:", result);
      } else {
        const result = await createOrder({
          date,
          salesRep: salesRepId,
          customer: customer.id,
          recipientName: recipientName.trim(),
          recipientPhone: recipientPhone.trim(),
          remittance: Number(remittance || 0),
          paymentStatus,
          items,
        });

        console.log("Pedido creado correctamente:", result);
      }

      setIsDirty(false);

      setFormMessage({
        type: "success",
        message: orderId ? "Pedido actualizado" : "Pedido guardado",
      });
    } catch (err) {
      console.error("Error al guardar el pedido:", err);
      setFormMessage({
        type: "error",
        message: "No fue posible guardar el pedido.",
      });
    }
  }

  function handleOpenCancelDialog() {
    setIsCancelDialogOpen(true);
  }

  async function handleConfirmCancelOrder() {
    setIsCancelDialogOpen(false);

    try {
      setIsCancelling(true);
      setFormMessage(null);

      await cancelOrder(orderId!);

      setIsCancelled(true);
      setIsDirty(false);

      setFormMessage({
        type: "success",
        message: "Pedido cancelado correctamente",
      });
    } catch (err) {
      console.error("Error al cancelar el pedido:", err);

      setFormMessage({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "No fue posible cancelar el pedido.",
      });
    } finally {
      setIsCancelling(false);
    }
  }

  function handleBack() {
    if (isDirty && !isCancelled) {
      setIsLeaveDialogOpen(true);
    } else {
      onBack();
    }
  }

  return (
    <div className="order-form-page">
      <div className="order-form-header">
        <div>
          <h2>{orderId ? "Editar pedido" : "Nuevo pedido"}</h2>
          <p>
            {orderId
              ? "Modifica los datos del pedido."
              : "Registra un nuevo pedido en Cubaclick."}
          </p>
        </div>
      </div>

      <button type="button" className="back-button" onClick={handleBack}>
        ← Atrás
      </button>

      {isLoadingOrder ? (
        <LoadingState message="Cargando pedido..." />
      ) : (
        <>
          <div className="order-form-sections">
            <OrderBasicInfo
              date={date}
              salesRepId={salesRepId}
              salesReps={salesReps}
              isLoadingSalesReps={isLoadingSalesReps}
              salesRepsError={salesRepsError}
              isEditing={orderId !== null}
              onDateChange={(value) => {
                setDate(value);
                setIsDirty(true);
              }}
              onSalesRepChange={(value) => {
                setSalesRepId(value);
                setIsDirty(true);
              }}
            />

            <CustomerFields
              name={customerName}
              phone={customerPhone}
              customers={customers}
              isLoadingCustomers={isLoadingCustomers}
              customersError={customersError}
              onNameChange={(value) => {
                setCustomerName(value);
                setIsDirty(true);
              }}
              onPhoneChange={(value) => {
                setCustomerPhone(value);
                setIsDirty(true);
              }}
            />

            <PersonFields
              title="Destinatario"
              name={recipientName}
              phone={recipientPhone}
              namePlaceholder="Nombre del destinatario"
              phonePlaceholder="Teléfono del destinatario"
              onNameChange={(value) => {
                setRecipientName(value);
                setIsDirty(true);
              }}
              onPhoneChange={(value) => {
                setRecipientPhone(value);
                setIsDirty(true);
              }}
            />

            <section className="order-form-section">
              <div className="order-form-section-header">
                <div>
                  <h3>Productos</h3>
                  <p>Agrega los productos incluidos en el pedido.</p>
                </div>
              </div>

              <OrderItemsEditor
                orderItems={orderItems}
                products={products}
                isLoadingProducts={isLoadingProducts}
                productsError={productsError}
                onChange={(value) => {
                  setOrderItems(value);
                  setIsDirty(true);
                }}
              />
            </section>

            <RemittanceField
              value={remittance}
              onChange={(value) => {
                setRemittance(value);
                setIsDirty(true);
              }}
            />

            <PaymentStatusField
              value={paymentStatus}
              onChange={(value) => {
                setPaymentStatus(value);
                setIsDirty(true);
              }}
            />
          </div>

          {formMessage && (
            <FormMessage
              type={formMessage.type}
              message={formMessage.message}
              onClose={() => setFormMessage(null)}
            />
          )}

          <OrderSummary total={orderTotal} />

          <div className="order-form-actions">
            {!isCancelled && (
              <button
                type="button"
                className="order-form-save-button"
                onClick={handleSaveOrder}
                disabled={!isDirty || isCancelling}
              >
                Guardar pedido
              </button>
            )}

            {orderId && !isCancelled && (
              <button
                type="button"
                className="order-form-cancel-button"
                onClick={handleOpenCancelDialog}
                disabled={isCancelling}
              >
                {isCancelling ? "Cancelando..." : "Cancelar pedido"}
              </button>
            )}

            {isCancelled && (
              <div className="order-details-cancelled">
                <strong>Estado: Cancelado</strong>
                <span>
                  Este pedido fue cancelado y se conserva únicamente como
                  registro.
                </span>
              </div>
            )}
          </div>
        </>
      )}

      <ConfirmDialog
        isOpen={isCancelDialogOpen}
        title="Cancelar pedido"
        message="¿Seguro que quieres cancelar este pedido? Esta acción no se puede deshacer."
        confirmLabel="Sí, cancelar pedido"
        cancelLabel="No, volver"
        variant="danger"
        onConfirm={handleConfirmCancelOrder}
        onCancel={() => setIsCancelDialogOpen(false)}
      />
      <ConfirmDialog
        isOpen={isLeaveDialogOpen}
        title="Salir sin guardar"
        message="Tienes cambios sin guardar. Si sales ahora, se perderán."
        confirmLabel="Sí, salir sin guardar"
        cancelLabel="No, seguir editando"
        variant="danger"
        onConfirm={() => {
          setIsLeaveDialogOpen(false);
          onBack();
        }}
        onCancel={() => setIsLeaveDialogOpen(false)}
      />
    </div>
  );
}

export default OrderFormPage;
