const express = require("express");
const controller = require("../controllers/document.controller");
const validate = require("../middlewares/validate");
const {
  addDocumentSchema,
  updateDocumentSchema,
} = require("../validations/document.validation");

// mergeParams: عشان نقدر نقرأ :id بتاع الـ application من الـ router الأب
const router = express.Router({ mergeParams: true });

router.post("/", validate(addDocumentSchema), controller.add);
router.patch("/:docId", validate(updateDocumentSchema), controller.update);
router.delete("/:docId", controller.remove);

module.exports = router;