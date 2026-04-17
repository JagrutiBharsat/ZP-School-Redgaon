const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected ✅");

    // Drop stale email_1 unique index from students collection if it exists.
    // This was left over from an older schema version that had email as unique.
    try {
      const db = mongoose.connection.db;
      const indexes = await db.collection("students").indexes();
      const hasEmailIndex = indexes.some(idx => idx.name === "email_1");
      if (hasEmailIndex) {
        await db.collection("students").dropIndex("email_1");
        console.log("Dropped stale email_1 index from students ✅");
      }
    } catch (indexErr) {
      // Index may not exist — safe to ignore
    }

  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
