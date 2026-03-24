'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `CREATE TYPE "enum_announcements_status" AS ENUM ('draft', 'published', 'archived')`
    );
    await queryInterface.addColumn('announcements', 'status', {
      type: Sequelize.ENUM('draft', 'published', 'archived'),
      allowNull: false,
      defaultValue: 'draft',
      after: 'level',
    });
    await queryInterface.addColumn('announcements', 'pinned_at', {
      type: Sequelize.DATE,
      allowNull: true,
      after: 'is_pinned',
    });
    await queryInterface.addIndex('announcements', ['status'], { name: 'announcements_status_idx' });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('announcements', 'announcements_status_idx');
    await queryInterface.removeColumn('announcements', 'pinned_at');
    await queryInterface.removeColumn('announcements', 'status');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_announcements_status"');
  },
};
