'use strict';

/**
 * Fixes mismatches between the original resources migration and the current model:
 *
 * 1. level:  ENUM('100','200','300','400') NOT NULL  →  INTEGER  nullable
 * 2. type:   ENUM value 'google_drive'               →  'drive'
 * 3. Add missing columns: file_name, file_size_bytes, member_count
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ── 1. Fix the `type` ENUM: rename 'google_drive' → 'drive' ──────────────
    // PostgreSQL 10+ supports RENAME VALUE
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_resources_type" RENAME VALUE 'google_drive' TO 'drive';`
    );

    // ── 2. Fix `level`: convert ENUM('100'…'400') → INTEGER, allow NULL ──────
    // Step 2a: drop the NOT NULL constraint and cast the enum string to integer
    await queryInterface.sequelize.query(`
      ALTER TABLE resources
        ALTER COLUMN level DROP NOT NULL,
        ALTER COLUMN level TYPE INTEGER USING level::text::integer;
    `);

    // Step 2b: drop the now-unused level ENUM type (if it exists)
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "enum_resources_level";`
    );

    // ── 3. Add missing columns ────────────────────────────────────────────────
    const tableDesc = await queryInterface.describeTable('resources');

    if (!tableDesc.file_name) {
      await queryInterface.addColumn('resources', 'file_name', {
        type: Sequelize.STRING(255),
        allowNull: true,
      });
    }

    if (!tableDesc.file_size_bytes) {
      await queryInterface.addColumn('resources', 'file_size_bytes', {
        type: Sequelize.BIGINT,
        allowNull: true,
      });
    }

    if (!tableDesc.member_count) {
      await queryInterface.addColumn('resources', 'member_count', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Reverse: rename 'drive' back to 'google_drive'
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_resources_type" RENAME VALUE 'drive' TO 'google_drive';`
    );

    // Remove added columns
    await queryInterface.removeColumn('resources', 'file_name').catch(() => {});
    await queryInterface.removeColumn('resources', 'file_size_bytes').catch(() => {});
    await queryInterface.removeColumn('resources', 'member_count').catch(() => {});

    // Note: reverting level back to ENUM is complex and not needed in practice.
  },
};
