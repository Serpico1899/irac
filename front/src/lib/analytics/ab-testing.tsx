"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { trackConversion } from "./tracking";

// Types
interface ABTestConfig {
  testId: string;
  name: string;
  description?: string;
  variants: ABTestVariant[];
  trafficAllocation: number; // Percentage of users to include in test (0-100)
  enabled: boolean;
  startDate?: Date;
  endDate?: Date;
  targetUrl?: string; // URL pattern to run test on
  audienceFilter?: (userId?: string) => boolean;
}

interface ABTestVariant {
  id: string;
  name: string;
  weight: number; // Percentage weight for this variant (should sum to 100 across all variants)
  config?: Record<string, any>; // Variant-specific configuration
}

interface UserAssignment {
  testId: string;
  variantId: string;
  assignedAt: number;
  sessionId: string;
}

interface ABTestResult {
  testId: string;
  variantId: string;
  variantName: string;
  isInTest: boolean;
  config?: Record<string, any>;
}

interface ABTestContextType {
  getVariant: (testId: string) => ABTestResult;
  trackConversion: (
    testId: string,
    conversionType: string,
    value?: number,
  ) => void;
  isTestActive: (testId: string) => boolean;
}

// Default test configurations
const DEFAULT_TESTS: ABTestConfig[] = [
  {
    testId: "landing_cta_text",
    name: "Landing Page CTA Text",
    description: "Test different CTA button texts on landing pages",
    variants: [
      { id: "control", name: "Control (Reserve Now)", weight: 50 },
      { id: "urgent", name: "Urgent (Reserve Your Spot Now)", weight: 25 },
      { id: "benefit", name: "Benefit (Join Expert Workshop)", weight: 25 },
    ],
    trafficAllocation: 100,
    enabled: true,
  },
  {
    testId: "hero_layout",
    name: "Hero Section Layout",
    description: "Test different hero section layouts",
    variants: [
      { id: "control", name: "Standard Layout", weight: 50 },
      { id: "video_bg", name: "Video Background", weight: 50 },
    ],
    trafficAllocation: 50,
    enabled: false,
  },
  {
    testId: "pricing_display",
    name: "Pricing Display Format",
    description: "Test different ways to show pricing",
    variants: [
      { id: "control", name: "Standard Price", weight: 40 },
      { id: "crossed_out", name: "Crossed Out Original", weight: 30 },
      { id: "savings_highlight", name: "Highlight Savings", weight: 30 },
    ],
    trafficAllocation: 80,
    enabled: true,
  },
];

// Storage keys
const AB_TEST_STORAGE_KEY = "irac_ab_tests";
const SESSION_ID_KEY = "irac_session_id";

// Utility functions
const generateSessionId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const getSessionId = (): string => {
  if (typeof window === "undefined") return generateSessionId();

  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
};

const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

const getUserBucket = (userId: string, testId: string): number => {
  const hashInput = `${userId}_${testId}`;
  const hash = hashString(hashInput);
  return hash % 100;
};

const selectVariant = (
  variants: ABTestVariant[],
  bucket: number,
): ABTestVariant => {
  let cumulativeWeight = 0;

  for (const variant of variants) {
    cumulativeWeight += variant.weight;
    if (bucket < cumulativeWeight) {
      return variant;
    }
  }

  // Fallback to first variant if weights don't add up properly
  return variants[0];
};

const loadStoredAssignments = (): UserAssignment[] => {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(AB_TEST_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("[AB Testing] Error loading stored assignments:", error);
    return [];
  }
};

const saveAssignment = (assignment: UserAssignment): void => {
  if (typeof window === "undefined") return;

  try {
    const assignments = loadStoredAssignments();
    const existingIndex = assignments.findIndex(
      (a) => a.testId === assignment.testId,
    );

    if (existingIndex >= 0) {
      assignments[existingIndex] = assignment;
    } else {
      assignments.push(assignment);
    }

    localStorage.setItem(AB_TEST_STORAGE_KEY, JSON.stringify(assignments));
  } catch (error) {
    console.error("[AB Testing] Error saving assignment:", error);
  }
};

// AB Test Manager Class
class ABTestManager {
  private tests: Map<string, ABTestConfig> = new Map();
  private assignments: Map<string, UserAssignment> = new Map();
  private sessionId: string;

  constructor() {
    this.sessionId = getSessionId();
    this.loadTests();
    this.loadAssignments();
  }

  private loadTests(): void {
    // Load default tests
    DEFAULT_TESTS.forEach((test) => {
      this.tests.set(test.testId, test);
    });

    // Load additional tests from environment or API
    if (typeof window !== "undefined" && window.IRAC_AB_TESTS) {
      window.IRAC_AB_TESTS.forEach((test: ABTestConfig) => {
        this.tests.set(test.testId, test);
      });
    }
  }

  private loadAssignments(): void {
    const storedAssignments = loadStoredAssignments();
    storedAssignments.forEach((assignment) => {
      this.assignments.set(assignment.testId, assignment);
    });
  }

  public isTestActive(test: ABTestConfig): boolean {
    if (!test.enabled) return false;

    const now = new Date();
    if (test.startDate && now < test.startDate) return false;
    if (test.endDate && now > test.endDate) return false;

    return true;
  }

