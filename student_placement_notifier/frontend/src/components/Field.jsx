const getError = (errors, name) => name.split('.').reduce((o, k) => (o ? o[k] : undefined), errors);

// Generic labelled form field wired to react-hook-form
export default function Field({ label, name, register, errors, as = 'input', type = 'text', required, hint, registerOptions, children, ...rest }) {
  const err = getError(errors, name);
  const Tag = as;
  const extra = as === 'input' ? { type, ...(type === 'number' ? { step: 'any' } : {}) } : {};
  return (
    <div>
      {label && (
        <label className="label" htmlFor={name}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <Tag id={name} className={`input ${err ? 'input-error' : ''}`} {...extra} {...register(name, registerOptions)} {...rest}>
        {children}
      </Tag>
      {hint && !err && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {err && <p className="error-message">{err.message}</p>}
    </div>
  );
}
