const express = require("express");
const controller = require("../controllers/university.controller");
const validate = require("../middlewares/validate");
const protect = require("../middlewares/auth");
const {
  createUniversitySchema,
  updateUniversitySchema,
} = require("../validations/university.validation");

const router = express.Router();

router.use(protect); // كل الـ routes هنا محمية

router.post("/", validate(createUniversitySchema), controller.create);
router.get("/", controller.list);
router.get("/:id", controller.getOne);
router.patch("/:id", validate(updateUniversitySchema), controller.update);
router.delete("/:id", controller.remove);

module.exports = router;