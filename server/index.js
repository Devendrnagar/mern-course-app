require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const courseRoutes = require("./routes/course");
const aiRoutes = require("./routes/ai");
const authMiddleware = require("./middleware/auth");
const { connectRedis } = require("./config/redis");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mern-assignment";

app.use(express.json());
app.use(cors());

app.get("/health", (_req, res) => {
	res.json({ status: "ok" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/recommend", aiRoutes);
app.get("/api/admin", authMiddleware, (req, res) => {
  res.json({ message: "Welcome Admin", user: req.user });
});

async function startServer() {
	try {
		await mongoose.connect(MONGO_URI);
		await connectRedis();
		console.log("MongoDB connected");
		app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
	} catch (error) {
		console.error("Failed to start server:", error.message);
		process.exit(1);
	}
}

startServer();