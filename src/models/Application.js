const mongoose = require("mongoose");
const { APPLICATION_STATUSES } = require("../utils/constants");

const applicationSchema = new mongoose.Schema(
  {
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: "planned",
    },
    notes: { type: String, trim: true, maxlength: 1000 },
    submittedAt: { type: Date },
  },
  { timestamps: true }
);

// تقديم واحد بس لكل جامعة لكل يوزر
applicationSchema.index({ owner: 1, university: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);