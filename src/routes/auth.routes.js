const express = require("express");
const controller = require("../controllers/auth.controller");
const validate = require("../middlewares/validate");
const protect = require("../middlewares/auth");
const { registerSchema, loginSchema } = require("../validations/auth.validation");

const router = express.Router();

router.post("/register", validate(registerSchema), controller.register);
router.post("/login", validate(loginSchema), controller.login);
router.get("/me", protect, controller.me);

module.exports = router;