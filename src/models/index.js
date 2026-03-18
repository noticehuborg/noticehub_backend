const { Sequelize } = require('sequelize');
const dbConfig = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require('./User')(sequelize, Sequelize.DataTypes);
db.Announcement = require('./Announcement')(sequelize, Sequelize.DataTypes);
db.Attachment = require('./Attachment')(sequelize, Sequelize.DataTypes);
db.Comment = require('./Comment')(sequelize, Sequelize.DataTypes);
db.Resource = require('./Resource')(sequelize, Sequelize.DataTypes);
db.Notification = require('./Notification')(sequelize, Sequelize.DataTypes);
db.AnnouncementView = require('./AnnouncementView')(sequelize, Sequelize.DataTypes);
db.LevelCorrectionRequest = require('./LevelCorrectionRequest')(sequelize, Sequelize.DataTypes);

// Run associations
Object.values(db).forEach((model) => {
  if (model.associate) model.associate(db);
});

module.exports = db;
