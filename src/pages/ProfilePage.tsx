import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ordersService } from '../services/orders.service';
import { usersService } from '../services/users.service';
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
  const [addressForm, setAddressForm] = useState({ address: '', city: '', department: '' });

  useEffect(() => {
    if (activeTab === 'orders') {
      ordersService.getMyOrders().then(setOrders).catch(console.error);
    } else if (activeTab === 'addresses') {
      usersService.getAddresses().then(setAddresses).catch(console.error);
    }
  }, [activeTab]);

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
                  <input placeholder="Nombre Completo" value={profileForm.fullName} onChange={e => setProfileForm({...profileForm, fullName: e.target.value})} required />
                  <input placeholder="Email" type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} required />
                  <input placeholder="Teléfono" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} />
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
                  setPasswordForm({password: '', confirmPassword: ''});
                } catch { toast.error('Error al actualizar contraseña'); }
              }}>
                <input placeholder="Nueva contraseña" type="password" value={passwordForm.password} onChange={e => setPasswordForm({...passwordForm, password: e.target.value})} required />
                <input placeholder="Confirmar contraseña" type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} required />
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
                      <p>Fecha: {new Date(order.createdAt).toLocaleDateString()}</p>
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
                    setAddressForm({address: '', city: '', department: ''});
                    usersService.getAddresses().then(setAddresses);
                  } catch { toast.error('Error al agregar'); }
                }}>
                  <input placeholder="Dirección (Ej. Carrera 15 # 10-20)" value={addressForm.address} onChange={e => setAddressForm({...addressForm, address: e.target.value})} required />
                  <input placeholder="Ciudad" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} required />
                  <input placeholder="Departamento" value={addressForm.department} onChange={e => setAddressForm({...addressForm, department: e.target.value})} required />
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
