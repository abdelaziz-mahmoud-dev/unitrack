const { z } = require("zod");

const addDocumentSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  note: z.string().trim().max(500).optional(),
});

const updateDocumentSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    done: z.boolean(),
    note: z.string().trim().max(500),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

module.exports = { addDocumentSchema, updateDocumentSchema };