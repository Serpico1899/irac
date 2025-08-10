# IRAC Frontend Project Setup Documentation

## 📋 Overview

This document outlines the foundational setup and architecture implementation for the **IRAC (Islamic Architecture Research Center)** frontend project. The setup focuses on establishing a clean, maintainable, and scalable foundation with internationalization support.

## 🔍 Initial Audit Results

### ✅ What Was Already Well-Structured
- **Dependencies**: All major dependencies were pre-installed (Next.js 15.3.2, Tailwind CSS v4, TypeScript)
- **Component Architecture**: Excellent atomic design structure (atoms, molecules, organisms, templates)
- **Styling**: Tailwind CSS v4 with Persian font (Vazirmatn) support
- **Core Directories**: Essential directories (`components`, `lib`, `locales`, `utils`) existed
- **RTL Support**: Basic RTL styling was already implemented

### ⚠️ What Was Missing/Fixed
- **Internationalization**: `next-intl` was installed but not configured
- **Locale Structure**: App structure didn't follow `[locale]` pattern
- **Missing Utilities**: Several utility files were missing
- **Configuration**: i18n middleware and configuration needed setup

## 🏗️ Implemented Architecture

### 1. Internationalization (i18n) Setup

#### **Core Configuration Files**
- `src/i18n.ts` - Main i18n configuration
- `src/middleware.ts` - Locale detection and routing
- `src/lib/i18n.ts` - Utility functions for locale management
- `src/lib/navigation.ts` - Locale-aware navigation utilities

#### **Locale Files**
- `src/locales/fa.json` - Persian translations (primary language)
- `src/locales/en.json` - English translations

#### **Supported Languages**
- **Primary**: Persian (`fa`) - RTL
- **Secondary**: English (`en`) - LTR

### 2. Directory Structure

```
src/
├── app/
│   ├── [locale]/              # Locale-based routing
│   │   ├── layout.tsx         # Locale-aware root layout
│   │   ├── page.tsx           # Main homepage with i18n
│   │   ├── admin/             # Admin routes
│   │   ├── login/             # Authentication routes
│   │   └── user/              # User management routes
│   ├── actions/               # Server actions (moved back to root)
│   └── globals.css            # Global styles with Tailwind
├── components/                # Atomic design structure
│   ├── atoms/                 # Basic UI elements
│   ├── molecules/             # Component combinations
│   ├── organisms/             # Complex components
│   └── templates/             # Page-level components
├── lib/                       # Utility libraries
│   ├── i18n.ts               # Internationalization utilities
│   ├── navigation.ts         # Navigation helpers
│   └── utils.ts              # Common utility functions
├── locales/                   # Translation files
│   ├── fa.json               # Persian translations
│   └── en.json               # English translations
├── utils/                     # Utility functions
│   ├── checkFileExtension.ts # File validation utilities
│   ├── prepareAccidentSearch.ts # Search utilities
│   └── ... (other utilities)
└── types/                     # TypeScript type definitions
```

### 3. Key Features Implemented

#### **Internationalization Features**
- ✅ Automatic locale detection from URL
- ✅ Server-side translation loading
- ✅ RTL/LTR direction handling
- ✅ Persian/English number conversion
- ✅ Locale-aware date/currency formatting
- ✅ SEO-friendly URLs with locale prefixes

#### **Navigation & Routing**
- ✅ Locale-aware Link component
- ✅ Automatic locale URL generation
- ✅ Breadcrumb generation utilities
- ✅ Route protection helpers

#### **Utility Functions**
- ✅ File extension validation
- ✅ Common helper functions (formatting, validation, etc.)
- ✅ Local storage management
- ✅ Error handling utilities

## 🛠️ Configuration Details

### Next.js Configuration (`next.config.ts`)
```typescript
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "550mb",
    },
  },
};

export default withNextIntl(nextConfig);
```

### Tailwind Configuration (`tailwind.config.ts`)
- ✅ Proper content paths for all source files
- ✅ Custom animations and keyframes
- ✅ Persian font configuration (Vazirmatn)
- ✅ Extended theme with custom colors and spacing

### Middleware (`src/middleware.ts`)
- ✅ Automatic locale detection
- ✅ URL rewriting for locale-based routing
- ✅ Default locale fallback (Persian)

