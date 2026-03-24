const cron = require('node-cron');
const { Op } = require('sequelize');
const { Announcement } = require('../models');
const notificationService = require('../services/notification.service');

/**
 * Deadline Warning Job
 * Runs daily at 08:00.
 * Finds published announcements whose deadline falls within the next 3 days
 * and fans out a deadline_warning notification to all eligible students.
 */
const deadlineWarningJob = cron.schedule('0 8 * * *', async () => {
  console.log('[deadlineWarningJob] Running at', new Date().toISOString());

  try {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const announcements = await Announcement.findAll({
      where: {
        deadline: {
          [Op.between]: [now, threeDaysFromNow],
        },
      },
    });

    console.log(`[deadlineWarningJob] Found ${announcements.length} announcements with upcoming deadlines`);

    for (const announcement of announcements) {
      await notificationService.fanOut(announcement, 'deadline_warning');
    }

    console.log('[deadlineWarningJob] Completed successfully');
  } catch (err) {
    console.error('[deadlineWarningJob] Error:', err.message);
  }
}, {
  scheduled: false,
});

module.exports = deadlineWarningJob;
