'use strict';

/**
 * Seeder: Lecturer-Course Assignments
 *
 * Links each seeded lecturer to their course:
 *
 *   Dr. Kwame Asante     → CSM 389  Data Structures & Algorithms
 *   Prof. Abena Osei-Bonsu → ITM 201 Introduction to IT
 *   Dr. Kofi Mensah      → CSM 302  Computer Networks
 *   Dr. Ama Boateng      → ITM 203  Database Management Systems
 *   Prof. Yaw Darko      → CSM 305  Operating Systems
 *
 * Depends on: 001-seed-courses, 002-seed-users
 */

// Must stay in sync with seeders 001 and 002
const USER_IDS = {
  asante:  '550e8400-e29b-41d4-a716-446655440004',
  osei:    '550e8400-e29b-41d4-a716-446655440005',
  mensah:  '550e8400-e29b-41d4-a716-446655440006',
  boateng: '550e8400-e29b-41d4-a716-446655440007',
  darko:   '550e8400-e29b-41d4-a716-446655440008',
};

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

    const assignments = [
      { lecturer_id: USER_IDS.asante,  course_id: COURSE_IDS.dsaCS300,      label: 'Dr. Asante → CSM 389' },
      { lecturer_id: USER_IDS.osei,    course_id: COURSE_IDS.introITIT200,   label: 'Prof. Osei-Bonsu → ITM 201' },
      { lecturer_id: USER_IDS.mensah,  course_id: COURSE_IDS.networksCS300,  label: 'Dr. Mensah → CSM 302' },
      { lecturer_id: USER_IDS.boateng, course_id: COURSE_IDS.dbmsIT200,      label: 'Dr. Boateng → ITM 203' },
      { lecturer_id: USER_IDS.darko,   course_id: COURSE_IDS.osCS300,        label: 'Prof. Darko → CSM 305' },
    ];

    for (const a of assignments) {
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM lecturer_courses WHERE lecturer_id = $1 AND course_id = $2 LIMIT 1`,
        { bind: [a.lecturer_id, a.course_id] }
      );
      if (existing.length === 0) {
        await queryInterface.bulkInsert('lecturer_courses', [{
          id:          require('crypto').randomUUID(),
          lecturer_id: a.lecturer_id,
          course_id:   a.course_id,
          created_at:  now,
          updated_at:  now,
        }]);
        console.log(`  ✓ Assigned: ${a.label}`);
      } else {
        console.log(`  – Skipped (exists): ${a.label}`);
      }
    }

    console.log('\nLecturer-courses seeder complete.');
  },

  async down(queryInterface) {
    const lecturerIds = Object.values(USER_IDS);
    await queryInterface.sequelize.query(
      `DELETE FROM lecturer_courses WHERE lecturer_id = ANY($1::uuid[])`,
      { bind: [lecturerIds] }
    );
  },
};
