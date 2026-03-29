'use strict';

/**
 * Migration 013 — Add position + course_teaching to users
 *
 * Both columns are nullable (not all users are lecturers with assigned courses).
 *
 * position:        e.g. "Lecturer", "Senior Lecturer", "Professor", "Head of Department"
 * course_teaching: e.g. "Data Structures & Algorithms" — the course a lecturer is assigned to
 *
 * Idempotent: checks information_schema before adding each column.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const q = queryInterface.sequelize;

    // ── position ─────────────────────────────────────────────────────────────
    const [posRows] = await q.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_name = 'users' AND column_name = 'position' LIMIT 1`
    );
    if (posRows.length === 0) {
      await queryInterface.addColumn('users', 'position', {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Academic/admin position, e.g. "Senior Lecturer", "Head of Department"',
      });
      console.log('  ✓ Added users.position');
    } else {
      console.log('  – users.position already exists, skipping');
    }

    // ── course_teaching ───────────────────────────────────────────────────────
    const [ctRows] = await q.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_name = 'users' AND column_name = 'course_teaching' LIMIT 1`
    );
    if (ctRows.length === 0) {
      await queryInterface.addColumn('users', 'course_teaching', {
        type: Sequelize.STRING(150),
        allowNull: true,
        comment: 'Course the lecturer is assigned to teach — used as default when creating announcements',
      });
      console.log('  ✓ Added users.course_teaching');
    } else {
      console.log('  – users.course_teaching already exists, skipping');
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'course_teaching').catch(() => {});
    await queryInterface.removeColumn('users', 'position').catch(() => {});
  },
};
