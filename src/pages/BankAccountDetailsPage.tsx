interface BankAccountDetailsPageProps {
  bankAccountId: string;
  onBack: () => void;
  onViewDetails: (orderId: string) => void;
}

export default function BankAccountDetailsPage({
  bankAccountId,
  onBack,
}: BankAccountDetailsPageProps) {
  return (
    <div>
      <button type="button" className="back-button" onClick={onBack}>
        ← Atrás
      </button>
      <p>Detalles de la cuenta (por implementar)</p>
      <small>ID: {bankAccountId}</small>
    </div>
  );
}
