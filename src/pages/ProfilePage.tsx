import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ordersService } from '../services/orders.service';
import { usersService } from '../services/users.service';
import { paymentsService } from '../services/payments.service';
import type { Order } from '../types';
import toast from 'react-hot-toast';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses'>('profile');

  // Edit Profile States
  const [profileForm, setProfileForm] = useState({ fullName: user?.fullName || '', email: user?.email || '', phone: user?.phone || '' });
  const [passwordForm, setPasswordForm] = useState({ password: '', confirmPassword: '' });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Addresses States
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    firstName: user?.fullName?.split(' ')[0] || '',
    lastName: user?.fullName?.split(' ').slice(1).join(' ') || '',
    address: '',
    city: '',
    department: '',
    phone: user?.phone || ''
  });

  // Retry Payment States
  const [retryOrderId, setRetryOrderId] = useState<number | null>(null);
  const [retryPhone, setRetryPhone] = useState(user?.phone || '');
  const [retryPendingTxId, setRetryPendingTxId] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'orders') {
      ordersService.getMyOrders().then(setOrders).catch(console.error);
    } else if (activeTab === 'addresses') {
      usersService.getAddresses().then(setAddresses).catch(console.error);
    }
  }, [activeTab]);
  // Polling logic for retry payment
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    
    if (retryPendingTxId) {
      intervalId = setInterval(async () => {
        try {
          const { status } = await paymentsService.getTransaction(retryPendingTxId);
          if (status === 'APPROVED') {
            clearInterval(intervalId);
            setRetryPendingTxId(null);
            setRetryOrderId(null);
            toast.success('¡Pago aceptado exitosamente!');
            ordersService.getMyOrders().then(setOrders); // refresh orders
          } else if (status === 'DECLINED' || status === 'ERROR' || status === 'VOIDED') {
            clearInterval(intervalId);
            setRetryPendingTxId(null);
            toast.error(`El pago fue rechazado o cancelado (${status}). Intenta nuevamente.`);
          }
        } catch (error) {
          console.error('Error polling transaction status', error);
        }
      }, 5000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [retryPendingTxId]);

  const handleRetryPayment = async (orderId: number, totalAmount: number) => {
    if (!retryPhone || retryPhone.length !== 10) {
      toast.error('El número de Nequi debe tener 10 dígitos');
      return;
    }

    try {
      const payment = await paymentsService.processNequiPayment({
        phoneNumber: retryPhone,
        amountInCents: Math.round(Number(totalAmount) * 100),
        customerEmail: user?.email || '',
        orderId: orderId,
      });

      setRetryPendingTxId(payment.transactionId);
      toast.success('Pago iniciado. Revisa tu Nequi.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al iniciar el pago');
    }
  };
  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1>Mi Cuenta</h1>

        <div className="profile-tabs">
          <button className={`tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            Perfil
          </button>
          <button className={`tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            Mis Pedidos
          </button>
          <button className={`tab ${activeTab === 'addresses' ? 'active' : ''}`} onClick={() => setActiveTab('addresses')}>
            Mis Direcciones
          </button>
        </div>

        <div className="profile-content">
          {activeTab === 'profile' && (
            <div className="profile-section">
              <h2>Datos Personales</h2>
              {!isEditingProfile ? (
                <div>
                  <p><strong>Nombre completo:</strong> {profileForm.fullName}</p>
                  <p><strong>Email:</strong> {profileForm.email}</p>
                  <p><strong>Teléfono:</strong> {profileForm.phone}</p>
                  <button className="edit-btn" onClick={() => setIsEditingProfile(true)}>Editar Perfil</button>
                </div>
              ) : (
                <form className="profile-form" onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await usersService.updateProfile(profileForm);
                    await refreshProfile();
                    toast.success('Perfil actualizado');
                    setIsEditingProfile(false);
                  } catch (e: any) { toast.error('Error al actualizar'); }
                }}>
                  <input placeholder="Nombre Completo" value={profileForm.fullName} onChange={e => setProfileForm({ ...profileForm, fullName: e.target.value })} required />
                  <input placeholder="Email" type="email" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} required />
                  <input placeholder="Teléfono" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} />
                  <div className="form-actions">
                    <button type="submit">Guardar</button>
                    <button type="button" onClick={() => setIsEditingProfile(false)}>Cancelar</button>
                  </div>
                </form>
              )}

              <hr />
              <h2>Cambiar Contraseña</h2>
              <form className="profile-form" onSubmit={async (e) => {
                e.preventDefault();
                if (passwordForm.password !== passwordForm.confirmPassword) return toast.error('Las contraseñas no coinciden');
                if (passwordForm.password.length < 6) return toast.error('La contraseña debe tener al menos 6 caracteres');
                try {
                  await usersService.changePassword(passwordForm.password);
                  toast.success('Contraseña actualizada');
                  setPasswordForm({ password: '', confirmPassword: '' });
                } catch { toast.error('Error al actualizar contraseña'); }
              }}>
                <input placeholder="Nueva contraseña" type="password" value={passwordForm.password} onChange={e => setPasswordForm({ ...passwordForm, password: e.target.value })} required />
                <input placeholder="Confirmar contraseña" type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} required />
                <button type="submit" disabled={!passwordForm.password}>Actualizar Contraseña</button>
              </form>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="profile-section">
              <h2>Historial de Pedidos</h2>
              {orders.length === 0 ? (
                <p>No has realizado ningún pedido aún.</p>
              ) : (
                <div className="orders-list">
                  {orders.map(order => (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <span><strong>Pedido #{order.id}</strong></span>
                        <span className={`status ${order.status.toLowerCase()}`}>{order.status}</span>
                      </div>
                      <p>Total: ${(Number(order.totalAmount)).toLocaleString('es-CO')}</p>
                      <p>Fecha: {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</p>
                      
                      {order.status === 'PENDING_PAYMENT' && (
                        <div className="order-retry-section" style={{ marginTop: '12px', borderTop: '1px solid #eee', paddingTop: '12px' }}>
                          {retryPendingTxId && retryOrderId === order.id ? (
                            <div style={{ color: '#F5A623', fontSize: '0.9rem' }}>
                              <span style={{ display: 'inline-block', animation: 'pulse 1.5s infinite', background: '#F5A623', width: '8px', height: '8px', borderRadius: '50%', marginRight: '8px' }}></span>
                              Esperando confirmación en Nequi ({retryPhone})...
                            </div>
                          ) : retryOrderId === order.id ? (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <input 
                                placeholder="Número Nequi" 
                                value={retryPhone} 
                                onChange={e => setRetryPhone(e.target.value)} 
                                maxLength={10}
                                style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9rem', width: '140px' }}
                              />
                              <button 
                                onClick={() => handleRetryPayment(order.id, Number(order.totalAmount))}
                                style={{ padding: '6px 12px', background: '#F5A623', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}
                              >
                                Pagar
                              </button>
                              <button 
                                onClick={() => { setRetryOrderId(null); setRetryPendingTxId(null); }}
                                style={{ padding: '6px 12px', background: '#eee', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => { setRetryOrderId(order.id); setRetryPhone(user?.phone || ''); }}
                              style={{ padding: '6px 12px', background: '#222', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}
                            >
                              Reintentar Pago
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="profile-section">
              <h2>Mis Direcciones de Envío</h2>

              {!showAddAddress ? (
                <button className="add-btn" onClick={() => setShowAddAddress(true)}>+ Agregar Dirección</button>
              ) : (
                <form className="profile-form address-form" onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await usersService.addAddress(addressForm);
                    toast.success('Dirección agregada');
                    setShowAddAddress(false);
                    setAddressForm({
                      firstName: user?.fullName?.split(' ')[0] || '',
                      lastName: user?.fullName?.split(' ').slice(1).join(' ') || '',
                      address: '',
                      city: '',
                      department: '',
                      phone: user?.phone || ''
                    });
                    usersService.getAddresses().then(setAddresses);
                  } catch { toast.error('Error al agregar'); }
                }}>
                  <div className="checkout__row">
                    <input placeholder="Nombre" value={addressForm.firstName} onChange={e => setAddressForm({ ...addressForm, firstName: e.target.value })} required />
                    <input placeholder="Apellido" value={addressForm.lastName} onChange={e => setAddressForm({ ...addressForm, lastName: e.target.value })} required />
                  </div>
                  <input placeholder="Dirección (Ej. Carrera 15 # 10-20)" value={addressForm.address} onChange={e => setAddressForm({ ...addressForm, address: e.target.value })} required />
                  <div className="checkout__row">
                    <input placeholder="Ciudad" value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} required />
                    <input placeholder="Departamento" value={addressForm.department} onChange={e => setAddressForm({ ...addressForm, department: e.target.value })} required />
                  </div>
                  <input placeholder="Teléfono" value={addressForm.phone} onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })} required />
                  <div className="form-actions">
                    <button type="submit">Guardar</button>
                    <button type="button" onClick={() => setShowAddAddress(false)}>Cancelar</button>
                  </div>
                </form>
              )}

              {addresses.length === 0 && !showAddAddress ? (
                <p className="mt-4">No tienes direcciones guardadas.</p>
              ) : (
                <div className="addresses-list mt-4">
                  {addresses.map(addr => (
                    <div key={addr.id} className="address-card">
                      <div>
                        <p><strong>{addr.address}</strong></p>
                        <p>{addr.city}, {addr.department}</p>
                      </div>
                      <button className="delete-btn" onClick={async () => {
                        if (!window.confirm('¿Seguro quieres borrar esto?')) return;
                        try { await usersService.deleteAddress(addr.id); setAddresses(addresses.filter(a => a.id !== addr.id)); toast.success('Borrado'); } catch { toast.error('Error al borrar'); }
                      }}>Borrar</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
