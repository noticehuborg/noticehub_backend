'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('resources', {
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
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      type: {
        type: Sequelize.ENUM('telegram', 'google_drive', 'youtube', 'file'),
        allowNull: false,
      },
      url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      file_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      public_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      program: {
        type: Sequelize.ENUM('Bsc. Computer Science', 'Bsc. Information Technology'),
        allowNull: false,
      },
      level: {
        type: Sequelize.ENUM('100', '200', '300', '400'),
        allowNull: false,
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

    await queryInterface.addIndex('resources', ['program', 'level'], { name: 'resources_program_level_idx' });
    await queryInterface.addIndex('resources', ['type'], { name: 'resources_type_idx' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('resources');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_resources_type"');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_resources_program"');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_resources_level"');
  },
};
