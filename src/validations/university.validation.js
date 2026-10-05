const { z } = require("zod");

const createUniversitySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  city: z.string().trim().min(2, "City must be at least 2 characters"),
  program: z.string().trim().min(2, "Program must be at least 2 characters"),
  deadline: z.coerce.date().optional(),
  website: z.string().trim().url("Invalid website URL").optional(),
});

const updateUniversitySchema = createUniversitySchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

module.exports = { createUniversitySchema, updateUniversitySchema };