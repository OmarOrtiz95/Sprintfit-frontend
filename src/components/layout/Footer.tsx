import { Link } from 'react-router-dom';
import { FiYoutube, FiInstagram } from 'react-icons/fi';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__subscribe">
        <p>ÚNETE A LA SUSCRIPCIÓN DE DESCUENTO EN TU PRÓXIMA COMPRA</p>
        <Link to="/register" className="footer__subscribe-btn">SUSCRIBIRME</Link>
      </div>
      <div className="footer__content">
        <div className="footer__col">
          <h4>SÍGUENOS EN NUESTRAS REDES SOCIALES</h4>
          <div className="footer__socials">
            <a href="#" aria-label="YouTube"><FiYoutube size={24} /></a>
            <a href="#" aria-label="Instagram"><FiInstagram size={24} /></a>
          </div>
        </div>
        <div className="footer__col">
          <h4>PRODUCTOS</h4>
          <Link to="/category/calzado">Calzado</Link>
          <Link to="/category/ropa">Ropa</Link>
          <Link to="/category/accesorios">Accesorios</Link>
        </div>
        <div className="footer__col">
          <h4>PREGUNTAS</h4>
          <a href="#">Mesa de ayuda</a>
          <a href="#">Preguntas frecuentes</a>
          <a href="#">TyC</a>
        </div>
        <div className="footer__col">
          <h4>ACERCA DE SPRINTFIT</h4>
          <a href="#">Sobre nosotros</a>
        </div>
      </div>
      <div className="footer__bottom">
        <p>© 2026 SprintFit. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
