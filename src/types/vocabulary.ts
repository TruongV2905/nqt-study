import type { VocabularyRow } from "./database";

export type VocabularyWithDays = VocabularyRow & { dayIds: string[] };
