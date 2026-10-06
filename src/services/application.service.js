const mongoose = require("mongoose");
const Application = require("../models/Application");
const University = require("../models/University");
const AppError = require("../utils/AppError");
const {
  APPLICATION_STATUSES,
  STATUS_TRANSITIONS,
} = require("../utils/constants");

const checkId = (id) => {
  if (!mongoose.isValidObjectId(id)) throw new AppError("Invalid id", 400);
};

const create = async (ownerId, { university, notes }) => {
  const owned = await University.exists({ _id: university, owner: ownerId });
  if (!owned) throw new AppError("University not found", 404);

  const duplicate = await Application.exists({ owner: ownerId, university });
  if (duplicate) {
    throw new AppError("You already have an application for this university", 409);
  }

  return Application.create({ university, notes, owner: ownerId });
};

const list = (ownerId, status) => {
  if (status && !APPLICATION_STATUSES.includes(status)) {
    throw new AppError(
      `Invalid status. Allowed: ${APPLICATION_STATUSES.join(", ")}`,
      400
    );
  }

  const filter = { owner: ownerId };
  if (status) filter.status = status;

  return Application.find(filter)
    .populate("university", "name city program deadline")
    .sort({ createdAt: -1 });
};

const getOne = async (ownerId, id) => {
  checkId(id);
  const application = await Application.findOne({ _id: id, owner: ownerId })
    .populate("university", "name city program deadline");
  if (!application) throw new AppError("Application not found", 404);
  return application;
};

const update = async (ownerId, id, data) => {
  checkId(id);
  const application = await Application.findOne({ _id: id, owner: ownerId });
  if (!application) throw new AppError("Application not found", 404);

  if (data.status && data.status !== application.status) {
    const allowed = STATUS_TRANSITIONS[application.status];
    if (!allowed.includes(data.status)) {
      throw new AppError(
        `Cannot move from "${application.status}" to "${data.status}"`,
        400
      );
    }
    if (data.status === "submitted" && !data.submittedAt) {
      data.submittedAt = new Date();
    }
  }

  Object.assign(application, data);
  await application.save();
  return application;
};

const remove = async (ownerId, id) => {
  checkId(id);
  const application = await Application.findOneAndDelete({ _id: id, owner: ownerId });
  if (!application) throw new AppError("Application not found", 404);
};

module.exports = { create, list, getOne, update, remove };