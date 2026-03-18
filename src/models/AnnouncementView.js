const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const AnnouncementView = sequelize.define(
    'AnnouncementView',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true,
      },
      announcement_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'announcements', key: 'id' },
        onDelete: 'CASCADE',
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
    },
    {
      tableName: 'announcement_views',
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['announcement_id', 'user_id'],
        },
      ],
    }
  );

  AnnouncementView.associate = (db) => {
    AnnouncementView.belongsTo(db.Announcement, { foreignKey: 'announcement_id', as: 'announcement' });
    AnnouncementView.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
  };

  return AnnouncementView;
};
