const User = require("../models/User");
const parseVErr = require("../util/parseValidationErr");

const registerShow = (req, res) => {
  res.render("register", {
    title: "Register",
    errors: req.flash("error"),
    info: req.flash("info"),
    csrfToken: req.csrfToken()
  });
};

const registerDo = async (req, res, next) => {
  const { password, password1 } = req.body;

  if (password !== password1) {
    req.flash("error", "Passwords do not match.");
    return res.render("register", {
      title: "Register",
      errors: req.flash("error"),
      info: req.flash("info"),
      csrfToken: req.csrfToken()
    });
  }

  try {
    await User.create(req.body);
    req.flash("info", "User registered successfully.");
    res.redirect("/sessions/logon");
  } catch (e) {
    if (e.constructor.name === "ValidationError") {
      parseVErr(e, req);
    } else if (e.code === 11000) {
      req.flash("error", "Email already exists.");
    } else {
      return next(e);
    }

    res.render("register", {
      title: "Register",
      errors: req.flash("error"),
      info: req.flash("info"),
      csrfToken: req.csrfToken()
    });
  }
};

const logonShow = (req, res) => {
  if (req.user) return res.redirect("/");
  res.render("logon", {
    title: "Logon",
    errors: req.flash("error"),
    info: req.flash("info"),
    csrfToken: req.csrfToken()
  });
};

const logoff = (req, res) => {
  req.logout(() => {
    req.flash("info", "Logged out successfully.");
    res.redirect("/");
  });
};

module.exports = { registerShow, registerDo, logonShow, logoff };



module.exports = {
  registerShow,
  registerDo,
  logonShow,
  logoff
};
