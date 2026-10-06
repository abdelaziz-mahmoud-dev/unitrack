const { z } = require("zod");
const { APPLICATION_STATUSES } = require("../utils/constants");

const createApplicationSchema = z.object({
  university: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid university id"),
  notes: z.string().trim().max(1000).optional(),
});

const updateApplicationSchema = z
  .object({
    status: z.enum(APPLICATION_STATUSES),
    notes: z.string().trim().max(1000),
    submittedAt: z.coerce.date(),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

module.exports = { createApplicationSchema, updateApplicationSchema };