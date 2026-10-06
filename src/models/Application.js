const mongoose = require("mongoose");
const { APPLICATION_STATUSES } = require("../utils/constants");

// Subdocument: كل مستند مطلوب جوا التقديم
const documentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  done: { type: Boolean, default: false },
  note: { type: String, trim: true, maxlength: 500 },
});

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
    documents: [documentSchema],
  },
  { timestamps: true, toJSON: { virtuals: true }, id: false }
);

// حقل محسوب (مش متخزّن في الـ database)
applicationSchema.virtual("progress").get(function () {
  const total = this.documents.length;
  const done = this.documents.filter((d) => d.done).length;
  return { done, total };
});

// تقديم واحد بس لكل جامعة لكل يوزر
applicationSchema.index({ owner: 1, university: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);