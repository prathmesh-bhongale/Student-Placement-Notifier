const { Op } = require('sequelize');
const Student = require('../models/Student');
const Drive = require('../models/Drive');
const { checkEligibility } = require('../utils/matchingLogic');
const { sendDriveEmail } = require('../utils/emailService');
const { AppError, asyncHandler, clean, cleanRich } = require('../utils/helpers');

const normalizeDrive = (b) => ({
  companyName: clean(b.companyName),
  jobPosts: b.jobPosts.map((p) => ({ title: clean(p.title), vacancies: p.vacancies })),
  eligibilityCriteria: {
    minPercent10: b.eligibilityCriteria.minPercent10 ?? null,
    minPercent12: b.eligibilityCriteria.minPercent12 ?? null,
    minDiplomaPercent: b.eligibilityCriteria.minDiplomaPercent ?? null,
    minSem6Percent: b.eligibilityCriteria.minSem6Percent ?? null,
    maxBacklogs: b.eligibilityCriteria.maxBacklogs ?? 0,
    requiredSkills: (b.eligibilityCriteria.requiredSkills || []).map(clean),
  },
  jobDescription: cleanRich(b.jobDescription),
  location: clean(b.location),
  driveDate: b.driveDate,
  applyLink: b.applyLink || '',
  status: b.status,
  notifyStudents: !!b.notifyStudents,
});

const eligibleStudentsFor = async (drive) => {
  const students = await Student.findAll({ order: [['name', 'ASC']] });
  return students.filter((s) => checkEligibility(s, drive).eligible);
};

const notifyEligible = async (drive) => {
  const students = await eligibleStudentsFor(drive);
  const results = await Promise.allSettled(students.map((s) => sendDriveEmail(s, drive)));
  const sent = results.filter((r) => r.status === 'fulfilled').length;
  results.filter((r) => r.status === 'rejected').forEach((r) => console.error('Email failed:', r.reason?.message));
  drive.notifiedAt = new Date();
  await drive.save();
  return { eligible: students.length, sent };
};

exports.dashboard = asyncHandler(async (req, res) => {
  const [totalStudents, totalDrives, activeDrives, upcomingDrives, recentDrives, students] = await Promise.all([
    Student.count(),
    Drive.countDocuments(),
    Drive.countDocuments({ status: 'active' }),
    Drive.countDocuments({ status: 'upcoming' }),
    Drive.find().sort({ createdAt: -1 }).limit(5),
    Student.findAll({ attributes: ['appliedDrives'] }),
  ]);
  const totalApplications = students.reduce((sum, s) => sum + (s.appliedDrives || []).length, 0);
  res.json({
    status: 'success',
    data: { stats: { totalStudents, totalDrives, activeDrives, upcomingDrives, totalApplications }, recentDrives },
  });
});

exports.listDrives = asyncHandler(async (req, res) => {
  const drives = await Drive.find().sort({ driveDate: -1 });
  res.json({ status: 'success', data: { drives } });
});

exports.getDrive = asyncHandler(async (req, res) => {
  const drive = await Drive.findById(req.params.id);
  if (!drive) throw new AppError('Drive not found', 404);
  res.json({ status: 'success', data: { drive } });
});

exports.createDrive = asyncHandler(async (req, res) => {
  const data = normalizeDrive(req.body);
  const drive = await Drive.create({ ...data, createdBy: req.user._id });
  let notification = null;
  if (data.notifyStudents) {
    try {
      notification = await notifyEligible(drive);
    } catch (e) {
      console.error('Notification failed:', e.message);
    }
  }
  res.status(201).json({ status: 'success', message: 'Drive created', data: { drive, notification } });
});

exports.updateDrive = asyncHandler(async (req, res) => {
  const { notifyStudents, ...data } = normalizeDrive(req.body);
  const drive = await Drive.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
  if (!drive) throw new AppError('Drive not found', 404);
  res.json({ status: 'success', message: 'Drive updated', data: { drive } });
});

exports.deleteDrive = asyncHandler(async (req, res) => {
  const drive = await Drive.findByIdAndDelete(req.params.id);
  if (!drive) throw new AppError('Drive not found', 404);
  res.json({ status: 'success', message: 'Drive deleted' });
});

exports.notifyDrive = asyncHandler(async (req, res) => {
  const drive = await Drive.findById(req.params.id);
  if (!drive) throw new AppError('Drive not found', 404);
  const result = await notifyEligible(drive);
  res.json({
    status: 'success',
    message: `Notification sent to ${result.sent} of ${result.eligible} eligible students`,
    data: result,
  });
});

exports.eligibleStudents = asyncHandler(async (req, res) => {
  const drive = await Drive.findById(req.params.id);
  if (!drive) throw new AppError('Drive not found', 404);
  const students = await eligibleStudentsFor(drive);
  res.json({ status: 'success', data: { students, total: students.length } });
});

exports.listStudents = asyncHandler(async (req, res) => {
  const search = String(req.query.search || '').trim().slice(0, 100);
  const where = search
    ? { [Op.or]: [{ name: { [Op.like]: `%${search}%` } }, { email: { [Op.like]: `%${search}%` } }, { prn: { [Op.like]: `%${search}%` } }] }
    : {};
  const students = await Student.findAll({ where, order: [['createdAt', 'DESC']], limit: 500 });
  res.json({ status: 'success', data: { students } });
});
