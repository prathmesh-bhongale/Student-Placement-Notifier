import * as yup from 'yup';
import { format } from 'date-fns';

const emptyToNull = (value, original) => (original === '' || original === null || original === undefined ? null : value);

const optionalPercent = (label) =>
  yup.number().transform(emptyToNull).nullable()
    .typeError(`${label} must be a number`)
    .min(0, `${label} must be between 0 and 100`)
    .max(100, `${label} must be between 0 and 100`);

const requiredPercent = (label) =>
  yup.number().transform(emptyToNull).nullable()
    .typeError(`${label} must be a number`)
    .required(`${label} is required`)
    .min(0, `${label} must be between 0 and 100`)
    .max(100, `${label} must be between 0 and 100`);

const csvRequired = (label) =>
  yup.string().test('has-item', `At least one ${label} is required`, (v) => (v || '').split(',').some((s) => s.trim()));

const profileShape = {
  name: yup.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long')
    .matches(/^[A-Za-z ]+$/, 'Name must contain only letters and spaces').required('Name is required'),
  phone: yup.string().matches(/^\d{10}$/, 'Phone number must be exactly 10 digits').required('Phone number is required'),
  address: yup.string().trim().min(5, 'Address must be at least 5 characters').max(500, 'Address is too long').required('Address is required'),
  percentage10: requiredPercent('10th percentage'),
  percentage12: optionalPercent('12th percentage'),
  diplomaPercentage: optionalPercent('Diploma percentage'),
  sem6Percentage: optionalPercent('Semester 6 percentage'),
  backlogs: yup.number().transform(emptyToNull).nullable()
    .typeError('Backlogs must be a number')
    .required('Backlogs is required')
    .integer('Backlogs must be a whole number')
    .min(0, 'Backlogs cannot be negative'),
  skills: csvRequired('skill'),
  certifications: yup.string(),
};

export const profileSchema = yup.object(profileShape);

export const registerSchema = yup.object({
  ...profileShape,
  prn: yup.string().trim().min(6, 'PRN must be at least 6 characters').max(20, 'PRN must be at most 20 characters')
    .matches(/^[A-Za-z0-9]+$/, 'PRN must be alphanumeric').required('PRN is required'),
  email: yup.string().trim().email('Please provide a valid email address').required('Email is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Password needs a lowercase letter')
    .matches(/[A-Z]/, 'Password needs an uppercase letter')
    .matches(/\d/, 'Password needs a number')
    .required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Please confirm your password'),
});

export const loginSchema = yup.object({
  email: yup.string().trim().email('Please provide a valid email address').required('Email is required'),
  password: yup.string().required('Password is required'),
});

export const driveSchema = yup.object({
  companyName: yup.string().trim().min(2, 'Company name must be at least 2 characters').max(150).required('Company name is required'),
  location: yup.string().trim().required('Location is required'),
  driveDate: yup.string().required('Drive date is required')
    .test('future', 'Drive date must be today or in the future', (v) => !v || v >= format(new Date(), 'yyyy-MM-dd')),
  applyLink: yup.string().trim().test('url', 'Apply link must be a valid URL', (v) => {
    if (!v) return true;
    try { const u = new URL(v); return u.protocol === 'http:' || u.protocol === 'https:'; } catch { return false; }
  }),
  status: yup.string().oneOf(['active', 'closed', 'upcoming']).required(),
  jobDescription: yup.string().trim().min(10, 'Job description must be at least 10 characters').required('Job description is required'),
  jobPosts: yup.array().of(
    yup.object({
      title: yup.string().trim().required('Job title is required'),
      vacancies: yup.number().transform(emptyToNull).nullable()
        .typeError('Vacancies must be a number').required('Vacancies is required')
        .integer('Vacancies must be a whole number').min(1, 'Vacancies must be at least 1'),
    })
  ).min(1, 'At least one job post is required'),
  minPercent10: optionalPercent('Minimum 10th percentage'),
  minPercent12: optionalPercent('Minimum 12th percentage'),
  minDiplomaPercent: optionalPercent('Minimum diploma percentage'),
  minSem6Percent: optionalPercent('Minimum semester 6 percentage'),
  maxBacklogs: yup.number().transform(emptyToNull).nullable()
    .typeError('Maximum backlogs must be a number').integer('Must be a whole number').min(0, 'Maximum backlogs cannot be negative'),
  requiredSkills: yup.string(),
  notifyStudents: yup.boolean(),
});

export const driveEditSchema = driveSchema.shape({
  driveDate: yup.string().required('Drive date is required'),
});

export const splitCsv = (s) => (s || '').split(',').map((x) => x.trim()).filter(Boolean);
