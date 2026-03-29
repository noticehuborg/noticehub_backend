const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const DEFAULT_FROM = 'NoticeHub <onboarding@resend.dev>';

const send = async ({ to, subject, html }) => {
  const from = process.env.EMAIL_FROM || DEFAULT_FROM;
  try {
    const { data, error } = await resend.emails.send({ from, to, subject, html });
    if (error) {
      console.error('[email] Resend error sending "%s" to %s —', subject, to, error);
      throw new Error(error.message || 'Resend API error');
    }
    console.log('[email] Sent "%s" to %s (id: %s)', subject, to, data?.id);
  } catch (err) {
    console.error('[email] FAILED to send "%s" to %s — %s', subject, to, err.message);
    throw err;
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
