const mongoose = require("mongoose");
const Application = require("../models/Application");
const AppError = require("../utils/AppError");

const findApplication = async (ownerId, applicationId) => {
  if (!mongoose.isValidObjectId(applicationId)) {
    throw new AppError("Invalid application id", 400);
  }
  const application = await Application.findOne({
    _id: applicationId,
    owner: ownerId,
  });
  if (!application) throw new AppError("Application not found", 404);
  return application;
};

const findDocument = (application, docId) => {
  if (!mongoose.isValidObjectId(docId)) {
    throw new AppError("Invalid document id", 400);
  }
  const doc = application.documents.id(docId);
  if (!doc) throw new AppError("Document not found", 404);
  return doc;
};

const add = async (ownerId, applicationId, data) => {
  const application = await findApplication(ownerId, applicationId);
  application.documents.push(data);
  await application.save();
  return application;
};

const update = async (ownerId, applicationId, docId, data) => {
  const application = await findApplication(ownerId, applicationId);
  const doc = findDocument(application, docId);
  doc.set(data);
  await application.save();
  return application;
};

const remove = async (ownerId, applicationId, docId) => {
  const application = await findApplication(ownerId, applicationId);
  findDocument(application, docId); // بيتأكد إنه موجود قبل المسح
  application.documents.pull({ _id: docId });
  await application.save();
  return application;
};

module.exports = { add, update, remove };