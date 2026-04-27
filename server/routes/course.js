const router = require("express").Router();
const Course = require("../models/Course");
const fs = require("fs");
const csv = require("csv-parser");
const multer = require("multer");
const { getRedisClient } = require("../config/redis");
const authMiddleware = require("../middleware/auth");

const upload = multer({ dest: "uploads/" });
const COURSES_CACHE_KEY = "courses:all";

function normalizeCourseRow(data) {
  return {
    course_id: (data.course_id || data["Unique ID"] || "").trim(),
    title: (data.title || data["Course Name"] || "").trim(),
    description: (data.description || data["Overview/Description"] || "").trim(),
    category: (data.category || data["Discipline/Major"] || "").trim(),
    instructor: (data.instructor || data["Professor Name"] || "").trim(),
    duration: (data.duration || data["Duration (Months)"] || "").toString().trim()
  };
}

// Upload CSV
router.post("/upload", authMiddleware, upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "CSV file is required in field 'file'" });
  }

  const results = [];

  try {
    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("data", (data) => results.push(normalizeCourseRow(data)))
        .on("end", resolve)
        .on("error", reject);
    });

    if (results.length === 0) {
      return res.status(400).json({ message: "CSV file is empty" });
    }

    const validCourses = results.filter((course) => course.title);
    await Course.insertMany(validCourses);

    const redisClient = getRedisClient();
    if (redisClient && redisClient.isOpen) {
      await redisClient.del(COURSES_CACHE_KEY);
    }

    res.json({ message: "Courses uploaded successfully", count: validCourses.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } finally {
    await fs.promises.unlink(req.file.path).catch(() => {});
  }
});

// Get Courses
router.get("/", async (req, res) => {
  try {
    const redisClient = getRedisClient();

    if (redisClient && redisClient.isOpen) {
      const cachedCourses = await redisClient.get(COURSES_CACHE_KEY);
      if (cachedCourses) {
        return res.json({ source: "redis-cache", data: JSON.parse(cachedCourses) });
      }
    }

    const courses = await Course.find().sort({ createdAt: -1 });

    if (redisClient && redisClient.isOpen) {
      await redisClient.setEx(COURSES_CACHE_KEY, 300, JSON.stringify(courses));
    }

    res.json({ source: "mongodb", data: courses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single course by MongoDB id
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(course);
  } catch (error) {
    res.status(400).json({ message: "Invalid course id" });
  }
});

module.exports = router;