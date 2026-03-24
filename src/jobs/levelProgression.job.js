const cron = require('node-cron');
const { Op } = require('sequelize');
const { User, LevelCorrectionRequest, Notification } = require('../models');
const { v4: uuidv4 } = require('uuid');

const LEVEL_ORDER = ['100', '200', '300', '400'];

/**
 * Level Progression Job
 * Runs at midnight on 1st January and 1st August each year.
 * Finds students whose level_updated_at is >= 12 months ago,
 * who have no pending level correction request, and who are below Level 400.
 * Increments their level by one step and resets level_updated_at.
 */
const levelProgressionJob = cron.schedule('0 0 1 1,8 *', async () => {
  console.log('[levelProgressionJob] Running at', new Date().toISOString());

  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    // Find all students below 400 whose level_updated_at is old enough
    const students = await User.findAll({
      where: {
        role: 'student',
        is_active: true,
        level: { [Op.in]: ['100', '200', '300'] },
        [Op.or]: [
          { level_updated_at: { [Op.lte]: twelveMonthsAgo } },
          { level_updated_at: null },
        ],
      },
    });

    console.log(`[levelProgressionJob] Found ${students.length} eligible students`);

    for (const student of students) {
      try {
        // Skip if student has a pending level correction request
        const pendingRequest = await LevelCorrectionRequest.findOne({
          where: { user_id: student.id, status: 'pending' },
        });

        if (pendingRequest) {
          console.log(`[levelProgressionJob] Skipping ${student.id} — has pending correction request`);
          continue;
        }

        const currentIndex = LEVEL_ORDER.indexOf(student.level);
        const nextLevel = LEVEL_ORDER[currentIndex + 1];

        if (!nextLevel) continue;

        await student.update({
          level: nextLevel,
          level_updated_at: new Date(),
        });

        await Notification.create({
          id: uuidv4(),
          user_id: student.id,
          type: 'level_progressed',
          title: 'Level Progression',
          body: `Congratulations! Your level has been updated to Level ${nextLevel}.`,
        });

        console.log(`[levelProgressionJob] Progressed student ${student.id}: ${student.level} -> ${nextLevel}`);
      } catch (studentErr) {
        console.error(`[levelProgressionJob] Error processing student ${student.id}:`, studentErr.message);
      }
    }

    console.log('[levelProgressionJob] Completed successfully');
  } catch (err) {
    console.error('[levelProgressionJob] Error:', err.message);
  }
}, {
  scheduled: false,
});

module.exports = levelProgressionJob;
