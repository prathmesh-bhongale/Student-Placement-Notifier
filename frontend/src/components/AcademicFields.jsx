import Field from './Field.jsx';

// Shared fields between registration and profile
export default function AcademicFields({ register, errors }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" name="name" register={register} errors={errors} required />
        <Field label="Phone" name="phone" register={register} errors={errors} maxLength={10} inputMode="numeric" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="10th %" name="percentage10" type="number" register={register} errors={errors} required />
        <Field label="12th %" name="percentage12" type="number" register={register} errors={errors} />
        <Field label="Diploma %" name="diplomaPercentage" type="number" register={register} errors={errors} />
        <Field label="Semester 6 %" name="sem6Percentage" type="number" register={register} errors={errors} />
        <Field label="Backlogs" name="backlogs" type="number" register={register} errors={errors} required />
      </div>
      <Field label="Address" name="address" as="textarea" rows={2} register={register} errors={errors} required />
      <Field label="Skills" name="skills" register={register} errors={errors} hint="Comma separated, e.g. JavaScript, React, Node.js" required />
      <Field label="Certifications" name="certifications" register={register} errors={errors} hint="Comma separated (optional)" />
    </>
  );
}
