const express = require("express");
const router = express.Router();
const { sendContactMessage } = require("../controllers/contact");

// Public route
router.post("/", sendContactMessage);

module.exports = router; 