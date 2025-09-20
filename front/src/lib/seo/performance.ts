import { ImageProps } from "next/image";

// Image optimization configuration
export const IMAGE_QUALITY = {
  low: 40,
  medium: 75,
  high: 90,
  lossless: 100,
} as const;

export const IMAGE_SIZES = {
  thumbnail: { width: 150, height: 150 },
  small: { width: 300, height: 200 },
  medium: { width: 600, height: 400 },
  large: { width: 1200, height: 800 },
  hero: { width: 1920, height: 1080 },
} as const;

// Generate responsive image sizes
export const generateImageSizes = (breakpoints?: number[]): string => {
  const defaultBreakpoints = [640, 768, 1024, 1280, 1536];
  const points = breakpoints || defaultBreakpoints;

  return points
    .map((bp, index) => {
      if (index === 0) return `(max-width: ${bp}px) 100vw`;
      if (index === points.length - 1) return `${bp}px`;
      return `(max-width: ${bp}px) 50vw`;
    })
    .join(", ");
};

// Optimize image props for Next.js Image component
export const optimizeImageProps = (
  src: string,
  alt: string,
  size: keyof typeof IMAGE_SIZES = "medium",
  quality: keyof typeof IMAGE_QUALITY = "medium",
  priority: boolean = false,
): Partial<ImageProps> => {
  const { width, height } = IMAGE_SIZES[size];

  return {
    src,
    alt,
    width,
    height,
    quality: IMAGE_QUALITY[quality],
    priority,
    placeholder: "blur",
    blurDataURL: generateBlurDataURL(width, height),
    sizes: generateImageSizes(),
    style: {
      width: "100%",
      height: "auto",
    },
  };
};

// Generate blur placeholder for images
export const generateBlurDataURL = (width: number, height: number): string => {
  // Create a simple geometric blur placeholder
  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f0f0f0;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e0e0e0;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
    </svg>
  `;

  const base64 = Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${base64}`;
};

// Lazy loading intersection observer hook
export const createLazyLoadObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit,
) => {
  if (typeof window === "undefined") return null;

  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: "50px",
    threshold: 0.1,
    ...options,
  };

  return new IntersectionObserver(callback, defaultOptions);
};

// Progressive image loading
export const progressiveImageLoad = (
  src: string,
  onLoad?: () => void,
  onError?: () => void,
): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      onLoad?.();
      resolve(img);
    };

    img.onerror = () => {
      onError?.();
      reject(new Error(`Failed to load image: ${src}`));
    };

    img.src = src;
  });
};

// Critical CSS inlining utility
export const inlineCriticalCSS = (css: string): void => {
  if (typeof document === "undefined") return;

  const styleElement = document.createElement("style");
  styleElement.type = "text/css";
  styleElement.innerHTML = css;
  document.head.appendChild(styleElement);
};

// Preload critical resources
export const preloadResource = (
  href: string,
  as: "script" | "style" | "font" | "image" | "fetch",
  crossorigin?: "anonymous" | "use-credentials",
): void => {
  if (typeof document === "undefined") return;

  const link = document.createElement("link");
  link.rel = "preload";
  link.href = href;
  link.as = as;

  if (crossorigin) {
    link.crossOrigin = crossorigin;
  }

  // Add font-specific attributes
  if (as === "font") {
    link.type = "font/woff2";
    link.crossOrigin = "anonymous";
  }

  document.head.appendChild(link);
};

// Prefetch resources for future navigation
export const prefetchResource = (href: string): void => {
  if (typeof document === "undefined") return;

  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = href;
  document.head.appendChild(link);
};

// DNS prefetch for external domains
export const dnsPrefetch = (domain: string): void => {
  if (typeof document === "undefined") return;

  const link = document.createElement("link");
  link.rel = "dns-prefetch";
  link.href = domain;
  document.head.appendChild(link);
};

// Performance monitoring utilities
export const measurePerformance = (
  name: string,
  fn: () => void | Promise<void>,
) => {
  if (typeof performance === "undefined") {
    return fn();
  }

  const startTime = performance.now();
  const result = fn();

  if (result instanceof Promise) {
    return result.finally(() => {
      const endTime = performance.now();
      console.log(`${name} took ${endTime - startTime} milliseconds`);
    });
  } else {
    const endTime = performance.now();
    console.log(`${name} took ${endTime - startTime} milliseconds`);
    return result;
  }
};

// Web Vitals tracking
export const trackWebVitals = (): void => {
  if (typeof window === "undefined") return;

  // Track Core Web Vitals
  try {
    import("web-vitals")
      .then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(console.log);
        getFID(console.log);
        getFCP(console.log);
        getLCP(console.log);
        getTTFB(console.log);
      })
      .catch(() => {
        console.warn("Web Vitals library not available");
      });
  } catch (error) {
    console.warn("Web Vitals tracking not available:", error);
  }
};

