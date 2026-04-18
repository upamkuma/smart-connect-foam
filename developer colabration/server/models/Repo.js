const mongoose = require("mongoose");

const repoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isPublic: {
      type: Boolean,
      default: true,
    },
    files: [
      {
        path: { type: String, required: true }, // e.g., "src/index.js" or "README.md"
        content: { type: String, default: "" },
      },
    ],
    commits: [
      {
        message: { type: String, required: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        timestamp: { type: Date, default: Date.now },
        filesSnapshot: [
          {
            path: String,
            content: String,
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Repo", repoSchema);
