const APPLICATION_STATUSES = [
  "planned",
  "preparing",
  "submitted",
  "accepted",
  "rejected",
];

// كل status يقدر يروح لأنهي status
const STATUS_TRANSITIONS = {
  planned: ["preparing"],
  preparing: ["planned", "submitted"],
  submitted: ["accepted", "rejected"],
  accepted: [],
  rejected: [],
};

module.exports = { APPLICATION_STATUSES, STATUS_TRANSITIONS };