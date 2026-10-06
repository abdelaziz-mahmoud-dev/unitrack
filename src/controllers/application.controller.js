const applicationService = require("../services/application.service");

const create = async (req, res) => {
  const application = await applicationService.create(req.user._id, req.body);
  res.status(201).json(application);
};

const list = async (req, res) => {
  const applications = await applicationService.list(req.user._id, req.query.status);
  res.json(applications);
};

const getOne = async (req, res) => {
  const application = await applicationService.getOne(req.user._id, req.params.id);
  res.json(application);
};

const update = async (req, res) => {
  const application = await applicationService.update(
    req.user._id,
    req.params.id,
    req.body
  );
  res.json(application);
};

const remove = async (req, res) => {
  await applicationService.remove(req.user._id, req.params.id);
  res.status(204).send();
};

module.exports = { create, list, getOne, update, remove };