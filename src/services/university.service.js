const mongoose = require("mongoose");
const University = require("../models/University");
const AppError = require("../utils/AppError");

const checkId = (id) => {
  if (!mongoose.isValidObjectId(id)) throw new AppError("Invalid id", 400);
};

const create = (ownerId, data) => University.create({ ...data, owner: ownerId });

const list = (ownerId) => University.find({ owner: ownerId }).sort({ deadline: 1 });

const getOne = async (ownerId, id) => {
  checkId(id);
  const university = await University.findOne({ _id: id, owner: ownerId });
  if (!university) throw new AppError("University not found", 404);
  return university;
};

const update = async (ownerId, id, data) => {
  checkId(id);
  const university = await University.findOneAndUpdate(
    { _id: id, owner: ownerId },
    data,
    { new: true, runValidators: true }
  );
  if (!university) throw new AppError("University not found", 404);
  return university;
};

const remove = async (ownerId, id) => {
  checkId(id);
  const university = await University.findOneAndDelete({ _id: id, owner: ownerId });
  if (!university) throw new AppError("University not found", 404);
};

module.exports = { create, list, getOne, update, remove };