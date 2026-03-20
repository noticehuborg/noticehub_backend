const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const LevelCorrectionRequest = sequelize.define(
    'LevelCorrectionRequest',
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

      current_level: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      requested_level: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      reason: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
      },

      admin_note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      actioned_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        comment: 'Admin who approved/rejected',
      },

      actioned_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'level_correction_requests',
      underscored: true,
      timestamps: true, // ✅ REQUIRED
    }
  );

  LevelCorrectionRequest.associate = (db) => {
    LevelCorrectionRequest.belongsTo(db.User, {
      foreignKey: 'user_id',
      as: 'user',
    });

    LevelCorrectionRequest.belongsTo(db.User, {
      foreignKey: 'actioned_by',
      as: 'actionedBy',
    });
  };

  return LevelCorrectionRequest;
};