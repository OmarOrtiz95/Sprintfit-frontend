import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>SprintFit Admin</h2>
        </div>
        <nav className="admin-nav">
          <Link to="/admin/products" className="admin-nav-link">Productos</Link>
          <Link to="/admin/categories" className="admin-nav-link">Categorías</Link>
          <Link to="/" className="admin-nav-link">Volver a la Tienda</Link>
        </nav>
        <div className="admin-sidebar-footer">
          <p>{user?.fullName}</p>
          <button onClick={handleLogout} className="admin-logout-btn">Cerrar Sesión</button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
