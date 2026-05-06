import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersService } from '../services/orders.service';
import { paymentsService } from '../services/payments.service';
import { usersService } from '../services/users.service';
import toast from 'react-hot-toast';
import './CheckoutPage.css';

interface SavedAddress {
  id: number;
  firstName: string;
  lastName: string;
  cedula?: string;
  address: string;
  city: string;
  department: string;
  phone: string;
  isDefault?: boolean;
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | 'new' | null>(null);

  // Manual address form (used when no saved addresses or user picks "new")
  const [form, setForm] = useState({
    email: user?.email || '',
    firstName: '',
    lastName: '',
    cedula: '',
    address: '',
    city: '',
    department: '',
    phone: '',
    nequiPhone: user?.phone || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [pendingTransactionId, setPendingTransactionId] = useState<string | null>(null);

  // Fetch saved addresses on mount
  useEffect(() => {
    if (!isAuthenticated) {
      setLoadingAddresses(false);
      return;
    }
    usersService.getAddresses()
      .then((addrs: SavedAddress[]) => {
        setSavedAddresses(addrs);
        if (addrs.length > 0) {
          const defaultAddr = addrs.find(a => a.isDefault) || addrs[0];
          setSelectedAddressId(defaultAddr.id);
        }
      })
      .catch(() => { })
      .finally(() => setLoadingAddresses(false));
  }, [isAuthenticated]);

  // Pre-fill email from user profile
  useEffect(() => {
    if (user?.email && !form.email) {
      setForm(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const getSelectedAddress = (): SavedAddress | null => {
    if (typeof selectedAddressId === 'number') {
      return savedAddresses.find(a => a.id === selectedAddressId) || null;
    }
    return null;
  };

  const validateForm = () => {
    const fieldErrors: Record<string, string> = {};

    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) {
      fieldErrors.email = 'Correo electrónico inválido';
    }

    // Only validate address fields if user is entering a new address
    if (selectedAddressId === 'new' || savedAddresses.length === 0) {
      if (!form.firstName || form.firstName.length < 2) fieldErrors.firstName = 'El nombre es requerido';
      if (!form.lastName || form.lastName.length < 2) fieldErrors.lastName = 'El apellido es requerido';
      if (!form.address || form.address.length < 5) fieldErrors.address = 'La dirección es requerida';
      if (!form.city || form.city.length < 2) fieldErrors.city = 'La ciudad es requerida';
      if (!form.department || form.department.length < 2) fieldErrors.department = 'El departamento es requerido';
      if (!form.phone || form.phone.length < 7) fieldErrors.phone = 'El teléfono es requerido';
    }

    // Validate nequiPhone separately since it's always required
    if (!form.nequiPhone || form.nequiPhone.length !== 10) {
      fieldErrors.nequiPhone = 'El número de Nequi debe tener 10 dígitos';
    }

    setErrors(fieldErrors);
    return Object.keys(fieldErrors).length === 0;
  };

  // Polling logic
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (pendingTransactionId) {
      intervalId = setInterval(async () => {
        try {
          const { status } = await paymentsService.getTransaction(pendingTransactionId);
          if (status === 'APPROVED') {
            clearInterval(intervalId);
            setPendingTransactionId(null);
            toast.success('¡Pago aceptado exitosamente!');
            navigate('/profile');
          } else if (status === 'DECLINED' || status === 'ERROR' || status === 'VOIDED') {
            clearInterval(intervalId);
            setPendingTransactionId(null);
            toast.error(`El pago fue rechazado o cancelado (${status}). Intenta nuevamente.`);
          }
          // If PENDING, keep polling
        } catch (error) {
          console.error('Error polling transaction status', error);
        }
      }, 5000); // Poll every 5 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [pendingTransactionId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para realizar una compra');
      navigate('/login');
      return;
    }

    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    setLoading(true);

    try {
      let shippingAddress: string;
      let phone: string;

      const selected = getSelectedAddress();
      if (selected) {
        shippingAddress = `${selected.address}, ${selected.city}, ${selected.department}`;
        phone = selected.phone;
      } else {
        shippingAddress = `${form.address}, ${form.city}, ${form.department}`;
        phone = form.phone;
      }

      const order = await ordersService.create({
        shippingAddress,
        phone,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      const payment = await paymentsService.processNequiPayment({
        phoneNumber: form.nequiPhone,
        amountInCents: Math.round(totalPrice * 100),
        customerEmail: form.email,
        orderId: order.id,
      });

      clearCart();
      setPendingTransactionId(payment.transactionId);
      toast.success('Pago iniciado');

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

  if (pendingTransactionId) {
    return (
      <div className="checkout__empty">
        <h2 style={{ color: '#F5A623' }}>Por favor acepta el pago en Nequi</h2>
        <p style={{ marginTop: '16px', color: '#555' }}>
          Hemos enviado una notificación a tu celular (<strong>{form.nequiPhone}</strong>).<br />
          Abre la aplicación de Nequi para confirmar la transacción.
        </p>
        <div style={{ marginTop: '30px' }}>
          <span style={{ display: 'inline-block', animation: 'pulse 1.5s infinite', background: '#F5A623', width: '12px', height: '12px', borderRadius: '50%', marginRight: '10px' }}></span>
          <span style={{ color: '#888' }}>Esperando confirmación...</span>
        </div>
        <p style={{ marginTop: '40px', fontSize: '0.9rem', color: '#888' }}>
          También puedes <Link to="/profile">revisar en tus pedidos</Link> más tarde.
        </p>
        <style>{`
          @keyframes pulse {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(245, 166, 35, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(245, 166, 35, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(245, 166, 35, 0); }
          }
        `}</style>
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
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="checkout__error">{errors.email}</span>}
            </div>
          </section>

          {/* Shipping */}
          <section className="checkout__section">
            <h2>Entrega</h2>

            {loadingAddresses ? (
              <p className="checkout__loading">Cargando direcciones...</p>
            ) : savedAddresses.length > 0 ? (
              <>
                <div className="checkout__address-list">
                  {savedAddresses.map(addr => (
                    <label
                      key={addr.id}
                      className={`checkout__address-card ${selectedAddressId === addr.id ? 'checkout__address-card--selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="shippingAddress"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                      />
                      <div className="checkout__address-card-info">
                        <span className="checkout__address-card-name">
                          {addr.firstName} {addr.lastName}
                        </span>
                        <span className="checkout__address-card-detail">
                          {addr.address}
                        </span>
                        <span className="checkout__address-card-detail">
                          {addr.city}, {addr.department}
                        </span>
                        <span className="checkout__address-card-detail">
                          Tel: {addr.phone}
                        </span>
                      </div>
                      {addr.isDefault && <span className="checkout__address-badge">Predeterminada</span>}
                    </label>
                  ))}

                  {/* Option to enter a new address */}
                  <label
                    className={`checkout__address-card checkout__address-card--new ${selectedAddressId === 'new' ? 'checkout__address-card--selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="shippingAddress"
                      checked={selectedAddressId === 'new'}
                      onChange={() => setSelectedAddressId('new')}
                    />
                    <div className="checkout__address-card-info">
                      <span className="checkout__address-card-name">+ Usar otra dirección</span>
                    </div>
                  </label>
                </div>

                {/* Show manual form only if "new" is selected */}
                {selectedAddressId === 'new' && (
                  <div className="checkout__new-address-form">
                    {renderManualAddressFields()}
                  </div>
                )}
              </>
            ) : (
              /* No saved addresses → show manual form directly */
              renderManualAddressFields()
            )}
          </section>

          {/* Payment */}
          <section className="checkout__section">
            <h2>Pago Nequi</h2>
            <div className="checkout__field">
              <input
                placeholder="Número de Nequi (10 dígitos)"
                value={form.nequiPhone}
                onChange={e => handleChange('nequiPhone', e.target.value)}
                className={errors.nequiPhone ? 'error' : ''}
                maxLength={10}
              />
              {errors.nequiPhone && <span className="checkout__error">{errors.nequiPhone}</span>}
            </div>
            <p className="checkout__secure">Se iniciará el pago con Nequi. Recibirás una notificación en este celular para aprobarlo.</p>
          </section>

          <button className="checkout__submit" type="submit" disabled={loading}>
            {loading ? 'Procesando...' : 'Pagar con Nequi'}
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

  function renderManualAddressFields() {
    return (
      <>
        <div className="checkout__row">
          <div className="checkout__field">
            <input
              placeholder="Nombre"
              value={form.firstName}
              onChange={e => handleChange('firstName', e.target.value)}
              className={errors.firstName ? 'error' : ''}
            />
            {errors.firstName && <span className="checkout__error">{errors.firstName}</span>}
          </div>
          <div className="checkout__field">
            <input
              placeholder="Apellido"
              value={form.lastName}
              onChange={e => handleChange('lastName', e.target.value)}
              className={errors.lastName ? 'error' : ''}
            />
            {errors.lastName && <span className="checkout__error">{errors.lastName}</span>}
          </div>
        </div>
        <div className="checkout__field">
          <input
            placeholder="Cédula"
            value={form.cedula}
            onChange={e => handleChange('cedula', e.target.value)}
            className={errors.cedula ? 'error' : ''}
          />
          {errors.cedula && <span className="checkout__error">{errors.cedula}</span>}
        </div>
        <div className="checkout__field">
          <input
            placeholder="Dirección"
            value={form.address}
            onChange={e => handleChange('address', e.target.value)}
            className={errors.address ? 'error' : ''}
          />
          {errors.address && <span className="checkout__error">{errors.address}</span>}
        </div>
        <div className="checkout__row">
          <div className="checkout__field">
            <input
              placeholder="Ciudad"
              value={form.city}
              onChange={e => handleChange('city', e.target.value)}
              className={errors.city ? 'error' : ''}
            />
            {errors.city && <span className="checkout__error">{errors.city}</span>}
          </div>
          <div className="checkout__field">
            <input
              placeholder="Departamento"
              value={form.department}
              onChange={e => handleChange('department', e.target.value)}
              className={errors.department ? 'error' : ''}
            />
            {errors.department && <span className="checkout__error">{errors.department}</span>}
          </div>
        </div>
        <div className="checkout__field">
          <input
            placeholder="Teléfono"
            value={form.phone}
            onChange={e => handleChange('phone', e.target.value)}
            className={errors.phone ? 'error' : ''}
          />
          {errors.phone && <span className="checkout__error">{errors.phone}</span>}
        </div>
      </>
    );
  }
}
