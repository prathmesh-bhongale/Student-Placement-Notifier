import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Plus, Trash2 } from 'lucide-react';
import Field from './Field.jsx';
import { driveSchema, driveEditSchema, splitCsv } from '../utils/validationSchemas.js';
import { applyServerErrors } from '../utils/api.js';

const blank = {
  companyName: '', location: '', driveDate: '', applyLink: '', status: 'upcoming', jobDescription: '',
  jobPosts: [{ title: '', vacancies: 1 }],
  minPercent10: '', minPercent12: '', minDiplomaPercent: '', minSem6Percent: '', maxBacklogs: 0, requiredSkills: '',
  notifyStudents: false,
};

export const driveToForm = (d) => ({
  companyName: d.companyName,
  location: d.location,
  driveDate: String(d.driveDate).slice(0, 10),
  applyLink: d.applyLink || '',
  status: d.status,
  jobDescription: d.jobDescription,
  jobPosts: d.jobPosts.map((p) => ({ title: p.title, vacancies: p.vacancies })),
  minPercent10: d.eligibilityCriteria?.minPercent10 ?? '',
  minPercent12: d.eligibilityCriteria?.minPercent12 ?? '',
  minDiplomaPercent: d.eligibilityCriteria?.minDiplomaPercent ?? '',
  minSem6Percent: d.eligibilityCriteria?.minSem6Percent ?? '',
  maxBacklogs: d.eligibilityCriteria?.maxBacklogs ?? 0,
  requiredSkills: (d.eligibilityCriteria?.requiredSkills || []).join(', '),
  notifyStudents: false,
});

export default function DriveForm({ drive, onSubmit, onCancel }) {
  const isEdit = !!drive;
  const {
    register, control, handleSubmit, setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: yupResolver(isEdit ? driveEditSchema : driveSchema),
    mode: 'onChange',
    defaultValues: isEdit ? driveToForm(drive) : blank,
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'jobPosts' });

  const submit = async (v) => {
    const payload = {
      companyName: v.companyName.trim(),
      location: v.location.trim(),
      driveDate: v.driveDate,
      applyLink: (v.applyLink || '').trim(),
      status: v.status,
      jobDescription: v.jobDescription.trim(),
      jobPosts: v.jobPosts.map((p) => ({ title: p.title.trim(), vacancies: p.vacancies })),
      eligibilityCriteria: {
        minPercent10: v.minPercent10,
        minPercent12: v.minPercent12,
        minDiplomaPercent: v.minDiplomaPercent,
        minSem6Percent: v.minSem6Percent,
        maxBacklogs: v.maxBacklogs ?? 0,
        requiredSkills: splitCsv(v.requiredSkills),
      },
      notifyStudents: !isEdit && v.notifyStudents,
    };
    try {
      await onSubmit(payload);
    } catch (err) {
      applyServerErrors(err, setError);
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Company" name="companyName" register={register} errors={errors} required />
        <Field label="Location" name="location" register={register} errors={errors} required />
        <Field label="Drive date" name="driveDate" type="date" register={register} errors={errors} required />
        <Field label="Status" name="status" as="select" register={register} errors={errors}>
          <option value="upcoming">Upcoming</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
        </Field>
      </div>
      <Field label="Apply link" name="applyLink" register={register} errors={errors} placeholder="https://…" />
      <Field label="Job description" name="jobDescription" as="textarea" rows={3} register={register} errors={errors} required />

      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="label !mb-0">Job posts <span className="text-red-500">*</span></span>
          <button type="button" className="btn-secondary !py-1" onClick={() => append({ title: '', vacancies: 1 })}>
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
        <div className="space-y-2">
          {fields.map((f, i) => (
            <div key={f.id} className="grid grid-cols-[1fr_110px_auto] items-start gap-2">
              <Field name={`jobPosts.${i}.title`} placeholder="Job title" register={register} errors={errors} />
              <Field name={`jobPosts.${i}.vacancies`} type="number" placeholder="Vacancies" register={register} errors={errors} />
              <button type="button" className="btn-secondary !px-2 mt-0.5" disabled={fields.length === 1} onClick={() => remove(i)} aria-label="Remove job post">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        {errors.jobPosts?.message && <p className="error-message">{errors.jobPosts.message}</p>}
      </div>

      <fieldset className="rounded-lg border border-slate-200 p-4">
        <legend className="px-2 text-sm font-medium">Eligibility criteria</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Min 10th %" name="minPercent10" type="number" register={register} errors={errors} />
          <Field label="Min 12th %" name="minPercent12" type="number" register={register} errors={errors} />
          <Field label="Min Diploma %" name="minDiplomaPercent" type="number" register={register} errors={errors} />
          <Field label="Min Sem 6 %" name="minSem6Percent" type="number" register={register} errors={errors} />
          <Field label="Max backlogs" name="maxBacklogs" type="number" register={register} errors={errors} />
          <Field label="Required skills" name="requiredSkills" register={register} errors={errors} hint="Comma separated" />
        </div>
      </fieldset>

      {!isEdit && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4" {...register('notifyStudents')} /> Notify eligible students immediately
        </label>
      )}

      <div className="flex justify-end gap-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn-primary" disabled={!isValid || isSubmitting}>
          {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create drive'}
        </button>
      </div>
    </form>
  );
}
