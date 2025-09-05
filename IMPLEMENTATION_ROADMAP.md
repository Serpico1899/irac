# Project IRAC Reconstruction: Implementation Roadmap

## 1. Introduction

This document provides a detailed, phased roadmap for the implementation of the `irac.ir` website reconstruction. It is based on a fresh analysis of the project's original state and the requirements outlined in the Persian proposal.

The goal is to provide a clear, step-by-step guide for developers, bridging the gap between the project's foundational state and the final vision.

---

## 2. Current Project Status (Analysis from Original State)

-   **Backend (Deno/Lesan):** A foundation exists with user authentication, basic CRUD for content models (articles, courses), and initial models for a wallet and file uploads.
-   **Frontend (Next.js):** A modern, scalable structure using the Next.js App Router is in place. An `i18n` directory indicates that multi-language support was planned.
-   **Critical Deficiencies:**
    1.  **Media Management is Non-functional:** The file upload system saves files to a non-public directory (`./uploads`) and, most critically, **fails to save the file's path to the database**. There is no endpoint to serve or download files, making the entire module unusable.
    2.  **Major Features are Missing:** The co-working space module, a complete e-commerce flow, the gamification/scoring system, advanced admin dashboards, and a referral system are entirely absent from the codebase.

---

## 3. Phased Implementation Plan

### Phase 1: Foundational Fixes & Features (Backend)

This phase is the highest priority. It addresses the critical flaws in the existing foundation and implements the first new feature module.

#### **Module 1.1: Remediate the Media Management System**

-   [ ] **Task 1.1.1: Update the Database Model.**
    -   Modify `back/models/file.ts`.
    -   Add a `path: string()` field to the `pure_file` schema. This is essential for locating the file after upload.

-   [ ] **Task 1.1.2: Correct the Upload Logic.**
    -   Modify `back/src/file/uploadFile/uploadFile.fn.ts`.
    -   Change the storage directory from `./uploads` to a publicly accessible `./public/uploads`.
    -   Update the function to save the relative file path (e.g., `/uploads/images/your-file.jpg`) into the new `path` field in the database.

-   [ ] **Task 1.1.3: Create a File Serving Endpoint.**
    -   Create a new directory: `back/src/file/serveFile`.
    -   Inside, create `serveFile.val.ts` to validate a `path` parameter.
    -   Create `serveFile.fn.ts` to read the file from the disk (based on the path) and return it as a proper HTTP response with the correct `Content-Type`.
    -   Create `mod.ts` to register `serveFile` as a public, non-authorized `GET` action.

-   [ ] **Task 1.1.4: Integrate the New Action.**
    -   Modify `back/src/file/mod.ts` to import and call `serveFileSetup()`.

#### **Module 1.2: Implement the Scoring & Gamification System**

-   [ ] **Task 1.2.1: Create the Point Model.**
    -   Create a new file: `back/models/point.ts`.
    -   Define a `pure_point` schema with `amount` and `reason` fields.
    -   Establish a mandatory single relation to the `user` model.

-   [ ] **Task 1.2.2: Update the User Model.**
    -   Modify `back/models/user.ts`.
    -   Add a `totalPoints: number()` field (defaulted to 0) to the `user_pure` schema for efficient score retrieval.
    -   Add a `points` multiple relation to the `point` model in `user_relations`.

-   [ ] **Task 1.2.3: Create the `awardPoint` Service.**
    -   Create a new directory: `back/src/point/awardPoint`.
    -   Implement the validator, function, and setup files.
    -   The function logic should create a new `point` record and atomically increment the `totalPoints` on the related `user` document. This service should be protected (admin or system-level access).

-   [ ] **Task 1.2.4: Register the New Module.**
    -   Create `back/src/point/mod.ts` to export the setup function.
    -   Modify `back/src/mod.ts` to import and call `pointSetup()`.

-   [ ] **Task 1.2.5: Integrate Point Awards.**
    -   Modify existing services (e.g., course enrollment, product purchase) to call the `awardPoint` service after a successful transaction.

#### **Module 1.3: Create Database Seeding for Development**

-   [ ] **Task 1.3.1: Create Seeding Infrastructure.**
    -   Create a new directory: `back/db/seeds`.
    -   Create a main runner script `back/db/mod.ts` that can be executed to run all seed scripts in the correct order.

