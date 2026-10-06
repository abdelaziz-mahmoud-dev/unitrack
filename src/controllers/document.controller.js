const documentService = require("../services/document.service");

const add = async (req, res) => {
  const application = await documentService.add(
    req.user._id,
    req.params.id,
    req.body
  );
  res.status(201).json(application);
};

const update = async (req, res) => {
  const application = await documentService.update(
    req.user._id,
    req.params.id,
    req.params.docId,
    req.body
  );
  res.json(application);
};

const remove = async (req, res) => {
  const application = await documentService.remove(
    req.user._id,
    req.params.id,
    req.params.docId
  );
  res.json(application);
};

module.exports = { add, update, remove };