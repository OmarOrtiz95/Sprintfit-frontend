import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { categoriesService } from '../services/categories.service';
import ProductCard from '../components/ui/ProductCard';
import type { Category } from '../types';
import './CategoryPage.css';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    categoriesService.getBySlug(slug)
      .then(setCategory)
      .catch(() => setCategory(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const hasChildren = category?.children && category.children.length > 0;

  // Collect all products: own products + children's products
  const allProducts = [
    ...(category?.products || []),
    ...(category?.children?.flatMap(c => c.products || []) || []),
  ];

  return (
    <div className="category-page">
      {/* ── Breadcrumb ───────────────────────────────────── */}
      <div className="category-page__breadcrumb">
        <Link to="/">Inicio</Link>
        <span>&gt;</span>
        <span>Todo SprintFit</span>
        {category?.parent && (
          <>
            <span>&gt;</span>
            <Link to={`/category/${category.parent.slug}`}>{category.parent.name}</Link>
          </>
        )}
        <span>&gt;</span>
        <span>{category?.name || slug}</span>
      </div>

      <h1 className="category-page__title">
        {category?.name || slug}
      </h1>

      {loading ? (
        <div className="category-page__grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="product-card-skeleton" />
          ))}
        </div>
      ) : allProducts.length === 0 ? (
        <div className="category-page__empty">
          <p>No se encontraron productos en esta categoría.</p>
          <Link to="/" className="category-page__back">Volver al inicio</Link>
        </div>
      ) : hasChildren ? (
        /* ── Parent category: show sections per child ─── */
        <div className="category-page__sections">
          {/* Own products (directly in parent category) */}
          {(category?.products?.length ?? 0) > 0 && (
            <section className="category-page__section">
              <h2 className="category-page__section-title">{category!.name}</h2>
              <div className="category-page__grid">
                {category!.products!.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          )}

          {/* Child categories with their products */}
          {category!.children!
            .filter(child => (child.products?.length ?? 0) > 0)
            .map(child => (
              <section key={child.id} className="category-page__section">
                <div className="category-page__section-header">
                  <h2 className="category-page__section-title">{child.name}</h2>
                  <Link to={`/category/${child.slug}`} className="category-page__section-link">
                    Ver todo &rarr;
                  </Link>
                </div>
                <div className="category-page__grid">
                  {child.products!.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            ))}
        </div>
      ) : (
        /* ── Leaf category: flat grid ───────────────────── */
        <div className="category-page__grid">
          {allProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
