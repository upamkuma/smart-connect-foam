require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIo = require("socket.io");
const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const repoRoutes = require("./routes/repoRoutes");
const userRoutes = require("./routes/userRoutes");
// Models
const Repo = require("./models/Repo");
const Message = require("./models/Message");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Backend is running"));
app.use("/api/auth", authRoutes);
app.use("/api/repos", repoRoutes);
app.use("/api/users", userRoutes);

// Socket.IO logic
io.on("connection", (socket) => {
  console.log("New client connected", socket.id);

  socket.on("join-repo", (repoId) => {
    socket.join(repoId);
    console.log(`Socket ${socket.id} joined repo ${repoId}`);
  });

  socket.on("code-change", async ({ repoId, path, content }) => {
    // broadcast to others
    socket.to(repoId).emit("code-update", { path, content });
    
    // Auto-save to DB periodically or instantly
    try {
      const repo = await Repo.findById(repoId);
      if (repo) {
        const fileIndex = repo.files.findIndex(f => f.path === path);
        if (fileIndex > -1) {
          repo.files[fileIndex].content = content;
        } else {
          repo.files.push({ path, content });
        }
        await repo.save();
      }
    } catch (err) {
      console.error("Code change save error", err);
    }
  });

  socket.on("send-message", async ({ repoId, senderId, content }) => {
    try {
      const msg = await Message.create({ repo: repoId, sender: senderId, content });
      const populatedMsg = await msg.populate("sender", "username profilePicture");
      io.to(repoId).emit("receive-message", populatedMsg);
    } catch (err) {
      console.error("Message save error", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
