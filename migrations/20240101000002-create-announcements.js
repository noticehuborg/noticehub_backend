'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('announcements', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      author_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      category: {
        type: Sequelize.ENUM('general', 'assignment', 'exams'),
        allowNull: false,
        defaultValue: 'general',
      },
      program: {
        type: Sequelize.ENUM('Bsc. Computer Science', 'Bsc. Information Technology'),
        allowNull: false,
      },
      level: {
        type: Sequelize.ENUM('100', '200', '300', '400'),
        allowNull: false,
      },
      is_pinned: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      deadline: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      useful_links: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: [],
      },
      view_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
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

    await queryInterface.addIndex('announcements', ['author_id'], { name: 'announcements_author_idx' });
    await queryInterface.addIndex('announcements', ['program', 'level'], { name: 'announcements_program_level_idx' });
    await queryInterface.addIndex('announcements', ['category'], { name: 'announcements_category_idx' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('announcements');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_announcements_category"');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_announcements_program"');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_announcements_level"');
  },
};
