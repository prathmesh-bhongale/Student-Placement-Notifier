const mongoose = require('mongoose');

const driveSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true, minlength: 2, maxlength: 150 },
    jobPosts: {
      type: [
        {
          _id: false,
          title: { type: String, required: true, trim: true },
          vacancies: { type: Number, required: true, min: 1 },
        },
      ],
      validate: (v) => Array.isArray(v) && v.length > 0,
    },
    eligibilityCriteria: {
      minPercent10: { type: Number, min: 0, max: 100, default: null },
      minPercent12: { type: Number, min: 0, max: 100, default: null },
      minDiplomaPercent: { type: Number, min: 0, max: 100, default: null },
      minSem6Percent: { type: Number, min: 0, max: 100, default: null },
      maxBacklogs: { type: Number, min: 0, default: 0 },
      requiredSkills: { type: [String], default: [] },
    },
    jobDescription: { type: String, required: true, minlength: 10 },
    location: { type: String, required: true, trim: true },
    driveDate: { type: Date, required: true },
    applyLink: { type: String, default: '' },
    notifyStudents: { type: Boolean, default: false },
    notifiedAt: { type: Date, default: null },
    status: { type: String, enum: ['active', 'closed', 'upcoming'], default: 'upcoming' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true }
);

driveSchema.index({ driveDate: -1 });
driveSchema.index({ status: 1 });

module.exports = mongoose.model('Drive', driveSchema);
