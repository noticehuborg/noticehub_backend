'use strict';

/**
 * Seeder: Courses
 *
 * Seeds the five courses that map to the seeded lecturers:
 *
 *   CSM 389  — Data Structures & Algorithms        (Bsc. CS,  300)
 *   ITM 201  — Introduction to Information Technology (Bsc. IT, 200)
 *   CSM 302  — Computer Networks                   (Bsc. CS,  300)
 *   ITM 203  — Database Management Systems         (Bsc. IT, 200)
 *   CSM 305  — Operating Systems                   (Bsc. CS,  300)
 *
 * IDs are fixed so the lecturer-courses seeder (003) can reference them
 * without a DB lookup. Keep these in sync with 003.
 */

const COURSE_IDS = {
  dsaCS300:      'c0c0c0c0-0000-0000-0000-000000000001',
  introITIT200:  'c0c0c0c0-0000-0000-0000-000000000002',
  networksCS300: 'c0c0c0c0-0000-0000-0000-000000000003',
  dbmsIT200:     'c0c0c0c0-0000-0000-0000-000000000004',
  osCS300:       'c0c0c0c0-0000-0000-0000-000000000005',
};

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const courses = [
      {
        id:         COURSE_IDS.dsaCS300,
        code:       'CSM 389',
        name:       'Data Structures & Algorithms',
        program:    'Bsc. Computer Science',
        level:      '300',
        is_active:  true,
        created_at: now,
        updated_at: now,
      },
      {
        id:         COURSE_IDS.introITIT200,
        code:       'ITM 201',
        name:       'Introduction to Information Technology',
        program:    'Bsc. Information Technology',
        level:      '200',
        is_active:  true,
        created_at: now,
        updated_at: now,
      },
      {
        id:         COURSE_IDS.networksCS300,
        code:       'CSM 302',
        name:       'Computer Networks',
        program:    'Bsc. Computer Science',
        level:      '300',
        is_active:  true,
        created_at: now,
        updated_at: now,
      },
      {
        id:         COURSE_IDS.dbmsIT200,
        code:       'ITM 203',
        name:       'Database Management Systems',
        program:    'Bsc. Information Technology',
        level:      '200',
        is_active:  true,
        created_at: now,
        updated_at: now,
      },
      {
        id:         COURSE_IDS.osCS300,
        code:       'CSM 305',
        name:       'Operating Systems',
        program:    'Bsc. Computer Science',
        level:      '300',
        is_active:  true,
        created_at: now,
        updated_at: now,
      },
    ];

    for (const course of courses) {
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM courses WHERE id = $1 LIMIT 1`,
        { bind: [course.id] }
      );
      if (existing.length === 0) {
        await queryInterface.bulkInsert('courses', [course]);
        console.log(`  ✓ Seeded: ${course.code} — ${course.name} (${course.program} ${course.level})`);
      } else {
        console.log(`  – Skipped (exists): ${course.code}`);
      }
    }

    console.log('\nCourses seeder complete.');
  },

  async down(queryInterface) {
    const ids = Object.values({
      dsaCS300:      'c0c0c0c0-0000-0000-0000-000000000001',
      introITIT200:  'c0c0c0c0-0000-0000-0000-000000000002',
      networksCS300: 'c0c0c0c0-0000-0000-0000-000000000003',
      dbmsIT200:     'c0c0c0c0-0000-0000-0000-000000000004',
      osCS300:       'c0c0c0c0-0000-0000-0000-000000000005',
    });
    await queryInterface.bulkDelete('courses', { id: ids }, {});
  },
};

module.exports.COURSE_IDS = COURSE_IDS;
