import { Link } from 'react-router-dom';
import { FiShoppingBag, FiChevronDown } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { categoriesService } from '../../services/categories.service';
import type { Category } from '../../types';
import './Navbar.css';

interface NavCategoryItemProps {
  category: Category;
}

function NavCategoryItem({ category }: NavCategoryItemProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const hasChildren = category.children && category.children.length > 0;

  useEffect(() => {
    if (!hasChildren) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [hasChildren]);

  if (!hasChildren) {
    return (
      <Link to={`/category/${category.slug}`} className="navbar__link">
        {category.name.toUpperCase()}
      </Link>
    );
  }

  return (
    <div
      ref={ref}
      className={`navbar__dropdown${open ? ' navbar__dropdown--open' : ''}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        to={`/category/${category.slug}`}
        className="navbar__link navbar__dropdown-trigger"
        onClick={() => setOpen(false)}
      >
        {category.name.toUpperCase()}
        <FiChevronDown className="navbar__dropdown-arrow" size={13} />
      </Link>

      <div className="navbar__dropdown-menu">
        {category.children!.map((child) => (
          <Link
            key={child.id}
            to={`/category/${child.slug}`}
            className="navbar__dropdown-item"
            onClick={() => setOpen(false)}
          >
            {child.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Navbar() {
  const { totalItems, setIsCartOpen } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const [rootCategories, setRootCategories] = useState<Category[]>([]);

  useEffect(() => {
    categoriesService.getAll().then((cats) => {
      // Agrupar hijos bajo sus padres
      const map = new Map<number, Category>();
      cats.forEach((c) => map.set(c.id, { ...c, children: [] }));

      const roots: Category[] = [];
      map.forEach((c) => {
        if (c.parentId !== null && c.parentId !== undefined) {
          const parent = map.get(c.parentId);
          if (parent) parent.children!.push(c);
        } else {
          roots.push(c);
        }
      });

      setRootCategories(roots);
    });
  }, []);

  return (
    <header className="navbar">
      <div className="navbar__container">
        <Link to="/" className="navbar__logo">
          <img src="/logo.jpeg" alt="SprintFit" />
        </Link>
        <nav className="navbar__links">
          {rootCategories.map((cat) => (
            <NavCategoryItem key={cat.id} category={cat} />
          ))}

          <div className="navbar__auth">
            {isAuthenticated ? (
              <>
                {user?.role === 'ADMIN' && (
                  <Link to="/admin" className="navbar__link" style={{ fontWeight: 'bold' }}>
                    PANEL ADMIN
                  </Link>
                )}
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
