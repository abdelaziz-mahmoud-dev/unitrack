const express = require("express");
const controller = require("../controllers/application.controller");
const validate = require("../middlewares/validate");
const protect = require("../middlewares/auth");
const documentRoutes = require("./document.routes");
const {
  createApplicationSchema,
  updateApplicationSchema,
} = require("../validations/application.validation");

const router = express.Router();

router.use(protect);
router.use("/:id/documents", documentRoutes);

router.post("/", validate(createApplicationSchema), controller.create);
router.get("/", controller.list);
router.get("/:id", controller.getOne);
router.patch("/:id", validate(updateApplicationSchema), controller.update);
router.delete("/:id", controller.remove);

module.exports = router;