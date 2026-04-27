const router = require("express").Router();

router.post("/", (req, res) => {
  const topic = req.body.topic?.trim();
  const level = req.body.level?.trim() || "Beginner";

  if (!topic) {
    return res.status(400).json({ message: "Topic is required" });
  }

  res.json({
    topic,
    level,
    courses: [
      { title: `${topic} Fundamentals`, level: "Beginner" },
      { title: `${topic} Practical Bootcamp`, level },
      { title: `${topic} Advanced Projects`, level: "Advanced" }
    ]
  });
});

module.exports = router;