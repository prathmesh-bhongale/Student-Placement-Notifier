const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) return null;
  if (!transporter) {
    const port = Number(process.env.EMAIL_PORT) || 587;
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port,
      secure: port === 465,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
    });
  }
  return transporter;
};

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const sendEmail = async ({ to, subject, html }) => {
  const t = getTransporter();
  if (!t) {
    console.log(`📧 [console mode] To: ${to} | Subject: ${subject}`);
    return { logged: true };
  }
  return t.sendMail({
    from: process.env.EMAIL_FROM || 'Placement Cell <noreply@placement.com>',
    to,
    subject,
    html,
  });
};

const sendDriveEmail = (student, drive) => {
  const date = new Date(drive.driveDate).toDateString();
  const posts = drive.jobPosts.map((p) => `<li>${esc(p.title)} (${p.vacancies} vacancies)</li>`).join('');
  const link = drive.applyLink ? `<p><a href="${esc(drive.applyLink)}">Apply here</a></p>` : '';
  return sendEmail({
    to: student.email,
    subject: `New placement drive: ${drive.companyName}`,
    html: `<div style="font-family:Arial,sans-serif">
      <h2>Hello ${esc(student.name)},</h2>
      <p>You are eligible for a new placement drive.</p>
      <h3>${esc(drive.companyName)}</h3>
      <p><b>Location:</b> ${esc(drive.location)}<br/><b>Date:</b> ${esc(date)}</p>
      <ul>${posts}</ul>${link}
      <p>Log in to the Placement Portal to save or apply.</p></div>`,
  });
};

module.exports = { sendEmail, sendDriveEmail };
