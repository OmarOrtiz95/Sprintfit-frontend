import { FiX, FiMinus, FiPlus } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../utils/image-utils';
import './CartSidebar.css';

export default function CartSidebar() {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeItem, totalPrice } = useCart();
  const navigate = useNavigate();

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);

  if (!isCartOpen) return null;

  return (
    <div className="cart-overlay" onClick={() => setIsCartOpen(false)}>
      <aside className="cart-sidebar" onClick={e => e.stopPropagation()}>
        <div className="cart-sidebar__header">
          <button className="cart-sidebar__close" onClick={() => setIsCartOpen(false)} aria-label="Cerrar">
            <FiX size={22} />
          </button>
          <h2>Carrito</h2>
        </div>

        <div className="cart-sidebar__items">
          {items.length === 0 && (
            <p className="cart-sidebar__empty">Tu carrito está vacío</p>
          )}
          {items.map(item => (
            <div key={item.productId} className="cart-item">
              <img src={getImageUrl(item.image)} alt={item.name} className="cart-item__img" />
              <div className="cart-item__info">
                <h4>{item.name}</h4>
                <p className="cart-item__price">{formatPrice(item.price)}</p>
                {item.selectedAttributes && (
                  <p className="cart-item__attrs">
                    {Object.entries(item.selectedAttributes).map(([k, v]) => `${k}: ${v}`).join(', ')}
                  </p>
                )}
                <div className="cart-item__qty">
                  <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} aria-label="Reducir">
                    <FiMinus size={14} />
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} aria-label="Aumentar">
                    <FiPlus size={14} />
                  </button>
                </div>
              </div>
              <button className="cart-item__remove" onClick={() => removeItem(item.productId)} aria-label="Eliminar">
                <FiX size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="cart-sidebar__footer">
          <div className="cart-sidebar__totals">
            <div className="cart-sidebar__row">
              <span>Subtotal</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="cart-sidebar__row cart-sidebar__row--total">
              <span>Total</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
          </div>
          <div className="cart-sidebar__actions">
            <button className="cart-sidebar__continue" onClick={() => setIsCartOpen(false)}>
              Seguir comprando
            </button>
            <button
              className="cart-sidebar__checkout"
              onClick={() => {
                setIsCartOpen(false);
                navigate('/checkout');
              }}
              disabled={items.length === 0}
            >
              Ir a pagar
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
