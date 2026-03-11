const express = require("express");
const passport = require("passport");
const router = express.Router();

const {
  registerShow,
  registerDo,
  logonShow,
  logoff
} = require("../controllers/sessionController");


router.get("/register", registerShow);
router.post("/register", registerDo);


router.get("/logon", logonShow);

router.post("/logon", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      req.flash("error", info?.message || "Invalid credentials");
      return res.redirect("/sessions/logon");
    }

    req.logIn(user, (err) => {
      if (err) return next(err);

      req.session.save((saveErr) => {
        if (saveErr) return next(saveErr);
        return res.redirect("/tasks");
      });
    });

  })(req, res, next);
});

router.post("/logoff", logoff);

module.exports = router;

