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

      // remove posted_by
// add author_id instead
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
        type: DataTypes.ENUM('telegram', 'drive', 'youtube', 'file'),
        allowNull: false,
      },

      url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      file_url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      file_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      file_size_bytes: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },

      public_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      program: {
        type: DataTypes.ENUM(
          'Bsc. Computer Science',
          'Bsc. Information Technology'
        ),
        allowNull: true,
      },

      level: {
        type: DataTypes.INTEGER,
        allowNull: true, // NULL = all levels
      },
    },
    {
      tableName: 'resources',
      underscored: true,
      timestamps: true, // ✅ REQUIRED
    }
  );

  Resource.associate = (db) => {
    Resource.belongsTo(db.User, {
      foreignKey: 'author_id',
      as: 'author',
    });
  };

  return Resource;
};