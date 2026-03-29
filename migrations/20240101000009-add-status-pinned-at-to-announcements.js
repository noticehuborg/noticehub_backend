'use strict';

/**
 * Migration 009 — Add status + pinned_at to announcements
 *
 * Written to be IDEMPOTENT: each step checks whether the column/type/index
 * already exists before attempting to create it.
 * This handles the case where sequelize.sync() previously applied these
 * changes to the DB outside of the migration system.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const q = queryInterface.sequelize;

    // ── 1. Create the status ENUM type (skip if already exists) ──────────────
    const [enumRows] = await q.query(
      `SELECT 1 FROM pg_type WHERE typname = 'enum_announcements_status' LIMIT 1`
    );
    if (enumRows.length === 0) {
      await q.query(
        `CREATE TYPE "enum_announcements_status" AS ENUM ('draft', 'published', 'archived')`
      );
    }

    // ── 2. Add 'status' column if it doesn't exist ────────────────────────────
    const [statusRows] = await q.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_name = 'announcements' AND column_name = 'status' LIMIT 1`
    );
    if (statusRows.length === 0) {
      await queryInterface.addColumn('announcements', 'status', {
        type: Sequelize.ENUM('draft', 'published', 'archived'),
        allowNull: false,
        defaultValue: 'draft',
      });
    }

    // ── 3. Add 'pinned_at' column if it doesn't exist ─────────────────────────
    const [pinnedRows] = await q.query(
      `SELECT column_name FROM information_schema.columns
       WHERE table_name = 'announcements' AND column_name = 'pinned_at' LIMIT 1`
    );
    if (pinnedRows.length === 0) {
      await queryInterface.addColumn('announcements', 'pinned_at', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }

    // ── 4. Add status index if it doesn't exist ───────────────────────────────
    const [idxRows] = await q.query(
      `SELECT 1 FROM pg_indexes
       WHERE tablename = 'announcements' AND indexname = 'announcements_status_idx' LIMIT 1`
    );
    if (idxRows.length === 0) {
      await queryInterface.addIndex('announcements', ['status'], {
        name: 'announcements_status_idx',
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('announcements', 'announcements_status_idx').catch(() => {});
    await queryInterface.removeColumn('announcements', 'pinned_at').catch(() => {});
    await queryInterface.removeColumn('announcements', 'status').catch(() => {});
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_announcements_status"'
    );
  },
};
