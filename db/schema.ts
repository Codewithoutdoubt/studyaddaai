import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["student", "admin"]);
export const contentStatusEnum = pgEnum("content_status", ["draft", "published", "archived"]);
export const difficultyEnum = pgEnum("difficulty", ["easy", "medium", "hard"]);
export const mediaTypeEnum = pgEnum("media_type", ["image", "pdf", "video"]);
export const questionPriorityEnum = pgEnum("question_priority", ["one", "two", "three", "four", "five"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    role: userRoleEnum("role").notNull().default("student"),
    avatarKey: text("avatar_key"),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email), index("users_role_idx").on(table.role)],
);

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 255 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("password_reset_token_hash_unique").on(table.tokenHash), index("password_reset_user_idx").on(table.userId)],
);

export const branches = pgTable(
  "branches",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 160 }).notNull(),
    code: varchar("code", { length: 30 }).notNull(),
    slug: varchar("slug", { length: 180 }).notNull(),
    description: text("description").notNull().default(""),
    icon: varchar("icon", { length: 80 }),
    displayOrder: integer("display_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("branches_code_unique").on(table.code),
    uniqueIndex("branches_slug_unique").on(table.slug),
    index("branches_active_order_idx").on(table.isActive, table.displayOrder),
  ],
);

export const semesters = pgTable(
  "semesters",
  {
    id: serial("id").primaryKey(),
    branchId: integer("branch_id")
      .notNull()
      .references(() => branches.id, { onDelete: "cascade" }),
    semesterNumber: integer("semester_number").notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 140 }).notNull(),
    description: text("description").notNull().default(""),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("semesters_branch_number_unique").on(table.branchId, table.semesterNumber),
    uniqueIndex("semesters_branch_slug_unique").on(table.branchId, table.slug),
    index("semesters_branch_idx").on(table.branchId),
  ],
);

