import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import Navbar from '../../components/Navbar.jsx';
import Field from '../../components/Field.jsx';
import AcademicFields from '../../components/AcademicFields.jsx';
import Chatbot from '../../components/Chatbot.jsx';
import api, { getErrorMessage, applyServerErrors } from '../../utils/api.js';
import { profileSchema, splitCsv } from '../../utils/validationSchemas.js';
import { useAuth } from '../../context/AuthContext.jsx';

const toForm = (s) => ({
  name: s.name,
  phone: s.phone,
  address: s.address,
  percentage10: s.percentage10 ?? '',
  percentage12: s.percentage12 ?? '',
  diplomaPercentage: s.diplomaPercentage ?? '',
  sem6Percentage: s.sem6Percentage ?? '',
  backlogs: s.backlogs ?? 0,
  skills: (s.skills || []).join(', '),
  certifications: (s.certifications || []).join(', '),
});

export default function StudentProfile() {
  const { updateUser } = useAuth();
  const [student, setStudent] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({ resolver: yupResolver(profileSchema), mode: 'onChange' });

  useEffect(() => {
    api.get('/students/me')
      .then(({ data }) => {
        setStudent(data.data.student);
        reset(toForm(data.data.student));
      })
      .catch((e) => toast.error(getErrorMessage(e)));
  }, [reset]);

  const onSubmit = async (v) => {
    const payload = {
      name: v.name.trim(),
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
      const { data } = await api.put('/students/me', payload);
      setStudent(data.data.student);
      reset(toForm(data.data.student));
      updateUser({ name: data.data.student.name });
      toast.success('Profile updated');
    } catch (err) {
      applyServerErrors(err, setError);
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <>
      <Navbar />
      <main className="mx-auto my-8 max-w-3xl px-4">
        {!student ? (
          <p className="text-slate-500">Loading profile…</p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4" noValidate>
            <h1 className="text-2xl font-bold">My Profile</h1>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><span className="label">PRN</span><input className="input" value={student.prn} readOnly /></div>
              <div><span className="label">Email</span><input className="input" value={student.email} readOnly /></div>
            </div>
            <AcademicFields register={register} errors={errors} />
            <button className="btn-primary" disabled={!isDirty || isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        )}
      </main>
      <Chatbot />
    </>
  );
}
