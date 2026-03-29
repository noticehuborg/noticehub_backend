'use strict';

/**
 * Migration 014 — Courses + Lecturer-Courses
 *
 * courses table     — catalog of courses e.g. { code: "CSM 389", name: "Data Structures & Algorithms",
 *                      program: "Bsc. Computer Science", level: "300" }
 *
 * lecturer_courses  — many-to-many: lecturers ↔ courses
 *
 * Also drops users.course_teaching (single-string approach replaced by the proper table).
 *
 * Idempotent — all steps check current state first.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const q = queryInterface.sequelize;

    // ── 1. Create courses table ───────────────────────────────────────────────
    const [courseTbl] = await q.query(
      `SELECT 1 FROM information_schema.tables WHERE table_name = 'courses' LIMIT 1`
    );
    if (courseTbl.length === 0) {
      await queryInterface.createTable('courses', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('gen_random_uuid()'),
          primaryKey: true,
        },
        code: {
          type: Sequelize.STRING(20),
          allowNull: false,
          comment: 'Course code, e.g. "CSM 389"',
        },
        name: {
          type: Sequelize.STRING(150),
          allowNull: false,
          comment: 'Course name, e.g. "Data Structures & Algorithms"',
        },
        program: {
          type: Sequelize.STRING(150),
          allowNull: false,
          comment: 'Program this course belongs to — determines which students see announcements',
        },
        level: {
          type: Sequelize.STRING(10),
          allowNull: false,
          comment: 'Level this course is taught at — determines which students see announcements',
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('NOW()'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('NOW()'),
        },
      });
      // Unique on code+program+level so the same code can't appear twice for the same audience
      await queryInterface.addIndex('courses', ['code', 'program', 'level'], {
        unique: true,
        name: 'courses_code_program_level_unique',
      });
      console.log('  ✓ Created courses table');
    } else {
      console.log('  – courses table already exists, skipping');
    }

    // ── 2. Create lecturer_courses table ─────────────────────────────────────
    const [lcTbl] = await q.query(
      `SELECT 1 FROM information_schema.tables WHERE table_name = 'lecturer_courses' LIMIT 1`
    );
    if (lcTbl.length === 0) {
      await queryInterface.createTable('lecturer_courses', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('gen_random_uuid()'),
          primaryKey: true,
        },
        lecturer_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onDelete: 'CASCADE',
        },
        course_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'courses', key: 'id' },
          onDelete: 'CASCADE',
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('NOW()'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('NOW()'),
        },
      });
      await queryInterface.addIndex('lecturer_courses', ['lecturer_id', 'course_id'], {
        unique: true,
        name: 'lecturer_courses_unique',
      });
      console.log('  ✓ Created lecturer_courses table');
    } else {
      console.log('  – lecturer_courses table already exists, skipping');
    }

    // ── 3. Drop users.course_teaching (replaced by the courses table) ─────────
    const [ctCol] = await q.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_name = 'users' AND column_name = 'course_teaching' LIMIT 1`
    );
    if (ctCol.length > 0) {
      await queryInterface.removeColumn('users', 'course_teaching');
      console.log('  ✓ Dropped users.course_teaching');
    } else {
      console.log('  – users.course_teaching already removed, skipping');
    }
  },

  async down(queryInterface) {
    const q = queryInterface.sequelize;

    await queryInterface.dropTable('lecturer_courses').catch(() => {});
    await queryInterface.dropTable('courses').catch(() => {});

    // Re-add course_teaching for rollback parity with migration 013
    const [ctCol] = await q.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_name = 'users' AND column_name = 'course_teaching' LIMIT 1`
    );
    if (ctCol.length === 0) {
      const { Sequelize } = require('../src/models/index');
      await queryInterface.addColumn('users', 'course_teaching', {
        type: Sequelize.STRING(150),
        allowNull: true,
      });
    }
  },
};
