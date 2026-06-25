import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import * as z from 'zod';

import {
  applicationTags,
  applications,
  subStages,
  tags,
} from '@/src/features/application/db/schema';

// Cross-field invariants (closed-state, resume scope) live in the DB CHECK constraints and
// the mutation actions that own those transitions.

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export const insertSubStageSchema = createInsertSchema(subStages, {
  name: (schema) => schema.trim().min(1).max(100),
  sortOrder: (schema) => schema.min(0),
});
export const updateSubStageSchema = createUpdateSchema(subStages, {
  name: (schema) => schema.trim().min(1).max(100),
  sortOrder: (schema) => schema.min(0),
});
export const selectSubStageSchema = createSelectSchema(subStages);

export const insertApplicationSchema = createInsertSchema(applications, {
  company: (schema) => schema.trim().min(1).max(200),
  role: (schema) => schema.trim().min(1).max(200),
  jdUrl: () => z.url(),
  location: (schema) => schema.max(200),
  salaryCurrency: (schema) => schema.max(8),
  salaryMin: (schema) => schema.positive(),
  salaryMax: (schema) => schema.positive(),
});
export const updateApplicationSchema = createUpdateSchema(applications, {
  company: (schema) => schema.trim().min(1).max(200),
  role: (schema) => schema.trim().min(1).max(200),
  jdUrl: () => z.url(),
  location: (schema) => schema.max(200),
  salaryCurrency: (schema) => schema.max(8),
  salaryMin: (schema) => schema.positive(),
  salaryMax: (schema) => schema.positive(),
});
export const selectApplicationSchema = createSelectSchema(applications);

export const insertTagSchema = createInsertSchema(tags, {
  name: (schema) => schema.trim().min(1).max(50),
  color: (schema) => schema.regex(HEX_COLOR),
});
export const updateTagSchema = createUpdateSchema(tags, {
  name: (schema) => schema.trim().min(1).max(50),
  color: (schema) => schema.regex(HEX_COLOR),
});
export const selectTagSchema = createSelectSchema(tags);

export const insertApplicationTagSchema = createInsertSchema(applicationTags);
export const updateApplicationTagSchema = createUpdateSchema(applicationTags);
export const selectApplicationTagSchema = createSelectSchema(applicationTags);

export type SubStageInsert = z.infer<typeof insertSubStageSchema>;
export type SubStageUpdate = z.infer<typeof updateSubStageSchema>;
export type SubStageSelect = z.infer<typeof selectSubStageSchema>;

export type ApplicationInsert = z.infer<typeof insertApplicationSchema>;
export type ApplicationUpdate = z.infer<typeof updateApplicationSchema>;
export type ApplicationSelect = z.infer<typeof selectApplicationSchema>;

export type TagInsert = z.infer<typeof insertTagSchema>;
export type TagUpdate = z.infer<typeof updateTagSchema>;
export type TagSelect = z.infer<typeof selectTagSchema>;

export type ApplicationTagInsert = z.infer<typeof insertApplicationTagSchema>;
export type ApplicationTagUpdate = z.infer<typeof updateApplicationTagSchema>;
export type ApplicationTagSelect = z.infer<typeof selectApplicationTagSchema>;
