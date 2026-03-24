const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const Announcement = sequelize.define(
    'Announcement',
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
      body: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      category: {
        type: DataTypes.ENUM('general', 'assignment', 'exams'),
        allowNull: false,
        defaultValue: 'general',
      },
      program: {
        type: DataTypes.ENUM('Bsc. Computer Science', 'Bsc. Information Technology'),
        allowNull: false,
      },
      level: {
        type: DataTypes.ENUM('100', '200', '300', '400'),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('draft', 'published', 'archived'),
        allowNull: false,
        defaultValue: 'draft',
      },
      is_pinned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      pinned_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      deadline: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      useful_links: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of { label: string, url: string }',
      },
      view_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      tableName: 'announcements',
      underscored: true,
    }
  );

  Announcement.associate = (db) => {
    Announcement.belongsTo(db.User, { foreignKey: 'author_id', as: 'author' });
    Announcement.hasMany(db.Attachment, { foreignKey: 'announcement_id', as: 'attachments' });
    Announcement.hasMany(db.Comment, { foreignKey: 'announcement_id', as: 'comments' });
    Announcement.hasMany(db.AnnouncementView, { foreignKey: 'announcement_id', as: 'views' });
  };

  return Announcement;
};
