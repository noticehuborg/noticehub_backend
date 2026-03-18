'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      full_name: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM('student', 'course_rep', 'admin'),
        allowNull: false,
        defaultValue: 'student',
      },
      program: {
        type: Sequelize.ENUM('Bsc. Computer Science', 'Bsc. Information Technology'),
        allowNull: true,
      },
      level: {
        type: Sequelize.ENUM('100', '200', '300', '400'),
        allowNull: true,
      },
      avatar_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      otp_code: {
        type: Sequelize.STRING(4),
        allowNull: true,
      },
      otp_expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      must_reset_password: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      refresh_token_hash: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      password_reset_token: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      password_reset_expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      level_updated_at: {
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

    await queryInterface.addIndex('users', ['email'], { unique: true, name: 'users_email_unique' });
    await queryInterface.addIndex('users', ['role'], { name: 'users_role_idx' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role"');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_program"');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_level"');
  },
};
