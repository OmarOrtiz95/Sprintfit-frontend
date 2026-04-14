import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { CartItem } from '../types';
import { cartService } from '../services/cart.service';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    try {
      const cart = await cartService.getCart();
      const mappedItems = cart.items.map((item: any) => ({
        productId: item.productId,
        name: item.product.name,
        price: Number(item.product.price),
        quantity: item.quantity,
        image: item.product.images?.[0]?.url || '',
        selectedAttributes: item.attributes,
      }));
      setItems(mappedItems);
    } catch (err) {
      console.error('Failed to fetch cart', err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const addItem = async (item: Omit<CartItem, 'id'>) => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para añadir productos al carrito');
      return;
    }
    try {
      await cartService.addItem(item.productId, item.quantity, item.selectedAttributes);
      await fetchCart();
      setIsCartOpen(true);
      toast.success('Producto agregado al carrito');
    } catch {
      toast.error('Error al agregar al carrito');
    }
  };

  const removeItem = async (productId: number) => {
    try {
      await cartService.removeItem(productId);
      await fetchCart();
    } catch {
      toast.error('Error al eliminar producto');
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (quantity <= 0) {
      return removeItem(productId);
    }
    try {
      await cartService.updateQuantity(productId, quantity);
      await fetchCart();
    } catch {
      toast.error('Error al actualizar cantidad');
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;
    try {
      await cartService.clearCart();
      setItems([]);
    } catch {
      toast.error('Error al vaciar carrito');
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
