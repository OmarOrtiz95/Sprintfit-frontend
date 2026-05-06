import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsService } from '../services/products.service';
import { useCart } from '../context/CartContext';
import { FiChevronDown } from 'react-icons/fi';
import type { Product } from '../types';
import { getImageUrl } from '../utils/image-utils';
import toast from 'react-hot-toast';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showDescription, setShowDescription] = useState(false);
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>({});
  const { addItem } = useCart();
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    productsService.getById(Number(id)).then(p => {
      setProduct(p);
      // Fetch related products
      productsService.getAll().then(all => {
        setRelatedProducts(all.filter(pr => pr.categoryId === p.categoryId && pr.id !== p.id).slice(0, 4));
      });
    }).finally(() => setLoading(false));
  }, [id]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);

  const handleAddToCart = () => {
    if (!product) return;
    const image = product.images?.sort((a, b) => a.displayOrder - b.displayOrder)[0];
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      image: image?.url || '',
      quantity: 1,
      selectedAttributes: Object.keys(selectedAttrs).length > 0 ? selectedAttrs : undefined,
    });
    toast.success('Agregado al carrito');
  };

  if (loading) {
    return <div className="product-detail__loading">Cargando...</div>;
  }

  if (!product) {
    return (
      <div className="product-detail__not-found">
        <p>Producto no encontrado.</p>
        <Link to="/">Volver al inicio</Link>
      </div>
    );
  }

  const sortedImages = [...(product.images || [])].sort((a, b) => a.displayOrder - b.displayOrder);
  const attrs = product.attributes as Record<string, any> | null;

  return (
    <div className="product-detail">
      <div className="product-detail__breadcrumb">
        <Link to="/">Inicio</Link>
        <span>&gt;</span>
        <span>Todo SprintFit</span>
        <span>&gt;</span>
        <Link to={`/category/${product.category?.slug || ''}`}>{product.category?.name || ''}</Link>
      </div>

      <div className="product-detail__main">
        {/* Image Gallery */}
        <div className="product-detail__gallery">
          <div className="product-detail__img-main">
            {sortedImages[selectedImage] ? (
              <img src={getImageUrl(sortedImages[selectedImage].url)} alt={product.name} />
            ) : (
              <div className="product-detail__img-placeholder" />
            )}
          </div>
          <div className="product-detail__thumbnails">
            {sortedImages.map((img, i) => (
              <button
                key={img.id}
                className={`product-detail__thumb ${i === selectedImage ? 'active' : ''}`}
                onClick={() => setSelectedImage(i)}
              >
                <img src={getImageUrl(img.url)} alt={`${product.name} ${i + 1}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="product-detail__info">
          <h1 className="product-detail__name">{product.name}</h1>
          <p className="product-detail__price">{formatPrice(Number(product.price))}</p>

          {/* Attributes */}
          {attrs && Object.entries(attrs).map(([key, value]) => (
            <div key={key} className="product-detail__attr">
              <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
              {Array.isArray(value) ? (
                <div className="product-detail__attr-options">
                  {value.map((opt: string) => (
                    <button
                      key={opt}
                      className={`product-detail__attr-btn ${selectedAttrs[key] === opt ? 'active' : ''}`}
                      onClick={() => setSelectedAttrs(prev => ({ ...prev, [key]: opt }))}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <span className="product-detail__attr-value">{String(value)}</span>
              )}
            </div>
          ))}

          <div className="product-detail__actions">
            <button className="product-detail__cart-btn" onClick={handleAddToCart}>
              Agregar al carrito
            </button>
          </div>

          <button
            className="product-detail__desc-toggle"
            onClick={() => setShowDescription(!showDescription)}
          >
            Descripción
            <FiChevronDown className={showDescription ? 'rotated' : ''} />
          </button>
          {showDescription && (
            <p className="product-detail__desc">{product.description}</p>
          )}

          {product.stockQuantity <= 0 && (
            <p className="product-detail__out-of-stock">Agotado</p>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="product-detail__related">
          <h2>Productos relacionados</h2>
          <div className="product-detail__related-grid">
            {relatedProducts.map(p => (
              <div key={p.id} className="product-detail__related-card" onClick={() => window.location.href = `/product/${p.id}`}>
                <img src={getImageUrl(p.images?.[0]?.url)} alt={p.name} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
