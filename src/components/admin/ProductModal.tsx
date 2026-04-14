import { useState, useEffect } from 'react';
import type { Product, Category } from '../../types';
import './Modal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: Product | null;
  categories: Category[];
}

export default function ProductModal({ isOpen, onClose, onSave, initialData, categories }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    price: 0,
    stockQuantity: 0,
    isActive: true,
    categoryId: ''
  });
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        sku: initialData.sku,
        price: initialData.price,
        stockQuantity: initialData.stockQuantity,
        isActive: initialData.isActive,
        categoryId: initialData.categoryId.toString()
      });
      if (initialData.images && initialData.images.length > 0) {
        setImageUrls(
          [...initialData.images]
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map(img => img.url)
        );
      } else {
        setImageUrls(['']);
      }
    } else {
      setFormData({
        name: '',
        description: '',
        sku: '',
        price: 0,
        stockQuantity: 0,
        isActive: true,
        categoryId: ''
      });
      setImageUrls(['']);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!formData.categoryId) {
        alert('Debe seleccionar una categoría');
        setLoading(false);
        return;
      }
      
      const images = imageUrls
        .filter(url => url.trim() !== '')
        .map((url, index) => ({
          url: url.trim(),
          displayOrder: index
        }));

      await onSave({
        ...formData,
        price: Number(formData.price),
        stockQuantity: Number(formData.stockQuantity),
        categoryId: Number(formData.categoryId),
        images: images.length > 0 ? images : undefined
      });
      onClose();
    } catch (error) {
      console.error('Error saving product', error);
      alert('Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2>{initialData ? 'Editar Producto' : 'Nuevo Producto'}</h2>
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label>Nombre</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label>SKU</label>
            <input required type="text" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Precio</label>
              <input required type="number" step="0.01" min="0" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Stock</label>
              <input required type="number" min="0" value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: Number(e.target.value)})} />
            </div>
          </div>
          <div className="form-group">
            <label>Categoría</label>
            <select required value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}>
              <option value="">Seleccione una categoría</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input type="checkbox" id="isActive" style={{ width: 'auto' }} checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
            <label htmlFor="isActive" style={{ margin: 0, cursor: 'pointer' }}>Producto Activo</label>
          </div>
          
          <div className="form-group">
            <label>URLs de Imágenes</label>
            {imageUrls.map((url, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input 
                  type="text" 
                  placeholder="https://ejemplo.com/foto.jpg" 
                  value={url} 
                  onChange={e => {
                    const newUrls = [...imageUrls];
                    newUrls[index] = e.target.value;
                    setImageUrls(newUrls);
                  }} 
                />
                <button 
                  type="button" 
                  className="btn-delete" 
                  onClick={() => {
                    const newUrls = [...imageUrls];
                    newUrls.splice(index, 1);
                    setImageUrls(newUrls.length ? newUrls : ['']);
                  }}
                >
                  X
                </button>
              </div>
            ))}
            <button 
              type="button" 
              className="btn-secondary" 
              style={{ fontSize: '0.8rem', padding: '5px 10px', marginTop: '5px' }} 
              onClick={() => setImageUrls([...imageUrls, ''])}
            >
              + Agregar otra URL
            </button>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
