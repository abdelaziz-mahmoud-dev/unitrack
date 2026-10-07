const Application = require("../models/Application");
const { APPLICATION_STATUSES } = require("../utils/constants");

const getStats = async (ownerId) => {
  const [result] = await Application.aggregate([
    { $match: { owner: ownerId } },
    {
      $facet: {
        // 1) عدد التقديمات في كل status
        byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],

        // 2) أقرب 5 deadlines للتقديمات اللي لسه متقدمتش
        upcoming: [
          { $match: { status: { $in: ["planned", "preparing"] } } },
          {
            $lookup: {
              from: "universities",
              localField: "university",
              foreignField: "_id",
              as: "university",
            },
          },
          { $unwind: "$university" },
          { $match: { "university.deadline": { $gte: new Date() } } },
          { $sort: { "university.deadline": 1 } },
          { $limit: 5 },
        ],

        // 3) إجمالي المستندات والمكتمل منها
        documents: [
          { $unwind: "$documents" },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              done: { $sum: { $cond: ["$documents.done", 1, 0] } },
            },
          },
        ],
      },
    },
  ]);

  // نبدأ بكل الـ statuses بصفر عشان يظهروا حتى لو مفيش تقديمات فيهم
  const byStatus = Object.fromEntries(APPLICATION_STATUSES.map((s) => [s, 0]));
  result.byStatus.forEach(({ _id, count }) => {
    byStatus[_id] = count;
  });

  const totalApplications = Object.values(byStatus).reduce((a, b) => a + b, 0);
  const docs = result.documents[0] || { done: 0, total: 0 };

  return {
    totalApplications,
    byStatus,
    upcomingDeadlines: result.upcoming.map((a) => ({
      applicationId: a._id,
      status: a.status,
      university: a.university.name,
      city: a.university.city,
      program: a.university.program,
      deadline: a.university.deadline,
    })),
    documents: { done: docs.done, total: docs.total },
  };
};

module.exports = { getStats };