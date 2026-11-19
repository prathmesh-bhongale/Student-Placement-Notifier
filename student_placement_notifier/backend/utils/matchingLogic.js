/**
 * Checks if a student is eligible for a drive.
 * Returns { eligible: boolean, reasons: string[] }
 */
const num = (v) => (v === null || v === undefined || v === '' ? null : Number(v));

const checkEligibility = (student, drive) => {
  const raw = drive.eligibilityCriteria || {};
  const c = typeof raw.toObject === 'function' ? raw.toObject() : raw;
  const reasons = [];

  const checks = [
    ['minPercent10', 'percentage10', '10th percentage'],
    ['minPercent12', 'percentage12', '12th percentage'],
    ['minDiplomaPercent', 'diplomaPercentage', 'Diploma percentage'],
    ['minSem6Percent', 'sem6Percentage', 'Semester 6 percentage'],
  ];

  checks.forEach(([criteriaKey, studentKey, label]) => {
    const required = num(c[criteriaKey]);
    if (required === null) return;
    const actual = num(student[studentKey]);
    if (actual === null) {
      reasons.push(`${label} not provided (minimum ${required}% required)`);
    } else if (actual < required) {
      reasons.push(`${label} is ${actual}% (minimum ${required}% required)`);
    }
  });

  const maxBacklogs = num(c.maxBacklogs);
  if (maxBacklogs !== null && Number(student.backlogs) > maxBacklogs) {
    reasons.push(`Backlogs: ${student.backlogs} (maximum ${maxBacklogs} allowed)`);
  }

  const requiredSkills = (c.requiredSkills || []).filter((s) => String(s).trim());
  if (requiredSkills.length) {
    const have = new Set((student.skills || []).map((s) => String(s).trim().toLowerCase()));
    const missing = requiredSkills.filter((s) => !have.has(String(s).trim().toLowerCase()));
    if (missing.length) reasons.push(`Missing required skills: ${missing.join(', ')}`);
  }

  return { eligible: reasons.length === 0, reasons };
};

module.exports = { checkEligibility };
