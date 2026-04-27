const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  course_id: {
    type: String,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  instructor: {
    type: String,
    trim: true
  },
  duration: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Course", courseSchema);