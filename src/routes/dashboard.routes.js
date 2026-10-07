const express = require("express");
const controller = require("../controllers/dashboard.controller");
const protect = require("../middlewares/auth");

const router = express.Router();

router.get("/", protect, controller.getStats);

module.exports = router;