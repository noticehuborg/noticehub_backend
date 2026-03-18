'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface) {
    const email = process.env.ADMIN_EMAIL || 'admin@noticehub.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin@1234';
    const password_hash = await bcrypt.hash(password, 12);

    const [existing] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = '${email}' LIMIT 1`
    );
    if (existing.length > 0) return;

    await queryInterface.bulkInsert('users', [
      {
        id: uuidv4(),
        full_name: 'NoticeHub Admin',
        email,
        password_hash,
        role: 'admin',
        program: null,
        level: null,
        is_verified: true,
        is_active: true,
        must_reset_password: false,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    console.log(`Admin seeded: ${email}`);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { role: 'admin' }, {});
  },
};
