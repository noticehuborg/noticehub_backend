'use strict';

module.exports = {
  async up(queryInterface) {
    // PostgreSQL requires each ADD VALUE to be its own statement and cannot run inside a transaction
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_notifications_type" ADD VALUE IF NOT EXISTS 'welcome'`
    );
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_notifications_type" ADD VALUE IF NOT EXISTS 'level_progressed'`
    );
  },

  async down() {
    // PostgreSQL does not support removing ENUM values — this migration is irreversible
    console.warn('Cannot remove ENUM values in PostgreSQL — down migration is a no-op');
  },
};
