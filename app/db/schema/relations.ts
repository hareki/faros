import { relations } from 'drizzle-orm';

import { activityLog } from '@/app/features/activity/db/schema';
import {
  applicationTags,
  applications,
  subStages,
  tags,
} from '@/app/features/application/db/schema';
import { accounts, sessions, users } from '@/app/features/auth/db/schema';
import { events } from '@/app/features/event/db/schema';
import { jobHunts } from '@/app/features/job-hunt/db/schema';
import {
  notificationRules,
  notifications,
  userNotificationPrefs,
} from '@/app/features/notification/db/schema';
import { resumes } from '@/app/features/resume/db/schema';

export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  jobHunts: many(jobHunts),
  subStages: many(subStages),
  tags: many(tags),
  resumes: many(resumes),
  notificationRules: many(notificationRules),
  notifications: many(notifications),
  notificationPrefs: one(userNotificationPrefs),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const jobHuntsRelations = relations(jobHunts, ({ one, many }) => ({
  user: one(users, { fields: [jobHunts.userId], references: [users.id] }),
  applications: many(applications),
}));

export const subStagesRelations = relations(subStages, ({ one, many }) => ({
  user: one(users, { fields: [subStages.userId], references: [users.id] }),
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one, many }) => ({
  jobHunt: one(jobHunts, { fields: [applications.jobHuntId], references: [jobHunts.id] }),
  subStage: one(subStages, { fields: [applications.subStageId], references: [subStages.id] }),
  // The resume selected for this application.
  resume: one(resumes, {
    fields: [applications.resumeId],
    references: [resumes.id],
    relationName: 'selectedResume',
  }),
  // One-off resumes scoped to this application (resumes.application_id = this app).
  scopedResumes: many(resumes, { relationName: 'scopedResume' }),
  applicationTags: many(applicationTags),
  events: many(events),
  activityLog: many(activityLog),
  notifications: many(notifications),
}));

export const tagsRelations = relations(tags, ({ one, many }) => ({
  user: one(users, { fields: [tags.userId], references: [users.id] }),
  applicationTags: many(applicationTags),
}));

export const applicationTagsRelations = relations(applicationTags, ({ one }) => ({
  application: one(applications, {
    fields: [applicationTags.applicationId],
    references: [applications.id],
  }),
  tag: one(tags, { fields: [applicationTags.tagId], references: [tags.id] }),
}));

export const resumesRelations = relations(resumes, ({ one, many }) => ({
  user: one(users, { fields: [resumes.userId], references: [users.id] }),
  // The application this one-off resume is scoped to.
  application: one(applications, {
    fields: [resumes.applicationId],
    references: [applications.id],
    relationName: 'scopedResume',
  }),
  // Applications that selected this resume.
  selectedByApplications: many(applications, { relationName: 'selectedResume' }),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  application: one(applications, {
    fields: [events.applicationId],
    references: [applications.id],
  }),
  notifications: many(notifications),
}));

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  application: one(applications, {
    fields: [activityLog.applicationId],
    references: [applications.id],
  }),
}));

export const notificationRulesRelations = relations(notificationRules, ({ one, many }) => ({
  user: one(users, { fields: [notificationRules.userId], references: [users.id] }),
  notifications: many(notifications),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
  rule: one(notificationRules, {
    fields: [notifications.ruleId],
    references: [notificationRules.id],
  }),
  application: one(applications, {
    fields: [notifications.applicationId],
    references: [applications.id],
  }),
  event: one(events, { fields: [notifications.eventId], references: [events.id] }),
}));

export const userNotificationPrefsRelations = relations(userNotificationPrefs, ({ one }) => ({
  user: one(users, { fields: [userNotificationPrefs.userId], references: [users.id] }),
}));
