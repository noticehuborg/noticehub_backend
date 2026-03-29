const { v4: uuidv4 } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const Program = sequelize.define(
    'Program',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: () => uuidv4(),
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        comment: 'Full program name used as the canonical value, e.g. "Bsc. Computer Science"',
      },
      short_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Short display label shown in the UI, e.g. "Computer Science"',
      },
      max_level: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 400,
        comment: 'Highest valid level for this program in multiples of 100 (e.g. 400, 500, 600)',
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Inactive programs are hidden from the registration dropdown',
      },
    },
    {
      tableName: 'programs',
      underscored: true,
    }
  );

  return Program;
};
