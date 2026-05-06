import { useState, useEffect, useRef } from 'react';
import type { Product, Category, ProductImage } from '../../types';
import { getImageUrl } from '../../utils/image-utils';
import './Modal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any, files: File[], existingImages: string[]) => Promise<void>;
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
    categoryId: '',
    tallas: '',
    colores: '',
    genero: ''
  });
  
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        sku: initialData.sku,
        price: initialData.price,
        stockQuantity: initialData.stockQuantity,
        isActive: initialData.isActive,
        categoryId: initialData.categoryId.toString(),
        tallas: Array.isArray(initialData.attributes?.talla) ? (initialData.attributes?.talla.join(', ') || '') : '',
        colores: Array.isArray(initialData.attributes?.color) ? (initialData.attributes?.color.join(', ') || '') : '',
        genero: initialData.attributes?.genero || ''
      });
      setExistingImages(initialData.images || []);
      setNewFiles([]);
      setPreviews([]);
    } else {
      setFormData({
        name: '',
        description: '',
        sku: '',
        price: 0,
        stockQuantity: 0,
        isActive: true,
        categoryId: '',
        tallas: '',
        colores: '',
        genero: ''
      });
      setExistingImages([]);
      setNewFiles([]);
      setPreviews([]);
    }
  }, [initialData, isOpen]);

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previews]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewFiles(prev => [...prev, ...filesArray]);
      
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeNewFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setNewFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (id: number) => {
    setExistingImages(prev => prev.filter(img => img.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!formData.categoryId) {
        alert('Debe seleccionar una categoría');
        setLoading(false);
        return;
      }
      
      const { tallas, colores, genero, ...productDataToSend } = formData;
      
      await onSave(
        {
          ...productDataToSend,
          price: Number(productDataToSend.price),
          stockQuantity: Number(productDataToSend.stockQuantity),
          categoryId: Number(productDataToSend.categoryId),
          attributes: {
            ...(tallas ? { talla: tallas.split(',').map(s => s.trim()).filter(s => s !== '') } : {}),
            ...(colores ? { color: colores.split(',').map(s => s.trim()).filter(s => s !== '') } : {}),
            ...(genero ? { genero: genero } : {})
          }
        },
        newFiles,
        existingImages.map(img => img.url)
      );
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

          <div className="form-attributes" style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', marginBottom: '15px', background: '#f9f9f9' }}>
            <h3 style={{ marginTop: 0, fontSize: '1rem', marginBottom: '10px' }}>Atributos del Producto</h3>
            <div className="form-group">
              <label>Tallas (separadas por coma)</label>
              <input type="text" placeholder="Ej: S, M, L, XL" value={formData.tallas} onChange={e => setFormData({...formData, tallas: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Colores (separados por coma)</label>
              <input type="text" placeholder="Ej: Negro, Blanco, Azul" value={formData.colores} onChange={e => setFormData({...formData, colores: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Género</label>
              <select value={formData.genero} onChange={e => setFormData({...formData, genero: e.target.value})}>
                <option value="">No especificado</option>
                <option value="Hombre">Hombre</option>
                <option value="Mujer">Mujer</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label>Imágenes del Producto</label>
            
            <div className="image-preview-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px', marginBottom: '15px' }}>
              {/* Existing Images */}
              {existingImages.map((img) => (
                <div key={img.id} className="image-preview-item" style={{ position: 'relative', aspectRatio: '1', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                  <img src={getImageUrl(img.url)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button 
                    type="button" 
                    onClick={() => removeExistingImage(img.id)}
                    style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(255,0,0,0.7)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    X
                  </button>
                </div>
              ))}
              
              {/* New Previews */}
              {previews.map((url, index) => (
                <div key={index} className="image-preview-item" style={{ position: 'relative', aspectRatio: '1', border: '1px solid #007bff', borderRadius: '4px', overflow: 'hidden' }}>
                  <img src={url} alt="New preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button 
                    type="button" 
                    onClick={() => removeNewFile(index)}
                    style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(255,0,0,0.7)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    X
                  </button>
                  <span style={{ position: 'absolute', bottom: '2px', left: '2px', background: 'rgba(0,123,255,0.7)', color: 'white', fontSize: '8px', padding: '1px 3px', borderRadius: '2px' }}>NUEVA</span>
                </div>
              ))}

              {/* Add Button */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={{ aspectRatio: '1', border: '2px dashed #ccc', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexDirection: 'column', color: '#666' }}
              >
                <span style={{ fontSize: '24px' }}>+</span>
                <span style={{ fontSize: '10px' }}>Subir</span>
              </div>
            </div>

            <input 
              type="file" 
              multiple 
              accept="image/*" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileChange} 
            />
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
