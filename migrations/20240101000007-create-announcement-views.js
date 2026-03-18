'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('announcement_views', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      announcement_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'announcements', key: 'id' },
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
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

    // UNIQUE constraint: one view record per user per announcement
    await queryInterface.addIndex('announcement_views', ['announcement_id', 'user_id'], {
      unique: true,
      name: 'announcement_views_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('announcement_views');
  },
};
