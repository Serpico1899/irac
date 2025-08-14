// Footer translation types
export interface FooterTranslations {
  copyright: string;
  allRightsReserved: string;
  aboutUs: string;
  contact: string;
  privacy: string;
  terms: string;
  followUs: string;
  newsletter: string;
  subscribe: string;
  emailPlaceholder: string;
}

// Common option type for dropdowns and selects
export interface Option {
  label: string;
  value: string;
}

// User level types
export type UserLevel = "Ghost" | "Manager" | "Editor" | "Normal" | null;

// Authentication context types
export interface AuthUser {
  token: string;
  level: UserLevel;
  nationalNumber: string;
}

// Re-export other types if needed
export * from './option';
