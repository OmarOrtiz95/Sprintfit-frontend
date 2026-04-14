import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CartSidebar from './CartSidebar';

export default function Layout() {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
      <CartSidebar />
    </div>
  );
}