-   [ ] **Task 1.3.2: Develop Seed Scripts.**
    -   Create `back/db/seeds/users.ts` to populate the database with sample users, including at least one admin.
    -   Create `back/db/seeds/courses.ts` to create sample courses.
    -   Create `back/db/seeds/articles.ts` to create sample articles.
    -   Create seed scripts for other core models (`tags`, `categories`, etc.) as needed for development.

-   [ ] **Task 1.3.3: Add a Deno Task.**
    -   Modify the `deno.json` file.
    -   Add a new task, `db:seed`, that executes the main runner script (e.g., `deno run --allow-net --allow-env ./db/mod.ts`).

---

### Phase 2: Core Feature Implementation (Backend)

#### **Module 2.1: Co-working Space Reservation System**

-   [ ] **Task 2.1.1: Create Models.**
    -   Create `back/models/space.ts` for reservable spaces (name, capacity, price, photos).
    -   Create `back/models/booking.ts` to link a `user` to a `space` with a `startTime`, `endTime`, and `status`.

-   [ ] **Task 2.1.2: Register New Models.**
    -   Export the new models from `back/models/mod.ts`.
    -   Import and instantiate them in the main `back/mod.ts`.

-   [ ] **Task 2.1.3: Implement Services.**
    -   `createSpace`, `updateSpace` (Admin only).
    -   `getSpaces` (Public).
    -   `getSpaceAvailability` (Public, shows available time slots).
    -   `createBooking` (User, handles payment).
    -   `getUserBookings`, `cancelBooking` (User).

#### **Module 2.2: User Wallet & E-commerce Payment System**

-   [ ] **Task 2.2.1: Implement Wallet Charging.**
    -   Create a `chargeWallet` service that integrates with a payment gateway provider.
    -   This service will create a `wallet_transaction` and update the user's `wallet` balance upon successful payment.

-   [ ] **Task 2.2.2: Implement "Pay from Wallet".**
    -   Enhance the e-commerce checkout and course enrollment flows to allow using the wallet balance as a payment method.

-   [ ] **Task 2.2.3: Create Wallet History Service.**
    -   Implement a `getWalletHistory` service to list all transactions for the logged-in user.

---

### Phase 3: Admin & Advanced Features (Backend)

#### **Module 3.1: Financial Dashboard & Reporting**

-   [ ] **Task 3.1.1: Create Aggregation Services (Admin Only).**
    -   `getFinancialStats`: A complex service using MongoDB aggregation pipelines to calculate revenue, sales, etc., with daily, monthly, and yearly filters.
    -   `getUserFinancials`: A service to view the complete transaction history for a specific user.

#### **Module 3.2: Referral System**

-   [ ] **Task 3.2.1: Update User Model.**
    -   Add a unique `referralCode` field and a `referredBy` relation to `back/models/user.ts`.

-   [ ] **Task 3.2.2: Update Registration Logic.**
    -   Modify the `register` service to accept an optional `referralCode`. If valid, trigger a discount or award points to the referrer.

---

### Phase 4: Frontend Implementation (Next.js)

#### **Module 4.1: Core UI & Internationalization (i18n)**

-   [ ] **Task 4.1.1: Implement i18n.**
    -   Set up an i18n provider (e.g., `next-intl`).
    -   Create translation files (`fa.json`, `en.json`).
    -   Implement a language switcher component.

#### **Module 4.2: Build Feature Pages.**

-   [ ] **Task 4.2.1: Co-working Space UI.**
    -   `/spaces`: A page to list available spaces.
    -   `/spaces/[id]`: A detail page with a calendar/time-slot picker for booking.
    -   `/dashboard/bookings`: A user page to view their bookings.

-   [ ] **Task 4.2.2: Wallet & Profile UI.**
    -   `/dashboard/wallet`: A page to view balance, transaction history, and add funds.
    -   Update the user profile to display `totalPoints`.

-   [ ] **Task 4.2.3: E-commerce UI.**
    -   Build the full shop flow: product listings, cart, and a checkout page that integrates both payment gateway and "Pay from Wallet" options.

-   [ ] **Task 4.2.4: Admin Dashboard UI.**
    -   Create a protected `/admin` section.
    -   Build pages for financial reporting, user management, and space management, using charts and data tables to display data from the admin services.

---

### Phase 5: Finalization & Deployment

-   [ ] **Task 5.1: SEO & Static Content:** Add metadata to all public pages. Create the static "About Us," "Contact," and English landing pages.
-   [ ] **Task 5.2: Testing:** Write end-to-end tests for critical user flows.
-   [ ] **Task 5.3: Deployment:** Finalize production Docker configurations and deploy.