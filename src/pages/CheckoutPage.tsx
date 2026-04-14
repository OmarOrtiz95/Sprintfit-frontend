import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersService } from '../services/orders.service';
import { paymentsService } from '../services/payments.service';
import { checkoutSchema, type CheckoutFormData } from '../schemas/checkout.schema';
import toast from 'react-hot-toast';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<Partial<CheckoutFormData>>({
    useSameAddress: true,
  });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);

  const handleChange = (field: keyof CheckoutFormData, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para realizar una compra');
      navigate('/login');
      return;
    }

    const result = checkoutSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        const key = issue.path[0] as string;
        fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    const data = result.data;
    setLoading(true);

    try {
      const shippingAddress = `${data.address}, ${data.city}, ${data.department}`;

      const order = await ordersService.create({
        shippingAddress,
        phone: data.phone,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      const payment: any = await paymentsService.processPayment(order.id);

      clearCart();
      
      const wompiUrl = `https://checkout.wompi.co/p/?public-key=${payment.publicKey}&currency=${payment.currency}&amount-in-cents=${payment.amountInCents}&reference=${payment.transactionReference}&redirect-url=${payment.redirectUrl}`;
      window.location.href = wompiUrl;

    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al procesar el pago';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="checkout__empty">
        <h2>Tu carrito está vacío</h2>
        <Link to="/">Volver a la tienda</Link>
      </div>
    );
  }

  return (
    <div className="checkout">
      <button className="checkout__back" onClick={() => navigate(-1)}>
        ← Volver
      </button>

      <div className="checkout__layout">
        <form className="checkout__form" onSubmit={handleSubmit}>
          {/* Contact */}
          <section className="checkout__section">
            <h2>Contacto</h2>
            <div className="checkout__field">
              <input
                type="email"
                placeholder="Correo electrónico"
                value={form.email || ''}
                onChange={e => handleChange('email', e.target.value)}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="checkout__error">{errors.email}</span>}
            </div>
          </section>

          {/* Shipping */}
          <section className="checkout__section">
            <h2>Entrega</h2>
            <div className="checkout__row">
              <div className="checkout__field">
                <input
                  placeholder="Nombre"
                  value={form.firstName || ''}
                  onChange={e => handleChange('firstName', e.target.value)}
                  className={errors.firstName ? 'error' : ''}
                />
                {errors.firstName && <span className="checkout__error">{errors.firstName}</span>}
              </div>
              <div className="checkout__field">
                <input
                  placeholder="Apellido"
                  value={form.lastName || ''}
                  onChange={e => handleChange('lastName', e.target.value)}
                  className={errors.lastName ? 'error' : ''}
                />
                {errors.lastName && <span className="checkout__error">{errors.lastName}</span>}
              </div>
            </div>
            <div className="checkout__field">
              <input
                placeholder="Cédula"
                value={form.cedula || ''}
                onChange={e => handleChange('cedula', e.target.value)}
                className={errors.cedula ? 'error' : ''}
              />
              {errors.cedula && <span className="checkout__error">{errors.cedula}</span>}
            </div>
            <div className="checkout__field">
              <input
                placeholder="Dirección"
                value={form.address || ''}
                onChange={e => handleChange('address', e.target.value)}
                className={errors.address ? 'error' : ''}
              />
              {errors.address && <span className="checkout__error">{errors.address}</span>}
            </div>
            <div className="checkout__row">
              <div className="checkout__field">
                <input
                  placeholder="Ciudad"
                  value={form.city || ''}
                  onChange={e => handleChange('city', e.target.value)}
                  className={errors.city ? 'error' : ''}
                />
                {errors.city && <span className="checkout__error">{errors.city}</span>}
              </div>
              <div className="checkout__field">
                <input
                  placeholder="Departamento"
                  value={form.department || ''}
                  onChange={e => handleChange('department', e.target.value)}
                  className={errors.department ? 'error' : ''}
                />
                {errors.department && <span className="checkout__error">{errors.department}</span>}
              </div>
            </div>
            <div className="checkout__field">
              <input
                placeholder="Teléfono"
                value={form.phone || ''}
                onChange={e => handleChange('phone', e.target.value)}
                className={errors.phone ? 'error' : ''}
              />
              {errors.phone && <span className="checkout__error">{errors.phone}</span>}
            </div>
          </section>

          {/* Payment */}
          <section className="checkout__section">
            <h2>Pago</h2>
            <p className="checkout__secure">Serás redirigido a la plataforma segura de Wompi (puedes pagar con Nequi).</p>
          </section>

          {/* Billing */}
          <section className="checkout__section">
            <h2>Dirección de facturación</h2>
            <label className="checkout__radio">
              <input
                type="radio"
                checked={form.useSameAddress === true}
                onChange={() => handleChange('useSameAddress', true)}
              />
              La misma dirección de envío
            </label>
            <label className="checkout__radio">
              <input
                type="radio"
                checked={form.useSameAddress === false}
                onChange={() => handleChange('useSameAddress', false)}
              />
              Usar una dirección de facturación distinta
            </label>
          </section>

          <button className="checkout__submit" type="submit" disabled={loading}>
            {loading ? 'Procesando...' : 'Pagar con Wompi (Nequi)'}
          </button>
        </form>

        {/* Order Summary */}
        <aside className="checkout__summary">
          {items.map(item => (
            <div key={item.productId} className="checkout__summary-item">
              <img src={item.image} alt={item.name} />
              <div className="checkout__summary-info">
                <h4>{item.name}</h4>
                {item.selectedAttributes && (
                  <p>
                    {Object.entries(item.selectedAttributes).map(([k, v]) => `${k}: ${v}`).join(', ')}
                  </p>
                )}
                <p>Cantidad: {item.quantity}</p>
              </div>
            </div>
          ))}
          <div className="checkout__summary-totals">
            <div className="checkout__summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="checkout__summary-row checkout__summary-row--total">
              <span>Total</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
