'use strict';

const bcrypt = require('bcryptjs');

/**
 * Seeder: Course Reps + Lecturers
 *
 * CS 300 Course Reps (3):
 *   Schnelle Kwegyir-Aggrey  |  Jennifer Mawufemor Akoto  |  Eliah Abormegah
 *
 * IT 200 Course Reps (3):
 *   Kwabena Agyei-Mensah  |  Efua Asante-Appiah  |  Nana Yaa Osei
 *
 * Lecturers (5) — CS 300 × 3, IT 200 × 2:
 *   Dr. Kwame Asante        (CS 300 — Data Structures & Algorithms)
 *   Prof. Abena Osei-Bonsu  (IT 200 — Introduction to Information Technology)
 *   Dr. Kofi Mensah         (CS 300 — Computer Networks)
 *   Dr. Ama Boateng         (IT 200 — Database Management Systems)
 *   Prof. Yaw Darko         (CS 300 — Operating Systems)
 *
 * Temp passwords (must_reset_password: true):
 *   Course Reps  → Rep@2026
 *   Lecturers    → Lecturer@2026
 *
 * NOTE: IDs are fixed so the announcements seeder (003) can reference them
 *       without a DB lookup. Keep these in sync with 003.
 */

const USER_IDS = {
  // CS 300 Course Reps
  schnelle: '550e8400-e29b-41d4-a716-446655440001',
  jennifer: '550e8400-e29b-41d4-a716-446655440002',
  eliah:    '550e8400-e29b-41d4-a716-446655440003',
  // IT 200 Course Reps
  kwabena:  '550e8400-e29b-41d4-a716-446655440009',
  efua:     '550e8400-e29b-41d4-a716-446655440010',
  nana:     '550e8400-e29b-41d4-a716-446655440011',
  // Lecturers
  asante:   '550e8400-e29b-41d4-a716-446655440004',
  osei:     '550e8400-e29b-41d4-a716-446655440005',
  mensah:   '550e8400-e29b-41d4-a716-446655440006',
  boateng:  '550e8400-e29b-41d4-a716-446655440007',
  darko:    '550e8400-e29b-41d4-a716-446655440008',
};

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    const repHash      = await bcrypt.hash('Rep@2026', 12);
    const lecturerHash = await bcrypt.hash('Lecturer@2026', 12);

    const users = [

      // ── CS 300 Course Reps ───────────────────────────────────────────────
      {
        id:                  USER_IDS.schnelle,
        full_name:           'Schnelle Kwegyir-Aggrey',
        email:               'schnelle.aggrey@gmail.com',
        password_hash:       repHash,
        role:                'course_rep',
        program:             'Bsc. Computer Science',
        level:               '300',
        is_verified:         true,
        is_active:           true,
        must_reset_password: true,
        created_at:          now,
        updated_at:          now,
      },
      {
        id:                  USER_IDS.jennifer,
        full_name:           'Jennifer Mawufemor Akoto',
        email:               'jennieakoto3@gmail.com',
        password_hash:       repHash,
        role:                'course_rep',
        program:             'Bsc. Computer Science',
        level:               '300',
        is_verified:         true,
        is_active:           true,
        must_reset_password: true,
        created_at:          now,
        updated_at:          now,
      },
      {
        id:                  USER_IDS.eliah,
        full_name:           'Eliah Abormegah',
        email:               'eliahabormegah@gmail.com',
        password_hash:       repHash,
        role:                'course_rep',
        program:             'Bsc. Computer Science',
        level:               '300',
        is_verified:         true,
        is_active:           true,
        must_reset_password: true,
        created_at:          now,
        updated_at:          now,
      },

      // ── IT 200 Course Reps ───────────────────────────────────────────────
      {
        id:                  USER_IDS.kwabena,
        full_name:           'Kwabena Agyei-Mensah',
        email:               'kwabena.agyei@gmail.com',
        password_hash:       repHash,
        role:                'course_rep',
        program:             'Bsc. Information Technology',
        level:               '200',
        is_verified:         true,
        is_active:           true,
        must_reset_password: true,
        created_at:          now,
        updated_at:          now,
      },
      {
        id:                  USER_IDS.efua,
        full_name:           'Efua Asante-Appiah',
        email:               'efua.asante@gmail.com',
        password_hash:       repHash,
        role:                'course_rep',
        program:             'Bsc. Information Technology',
        level:               '200',
        is_verified:         true,
        is_active:           true,
        must_reset_password: true,
        created_at:          now,
        updated_at:          now,
      },
      {
        id:                  USER_IDS.nana,
        full_name:           'Nana Yaa Osei',
        email:               'nanayaa.osei@gmail.com',
        password_hash:       repHash,
        role:                'course_rep',
        program:             'Bsc. Information Technology',
        level:               '200',
        is_verified:         true,
        is_active:           true,
        must_reset_password: true,
        created_at:          now,
        updated_at:          now,
      },

      // ── Lecturers ────────────────────────────────────────────────────────
      {
        id:                  USER_IDS.asante,
        full_name:           'Dr. Kwame Asante',
        email:               'kwame.asante@cs.noticehub.edu.gh',
        password_hash:       lecturerHash,
        role:                'lecturer',
        position:            'Senior Lecturer',
        is_verified:         true,
        is_active:           true,
        must_reset_password: true,
        created_at:          now,
        updated_at:          now,
      },
      {
        id:                  USER_IDS.osei,
        full_name:           'Prof. Abena Osei-Bonsu',
        email:               'abena.osei@it.noticehub.edu.gh',
        password_hash:       lecturerHash,
        role:                'lecturer',
        position:            'Professor',
        is_verified:         true,
        is_active:           true,
        must_reset_password: true,
        created_at:          now,
        updated_at:          now,
      },
      {
        id:                  USER_IDS.mensah,
        full_name:           'Dr. Kofi Mensah',
        email:               'kofi.mensah@cs.noticehub.edu.gh',
        password_hash:       lecturerHash,
        role:                'lecturer',
        position:            'Lecturer',
        is_verified:         true,
        is_active:           true,
        must_reset_password: true,
        created_at:          now,
        updated_at:          now,
      },
      {
        id:                  USER_IDS.boateng,
        full_name:           'Dr. Ama Boateng',
        email:               'ama.boateng@it.noticehub.edu.gh',
        password_hash:       lecturerHash,
        role:                'lecturer',
        position:            'Senior Lecturer',
        is_verified:         true,
        is_active:           true,
        must_reset_password: true,
        created_at:          now,
        updated_at:          now,
      },
      {
        id:                  USER_IDS.darko,
        full_name:           'Prof. Yaw Darko',
        email:               'yaw.darko@cs.noticehub.edu.gh',
        password_hash:       lecturerHash,
        role:                'lecturer',
        position:            'Professor',
        is_verified:         true,
        is_active:           true,
        must_reset_password: true,
        created_at:          now,
        updated_at:          now,
      },
    ];

    for (const user of users) {
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id, position FROM users WHERE email = $1 LIMIT 1`,
        { bind: [user.email] }
      );

      if (existing.length === 0) {
        await queryInterface.bulkInsert('users', [user]);
        console.log(`  ✓ Seeded: ${user.full_name} (${user.role})`);
      } else {
        // If the record exists but position is NULL (added after initial seed), patch it in.
        if (user.role === 'lecturer' && user.position && existing[0].position === null) {
          await queryInterface.sequelize.query(
            `UPDATE users SET position = $1, updated_at = NOW() WHERE email = $2`,
            { bind: [user.position, user.email] }
          );
          console.log(`  ↻ Updated: ${user.email} (position)`);
        } else {
          console.log(`  – Skipped (exists): ${user.email}`);
        }
      }
    }

    console.log('\nUsers seeder complete.');
    console.log('  CS 300 Course Reps : Schnelle, Jennifer, Eliah');
    console.log('  IT 200 Course Reps : Kwabena, Efua, Nana');
    console.log('  CS 300 Lecturers   : Dr. Asante, Dr. Mensah, Prof. Darko');
    console.log('  IT 200 Lecturers   : Prof. Osei-Bonsu, Dr. Boateng');
    console.log('  Temp password → Rep@2026 / Lecturer@2026\n');
  },

  async down(queryInterface) {
    const emails = [
      'schnelle.aggrey@gmail.com',
      'jennieakoto3@gmail.com',
      'eliahabormegah@gmail.com',
      'kwabena.agyei@gmail.com',
      'efua.asante@gmail.com',
      'nanayaa.osei@gmail.com',
      'kwame.asante@cs.noticehub.edu.gh',
      'abena.osei@it.noticehub.edu.gh',
      'kofi.mensah@cs.noticehub.edu.gh',
      'ama.boateng@it.noticehub.edu.gh',
      'yaw.darko@cs.noticehub.edu.gh',
    ];
    await queryInterface.bulkDelete('users', { email: emails }, {});
  },
};

module.exports.USER_IDS = USER_IDS;
