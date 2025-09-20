export const formatDate = (date: Date | string, locale: string = "fa"): string => {
  const d = typeof date === "string" ? new Date(date) : date;

  if (locale === "fa") {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(d);
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
};

export const formatShortDate = (date: Date | string, locale: string = "fa"): string => {
  const d = typeof date === "string" ? new Date(date) : date;

  if (locale === "fa") {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(d);
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
};

export const formatDateTime = (date: Date | string, locale: string = "fa"): string => {
  const d = typeof date === "string" ? new Date(date) : date;

  if (locale === "fa") {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
};

export const getRelativeTime = (date: Date | string, locale: string = "fa"): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (locale === "fa") {
    if (diffInSeconds < 60) return "همین الان";
    if (diffInMinutes < 60) return `${diffInMinutes} دقیقه پیش`;
    if (diffInHours < 24) return `${diffInHours} ساعت پیش`;
    if (diffInDays < 30) return `${diffInDays} روز پیش`;
    if (diffInMonths < 12) return `${diffInMonths} ماه پیش`;
    return `${diffInYears} سال پیش`;
  }

  if (diffInSeconds < 60) return "just now";
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
  return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
};

export const isValidDate = (date: any): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

export const toISOString = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString();
};

export const formatForInput = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split('T')[0]; // Returns YYYY-MM-DD format for HTML input
};
