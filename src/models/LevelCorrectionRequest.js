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
        type: DataTypes.ENUM('100', '200', '300', '400'),
        allowNull: false,
      },
      requested_level: {
        type: DataTypes.ENUM('100', '200', '300', '400'),
        allowNull: false,
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
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
    }
  );

  LevelCorrectionRequest.associate = (db) => {
    LevelCorrectionRequest.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
    LevelCorrectionRequest.belongsTo(db.User, { foreignKey: 'actioned_by', as: 'actionedBy' });
  };

  return LevelCorrectionRequest;
};
