import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsService } from '../services/products.service';
import { categoriesService } from '../services/categories.service';
import ProductCard from '../components/ui/ProductCard';
import type { Product, Category } from '../types';
import './HomePage.css';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productsService.getAll(),
      categoriesService.getAll(),
    ]).then(([prods, cats]) => {
      setProducts(prods);
      setCategories(cats);
    }).finally(() => setLoading(false));
  }, []);

  const featuredProducts = products.slice(0, 8);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero__overlay">
          <div className="hero__content">
            <h1 className="hero__title">
              BORN CLASSIC:<br />BORN FOR LIFE
            </h1>
            <Link to="/category/calzado" className="hero__cta">DESCUBRE MÁS</Link>
          </div>
        </div>
      </section>

      {/* Brands Strip */}
      <section className="brands">
        <div className="brands__strip">
          {['adidas', 'Nike', 'adidas', 'Nike', 'adidas', 'Nike'].map((brand, i) => (
            <span key={i} className="brands__name">{brand}</span>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured">
        <div className="section-bar">
          <h2>LO QUE BUSCAS ESTÁ AQUÍ</h2>
        </div>
        <div className="featured__grid">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="product-card-skeleton" />
            ))
          ) : (
            featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="categories-section">
          <h2>Explora nuestras categorías</h2>
          <div className="categories-section__grid">
            {categories.filter(c => !c.parentId).map(cat => (
              <Link key={cat.id} to={`/category/${cat.slug}`} className="category-chip">
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
