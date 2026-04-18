const express = require("express");
const {
  createRepo,
  getUserRepos,
  getRepoById,
  updateRepo,
  deleteRepo,
  addCollaborator,
} = require("../controllers/repoController");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.route("/")
  .post(protect, createRepo)
  .get(protect, getUserRepos);

router.route("/:id")
  .get(protect, getRepoById)
  .put(protect, updateRepo)
  .delete(protect, deleteRepo);

router.post("/:id/collaborate", protect, addCollaborator);
router.get("/:id/messages", protect, require("../controllers/repoController").getMessages);

module.exports = router;
