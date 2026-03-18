const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const Attachment = sequelize.define(
    'Attachment',
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
      file_url: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      file_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      file_type: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      file_size: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Size in bytes',
      },
      public_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Cloudinary public_id for deletion',
      },
    },
    {
      tableName: 'attachments',
      underscored: true,
    }
  );

  Attachment.associate = (db) => {
    Attachment.belongsTo(db.Announcement, { foreignKey: 'announcement_id', as: 'announcement' });
  };

  return Attachment;
};
