export interface ProductImage {
  id: number;
  url: string;
  displayOrder: number;
  productId: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  children?: Category[];
  parent?: Category;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  sku: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
  attributes: Record<string, any> | null;
  categoryId: number;
  category?: Category;
  images: ProductImage[];
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  role: 'ADMIN' | 'CUSTOMER';
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  id: number;
  quantity: number;
  unitPrice: number;
  orderId: number;
  productId: number;
  product?: Product;
}

export interface Payment {
  id: number;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR';
  transactionReference: string;
  providerResponse?: any;
  orderId: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Order {
  id: number;
  totalAmount: number;
  status: 'PENDING_PAYMENT' | 'PAID' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  shippingAddress: string;
  phone?: string;
  userId: number;
  user?: User;
  items: OrderItem[];
  payments?: Payment[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedAttributes?: Record<string, string>;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}
