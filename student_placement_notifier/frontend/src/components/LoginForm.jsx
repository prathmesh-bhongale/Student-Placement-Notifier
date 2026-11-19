import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LogIn } from 'lucide-react';
import Field from './Field.jsx';
import Navbar from './Navbar.jsx';
import api, { getErrorMessage } from '../utils/api.js';
import { loginSchema } from '../utils/validationSchemas.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginForm({ role }) {
  const isAdmin = role === 'admin';
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(loginSchema), mode: 'onTouched' });

  if (user) return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;

  const onSubmit = async (values) => {
    try {
      const { data } = await api.post(isAdmin ? '/auth/admin/login' : '/auth/login', values);
      login(data.data.token, data.data.user, role);
      toast.success('Welcome back!');
      navigate(isAdmin ? '/admin/dashboard' : '/student/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <>
      <Navbar />
      <main className="mx-auto mt-12 max-w-md px-4">
        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4" noValidate>
          <h1 className="text-2xl font-bold">{isAdmin ? 'Admin / TPO Login' : 'Student Login'}</h1>
          <Field label="Email" name="email" type="email" register={register} errors={errors} autoComplete="email" required />
          <Field label="Password" name="password" type="password" register={register} errors={errors} autoComplete="current-password" required />
          <button className="btn-primary w-full" disabled={isSubmitting}>
            <LogIn className="h-4 w-4" /> {isSubmitting ? 'Signing in…' : 'Login'}
          </button>
          <p className="text-center text-sm text-slate-500">
            {isAdmin ? (
              <Link className="text-indigo-600 hover:underline" to="/student/login">Student login</Link>
            ) : (
              <>
                New student? <Link className="text-indigo-600 hover:underline" to="/student/register">Register</Link> ·{' '}
                <Link className="text-indigo-600 hover:underline" to="/admin/login">Admin login</Link>
              </>
            )}
          </p>
        </form>
      </main>
    </>
  );
}
