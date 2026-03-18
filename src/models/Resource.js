const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const Resource = sequelize.define(
    'Resource',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true,
      },
      author_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      type: {
        type: DataTypes.ENUM('telegram', 'google_drive', 'youtube', 'file'),
        allowNull: false,
      },
      url: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'For link-type resources',
      },
      file_url: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'For file-type resources (Cloudinary URL)',
      },
      public_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Cloudinary public_id for deletion',
      },
      program: {
        type: DataTypes.ENUM('Bsc. Computer Science', 'Bsc. Information Technology'),
        allowNull: false,
      },
      level: {
        type: DataTypes.ENUM('100', '200', '300', '400'),
        allowNull: false,
      },
    },
    {
      tableName: 'resources',
      underscored: true,
    }
  );

  Resource.associate = (db) => {
    Resource.belongsTo(db.User, { foreignKey: 'author_id', as: 'author' });
  };

  return Resource;
};