## 🎯 Current Status

### ✅ Completed Features
1. **Internationalization Setup**: Full i18n configuration with Next.js 15
2. **Locale-based Routing**: `/[locale]/` structure implemented
3. **Translation System**: Comprehensive translation files
4. **Utility Libraries**: Core utility functions created
5. **Component Architecture**: Maintained existing atomic design structure
6. **Styling System**: Tailwind CSS v4 with RTL support

### ⚠️ Known Issues & Temporary Solutions
1. **Missing Action Dependencies**: Some action imports reference non-existent files
   - **Temporary Fix**: Placeholder actions created for missing dependencies
   - **Action Required**: Implement actual API integration

2. **TypeScript Strict Mode**: Some type errors remain
   - **Status**: Build works with linting disabled
   - **Action Required**: Gradual type fixing recommended

3. **Complex Component Dependencies**: Some components have circular or missing dependencies
   - **Recommendation**: Refactor gradually during feature development

## 🚀 Next Steps for Development

### Immediate Priorities (Week 1)
1. **API Integration**: Replace placeholder actions with real API calls
2. **Component Testing**: Test existing components with new i18n structure
3. **Route Testing**: Verify all routes work with locale structure
4. **Type Safety**: Fix remaining TypeScript errors

### Short-term Goals (Week 2-4)
1. **Content Migration**: Move existing content to new structure
2. **SEO Implementation**: Add proper meta tags and structured data
3. **Performance Optimization**: Implement lazy loading and code splitting
4. **Testing Setup**: Add unit and integration tests

### Long-term Goals (Month 2+)
1. **Feature Development**: Build new features using established patterns
2. **Accessibility**: Ensure WCAG compliance
3. **Performance Monitoring**: Implement analytics and monitoring
4. **Documentation**: Create component library documentation

## 📚 Developer Guidelines

### Using Internationalization
```typescript
// In components
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('Navigation');
  return <h1>{t('home')}</h1>;
}
```

### Navigation
```typescript
// Use locale-aware navigation
import { Link } from '@/lib/navigation';

function MyComponent() {
  return <Link href="/about">{t('about')}</Link>;
}
```

### Adding New Translations
1. Add keys to both `src/locales/fa.json` and `src/locales/en.json`
2. Follow nested structure: `{ "Section": { "key": "value" } }`
3. Use descriptive key names

### Component Development
1. Follow atomic design principles
2. Use TypeScript for all components
3. Implement proper prop validation
4. Include internationalization from the start

## 🔧 Available Scripts

```bash
# Development
pnpm run dev          # Start development server with Turbopack

# Building
pnpm run build        # Production build
pnpm run build --no-lint  # Build without linting (temporary)

# Linting
pnpm run lint         # Run ESLint

# Package Management
pnpm install          # Install dependencies
pnpm add <package>    # Add new dependency
```

## 📝 Important Notes

### Font Implementation
- **Font**: Vazirmatn (Persian web font)
- **Location**: `/public/fonts/ttf/Vazirmatn-Regular.ttf`
- **CSS**: Configured in `globals.css` with font-face

### RTL/LTR Handling
- Automatic direction detection based on locale
- CSS classes: `.dir-rtl` for Persian, default LTR for English
- Tailwind utilities: `space-x-reverse` for RTL layouts

### State Management
- Current: React Context for authentication
- Recommendation: Consider Zustand or Redux Toolkit for complex state

### Performance Considerations
- Next.js 15 with App Router for optimal performance
- Turbopack enabled for fast development builds
- Lazy loading recommended for heavy components

## 🤝 Team Collaboration

### Code Standards
- Use TypeScript for all new code
- Follow ESLint configuration
- Implement proper error boundaries
- Write descriptive commit messages

### Translation Workflow
1. Developers add translation keys in English
2. Persian translations provided by content team
3. Review process for translation accuracy
4. Testing in both languages before deployment

### Component Library
- Document all reusable components
- Include usage examples
- Maintain consistent design patterns
- Regular component audits for consolidation

## 🔗 Resources

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [Atomic Design Principles](https://atomicdesign.bradfrost.com/)

---

**Last Updated**: December 2024  
**Project Version**: 0.1.0  
**Next.js Version**: 15.3.2  
**Primary Maintainer**: Senior Frontend Development Team