// Analytics tracking utilities for IRAC website
// Provides type-safe tracking functions for Google Analytics and conversion events

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    trackConversion?: (eventName: string, eventParams?: any) => void;
    trackLandingPageConversion?: (
      type: string,
      slug: string,
      action: string,
    ) => void;
    trackCTAClick?: (ctaText: string, location: string) => void;
    trackFormSubmission?: (formType: string, success?: boolean) => void;
  }
}

// Event parameter types
interface BaseEventParams {
  event_category?: string;
  event_label?: string;
  value?: number;
  currency?: string;
  custom_parameters?: Record<string, any>;
}

interface ConversionEventParams extends BaseEventParams {
  content_type?: "workshop" | "course" | "product";
  content_id?: string;
  action?: "reserve" | "enroll" | "purchase" | "learn_more" | "download";
}

interface PageViewParams {
  page_title?: string;
  page_location?: string;
  content_group1?: string; // e.g., 'landing-page'
  content_group2?: string; // e.g., 'workshop' | 'course'
  content_group3?: string; // e.g., slug
}

interface FormTrackingParams extends BaseEventParams {
  form_type:
    | "contact"
    | "enrollment"
    | "reservation"
    | "newsletter"
    | "feedback";
  form_location?: string;
  success?: boolean;
  error_type?: string;
}

interface CTATrackingParams extends BaseEventParams {
  cta_text: string;
  cta_location: string;
  cta_type?: "primary" | "secondary" | "sticky";
  destination_url?: string;
}

interface UserEngagementParams extends BaseEventParams {
  engagement_time_msec?: number;
  engagement_type?: "scroll" | "time_on_page" | "video_play" | "file_download";
  engagement_value?: string;
}

// Main Analytics Class
class Analytics {
  private isEnabled: boolean;
  private debug: boolean;

  constructor() {
    this.isEnabled =
      typeof window !== "undefined" && !!process.env.NEXT_PUBLIC_GA_ID;
    this.debug = process.env.NODE_ENV === "development";
  }

  // Generic event tracking
  private track(eventName: string, parameters: Record<string, any> = {}) {
    if (!this.isEnabled) {
      if (this.debug) {
        console.log("[Analytics]", eventName, parameters);
      }
      return;
    }

    try {
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", eventName, parameters);
      }
    } catch (error) {
      console.error("[Analytics Error]", error);
    }
  }

  // Page view tracking
  trackPageView(params: PageViewParams = {}) {
    const defaultParams = {
      page_title: document?.title || "",
      page_location: window?.location?.href || "",
    };

    this.track("page_view", { ...defaultParams, ...params });
  }

  // Conversion tracking
  trackConversion(eventName: string, params: ConversionEventParams = {}) {
    const defaultParams = {
      event_category: "conversion",
      currency: "IRR",
    };

    this.track(eventName, { ...defaultParams, ...params });
  }

  // Landing page specific conversions
  trackLandingPageConversion(
    type: "workshop" | "course",
    slug: string,
    action: "reserve" | "enroll" | "learn_more" | "download",
  ) {
    this.trackConversion("landing_page_conversion", {
      content_type: type,
      content_id: slug,
      action: action,
      event_label: `${type}_${slug}_${action}`,
      custom_parameters: {
        content_group1: "landing-page",
        content_group2: type,
        content_group3: slug,
      },
    });

    // Track specific conversion goals
    if (action === "reserve" || action === "enroll") {
      this.trackConversion("conversion_goal", {
        action: action,
        content_type: type,
        content_id: slug,
        event_label: `goal_${action}_${type}`,
      });
    }
  }

  // CTA click tracking
  trackCTAClick(params: CTATrackingParams) {
    const {
      cta_text,
      cta_location,
      cta_type = "primary",
      destination_url = "",
    } = params;

    this.track("cta_click", {
      event_category: "engagement",
      event_label: `${cta_text}_${cta_location}`,
      cta_text,
      cta_location,
      cta_type,
      destination_url,
      ...params.custom_parameters,
    });
  }

  // Form tracking
  trackFormSubmission(params: FormTrackingParams) {
    const {
      form_type,
      success = true,
      error_type,
      form_location = "",
    } = params;

    this.track("form_submit", {
      event_category: "form_interaction",
      event_label: `${form_type}_${success ? "success" : "error"}`,
      form_type,
      form_location,
      success,
      error_type,
      ...params.custom_parameters,
    });
  }

  // User engagement tracking
  trackEngagement(params: UserEngagementParams) {
    const { engagement_type = "general", engagement_value = "" } = params;

    this.track("engagement", {
      event_category: "user_engagement",
      event_label: `${engagement_type}_${engagement_value}`,
      engagement_type,
      engagement_value,
      ...params.custom_parameters,
    });
  }

  // Scroll depth tracking
  trackScrollDepth(percentage: number, page_type = "") {
    if (percentage % 25 === 0 || percentage === 100) {
      this.trackEngagement({
        engagement_type: "scroll",
        engagement_value: `${percentage}%`,
        event_label: `scroll_${percentage}_${page_type}`,
      });
    }
  }

  // Time on page tracking
  trackTimeOnPage(seconds: number, page_type = "") {
    const minutes = Math.floor(seconds / 60);
    if (seconds === 30 || seconds === 60 || minutes > 0) {
      this.trackEngagement({
        engagement_time_msec: seconds * 1000,
        engagement_type: "time_on_page",
        engagement_value: `${seconds}s`,
        event_label: `time_${seconds}s_${page_type}`,
      });
    }
  }

  // Workshop/Course specific tracking
  trackWorkshopInteraction(
    slug: string,
    interaction: string,
    details: Record<string, any> = {},
  ) {
    this.track("workshop_interaction", {
      event_category: "workshop_engagement",
      event_label: `${slug}_${interaction}`,
      workshop_slug: slug,
      interaction_type: interaction,
      ...details,
    });
  }

  trackCourseInteraction(
    slug: string,
    interaction: string,
    details: Record<string, any> = {},
  ) {
    this.track("course_interaction", {
      event_category: "course_engagement",
      event_label: `${slug}_${interaction}`,
      course_slug: slug,
      interaction_type: interaction,
      ...details,
    });
  }

  // E-commerce tracking
  trackPurchaseIntent(
    itemType: "workshop" | "course" | "product",
    itemId: string,
    value: number,
  ) {
    this.track("add_to_cart", {
      event_category: "ecommerce",
      event_label: `${itemType}_${itemId}`,
      content_type: itemType,
      content_id: itemId,
      value: value,
      currency: "IRR",
    });
  }

  trackPurchase(
    transactionId: string,
    items: Array<{
      item_id: string;
      item_name: string;
      item_category: string;
      quantity: number;
      price: number;
    }>,
    totalValue: number,
  ) {
    this.track("purchase", {
      event_category: "ecommerce",
      transaction_id: transactionId,
      value: totalValue,
      currency: "IRR",
      items: items,
    });
  }

  // Error tracking
  trackError(errorType: string, errorMessage: string, errorLocation: string) {
    this.track("exception", {
      description: errorMessage,
      fatal: false,
      error_type: errorType,
      error_location: errorLocation,
    });
  }
}