  private shouldIncludeInTest(test: ABTestConfig): boolean {
    if (!this.isTestActive(test)) return false;

    // Check URL pattern if specified
    if (test.targetUrl && typeof window !== "undefined") {
      const currentUrl = window.location.pathname;
      const urlPattern = new RegExp(test.targetUrl);
      if (!urlPattern.test(currentUrl)) return false;
    }

    // Check audience filter
    if (test.audienceFilter && !test.audienceFilter()) return false;

    // Check traffic allocation
    const bucket = getUserBucket(this.sessionId, test.testId);
    return bucket < test.trafficAllocation;
  }

  getVariant(testId: string): ABTestResult {
    const test = this.tests.get(testId);

    if (!test) {
      return {
        testId,
        variantId: "control",
        variantName: "Control",
        isInTest: false,
      };
    }

    // Check if user should be included in test
    if (!this.shouldIncludeInTest(test)) {
      return {
        testId,
        variantId: "control",
        variantName: "Control",
        isInTest: false,
      };
    }

    // Check for existing assignment
    let assignment = this.assignments.get(testId);

    if (!assignment) {
      // Create new assignment
      const bucket = getUserBucket(this.sessionId, testId);
      const variant = selectVariant(test.variants, bucket);

      assignment = {
        testId,
        variantId: variant.id,
        assignedAt: Date.now(),
        sessionId: this.sessionId,
      };

      this.assignments.set(testId, assignment);
      saveAssignment(assignment);

      // Track assignment
      trackConversion("ab_test_assignment", {
        content_type: "course",
        content_id: testId,
        action: "enroll",
        event_label: `${testId}_${variant.id}`,
        custom_parameters: {
          test_id: testId,
          variant_id: variant.id,
          variant_name: variant.name,
        },
      });
    }

    const variant = test.variants.find((v) => v.id === assignment!.variantId);

    return {
      testId,
      variantId: assignment.variantId,
      variantName: variant?.name || "Unknown",
      isInTest: true,
      config: variant?.config,
    };
  }

  trackConversion(
    testId: string,
    conversionType: string,
    value?: number,
  ): void {
    const variant = this.getVariant(testId);

    if (!variant.isInTest) return;

    trackConversion("ab_test_conversion", {
      content_type: "course",
      content_id: testId,
      action: "enroll",
      value: value,
      event_label: `${testId}_${variant.variantId}_${conversionType}`,
      custom_parameters: {
        test_id: testId,
        variant_id: variant.variantId,
        variant_name: variant.variantName,
        conversion_type: conversionType,
      },
    });
  }

  isTestActiveById(testId: string): boolean {
    const test = this.tests.get(testId);
    return test ? this.isTestActive(test) : false;
  }

  // Get all active tests (for debugging)
  getActiveTests(): ABTestConfig[] {
    return Array.from(this.tests.values()).filter((test) =>
      this.isTestActive(test),
    );
  }

  // Get user's assignments (for debugging)
  getUserAssignments(): UserAssignment[] {
    return Array.from(this.assignments.values());
  }
}

// Singleton instance
const abTestManager = new ABTestManager();

// Context
const ABTestContext = createContext<ABTestContextType>({
  getVariant: () => ({
    testId: "",
    variantId: "control",
    variantName: "Control",
    isInTest: false,
  }),
  trackConversion: () => {},
  isTestActive: () => false,
});

// Provider component
interface ABTestProviderProps {
  children: ReactNode;
}

export const ABTestProvider: React.FC<ABTestProviderProps> = ({ children }) => {
  const contextValue: ABTestContextType = {
    getVariant: (testId: string) => abTestManager.getVariant(testId),
    trackConversion: (testId: string, conversionType: string, value?: number) =>
      abTestManager.trackConversion(testId, conversionType, value),
    isTestActive: (testId: string) => abTestManager.isTestActiveById(testId),
  };

  return (
    <ABTestContext.Provider value={contextValue}>
      {children}
    </ABTestContext.Provider>
  );
};

// Hook
export const useABTest = (testId: string): ABTestResult => {
  const context = useContext(ABTestContext);
  const [variant, setVariant] = useState<ABTestResult>(() =>
    context.getVariant(testId),
  );

  useEffect(() => {
    setVariant(context.getVariant(testId));
  }, [testId, context]);

  return variant;
};

// Component wrapper for A/B testing
interface ABTestComponentProps {
  testId: string;
  children: (variant: ABTestResult) => ReactNode;
  fallback?: ReactNode;
}

export const ABTestComponent: React.FC<ABTestComponentProps> = ({
  testId,
  children,
  fallback = null,
}) => {
  const variant = useABTest(testId);

  try {
    return <>{children(variant)}</>;
  } catch (error) {
    console.error(`[AB Testing] Error rendering test ${testId}:`, error);
    return <>{fallback}</>;
  }
};

// Utility functions for direct use
export const getVariant = (testId: string): ABTestResult =>
  abTestManager.getVariant(testId);
export const trackABTestConversion = (
  testId: string,
  conversionType: string,
  value?: number,
): void => abTestManager.trackConversion(testId, conversionType, value);
export const isTestActive = (testId: string): boolean =>
  abTestManager.isTestActiveById(testId);

// Debug utilities (only in development)
export const debugABTesting = () => {
  if (process.env.NODE_ENV === "development") {
    console.log(
      "[AB Testing Debug] Active Tests:",
      abTestManager.getActiveTests(),
    );
    console.log(
      "[AB Testing Debug] User Assignments:",
      abTestManager.getUserAssignments(),
    );
  }
};

// Global declaration for additional tests
declare global {
  interface Window {
    IRAC_AB_TESTS?: ABTestConfig[];
  }
}

export default ABTestManager;
export type { ABTestConfig, ABTestVariant, ABTestResult, UserAssignment };
