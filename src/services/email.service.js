/**
 * Email service — powered by Brevo (formerly Sendinblue) HTTP API.
 * Uses Node's built-in fetch (Node 18+) so no extra dependencies needed.
 * Works on any hosting platform including Render (port 443, not SMTP).
 */

const BREVO_API = 'https://api.brevo.com/v3/smtp/email';

const send = async ({ to, subject, html }) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.SMTP_USER;
  const senderName = process.env.BREVO_SENDER_NAME || 'NoticeHub';

  if (!apiKey) {
    console.error('[email] BREVO_API_KEY is not set — cannot send email');
    throw new Error('Email service not configured');
  }

  const body = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  };

  const res = await fetch(BREVO_API, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const msg = errBody?.message || `HTTP ${res.status}`;
    console.error('[email] Brevo error sending "%s" to %s — %s', subject, to, msg);
    throw new Error(msg);
  }

  console.log('[email] Sent "%s" to %s', subject, to);
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

const sendContactForm = async ({ name, email, program, level, messageType, subject, message }) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.error('[email] ADMIN_EMAIL is not set — cannot forward contact form');
    throw new Error('Admin email not configured');
  }
  await send({
    to: adminEmail,
    subject: `[NoticeHub Contact] ${subject}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <table cellpadding="6" style="border-collapse:collapse">
        <tr><td><strong>Name</strong></td><td>${name}</td></tr>
        <tr><td><strong>Email</strong></td><td>${email}</td></tr>
        <tr><td><strong>Program</strong></td><td>${program || '—'}</td></tr>
        <tr><td><strong>Level</strong></td><td>${level || '—'}</td></tr>
        <tr><td><strong>Type</strong></td><td>${messageType || '—'}</td></tr>
        <tr><td><strong>Subject</strong></td><td>${subject}</td></tr>
      </table>
      <hr />
      <p style="white-space:pre-line">${message}</p>
    `,
  });
};

module.exports = {
  sendOtp,
  sendPasswordReset,
  sendRepCredentials,
  sendLecturerCredentials,
  sendContactForm,
};
