const ROLES = {
  STUDENT: 'student',
  COURSE_REP: 'course_rep',
  LECTURER: 'lecturer',
  ADMIN: 'admin',
};

// Programs are now managed in the `programs` DB table and served via GET /api/auth/programs.
// This list is kept only as a fallback for validators that run before the DB is queried.
const PROGRAMS = [
  'Bsc. Computer Science',
  'Bsc. Information Technology',
];

// All possible level values across all programs (100–600 in steps of 100).
// Per-program max is enforced at the controller level via the programs table.
const LEVELS = ['100', '200', '300', '400', '500', '600'];

const ANNOUNCEMENT_CATEGORIES = ['general', 'assignment', 'exams'];

const RESOURCE_TYPES = ['telegram', 'drive', 'youtube', 'file'];

module.exports = { ROLES, PROGRAMS, LEVELS, ANNOUNCEMENT_CATEGORIES, RESOURCE_TYPES };
