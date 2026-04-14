import { useState, useEffect } from 'react';
import type { Category } from '../../types';
import './Modal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; slug: string; parentId?: number | null }) => Promise<void>;
  initialData?: Category | null;
  categories: Category[];
}

export default function CategoryModal({ isOpen, onClose, onSave, initialData, categories }: Props) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setSlug(initialData.slug);
      setParentId(initialData.parentId || '');
    } else {
      setName('');
      setSlug('');
      setParentId('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        name,
        slug,
        parentId: parentId === '' ? null : Number(parentId)
      });
      onClose();
    } catch (error) {
      console.error('Error saving category', error);
      alert('Error al guardar la categoría');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{initialData ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label>Nombre</label>
            <input required type="text" value={name} onChange={e => {
              setName(e.target.value);
              if (!initialData) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
            }} />
          </div>
          <div className="form-group">
            <label>Slug</label>
            <input required type="text" value={slug} onChange={e => setSlug(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Categoría Padre</label>
            <select value={parentId} onChange={e => setParentId(e.target.value === '' ? '' : Number(e.target.value))}>
              <option value="">Ninguna</option>
              {categories.filter(c => c.id !== initialData?.id).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
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
