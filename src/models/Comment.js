const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define(
    'Comment',
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
      author_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      parent_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'comments', key: 'id' },
        onDelete: 'CASCADE',
        comment: 'NULL = top-level comment; non-null = reply',
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          len: [1, 1000],
        },
      },
    },
    {
      tableName: 'comments',
      underscored: true,
      timestamps: true, // ✅ REQUIRED
    }
  );

  Comment.associate = (db) => {
    Comment.belongsTo(db.Announcement, {
      foreignKey: 'announcement_id',
      as: 'announcement',
    });

    Comment.belongsTo(db.User, {
      foreignKey: 'author_id',
      as: 'author',
    });

    Comment.belongsTo(db.Comment, {
      foreignKey: 'parent_id',
      as: 'parent',
    });

    Comment.hasMany(db.Comment, {
      foreignKey: 'parent_id',
      as: 'replies',
      onDelete: 'CASCADE', // ✅ IMPORTANT
    });
  };

  return Comment;
};