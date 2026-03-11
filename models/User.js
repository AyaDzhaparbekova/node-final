const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const ChildSchema = new mongoose.Schema({
  name:     { type: String, required: true, minlength: 2 },
  age:      { type: Number, default: null },
  doctor:   { type: String, default: "" },
  school:   { type: String, default: "" },
  contacts: { type: String, default: "" },
  sports:   { type: String, default: "" },
  notes:    { type: String, default: "" },
});

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: [true, "Please provide email"],
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide password"],
    minlength: 6,
  },
  sensitiveInfo: {
    doctor:   { type: String, default: "" },
    clubs:    { type: String, default: "" },
    homework: { type: String, default: "" },
    sports:   { type: String, default: "" },
  },
  children: [ChildSchema], 
});

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", UserSchema);
