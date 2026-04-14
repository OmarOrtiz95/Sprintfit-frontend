import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsService } from '../services/products.service';
import { categoriesService } from '../services/categories.service';
import ProductCard from '../components/ui/ProductCard';
import type { Product, Category } from '../types';
import './CategoryPage.css';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      productsService.getAll(),
      categoriesService.getAll(),
    ]).then(([prods, cats]) => {
      setCategories(cats);
      const category = cats.find(c => c.slug === slug);
      if (category) {
        const filtered = prods.filter(p => p.categoryId === category.id);
        setProducts(filtered);
      } else {
        setProducts(prods);
      }
    }).finally(() => setLoading(false));
  }, [slug]);

  const currentCategory = categories.find(c => c.slug === slug);
  const categoryDescriptions: Record<string, string> = {
    calzado: 'Calzado Casual y práctico para todas las ocasiones sin dejar de lado tu deportividad!',
    ropa: 'Calzado ideal para entrenar y ejercitarte al límite sin perder el mejor estilo!',
    accesorios: 'Los mejores accesorios para complementar tu estilo deportivo!',
  };

  return (
    <div className="category-page">
      <div className="category-page__breadcrumb">
        <Link to="/">Inicio</Link>
        <span>&gt;</span>
        <span>Todo SprintFit</span>
        <span>&gt;</span>
        <span>{currentCategory?.name || slug}</span>
      </div>

      <h1 className="category-page__title">
        {currentCategory?.name || slug}
      </h1>
      <p className="category-page__description">
        {slug && categoryDescriptions[slug] || 'Descubre nuestra colección de productos.'}
      </p>

      {loading ? (
        <div className="category-page__grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="product-card-skeleton" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="category-page__empty">
          <p>No se encontraron productos en esta categoría.</p>
          <Link to="/" className="category-page__back">Volver al inicio</Link>
        </div>
      ) : (
        <div className="category-page__grid">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
