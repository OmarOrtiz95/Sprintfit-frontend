import { useNavigate } from 'react-router-dom';
import type { Product } from '../../types';
import { getImageUrl } from '../../utils/image-utils';
import './ProductCard.css';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const navigate = useNavigate();
  const image = product.images?.sort((a, b) => a.displayOrder - b.displayOrder)[0];

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);

  return (
    <div className="product-card" onClick={() => navigate(`/product/${product.id}`)}>
      <div className="product-card__img-wrap">
        <span className="product-card__badge">NUEVO</span>
        {image ? (
          <img src={getImageUrl(image.url)} alt={product.name} className="product-card__img" />
        ) : (
          <div className="product-card__placeholder" />
        )}
      </div>
      <div className="product-card__info">
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__price">{formatPrice(Number(product.price))}</p>
      </div>
    </div>
  );
}
