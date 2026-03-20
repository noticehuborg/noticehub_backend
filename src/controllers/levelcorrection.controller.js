const { LevelCorrectionRequest, User } = require('../models');

exports.getMyLevelCorrections = async (req, res, next) => {
  try {
    const requests = await LevelCorrectionRequest.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'actionedBy',
          attributes: ['id', 'full_name'],
        },
      ],
    });

    res.json({
      success: true,
      data: requests,
    });
  } catch (err) {
    next(err);
  }
};