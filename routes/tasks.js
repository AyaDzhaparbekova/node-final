const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getTasks,
  getNewTask,
  addTask,
  editTask,
  updateTask,
  deleteTask
} = require("../controllers/tasksController");


router.use((req, res, next) => {
  console.log("TASK ROUTE HIT:", req.path, req.method, "USER:", req.user ? req.user.email : "NO USER");
  next();
});

router.use(auth);

router.get("/", getTasks);
router.get("/new", getNewTask);
router.post("/", addTask);
router.get("/edit/:id", editTask);
router.post("/update/:id", updateTask);
router.post("/delete/:id", deleteTask);

module.exports = router;