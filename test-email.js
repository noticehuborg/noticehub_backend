/**
 * Quick SMTP diagnostic script.
 * Run from the backend root: node test-email.js
 */

require('dotenv').config();
const nodemailer = require('nodemailer');
const dns = require('dns');

// Force public DNS — bypasses ISP DNS blocks on SMTP hostnames
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env;
const port = parseInt(SMTP_PORT, 10) || 465;
const pass = (SMTP_PASS || '').replace(/\s/g, '');

console.log('\n─── SMTP Config ───────────────────────────────');
console.log('HOST :', SMTP_HOST);
console.log('PORT :', port);
console.log('USER :', SMTP_USER);
console.log('PASS :', pass ? `${'*'.repeat(pass.length)} (${pass.length} chars)` : 'NOT SET');
console.log('FROM :', EMAIL_FROM);
console.log('───────────────────────────────────────────────\n');

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port,
  secure: port === 465,
  auth: { user: SMTP_USER, pass },
  ...(port === 587 && { requireTLS: true }),
  connectionTimeout: 10000,
});

(async () => {
  console.log('1. Verifying SMTP connection (using public DNS)...');
  try {
    await transporter.verify();
    console.log('   ✓ Connection OK\n');
  } catch (err) {
    console.error('   ✗ FAILED:', err.message);
    console.error('   Code:', err.code);
    transporter.close();
    process.exit(1);
  }

  console.log('2. Sending test email to', SMTP_USER, '...');
  try {
    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to: SMTP_USER,
      subject: 'NoticeHub — SMTP Test ✓',
      html: '<h2>SMTP is working!</h2><p>Your email configuration is correct.</p>',
    });
    console.log('   ✓ Sent! Message ID:', info.messageId);
    console.log('\n✅ All good. Check inbox at', SMTP_USER);
  } catch (err) {
    console.error('   ✗ sendMail FAILED:', err.message);
  } finally {
    transporter.close();
  }
})();
