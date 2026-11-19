import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar.jsx';
import Field from '../../components/Field.jsx';
import AcademicFields from '../../components/AcademicFields.jsx';
import api, { getErrorMessage, applyServerErrors } from '../../utils/api.js';
import { registerSchema, splitCsv } from '../../utils/validationSchemas.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function StudentRegister() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    trigger,
    getValues,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: yupResolver(registerSchema),
    mode: 'onChange',
    defaultValues: { backlogs: 0 },
  });

  if (user) return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;

  // Availability checks on blur
  const checkAvailability = (field, endpoint, label) => async () => {
    const value = (getValues(field) || '').trim();
    if (!value || !(await trigger(field))) return;
    try {
      const { data } = await api.get(`/auth/${endpoint}`, { params: { [field]: value } });
      if (!data.data.available) setError(field, { type: 'server', message: `${label} already exists` });
    } catch { /* ignore - final check happens on submit */ }
  };

  const onSubmit = async (v) => {
    const payload = {
      name: v.name.trim(),
      prn: v.prn.trim(),
      email: v.email.trim(),
      password: v.password,
      phone: v.phone,
      address: v.address.trim(),
      percentage10: v.percentage10,
      percentage12: v.percentage12,
      diplomaPercentage: v.diplomaPercentage,
      sem6Percentage: v.sem6Percentage,
      backlogs: v.backlogs,
      skills: splitCsv(v.skills),
      certifications: splitCsv(v.certifications),
    };
    try {
      const { data } = await api.post('/auth/register', payload);
      login(data.data.token, data.data.user, 'student');
      toast.success('Registration successful!');
      navigate('/student/dashboard');
    } catch (err) {
      applyServerErrors(err, setError);
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <>
      <Navbar />
      <main className="mx-auto my-8 max-w-3xl px-4">
        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4" noValidate>
          <h1 className="text-2xl font-bold">Student Registration</h1>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="PRN" name="prn" register={register} errors={errors} required
              registerOptions={{ onBlur: checkAvailability('prn', 'check-prn', 'PRN') }} />
            <Field label="Email" name="email" type="email" register={register} errors={errors} required
              registerOptions={{ onBlur: checkAvailability('email', 'check-email', 'Email') }} />
            <Field label="Password" name="password" type="password" register={register} errors={errors} autoComplete="new-password" required />
            <Field label="Confirm password" name="confirmPassword" type="password" register={register} errors={errors} autoComplete="new-password" required />
          </div>
          <AcademicFields register={register} errors={errors} />
          <button className="btn-primary w-full" disabled={!isValid || isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Register'}
          </button>
          <p className="text-center text-sm text-slate-500">
            Already registered? <Link className="text-indigo-600 hover:underline" to="/student/login">Login</Link>
          </p>
        </form>
      </main>
    </>
  );
}
