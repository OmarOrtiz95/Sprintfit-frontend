import { useState, useEffect } from 'react';
import { ordersService } from '../../services/orders.service';
import type { Order } from '../../types';
import toast from 'react-hot-toast';
import './AdminOrdersPage.css';

const ORDER_STATUSES = [
  'PENDING_PAYMENT',
  'PAID',
  'PREPARING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED'
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (statusFilter === 'ALL') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(o => o.status === statusFilter));
    }
  }, [statusFilter, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersService.getAll();
      setOrders(data);
    } catch (err) {
      toast.error('Error al cargar las órdenes');
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (orderId: number) => {
    try {
      // Fetch full order details including products, payments
      const orderData = await ordersService.getById(orderId);
      setSelectedOrder(orderData);
      setNewStatus(orderData.status);
    } catch (err) {
      toast.error('Error al cargar detalles de la orden');
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    try {
      const updated = await ordersService.updateStatus(selectedOrder.id, newStatus);
      toast.success('Estado actualizado correctamente');
      
      // Update local state
      setSelectedOrder({ ...selectedOrder, status: updated.status as any });
      setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, status: updated.status as any } : o));
    } catch (err) {
      toast.error('Error al actualizar estado');
    }
  };

  if (loading) return <div style={{ padding: '24px' }}>Cargando órdenes...</div>;

  return (
    <div className="admin-orders">
      <div className="admin-orders-header">
        <h1>Gestión de Órdenes</h1>
        <div className="admin-orders-filters">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">Todos los estados</option>
            {ORDER_STATUSES.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Pago (Ref)</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center' }}>No se encontraron órdenes</td>
              </tr>
            ) : (
              filteredOrders.map(order => {
                const latestPayment = order.payments && order.payments.length > 0 
                  ? order.payments[order.payments.length - 1] 
                  : null;

                return (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{new Date(order.createdAt!).toLocaleDateString()}</td>
                    <td>{order.user?.email || `User ${order.userId}`}</td>
                    <td>${Number(order.totalAmount).toLocaleString('es-CO')}</td>
                    <td>
                      <span className={`status-badge ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      {latestPayment ? (
                        <div style={{ fontSize: '0.8rem' }}>
                          <strong>{latestPayment.status}</strong>
                          <br />
                          <span style={{ color: '#888' }}>{latestPayment.transactionReference.split('_')[1] || latestPayment.transactionReference}</span>
                        </div>
                      ) : (
                        <span style={{ color: '#aaa', fontSize: '0.8rem' }}>N/A</span>
                      )}
                    </td>
                    <td>
                      <button className="action-btn" onClick={() => openDetail(order.id)}>
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedOrder(null)}>×</button>
            <h2>Detalle de Orden #{selectedOrder.id}</h2>

            <div className="order-detail-grid">
              <div className="detail-section">
                <h3>Datos del Cliente</h3>
                <p><strong>Nombre:</strong> {selectedOrder.user?.fullName}</p>
                <p><strong>Email:</strong> {selectedOrder.user?.email}</p>
                <p><strong>Teléfono:</strong> {selectedOrder.phone || 'N/A'}</p>
              </div>

              <div className="detail-section">
                <h3>Envío</h3>
                <p><strong>Dirección:</strong> {selectedOrder.shippingAddress}</p>
              </div>

              <div className="detail-section">
                <h3>Pagos Asociados</h3>
                {selectedOrder.payments && selectedOrder.payments.length > 0 ? (
                  selectedOrder.payments.map(payment => (
                    <div key={payment.id} style={{ marginBottom: '8px', padding: '8px', background: '#f8f8f8', borderRadius: '4px' }}>
                      <p><strong>Referencia:</strong> {payment.transactionReference}</p>
                      <p><strong>Estado Wompi:</strong> {payment.status}</p>
                      <p><strong>Monto:</strong> ${Number(payment.amount).toLocaleString('es-CO')}</p>
                      <p><strong>Fecha:</strong> {new Date(payment.createdAt!).toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <p>No hay registros de pago.</p>
                )}
              </div>
            </div>

            <div className="detail-section">
              <h3>Productos Comprados</h3>
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>SKU</th>
                    <th>Precio Unit.</th>
                    <th>Cant.</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map(item => (
                    <tr key={item.id}>
                      <td>{item.product?.name || `Producto #${item.productId}`}</td>
                      <td>{item.product?.sku || 'N/A'}</td>
                      <td>${Number(item.unitPrice).toLocaleString('es-CO')}</td>
                      <td>{item.quantity}</td>
                      <td>${(Number(item.unitPrice) * item.quantity).toLocaleString('es-CO')}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'right', fontWeight: 'bold' }}>TOTAL:</td>
                    <td style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>${Number(selectedOrder.totalAmount).toLocaleString('es-CO')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="order-status-update">
              <label><strong>Actualizar Estado de la Orden:</strong></label>
              <select value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                {ORDER_STATUSES.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <button onClick={handleUpdateStatus}>Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
