'use strict';

module.exports = (sequelize, DataTypes) => {
  const LecturerCourse = sequelize.define(
    'LecturerCourse',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      lecturer_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      course_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      tableName: 'lecturer_courses',
      underscored: true,
    }
  );

  // No associations needed here — the join table is accessed via User.belongsToMany(Course)
  return LecturerCourse;
};
