const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true,
      },
      full_name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('student', 'course_rep', 'admin'),
        allowNull: false,
        defaultValue: 'student',
      },
      program: {
        type: DataTypes.ENUM('Bsc. Computer Science', 'Bsc. Information Technology'),
        allowNull: true,
      },
      level: {
        type: DataTypes.ENUM('100', '200', '300', '400'),
        allowNull: true,
      },
      avatar_url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      otp_code: {
        type: DataTypes.STRING(4),
        allowNull: true,
      },
      otp_expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      must_reset_password: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      refresh_token_hash: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      password_reset_token: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      password_reset_expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      level_updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'users',
      underscored: true,
    }
  );

  User.associate = (db) => {
    User.hasMany(db.Announcement, { foreignKey: 'author_id', as: 'announcements' });
    User.hasMany(db.Comment, { foreignKey: 'author_id', as: 'comments' });
    User.hasMany(db.Resource, { foreignKey: 'author_id', as: 'resources' });
    User.hasMany(db.Notification, { foreignKey: 'user_id', as: 'notifications' });
    User.hasMany(db.AnnouncementView, { foreignKey: 'user_id', as: 'views' });
    User.hasMany(db.LevelCorrectionRequest, { foreignKey: 'user_id', as: 'levelCorrectionRequests' });
  };

  return User;
};
