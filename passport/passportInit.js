const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/User");

const passportInit = () => {
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          console.log("🔍 LOGIN ATTEMPT:", email);

          const user = await User.findOne({ email });

          if (!user) {
            console.log("❌ User not found");
            return done(null, false, { message: "Incorrect credentials." });
          }

          const match = await user.comparePassword(password);
          console.log("🔐 Password match:", match);

          if (!match) {
            return done(null, false, { message: "Incorrect credentials." });
          }

          console.log("✅ Login success:", user.email);
          done(null, user);
        } catch (err) {
          console.error("🚨 Passport error:", err);
          done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    console.log("📦 Serialize user:", user.id);
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      console.log("📬 Deserialize id:", id);
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};

module.exports = passportInit;
