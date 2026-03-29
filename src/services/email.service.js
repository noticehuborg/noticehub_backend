const nodemailer = require('nodemailer');
const dns = require('dns');

// Force Node.js to use Google's public DNS instead of the ISP's DNS,
// which may block SMTP-related hostname lookups.
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const createTransporter = () => {
  const port = parseInt(process.env.SMTP_PORT, 10) || 465;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    // port 465 = implicit SSL; port 587 = STARTTLS (secure: false + requireTLS: true)
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      // Strip spaces — Gmail displays app passwords with spaces but SMTP needs the raw 16 chars
      pass: (process.env.SMTP_PASS || '').replace(/\s/g, ''),
    },
    ...(port === 587 && { requireTLS: true }),
    pool: false,
    connectionTimeout: 10000,
  });
};

const DEFAULT_FROM = '"NoticeHub" <noreply@noticehub.app>';

const send = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || DEFAULT_FROM,
      to,
      subject,
      html,
    });
    console.log('[email] Sent "%s" to %s', subject, to);
  } catch (err) {
    console.error('[email] FAILED to send "%s" to %s — %s', subject, to, err.message);
    console.error('[email] SMTP config: host=%s port=%s user=%s passLength=%d',
      process.env.SMTP_HOST || 'NOT SET',
      process.env.SMTP_PORT || 'NOT SET',
      process.env.SMTP_USER || 'NOT SET',
      (process.env.SMTP_PASS || '').replace(/\s/g, '').length
    );
    throw err;
  } finally {
    transporter.close();
  }
};

const sendOtp = async (email, otp) => {
  await send({
    to: email,
    subject: 'Verify your NoticeHub account',
    html: `
      <h2>Welcome to NoticeHub</h2>
      <p>Your verification OTP is:</p>
      <h1 style="letter-spacing:6px">${otp}</h1>
      <p>This code expires in 10 minutes.</p>
    `,
  });
};

const sendPasswordReset = async (email, resetUrl) => {
  await send({
    to: email,
    subject: 'Reset your NoticeHub password',
    html: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password. It expires in 1 hour.</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>If you did not request this, ignore this email.</p>
    `,
  });
};

const sendRepCredentials = async (email, fullName, tempPassword) => {
  await send({
    to: email,
    subject: 'Your NoticeHub Course Rep Account',
    html: `
      <h2>Hello ${fullName},</h2>
      <p>An admin has created a Course Rep account for you on NoticeHub.</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Temporary Password:</strong> ${tempPassword}</p>
      <p>Please log in and change your password immediately.</p>
    `,
  });
};

const sendLecturerCredentials = async (email, fullName, tempPassword) => {
  await send({
    to: email,
    subject: 'Your NoticeHub Lecturer Account',
    html: `
      <h2>Hello ${fullName},</h2>
      <p>An admin has created a Lecturer account for you on NoticeHub.</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Temporary Password:</strong> ${tempPassword}</p>
      <p>Please log in and change your password immediately.</p>
    `,
  });
};

module.exports = { sendOtp, sendPasswordReset, sendRepCredentials, sendLecturerCredentials };
