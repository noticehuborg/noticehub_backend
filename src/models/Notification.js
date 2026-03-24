const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    'Notification',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      type: {
        type: DataTypes.ENUM('new_announcement', 'deadline_warning', 'comment_reply', 'welcome', 'level_progressed'),
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      reference_id: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: 'ID of the announcement or comment that triggered the notification',
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'notifications',
      underscored: true,
    }
  );

  Notification.associate = (db) => {
    Notification.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
  };

  return Notification;
};
