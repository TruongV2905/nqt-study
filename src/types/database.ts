import type { Database } from "./database.types";

type Tables = Database["public"]["Tables"];
type TableName = keyof Tables;

export type TableRow<T extends TableName> = Tables[T]["Row"];
export type TableInsert<T extends TableName> = Tables[T]["Insert"];
export type TableUpdate<T extends TableName> = Tables[T]["Update"];
export type StudyDayRow = TableRow<"study_days">;
export type VocabularyRow = TableRow<"vocabularies">;
export type VocabularyDayRow = TableRow<"vocabulary_days">;
export type WordProgressRow = TableRow<"word_progress">;
export type StudySessionRow = TableRow<"study_sessions">;
export type UserSettingsRow = TableRow<"user_settings">;
