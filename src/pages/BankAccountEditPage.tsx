interface BankAccountEditPageProps {
  bankAccountId: string | null;
  onBack: () => void;
}

export default function BankAccountEditPage({
  bankAccountId,
  onBack,
}: BankAccountEditPageProps) {
  return (
    <div>
      <button type="button" className="back-button" onClick={onBack}>
        ← Atrás
      </button>
      <p>Formulario de cuenta (por implementar)</p>
      <small>ID: {bankAccountId ?? "(nueva)"}</small>
    </div>
  );
}
