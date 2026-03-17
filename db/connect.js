const mongoose = require("mongoose");

const connectDB = async (url) => {
  if (mongoose.connection.readyState >= 1) {
    return; 
  }
  return mongoose.connect(url);
};

module.exports = connectDB;
