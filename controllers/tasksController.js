const Task = require("../models/Task");
const handleErrors = require("../util/parseValidationErr");
const { JSDOM } = require("jsdom");
const DOMPurify = require("dompurify")(new JSDOM("").window);

const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.render("tasks", { tasks, title: "My Tasks" });
  } catch (error) {
    req.flash("error", "Could not load tasks");
    res.redirect("/");
  }
};

const getNewTask = (req, res) => {
  const isPrivate = req.query.private === "true"; 

  res.render("taskForm", {
    title: "New Task",
    task: null,
    isEdit: false,
    isPrivate,              
    csrfToken: req.csrfToken(),
  });
};


const addTask = async (req, res) => {
  try {
    const sanitizedSensitive = req.body.sensitiveInfo
      ? DOMPurify.sanitize(req.body.sensitiveInfo)
      : "";

    await Task.create({
      title:         req.body.title,
      description:   req.body.description,
      category:      req.body.category,
      status:        req.body.status || "todo",
      dueDate:       req.body.dueDate || undefined,
      sensitiveInfo: sanitizedSensitive,
      isPrivate:     req.body.isPrivate === "true", 
      createdBy:     req.user._id,
    });

    req.flash("success", "Task added successfully!");
    res.redirect("/tasks");
  } catch (error) {
    if (error.name === "ValidationError") {
      handleErrors(error, req);
    } else {
      req.flash("error", error.message || "Could not add task");
    }
    return res.render("taskForm", {
      task: null,
      title: "Add New Task",
      csrfToken: req.csrfToken()
    });
  }
};

const editTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!task) {
      req.flash("error", "Task not found or access denied");
      return res.redirect("/tasks");
    }
    res.render("taskForm", { task, title: "Edit Task", csrfToken: req.csrfToken() });
  } catch (error) {
    req.flash("error", "Could not load task");
    res.redirect("/tasks");
  }
};

const updateTask = async (req, res) => {
  try {
    if (req.body.sensitiveInfo) {
      req.body.sensitiveInfo = DOMPurify.sanitize(req.body.sensitiveInfo);
    }

    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      {
        title:         req.body.title,
        description:   req.body.description,
        category:      req.body.category,
        status:        req.body.status,
        dueDate:       req.body.dueDate || undefined,
        sensitiveInfo: req.body.sensitiveInfo,
        isPrivate:     req.body.isPrivate === "true", // ✅
      },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      req.flash("error", "Task not found");
      return res.redirect("/tasks");
    }

    req.flash("success", "Task updated!");
    res.redirect("/tasks");
  } catch (error) {
    if (error.name === "ValidationError") {
      handleErrors(error, req);
    } else {
      req.flash("error", error.message || "Could not update task");
    }
    res.redirect("/tasks/edit/" + req.params.id);
  }
};

const deleteTask = async (req, res) => {
  try {
    const deleted = await Task.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id
    });
    if (!deleted) {
      req.flash("error", "Task not found");
      return res.redirect("/tasks");
    }
    req.flash("success", "Task deleted!");
    res.redirect("/tasks");
  } catch (error) {
    req.flash("error", error.message || "Could not delete task");
    res.redirect("/tasks");
  }
};

module.exports = { getTasks, getNewTask, addTask, editTask, updateTask, deleteTask };
