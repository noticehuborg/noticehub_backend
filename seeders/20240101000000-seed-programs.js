'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * Seeder 000 — Initial programs
 *
 * Runs FIRST so subsequent seeders (users, announcements) can reference valid program names.
 *
 * max_level controls which levels appear in the registration dropdown:
 *   400 → levels 100, 200, 300, 400
 *   500 → levels 100, 200, 300, 400, 500
 *   600 → levels 100, 200, 300, 400, 500, 600
 *
 * To add more programs, insert a row here (or via the admin panel once built).
 * Run: npx sequelize-cli db:seed --seed 20240101000000-seed-programs.js
 */

const PROGRAMS = [
  {
    name:       'Bsc. Computer Science',
    short_name: 'Computer Science',
    max_level:  400,
  },
  {
    name:       'Bsc. Information Technology',
    short_name: 'Information Technology',
    max_level:  400,
  },
];

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    for (const p of PROGRAMS) {
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM programs WHERE name = $1 LIMIT 1`,
        { bind: [p.name] }
      );
      if (existing.length === 0) {
        await queryInterface.bulkInsert('programs', [{
          id:         uuidv4(),
          name:       p.name,
          short_name: p.short_name,
          max_level:  p.max_level,
          is_active:  true,
          created_at: now,
          updated_at: now,
        }]);
        console.log(`  ✓ Seeded program: ${p.name} (max level: ${p.max_level})`);
      } else {
        console.log(`  – Skipped (exists): ${p.name}`);
      }
    }

    console.log('\nPrograms seeder complete.\n');
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('programs', {
      name: PROGRAMS.map((p) => p.name),
    }, {});
  },
};
