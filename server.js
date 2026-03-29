require('dotenv').config();
const app = require('./src/app');
const { sequelize, Program } = require('./src/models');
const deadlineWarningJob = require('./src/jobs/deadlineWarning.job');
const levelProgressionJob = require('./src/jobs/levelProgression.job');
const { v4: uuidv4 } = require('uuid');

const PORT = process.env.PORT || 5000;

const DEFAULT_PROGRAMS = [
  { name: 'Bsc. Computer Science',        short_name: 'Computer Science',        max_level: 400 },
  { name: 'Bsc. Information Technology',  short_name: 'Information Technology',  max_level: 400 },
  { name: 'Bsc. Electrical Engineering',  short_name: 'Electrical Engineering',  max_level: 400 },
  { name: 'Bsc. Mathematics',             short_name: 'Mathematics',             max_level: 400 },
];

async function seedProgramsIfEmpty() {
  const count = await Program.count();
  if (count > 0) return;
  const now = new Date();
  await Program.bulkCreate(
    DEFAULT_PROGRAMS.map((p) => ({ id: uuidv4(), ...p, is_active: true, created_at: now, updated_at: now }))
  );
  console.log(`Seeded ${DEFAULT_PROGRAMS.length} default programs`);
}

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    await seedProgramsIfEmpty();

    // Register cron jobs
    deadlineWarningJob.start();
    levelProgressionJob.start();

    app.listen(PORT, () => {
      console.log(`NoticeHub API running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();
