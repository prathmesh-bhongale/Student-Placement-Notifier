const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const Student = sequelize.define(
  'Student',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    prn: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: false },
    percentage10: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
    percentage12: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    diplomaPercentage: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    sem6Percentage: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    backlogs: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    address: { type: DataTypes.TEXT, allowNull: false },
    phone: { type: DataTypes.STRING(10), allowNull: false },
    skills: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    certifications: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    savedDrives: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    appliedDrives: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
  },
  { tableName: 'students', timestamps: true }
);

const hashPassword = async (student) => {
  if (student.changed('password')) {
    student.password = await bcrypt.hash(student.password, 12);
  }
};
Student.beforeCreate(hashPassword);
Student.beforeUpdate(hashPassword);

Student.prototype.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

// Never leak the password hash; convert DECIMAL strings to numbers
Student.prototype.toJSON = function () {
  const v = { ...this.get() };
  delete v.password;
  ['percentage10', 'percentage12', 'diplomaPercentage', 'sem6Percentage'].forEach((k) => {
    v[k] = v[k] === null || v[k] === undefined ? null : Number(v[k]);
  });
  return v;
};

module.exports = Student;
