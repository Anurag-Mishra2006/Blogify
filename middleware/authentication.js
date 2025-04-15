const { validateToken } = require("../services/authentication");

function checkForAuthenticationCookie(cookieName) {
  return (req, res, next) => {
    const tokenCookieValue = req.cookies[cookieName];

    if (!tokenCookieValue) return next(); // No token, continue normally

    try {
      const userPayload = validateToken(tokenCookieValue);
      req.user = userPayload;
      return next(); // Only call next once
    } catch (error) {
      console.error("Invalid token:", error.message);
      req.user = null;
      return next(); // Safe fallback if token is invalid
    }
  };
}

module.exports = {
  checkForAuthenticationCookie,
};
