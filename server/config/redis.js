const { createClient } = require("redis");

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

let redisClient = null;

async function connectRedis() {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  redisClient = createClient({
    url: REDIS_URL,
    socket: {
      connectTimeout: 1000,
      reconnectStrategy: () => false
    }
  });

  redisClient.on("error", (error) => {
    console.error("Redis error:", error.message);
  });

  try {
    await redisClient.connect();
    console.log("Redis connected");
  } catch (error) {
    console.warn("Redis unavailable, continuing without cache:", error.message);
    redisClient = null;
  }

  return redisClient;
}

function getRedisClient() {
  return redisClient;
}

module.exports = {
  connectRedis,
  getRedisClient
};
