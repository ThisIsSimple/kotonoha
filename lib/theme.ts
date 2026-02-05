export const THEME_STORAGE_KEY = "theme-preference";

export type ThemePreference = "system" | "light" | "dark";

export const themeOptions: Array<{
  value: ThemePreference;
  label: string;
  description: string;
}> = [
  {
    value: "system",
    label: "システム",
    description: "OSの設定に合わせます。",
  },
  {
    value: "light",
    label: "ライト",
    description: "明るいテーマを固定します。",
  },
  {
    value: "dark",
    label: "ダーク",
    description: "落ち着いた暗めのテーマです。",
  },
];

export function normalizeTheme(value: string | null): ThemePreference {
  if (value === "light" || value === "dark" || value === "system") {
    return value;
  }
  return "system";
}
