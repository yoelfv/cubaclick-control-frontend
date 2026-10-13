import { useEffect } from "react";

interface FormMessageProps {
  type: "success" | "error";
  message: string;
  onClose: () => void;
}

function FormMessage({ type, message, onClose }: FormMessageProps) {
  useEffect(() => {
    if (type !== "success") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      onClose();
    }, 4000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [type, onClose]);

  return (
    <div
      className={`order-form-message order-form-message-${type}`}
      role={type === "error" ? "alert" : "status"}
    >
      <span>{message}</span>

      <button type="button" aria-label="Cerrar mensaje" onClick={onClose}>
        ×
      </button>
    </div>
  );
}

export default FormMessage;
