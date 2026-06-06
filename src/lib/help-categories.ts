export const helpCategories = [
  "Getting Started",
  "Diary & Entries",
  "Folders",
  "Community",
  "Social Features",
  "AI Features",
  "Settings & Appearance",
  "Pro Features",
] as const;

export type HelpCategory = (typeof helpCategories)[number];
