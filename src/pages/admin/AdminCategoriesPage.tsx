import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { categoriesService } from '../../services/categories.service';
import type { Category } from '../../types';
import CategoryModal from '../../components/admin/CategoryModal';
import './AdminPages.css';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoriesService.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: { name: string; slug: string; parentId?: number | null }) => {
    if (editingCategory) {
      await categoriesService.update(editingCategory.id, data);
      toast.success('Categoría actualizada exitosamente');
    } else {
      await categoriesService.create(data);
      toast.success('Categoría creada exitosamente');
    }
    loadCategories();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      try {
        await categoriesService.delete(id);
        toast.success('Categoría eliminada');
        loadCategories();
      } catch (error) {
        toast.error('Error al eliminar categoría');
      }
    }
  };

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <h1>Gestión de Categorías</h1>
        <button className="btn-primary" onClick={() => { setEditingCategory(null); setIsModalOpen(true); }}>
          Nueva Categoría
        </button>
      </div>

      {loading ? (
        <p>Cargando categorías...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Slug</th>
              <th>Padre</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td>{cat.id}</td>
                <td>{cat.name}</td>
                <td>{cat.slug}</td>
                <td>{cat.parentId || '-'}</td>
                <td>
                  <button className="btn-edit" onClick={() => { setEditingCategory(cat); setIsModalOpen(true); }}>Editar</button>
                  <button className="btn-delete" onClick={() => handleDelete(cat.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingCategory}
        categories={categories}
      />
    </div>
  );
}
