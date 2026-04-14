import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';
import './AuthPage.css';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    authService.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <h1>Verificar Correo</h1>
        {status === 'loading' && <p>Verificando tu correo...</p>}
        {status === 'success' && (
          <>
            <p>Tu correo ha sido verificado exitosamente.</p>
            <Link to="/login" className="auth-submit" style={{ display: 'inline-block', marginTop: '1rem', textDecoration: 'none' }}>
              Ir a Iniciar Sesión
            </Link>
          </>
        )}
        {status === 'error' && (
          <p className="auth-error" style={{ position: 'static' }}>
            El enlace es inválido o ha expirado.
          </p>
        )}
      </div>
    </div>
  );
}
