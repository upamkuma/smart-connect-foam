const Repo = require("../models/Repo");
const User = require("../models/User");

exports.createRepo = async (req, res) => {
  const { name, description, isPublic } = req.body;
  try {
    const repo = await Repo.create({
      name,
      description,
      isPublic: isPublic !== undefined ? isPublic : true,
      owner: req.user._id,
      files: [{ path: "README.md", content: `# ${name}\n\n${description}` }],
    });
    res.status(201).json(repo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserRepos = async (req, res) => {
  try {
    const repos = await Repo.find({ owner: req.user._id }).populate("owner", "username email");
    const collabRepos = await Repo.find({ collaborators: req.user._id }).populate("owner", "username email");
    res.json({ owned: repos, collaborated: collabRepos });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRepoById = async (req, res) => {
  try {
    const repo = await Repo.findById(req.params.id)
      .populate("owner", "username email")
      .populate("collaborators", "username email");
    if (!repo) return res.status(404).json({ message: "Repo not found" });

    // Check access
    if (
      !repo.isPublic &&
      repo.owner._id.toString() !== req.user._id.toString() &&
      !repo.collaborators.find((c) => c._id.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(repo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRepo = async (req, res) => {
  try {
    const repo = await Repo.findById(req.params.id);
    if (!repo) return res.status(404).json({ message: "Repo not found" });

    if (repo.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only owner can update" });
    }

    const { name, description, isPublic } = req.body;
    if (name !== undefined) repo.name = name;
    if (description !== undefined) repo.description = description;
    if (isPublic !== undefined) repo.isPublic = isPublic;

    const updatedRepo = await repo.save();
    res.json(updatedRepo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteRepo = async (req, res) => {
  try {
    const repo = await Repo.findById(req.params.id);
    if (!repo) return res.status(404).json({ message: "Repo not found" });

    if (repo.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only owner can delete" });
    }

    await Repo.findByIdAndDelete(req.params.id);
    res.json({ message: "Repo removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addCollaborator = async (req, res) => {
  try {
    const { collaboratorId } = req.body;
    const repo = await Repo.findById(req.params.id);

    if (!repo) return res.status(404).json({ message: "Repo not found" });
    if (repo.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only owner can add collaborators" });
    }

    if (!repo.collaborators.includes(collaboratorId)) {
      repo.collaborators.push(collaboratorId);
      await repo.save();
    }

    res.json(repo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const Message = require("../models/Message");
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ repo: req.params.id })
      .populate("sender", "username profilePicture")
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

