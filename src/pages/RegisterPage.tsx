import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerSchema, type RegisterFormData } from '../schemas/auth.schema';
import toast from 'react-hot-toast';
import './AuthPage.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<Partial<RegisterFormData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof RegisterFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = registerSchema.safeParse(form);
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
      await register({
        email: result.data.email,
        password: result.data.password,
        fullName: result.data.fullName,
        phone: result.data.phone,
      });
      toast.success('¡Cuenta creada! Por favor revisa tu correo para verificar (ver consola del backend en desarrollo).', { duration: 6000 });
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Crear cuenta</h1>
        <div className="auth-field">
          <input
            placeholder="Nombre completo"
            value={form.fullName || ''}
            onChange={e => handleChange('fullName', e.target.value)}
            className={errors.fullName ? 'error' : ''}
          />
          {errors.fullName && <span className="auth-error">{errors.fullName}</span>}
        </div>
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
            type="tel"
            placeholder="Teléfono (opcional)"
            value={form.phone || ''}
            onChange={e => handleChange('phone', e.target.value)}
          />
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
        <div className="auth-field">
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={form.confirmPassword || ''}
            onChange={e => handleChange('confirmPassword', e.target.value)}
            className={errors.confirmPassword ? 'error' : ''}
          />
          {errors.confirmPassword && <span className="auth-error">{errors.confirmPassword}</span>}
        </div>
        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? 'Creando cuenta...' : 'Registrarse'}
        </button>
        <p className="auth-toggle">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </form>
    </div>
  );
}
