import type { InferSelectModel } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  primaryKey,
  foreignKey,
  boolean,
} from 'drizzle-orm/pg-core';

import { mysqlTable as table, AnyMySqlColumn } from "drizzle-orm/mysql-core";
import * as t from "drizzle-orm/mysql-core";
// import { AnyMySqlColumn } from "drizzle-orm/mysql-core";
export const user = table(
  "User",
  {
    id: t.int().primaryKey().autoincrement(),
    firstName: t.varchar("first_name", { length: 256 }),
    lastName: t.varchar("last_name", { length: 256 }),
    password: t.varchar("password", { length: 256 }),
    email: t.varchar({ length: 256 }).notNull(),
    role: t.mysqlEnum(["guest", "user", "admin"]).default("guest"),
  },
  (table) => {
    return {
      emailIndex: t.uniqueIndex("email_idx").on(table.email),
    };
  }
);

export type User = InferSelectModel<typeof user>;

export const chat = table(
  "Chat",
  {
    id: t.int().primaryKey().autoincrement(),
    createdAt: timestamp('createdAt').notNull(),
    title: text('title').notNull(),
    userId: uuid('userId')
      .notNull()
    ,
    visibility: varchar('visibility', { enum: ['public', 'private'] })
      .notNull()
      .default('private'),
  },
  (table) => {
    return {
      idx: t.uniqueIndex("idx").on(table.id),
    };
  }

  //   'Chat', {
  //   id: t.int().primaryKey().autoincrement(),
  //   createdAt: timestamp('createdAt').notNull(),
  //   title: text('title').notNull(),
  //   userId: uuid('userId')
  //     .notNull()
  //     ,
  //   visibility: varchar('visibility', { enum: ['public', 'private'] })
  //     .notNull()
  //     .default('private'),
  // }
);

export type Chat = InferSelectModel<typeof chat>;

export const message = table('Message', {
  id: t.int().primaryKey().autoincrement(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id),
  role: varchar('role').notNull(),
  content: json('content').notNull(),
  createdAt: timestamp('createdAt').notNull(),
});

export type Message = InferSelectModel<typeof message>;

export const vote = table(
  'Vote',
  {
    chatId: uuid('chatId')
      .notNull()
      .references(() => chat.id),
    messageId: uuid('messageId')
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean('isUpvoted').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  },
);

export type Vote = InferSelectModel<typeof vote>;

export const document = table(
  'Document',
  {
    id: uuid('id').notNull().defaultRandom(),
    createdAt: timestamp('createdAt').notNull(),
    title: text('title').notNull(),
    content: text('content'),
    kind: varchar('text', { enum: ['text', 'code'] })
      .notNull()
      .default('text'),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id, table.createdAt] }),
    };
  },
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = table(
  'Suggestion',
  {
    id: uuid('id').notNull().defaultRandom(),
    documentId: uuid('documentId').notNull(),
    documentCreatedAt: timestamp('documentCreatedAt').notNull(),
    originalText: text('originalText').notNull(),
    suggestedText: text('suggestedText').notNull(),
    description: text('description'),
    isResolved: boolean('isResolved').notNull().default(false),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
    createdAt: timestamp('createdAt').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  }),
);

export type Suggestion = InferSelectModel<typeof suggestion>;
