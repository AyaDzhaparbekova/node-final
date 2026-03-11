const auth = (req, res, next) => {
  if (!req.user) {
    req.flash("error", "You can't access that page before logon.");
    return res.redirect("/");
  }
  next();
};

module.exports = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "Please log in first");
    return res.redirect("/sessions/logon");
  }
  next();
};
