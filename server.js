require('dotenv').config();
const app = require('./src/app');
const { sequelize } = require('./src/models');
const deadlineWarningJob = require('./src/jobs/deadlineWarning.job');
const levelProgressionJob = require('./src/jobs/levelProgression.job');

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    // Register cron jobs
    deadlineWarningJob.start();
    console.log('Cron job registered: deadlineWarningJob (daily at 08:00)');

    levelProgressionJob.start();
    console.log('Cron job registered: levelProgressionJob (midnight on 1 Jan & 1 Aug)');

    app.listen(PORT, () => {
      console.log(`NoticeHub API running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();
