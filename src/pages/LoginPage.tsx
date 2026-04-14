import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginSchema, type LoginFormData } from '../schemas/auth.schema';
import toast from 'react-hot-toast';
import './AuthPage.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<Partial<LoginFormData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof LoginFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = loginSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      await login(result.data.email, result.data.password);
      toast.success('¡Bienvenido!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Iniciar sesión</h1>
        <div className="auth-field">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={form.email || ''}
            onChange={e => handleChange('email', e.target.value)}
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="auth-error">{errors.email}</span>}
        </div>
        <div className="auth-field">
          <input
            type="password"
            placeholder="Contraseña"
            value={form.password || ''}
            onChange={e => handleChange('password', e.target.value)}
            className={errors.password ? 'error' : ''}
          />
          {errors.password && <span className="auth-error">{errors.password}</span>}
        </div>
        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
        <p className="auth-toggle">
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </p>
      </form>
    </div>
  );
}