export const subjects = pgTable(
  "subjects",
  {
    id: serial("id").primaryKey(),
    semesterId: integer("semester_id")
      .notNull()
      .references(() => semesters.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 180 }).notNull(),
    code: varchar("code", { length: 40 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull(),
    description: text("description").notNull().default(""),
    coverImageKey: text("cover_image_key"),
    displayOrder: integer("display_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("subjects_semester_code_unique").on(table.semesterId, table.code),
    uniqueIndex("subjects_semester_slug_unique").on(table.semesterId, table.slug),
    index("subjects_semester_order_idx").on(table.semesterId, table.displayOrder),
  ],
);

export const units = pgTable(
  "units",
  {
    id: serial("id").primaryKey(),
    subjectId: integer("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    unitNumber: integer("unit_number").notNull(),
    title: varchar("title", { length: 180 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull(),
    overview: text("overview").notNull().default(""),
    displayOrder: integer("display_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("units_subject_number_unique").on(table.subjectId, table.unitNumber),
    uniqueIndex("units_subject_slug_unique").on(table.subjectId, table.slug),
    index("units_subject_order_idx").on(table.subjectId, table.displayOrder),
  ],
);

export const topics = pgTable(
  "topics",
  {
    id: serial("id").primaryKey(),
    unitId: integer("unit_id")
      .notNull()
      .references(() => units.id, { onDelete: "cascade" }),
    authorId: integer("author_id").references(() => users.id, { onDelete: "set null" }),
    title: varchar("title", { length: 220 }).notNull(),
    slug: varchar("slug", { length: 240 }).notNull(),
    summary: text("summary").notNull().default(""),
    definition: text("definition").notNull().default(""),
    explanation: text("explanation").notNull().default(""),
    diagram: text("diagram").notNull().default(""),
    examples: text("examples").notNull().default(""),
    advantages: text("advantages").notNull().default(""),
    disadvantages: text("disadvantages").notNull().default(""),
    applications: text("applications").notNull().default(""),
    interviewQuestions: text("interview_questions").notNull().default(""),
    examQuestions: text("exam_questions").notNull().default(""),
    revisionNotes: text("revision_notes").notNull().default(""),
    references: text("references").notNull().default(""),
    keywords: jsonb("keywords").notNull().default(sql`'[]'::jsonb`),
    difficulty: difficultyEnum("difficulty").notNull().default("medium"),
    status: contentStatusEnum("status").notNull().default("draft"),
    estimatedReadingMinutes: integer("estimated_reading_minutes").notNull().default(1),
    displayOrder: integer("display_order").notNull().default(0),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("topics_unit_slug_unique").on(table.unitId, table.slug),
    index("topics_unit_order_idx").on(table.unitId, table.displayOrder),
    index("topics_status_idx").on(table.status),
    index("topics_difficulty_idx").on(table.difficulty),
  ],
);

export const topicImages = pgTable(
  "topic_images",
  {
    id: serial("id").primaryKey(),
    topicId: integer("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    storageKey: text("storage_key").notNull(),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    altText: varchar("alt_text", { length: 255 }).notNull().default(""),
    caption: text("caption").notNull().default(""),
    fileSize: integer("file_size").notNull().default(0),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("topic_images_topic_order_idx").on(table.topicId, table.displayOrder)],
);

export const topicMedia = pgTable(
  "topic_media",
  {
    id: serial("id").primaryKey(),
    topicId: integer("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    uploadedBy: integer("uploaded_by").references(() => users.id, { onDelete: "set null" }),
    mediaType: mediaTypeEnum("media_type").notNull(),
    storageKey: text("storage_key"),
    externalUrl: text("external_url"),
    title: varchar("title", { length: 255 }).notNull(),
    mimeType: varchar("mime_type", { length: 100 }),
    fileSize: integer("file_size"),
    displayOrder: integer("display_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("topic_media_topic_type_idx").on(table.topicId, table.mediaType)],
);

export const previousQuestions = pgTable(
  "previous_questions",
  {
    id: serial("id").primaryKey(),
    topicId: integer("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    year: integer("year").notNull(),
    month: varchar("month", { length: 20 }).notNull(),
    marks: integer("marks").notNull(),
    priority: questionPriorityEnum("priority").notNull().default("three"),
    question: text("question").notNull(),
    answer: text("answer").notNull().default(""),
    source: varchar("source", { length: 160 }),
    createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (table) => [index("previous_questions_topic_year_idx").on(table.topicId, table.year)],
);

export const bookmarks = pgTable(
  "bookmarks",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    topicId: integer("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("bookmarks_user_topic_unique").on(table.userId, table.topicId),
    index("bookmarks_user_idx").on(table.userId),
  ],
);

export const studyProgress = pgTable(
  "study_progress",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    topicId: integer("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    difficulty: difficultyEnum("difficulty"),
    isCompleted: boolean("is_completed").notNull().default(false),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    lastReadAt: timestamp("last_read_at", { withTimezone: true }),
    readingSeconds: integer("reading_seconds").notNull().default(0),
    revisionCount: integer("revision_count").notNull().default(0),
    lastRevisionAt: timestamp("last_revision_at", { withTimezone: true }),
    notes: text("notes").notNull().default(""),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("study_progress_user_topic_unique").on(table.userId, table.topicId),
    index("study_progress_user_completed_idx").on(table.userId, table.isCompleted),
  ],
);

export const revisionHistory = pgTable(
  "revision_history",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    topicId: integer("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    revisedAt: timestamp("revised_at", { withTimezone: true }).notNull().defaultNow(),
    durationSeconds: integer("duration_seconds").notNull().default(0),
    confidence: difficultyEnum("confidence"),
    note: text("note").notNull().default(""),
  },
  (table) => [index("revision_history_user_date_idx").on(table.userId, table.revisedAt), index("revision_history_topic_idx").on(table.topicId)],
);

export const studySessions = pgTable(
  "study_sessions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    topicId: integer("topic_id").references(() => topics.id, { onDelete: "set null" }),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    durationSeconds: integer("duration_seconds").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("study_sessions_user_started_idx").on(table.userId, table.startedAt)],
);

export const comments = pgTable(
  "comments",
  {
    id: serial("id").primaryKey(),
    topicId: integer("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    parentId: integer("parent_id"),
    body: text("body").notNull(),
    isApproved: boolean("is_approved").notNull().default(true),
    ...timestamps,
  },
  (table) => [index("comments_topic_created_idx").on(table.topicId, table.createdAt), index("comments_parent_idx").on(table.parentId)],
);

export const topicRelations = pgTable(
  "topic_relations",
  {
    topicId: integer("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    relatedTopicId: integer("related_topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.topicId, table.relatedTopicId] }), index("topic_relations_related_idx").on(table.relatedTopicId)],
);

export const userSettings = pgTable("user_settings", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  darkMode: boolean("dark_mode").notNull().default(false),
  emailNotifications: boolean("email_notifications").notNull().default(true),
  compactSidebar: boolean("compact_sidebar").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const contentAuditLog = pgTable(
  "content_audit_log",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
    entityType: varchar("entity_type", { length: 60 }).notNull(),
    entityId: integer("entity_id").notNull(),
    action: varchar("action", { length: 40 }).notNull(),
    changes: jsonb("changes").notNull().default(sql`'{}'::jsonb`),
    occurredOn: date("occurred_on").notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("content_audit_entity_idx").on(table.entityType, table.entityId), index("content_audit_user_idx").on(table.userId)],
);