// Image format detection and optimization
export const getOptimalImageFormat = (): "webp" | "avif" | "jpeg" => {
  if (typeof window === "undefined") return "jpeg";

  // Check for AVIF support
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (ctx) {
    canvas.width = 1;
    canvas.height = 1;

    try {
      const avifSupported = canvas
        .toDataURL("image/avif")
        .startsWith("data:image/avif");
      if (avifSupported) return "avif";
    } catch (e) {
      // AVIF not supported
    }

    try {
      const webpSupported = canvas
        .toDataURL("image/webp")
        .startsWith("data:image/webp");
      if (webpSupported) return "webp";
    } catch (e) {
      // WebP not supported
    }
  }

  return "jpeg";
};

// Service Worker registration for caching
export const registerServiceWorker = async (): Promise<void> => {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js");
    console.log("Service Worker registered:", registration);
  } catch (error) {
    console.error("Service Worker registration failed:", error);
  }
};

// Critical font loading
export const loadCriticalFonts = (fonts: string[]): void => {
  fonts.forEach((fontUrl) => {
    preloadResource(fontUrl, "font");
  });
};

// Optimize third-party scripts loading
export const loadThirdPartyScript = (
  src: string,
  async: boolean = true,
  defer: boolean = false,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("Document not available"));
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = async;
    script.defer = defer;

    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));

    document.head.appendChild(script);
  });
};

// Reduce bundle size by dynamic imports
export const dynamicImport = async <T>(
  importPath: string,
  fallback?: T,
): Promise<T | undefined> => {
  try {
    const module = await import(importPath);
    return module.default || module;
  } catch (error) {
    console.error(`Dynamic import failed for ${importPath}:`, error);
    return fallback;
  }
};

// Resource hints for better performance
export const addResourceHints = (): void => {
  if (typeof document === "undefined") return;

  // DNS prefetch for external domains
  const externalDomains = [
    "//fonts.googleapis.com",
    "//fonts.gstatic.com",
    "//images.unsplash.com",
    "//analytics.google.com",
  ];

  externalDomains.forEach((domain) => {
    dnsPrefetch(domain);
  });

  // Preload critical fonts
  const criticalFonts = [
    "/fonts/woff2/Vazirmatn-Regular.woff2",
    "/fonts/woff2/Vazirmatn-Bold.woff2",
  ];

  criticalFonts.forEach((font) => {
    preloadResource(font, "font");
  });
};

// Image compression utility (client-side)
export const compressImage = (
  file: File,
  maxWidth: number = 1200,
  quality: number = 0.8,
): Promise<Blob> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      const { width, height } = img;
      const ratio = Math.min(maxWidth / width, maxWidth / height);

      canvas.width = width * ratio;
      canvas.height = height * ratio;

      // Draw and compress
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          resolve(blob!);
        },
        "image/jpeg",
        quality,
      );
    };

    img.src = URL.createObjectURL(file);
  });
};

// Debounce utility for performance optimization
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Throttle utility for performance optimization
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number,
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func.apply(null, args);
    }
  };
};

// Memory usage monitoring
export const monitorMemoryUsage = (): void => {
  if (typeof window === "undefined" || !("performance" in window)) return;

  const memory = (performance as any).memory;
  if (memory) {
    console.log("Memory usage:", {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
      limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
    });
  }
};

// Performance optimization bundle
export const initializePerformanceOptimizations = (): void => {
  // Add resource hints
  addResourceHints();

  // Register service worker
  registerServiceWorker().catch(console.error);

  // Track web vitals
  trackWebVitals();

  // Monitor memory usage in development
  if (process.env.NODE_ENV === "development") {
    setInterval(monitorMemoryUsage, 30000); // Every 30 seconds
  }
};

export default {
  IMAGE_QUALITY,
  IMAGE_SIZES,
  generateImageSizes,
  optimizeImageProps,
  generateBlurDataURL,
  createLazyLoadObserver,
  progressiveImageLoad,
  inlineCriticalCSS,
  preloadResource,
  prefetchResource,
  dnsPrefetch,
  measurePerformance,
  trackWebVitals,
  getOptimalImageFormat,
  registerServiceWorker,
  loadCriticalFonts,
  loadThirdPartyScript,
  dynamicImport,
  addResourceHints,
  compressImage,
  debounce,
  throttle,
  monitorMemoryUsage,
  initializePerformanceOptimizations,
};