// Create singleton instance
const analytics = new Analytics();

// Export individual functions for convenience
export const trackPageView = (params?: PageViewParams) =>
  analytics.trackPageView(params);
export const trackConversion = (
  eventName: string,
  params?: ConversionEventParams,
) => analytics.trackConversion(eventName, params);
export const trackLandingPageConversion = (
  type: "workshop" | "course",
  slug: string,
  action: "reserve" | "enroll" | "learn_more" | "download",
) => analytics.trackLandingPageConversion(type, slug, action);
export const trackCTAClick = (params: CTATrackingParams) =>
  analytics.trackCTAClick(params);
export const trackFormSubmission = (params: FormTrackingParams) =>
  analytics.trackFormSubmission(params);
export const trackEngagement = (params: UserEngagementParams) =>
  analytics.trackEngagement(params);
export const trackScrollDepth = (percentage: number, pageType?: string) =>
  analytics.trackScrollDepth(percentage, pageType);
export const trackTimeOnPage = (seconds: number, pageType?: string) =>
  analytics.trackTimeOnPage(seconds, pageType);
export const trackWorkshopInteraction = (
  slug: string,
  interaction: string,
  details?: Record<string, any>,
) => analytics.trackWorkshopInteraction(slug, interaction, details);
export const trackCourseInteraction = (
  slug: string,
  interaction: string,
  details?: Record<string, any>,
) => analytics.trackCourseInteraction(slug, interaction, details);
export const trackPurchaseIntent = (
  itemType: "workshop" | "course" | "product",
  itemId: string,
  value: number,
) => analytics.trackPurchaseIntent(itemType, itemId, value);
export const trackPurchase = (
  transactionId: string,
  items: any[],
  totalValue: number,
) => analytics.trackPurchase(transactionId, items, totalValue);
export const trackError = (
  errorType: string,
  errorMessage: string,
  errorLocation: string,
) => analytics.trackError(errorType, errorMessage, errorLocation);

// Export the main analytics instance
export default analytics;

// Hook for React components
export const useAnalytics = () => {
  return {
    trackPageView,
    trackConversion,
    trackLandingPageConversion,
    trackCTAClick,
    trackFormSubmission,
    trackEngagement,
    trackScrollDepth,
    trackTimeOnPage,
    trackWorkshopInteraction,
    trackCourseInteraction,
    trackPurchaseIntent,
    trackPurchase,
    trackError,
  };
};

// Auto-track scroll depth
if (typeof window !== "undefined") {
  let maxScrollDepth = 0;
  const timeOnPageStart = Date.now();

  const trackScrollProgress = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.round((scrollTop / docHeight) * 100);

    if (scrollPercent > maxScrollDepth) {
      maxScrollDepth = scrollPercent;
      analytics.trackScrollDepth(scrollPercent, "auto");
    }
  };

  const trackTimeProgress = () => {
    const timeSpent = Math.floor((Date.now() - timeOnPageStart) / 1000);
    analytics.trackTimeOnPage(timeSpent, "auto");
  };

  // Attach scroll listener
  window.addEventListener("scroll", trackScrollProgress, { passive: true });

  // Track time milestones
  setTimeout(() => trackTimeProgress(), 30000); // 30 seconds
  setTimeout(() => trackTimeProgress(), 60000); // 1 minute
  setTimeout(() => trackTimeProgress(), 180000); // 3 minutes

  // Track on page unload
  window.addEventListener("beforeunload", () => {
    const finalTimeSpent = Math.floor((Date.now() - timeOnPageStart) / 1000);
    analytics.trackTimeOnPage(finalTimeSpent, "final");
  });
}
