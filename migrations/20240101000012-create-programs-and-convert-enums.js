'use strict';

/**
 * Migration 012 — Programs table + convert program/level columns from ENUM to VARCHAR
 *
 * Why VARCHAR instead of ENUM:
 *   - Programs are now managed in the `programs` table (can be added/renamed by admin)
 *   - Levels now go up to 600 for some programs; ENUM would need a migration every time
 *   - Idempotent: all steps check existing state before acting
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const q = queryInterface.sequelize;

    // ── 1. Create programs table ──────────────────────────────────────────────
    const [tableRows] = await q.query(
      `SELECT 1 FROM information_schema.tables WHERE table_name = 'programs' LIMIT 1`
    );
    if (tableRows.length === 0) {
      await queryInterface.createTable('programs', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('gen_random_uuid()'),
          primaryKey: true,
        },
        name: {
          type: Sequelize.STRING(150),
          allowNull: false,
          unique: true,
          comment: 'Full program name, e.g. "Bsc. Computer Science"',
        },
        short_name: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Display label for UI, e.g. "Computer Science"',
        },
        max_level: {
          type: Sequelize.SMALLINT,
          allowNull: false,
          defaultValue: 400,
          comment: 'Highest level for this program (100 increments, e.g. 400, 500, 600)',
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
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
      console.log('  ✓ Created programs table');
    } else {
      console.log('  – programs table already exists, skipping');
    }

    // ── 2. Add index on programs.name ─────────────────────────────────────────
    const [nameIdxRows] = await q.query(
      `SELECT 1 FROM pg_indexes WHERE tablename = 'programs' AND indexname = 'programs_name_idx' LIMIT 1`
    );
    if (nameIdxRows.length === 0) {
      await queryInterface.addIndex('programs', ['name'], { name: 'programs_name_idx' });
    }

    // ── Helper: convert a column from ENUM → VARCHAR if still ENUM ────────────
    async function convertEnumToVarchar(table, column, size) {
      const [colRows] = await q.query(
        `SELECT data_type FROM information_schema.columns
         WHERE table_name = '${table}' AND column_name = '${column}' LIMIT 1`
      );
      if (colRows.length > 0 && colRows[0].data_type === 'USER-DEFINED') {
        await q.query(
          `ALTER TABLE "${table}" ALTER COLUMN "${column}" TYPE VARCHAR(${size}) USING "${column}"::text`
        );
        console.log(`  ✓ Converted ${table}.${column}: ENUM → VARCHAR(${size})`);
      } else {
        console.log(`  – ${table}.${column} is already VARCHAR, skipping`);
      }
    }

    // ── 3. Convert users.program  ─────────────────────────────────────────────
    await convertEnumToVarchar('users', 'program', 150);

    // ── 4. Convert users.level ────────────────────────────────────────────────
    await convertEnumToVarchar('users', 'level', 10);

    // ── 5. Convert announcements.program ─────────────────────────────────────
    await convertEnumToVarchar('announcements', 'program', 150);

    // ── 6. Convert announcements.level ───────────────────────────────────────
    await convertEnumToVarchar('announcements', 'level', 10);

    // ── 7. Drop old ENUM types (safe — they're no longer referenced) ──────────
    await q.query('DROP TYPE IF EXISTS "enum_users_program"');
    await q.query('DROP TYPE IF EXISTS "enum_users_level"');
    await q.query('DROP TYPE IF EXISTS "enum_announcements_program"');
    await q.query('DROP TYPE IF EXISTS "enum_announcements_level"');
    console.log('  ✓ Dropped legacy ENUM types (if they existed)');
  },

  async down(queryInterface) {
    // Re-create ENUMs and drop programs table (best-effort rollback)
    const q = queryInterface.sequelize;

    await q.query(`CREATE TYPE IF NOT EXISTS "enum_users_program" AS ENUM ('Bsc. Computer Science', 'Bsc. Information Technology')`).catch(() => {});
    await q.query(`CREATE TYPE IF NOT EXISTS "enum_users_level" AS ENUM ('100', '200', '300', '400')`).catch(() => {});
    await q.query(`ALTER TABLE users ALTER COLUMN program TYPE "enum_users_program" USING program::"enum_users_program"`).catch(() => {});
    await q.query(`ALTER TABLE users ALTER COLUMN level TYPE "enum_users_level" USING level::"enum_users_level"`).catch(() => {});

    await q.query(`CREATE TYPE IF NOT EXISTS "enum_announcements_program" AS ENUM ('Bsc. Computer Science', 'Bsc. Information Technology')`).catch(() => {});
    await q.query(`CREATE TYPE IF NOT EXISTS "enum_announcements_level" AS ENUM ('100', '200', '300', '400')`).catch(() => {});
    await q.query(`ALTER TABLE announcements ALTER COLUMN program TYPE "enum_announcements_program" USING program::"enum_announcements_program"`).catch(() => {});
    await q.query(`ALTER TABLE announcements ALTER COLUMN level TYPE "enum_announcements_level" USING level::"enum_announcements_level"`).catch(() => {});

    await queryInterface.dropTable('programs').catch(() => {});
  },
};
