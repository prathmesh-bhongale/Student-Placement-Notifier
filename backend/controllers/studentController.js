const Student = require('../models/Student');
const Drive = require('../models/Drive');
const { checkEligibility } = require('../utils/matchingLogic');
const { AppError, asyncHandler, clean } = require('../utils/helpers');

const decorate = (student, drive) => {
  const { eligible, reasons } = checkEligibility(student, drive);
  const id = drive._id.toString();
  return {
    ...drive.toObject(),
    eligible,
    reasons,
    isSaved: (student.savedDrives || []).includes(id),
    isApplied: (student.appliedDrives || []).includes(id),
  };
};

exports.getMe = asyncHandler(async (req, res) => {
  res.json({ status: 'success', data: { student: req.user } });
});

exports.updateMe = asyncHandler(async (req, res) => {
  const b = req.body;
  await req.user.update({
    name: clean(b.name),
    phone: b.phone,
    address: clean(b.address),
    percentage10: b.percentage10,
    percentage12: b.percentage12,
    diplomaPercentage: b.diplomaPercentage,
    sem6Percentage: b.sem6Percentage,
    backlogs: b.backlogs,
    skills: b.skills.map(clean),
    certifications: (b.certifications || []).map(clean),
  });
  res.json({ status: 'success', message: 'Profile updated', data: { student: req.user } });
});

exports.getMatches = asyncHandler(async (req, res) => {
  const drives = await Drive.find().sort({ driveDate: -1 });
  res.json({ status: 'success', data: { drives: drives.map((d) => decorate(req.user, d)) } });
});

const listByIds = async (student, ids) => {
  const drives = await Drive.find({ _id: { $in: ids.filter((i) => /^[a-f\d]{24}$/i.test(i)) } }).sort({ driveDate: -1 });
  return drives.map((d) => decorate(student, d));
};

exports.getSaved = asyncHandler(async (req, res) => {
  res.json({ status: 'success', data: { drives: await listByIds(req.user, req.user.savedDrives || []) } });
});

exports.getApplied = asyncHandler(async (req, res) => {
  res.json({ status: 'success', data: { drives: await listByIds(req.user, req.user.appliedDrives || []) } });
});

exports.saveDrive = asyncHandler(async (req, res) => {
  const drive = await Drive.findById(req.params.id);
  if (!drive) throw new AppError('Drive not found', 404);
  const saved = req.user.savedDrives || [];
  if (!saved.includes(req.params.id)) await req.user.update({ savedDrives: [...saved, req.params.id] });
  res.json({ status: 'success', message: 'Drive saved' });
});

exports.unsaveDrive = asyncHandler(async (req, res) => {
  const saved = (req.user.savedDrives || []).filter((id) => id !== req.params.id);
  await req.user.update({ savedDrives: saved });
  res.json({ status: 'success', message: 'Drive removed from saved' });
});

exports.applyDrive = asyncHandler(async (req, res) => {
  const drive = await Drive.findById(req.params.id);
  if (!drive) throw new AppError('Drive not found', 404);
  if (drive.status === 'closed') throw new AppError('Applications for this drive are closed', 400);

  const applied = req.user.appliedDrives || [];
  if (applied.includes(req.params.id)) throw new AppError('You have already applied to this drive', 400);

  const { eligible, reasons } = checkEligibility(req.user, drive);
  if (!eligible) throw new AppError('You are not eligible for this drive', 403, reasons.map((m) => ({ field: 'eligibility', message: m })));

  await req.user.update({ appliedDrives: [...applied, req.params.id] });
  res.json({ status: 'success', message: 'Applied successfully' });
});
