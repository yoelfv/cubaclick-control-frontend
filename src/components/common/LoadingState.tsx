interface LoadingStateProps {
  /** Texto opcional debajo del spinner. Por defecto "Cargando...". */
  message?: string;
  /**
   * `full` (por defecto): padding generoso, para cargas de página completa.
   * `inline`: padding compacto, para cargas dentro de una página.
   */
  variant?: "full" | "inline";
}

export default function LoadingState({
  message = "Cargando...",
  variant = "full",
}: LoadingStateProps) {
  const className =
    variant === "inline"
      ? "loading-state loading-state-inline"
      : "loading-state";

  return (
    <div className={className} role="status" aria-live="polite">
      <div className="loading-state-spinner" aria-hidden="true" />
      {message && <p className="loading-state-message">{message}</p>}
    </div>
  );
}
