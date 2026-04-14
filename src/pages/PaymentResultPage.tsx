import { useLocation, Link } from 'react-router-dom';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import './PaymentResultPage.css';

interface PaymentState {
  status: 'APPROVED' | 'DECLINED' | 'PENDING' | 'ERROR' | 'VOIDED';
  transactionReference: string;
  amount: number;
}

export default function PaymentResultPage() {
  const location = useLocation();
  const state = location.state as PaymentState | null;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);

  if (!state) {
    return (
      <div className="payment-result">
        <div className="payment-result__card">
          <p>No hay información de pago disponible.</p>
          <Link to="/" className="payment-result__link">← Volver a SprintFit</Link>
        </div>
      </div>
    );
  }

  const isApproved = state.status === 'APPROVED';

  return (
    <div className="payment-result">
      <div className={`payment-result__card ${isApproved ? 'payment-result__card--success' : 'payment-result__card--error'}`}>
        <div className="payment-result__icon">
          {isApproved ? <FiCheckCircle size={48} /> : <FiAlertCircle size={48} />}
        </div>
        <h1>{isApproved ? 'Tu pago fue aprobado' : 'Tu pago fue rechazado'}</h1>
        <p className="payment-result__ref">Operación #{state.transactionReference}</p>
        {isApproved && (
          <p className="payment-result__amount">Total pagado: {formatPrice(Number(state.amount))}</p>
        )}
        <Link to="/" className="payment-result__link">← Volver a SprintFit</Link>
      </div>
    </div>
  );
}
