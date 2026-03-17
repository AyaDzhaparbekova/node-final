const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title:       { type: String, required: true, maxlength: 100 },
  description: { type: String, maxlength: 500 },
  category: {
    type: String,
    enum: ["doctor", "club", "sport", "homework", "other"],
    default: "other"
  },
  status: {
    type: String,
    enum: ["todo", "in progress", "done"],
    default: "todo"
  },
  dueDate:      { type: Date },
  sensitiveInfo:{ type: String, maxlength: 200 },
  isPrivate:    { type: Boolean, default: false },
  createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt:    { type: Date, default: Date.now },
});

module.exports = mongoose.model("Task", taskSchema);