'use strict';

/**
 * Migration 011 — Two additions:
 * 1. Add 'lecturer' value to the enum_users_role PostgreSQL enum
 * 2. Add 'course' column (VARCHAR 150, nullable) to announcements table
 *    — used to tag which course (e.g. "Data Structures") an announcement belongs to
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Extend the users role enum with 'lecturer'
    //    PostgreSQL supports ADD VALUE IF NOT EXISTS to be idempotent
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'lecturer'`
    );

    // 2. Add 'course' column to announcements
    await queryInterface.addColumn('announcements', 'course', {
      type: Sequelize.STRING(150),
      allowNull: true,
      defaultValue: null,
    });

    // 3. Add an index for course lookups
    await queryInterface.addIndex('announcements', ['course'], {
      name: 'announcements_course_idx',
    });
  },

  async down(queryInterface) {
    // Remove course index and column
    await queryInterface.removeIndex('announcements', 'announcements_course_idx');
    await queryInterface.removeColumn('announcements', 'course');
    // NOTE: PostgreSQL does not support removing an enum value.
    // The 'lecturer' value remains in the enum on rollback — this is safe.
  },
};
