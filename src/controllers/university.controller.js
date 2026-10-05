const universityService = require("../services/university.service");

const create = async (req, res) => {
  const university = await universityService.create(req.user._id, req.body);
  res.status(201).json(university);
};

const list = async (req, res) => {
  const universities = await universityService.list(req.user._id);
  res.json(universities);
};

const getOne = async (req, res) => {
  const university = await universityService.getOne(req.user._id, req.params.id);
  res.json(university);
};

const update = async (req, res) => {
  const university = await universityService.update(
    req.user._id,
    req.params.id,
    req.body
  );
  res.json(university);
};

const remove = async (req, res) => {
  await universityService.remove(req.user._id, req.params.id);
  res.status(204).send();
};

module.exports = { create, list, getOne, update, remove };