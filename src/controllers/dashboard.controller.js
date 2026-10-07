const dashboardService = require("../services/dashboard.service");

const getStats = async (req, res) => {
  const stats = await dashboardService.getStats(req.user._id);
  res.json(stats);
};

module.exports = { getStats };