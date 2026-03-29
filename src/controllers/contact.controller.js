const { sendContactForm } = require('../services/email.service');
const { success, error } = require('../utils/response');

// POST /contact
exports.submitContact = async (req, res, next) => {
  try {
    const { name, email, program, level, messageType, subject, message } = req.body;

    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return error(res, 'Name, email, subject, and message are required.', 400);
    }

    await sendContactForm({ name, email, program, level, messageType, subject, message });

    return success(res, null, 'Your message has been sent. We will get back to you soon.');
  } catch (err) {
    next(err);
  }
};
