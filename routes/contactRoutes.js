const express = require("express");
const multer = require("multer");
const router = express.Router();
const { submitContact } = require("../controllers/contactController");

const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), submitContact);

module.exports = router;
