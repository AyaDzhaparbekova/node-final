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

let mongoURL = process.env.MONGO_URI;
if (process.env.NODE_ENV == "test") {
  mongoURL = process.env.MONGO_URI_TEST;
}


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

app.use((req, res, next) => {
  if (req.path == "/multiply") {
    res.set("Content-Type", "application/json");
  } else {
    res.set("Content-Type", "text/html");
  }
  next();
});

app.use("/sessions", sessionRoutes);
app.use("/tasks", taskRoutes); 
app.use("/sensitive", auth, sensitiveRouter);
app.use("/profile", auth, profileRouter);

app.get("/multiply", (req, res) => {
  const result = req.query.first * req.query.second;
  res.json({ result: result });
});


app.use((req, res) => {
  res.status(404).render("404", { title: "Page Not Found" });
});


app.use((err, req, res, next) => {
  console.error(err);
  req.flash("error", err.message || "Something went wrong");
  res.status(500).redirect("/");
});

const port = process.env.PORT || 3000;
const start = () => {
  try {
    require("./db/connect")(mongoURL);
    return app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

if (require.main === module) {
  start(); 
}
module.exports = { app };