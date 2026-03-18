const nodemailer = require('nodemailer');

const createTransporter = () => nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  pool: false,
  connectionTimeout: 10000,
});

const send = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
  transporter.close();
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

module.exports = { sendOtp, sendPasswordReset, sendRepCredentials };
