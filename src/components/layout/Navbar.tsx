import { Link } from 'react-router-dom';
import { FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { totalItems, setIsCartOpen } = useCart();
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar__container">
        <Link to="/" className="navbar__logo">
          SPRINT<span>FIT</span>
        </Link>
        <nav className="navbar__links">
          <Link to="/category/calzado" className="navbar__link">CALZADO</Link>
          <Link to="/category/ropa" className="navbar__link">ROPA</Link>
          <Link to="/category/accesorios" className="navbar__link">ACCESORIOS</Link>
          
          <div className="navbar__auth">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="navbar__link" style={{ textDecoration: 'underline' }}>
                  HOLA, {user?.fullName?.split(' ')[0].toUpperCase()}
                </Link>
                <button 
                  className="navbar__link" 
                  onClick={logout}
                  style={{ background: 'none', border: 'none', padding: 0 }}
                >
                  SALIR
                </button>
              </>
            ) : (
              <Link to="/login" className="navbar__link">INICIAR SESIÓN</Link>
            )}
          </div>

          <button
            className="navbar__cart-btn"
            onClick={() => setIsCartOpen(true)}
            aria-label="Bolsa de compras"
          >
            <FiShoppingBag size={20} />
            BOLSA DE COMPRAS
            {totalItems > 0 && <span className="navbar__cart-badge">{totalItems}</span>}
          </button>
        </nav>
      </div>
    </header>
  );
}
