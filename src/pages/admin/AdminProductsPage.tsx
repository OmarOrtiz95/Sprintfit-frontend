import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { productsService } from '../../services/products.service';
import { categoriesService } from '../../services/categories.service';
import type { Product, Category } from '../../types';
import ProductModal from '../../components/admin/ProductModal';
import './AdminPages.css';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prods, cats] = await Promise.all([
        productsService.getAll(),
        categoriesService.getAll()
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error cargando los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (data: any, files: File[], existingImages: string[]) => {
    try {
      if (editingProduct) {
        await productsService.update(editingProduct.id, data, files, existingImages);
        toast.success('Producto actualizado exitosamente');
      } else {
        await productsService.create(data, files);
        toast.success('Producto creado exitosamente');
      }
      loadData();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Error al guardar el producto');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await productsService.delete(id);
        toast.success('Producto eliminado');
        loadData();
      } catch (error) {
        toast.error('Error al eliminar producto');
      }
    }
  };

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <h1>Gestión de Productos</h1>
        <button className="btn-primary" onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}>
          Nuevo Producto
        </button>
      </div>

      {loading ? (
        <p>Cargando productos...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>SKU</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((prod) => (
              <tr key={prod.id}>
                <td>{prod.id}</td>
                <td>{prod.name}</td>
                <td>{prod.sku}</td>
                <td>${Number(prod.price).toFixed(2)}</td>
                <td>{prod.stockQuantity}</td>
                <td>
                  <button className="btn-edit" onClick={() => { setEditingProduct(prod); setIsModalOpen(true); }}>Editar</button>
                  <button className="btn-delete" onClick={() => handleDelete(prod.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingProduct}
        categories={categories}
      />
    </div>
  );
}
