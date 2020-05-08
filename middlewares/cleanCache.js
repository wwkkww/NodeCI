const { clearHash } = require('../services/cache');

module.exports = async (req, res, next) => {
  // issue: need to run after the route handler finish create post
  // use await to let route handler finish the task first
  await next();

  // run after route handler finish their task
  clearHash(req.user.id);
}