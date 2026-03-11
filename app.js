require("dotenv").config();
const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const bodyParser = require("body-parser");
const path = require("path");
const passport = require("passport");
const helmet = require("helmet");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const csrfProtection = csrf();



const connectDB = require("./db/connect");
const passportInit = require("./passport/passportInit");
const auth = require("./middleware/auth");
const storeLocals = require("./middleware/storeLocals");


const sessionRoutes = require("./routes/sessionRoutes");
const taskRoutes = require("./routes/tasks");
const sensitiveRouter = require("./routes/sensitive"); 
const profileRouter = require("./routes/profileRoutes");

const app = express();

connectDB(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));


app.use(
  helmet({
    contentSecurityPolicy: false
  })
);


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: "mySessions",
});


app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(flash());

app.use(csrfProtection);

app.use((req, res, next) => {
  try {
    res.locals.csrfToken = req.csrfToken();
  } catch (err) {
    res.locals.csrfToken = "";
  }
  next();
});


passportInit();
app.use(passport.initialize());
app.use(passport.session());


app.use(storeLocals);


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


app.use(express.static(path.join(__dirname, "public")));


app.get("/", (req, res) => {
  res.render("index", { title: "Home" });
});

app.use("/sessions", sessionRoutes);
app.use("/tasks", taskRoutes); 
app.use("/sensitive", auth, sensitiveRouter);
app.use("/profile", auth, profileRouter);



app.use((req, res) => {
  res.status(404).render("404", { title: "Page Not Found" });
});


app.use((err, req, res, next) => {
  console.error(err);
  req.flash("error", err.message || "Something went wrong");
  res.status(500).redirect("/");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));