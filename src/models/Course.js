'use strict';

module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define(
    'Course',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      code: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: 'Course code, e.g. "CSM 389"',
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
        comment: 'Course name, e.g. "Data Structures & Algorithms"',
      },
      program: {
        type: DataTypes.STRING(150),
        allowNull: false,
        comment: 'Program this course belongs to — scopes announcements to the right students',
      },
      level: {
        type: DataTypes.STRING(10),
        allowNull: false,
        comment: 'Level this course is taught at — scopes announcements to the right students',
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: 'courses',
      underscored: true,
    }
  );

  Course.associate = (db) => {
    Course.belongsToMany(db.User, {
      through: db.LecturerCourse,
      foreignKey: 'course_id',
      otherKey: 'lecturer_id',
      as: 'lecturers',
    });
  };

  return Course;
};
