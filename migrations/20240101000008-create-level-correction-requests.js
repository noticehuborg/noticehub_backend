'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('level_correction_requests', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      current_level: {
        type: Sequelize.ENUM('100', '200', '300', '400'),
        allowNull: false,
      },
      requested_level: {
        type: Sequelize.ENUM('100', '200', '300', '400'),
        allowNull: false,
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
      },
      actioned_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
      },
      actioned_at: {
        type: Sequelize.DATE,
        allowNull: true,
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

    await queryInterface.addIndex('level_correction_requests', ['user_id'], { name: 'lcr_user_idx' });
    await queryInterface.addIndex('level_correction_requests', ['status'], { name: 'lcr_status_idx' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('level_correction_requests');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_level_correction_requests_current_level"');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_level_correction_requests_requested_level"');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_level_correction_requests_status"');
  },
};
