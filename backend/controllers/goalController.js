const asyncHandler = require("express-async-handler");

const getGoals = asyncHandler(async (req, res) => {
  res.json({ message: "Get goals" });
});

module.exports = {
  getGoals,
};
