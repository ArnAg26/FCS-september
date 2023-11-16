const setRateLimit = require("express-rate-limit");

// Rate limit middleware
const rateLimitMiddleware = setRateLimit({
  windowMs: 60 * 1000*5,
  max: 100,
  message: "You have exceeded your 100 requests in 5 mins.",
  headers: true,
});

module.exports = rateLimitMiddleware;