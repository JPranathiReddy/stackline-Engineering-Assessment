# Stackline Full Stack Assignment

## Overview

This is a sample eCommerce website that includes:
- Product List Page
- Search Results Page
- Product Detail Page

The application contains various bugs including UX issues, design problems, functionality bugs, and potential security vulnerabilities

---

## Getting Started

```bash
yarn install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Approach

Reviewed the codebase by reading each component and API route top-to-bottom, then ran the app to verify behavior at runtime. Bugs were found through a combination of code inspection (missing params, type mismatches, unhandled async states) and manual testing (clicking through every feature, navigating between pages, applying filters). Enhancements were identified by comparing what the data contained vs. what the UI actually showed.

---

## Bug Fixes

### 1. Product data passed via URL query string
**Issue:** Clicking a product serialized the full product object (images, bullets, etc.) as JSON into the URL query string. This breaks for large products (URL length limits) and exposes raw data in the browser history.

**Fix:** Replaced with a proper dynamic route `/product/[sku]`. The page now fetches product data from the existing `/api/products/[sku]` endpoint using the SKU from the URL path.

**Why:** Clean URL, no data exposure, no length limit risk, and aligns with REST conventions already in place.

---

### 2. No pagination — only 20 products ever shown
**Issue:** The API supported `limit`/`offset` and returned a `total` count, but the UI hardcoded `limit=20` with no way to browse further. Users could never see beyond the first 20 products.

**Fix:** Added numbered pagination (Previous / 1 2 … N / Next) with 20 products per page. Counter shows "Showing 1–20 of 500 products". Any filter or search change resets to page 1. Also fixed a missing Amazon image hostname in `next.config.ts` that only surfaced when navigating past page 1.

**Why:** Numbered pages let users know their position in the catalog and navigate directly to any page — better UX than append-only for a product listing.

---

### 3. Subcategories not filtered by selected category
**Issue:** `fetch('/api/subcategories')` never passed the selected category, so the dropdown always showed all subcategories across every category instead of only those relevant to the selection.

**Fix:** Added `?category=` param to the fetch. The API already supported this — it just wasn't being called correctly.

**Why:** One missing query param was the entire bug. No API changes needed.

---

### 4. Search fires a request on every keystroke
**Issue:** The search input triggered a product fetch on every character typed with no delay, causing excessive API calls.

**Fix:** Added a 300ms debounce using a `debouncedSearch` state updated via `setTimeout` in a `useEffect`. The products fetch now depends on `debouncedSearch` instead of `search`.

**Why:** Without debounce, typing "apple" fires 5 separate API calls — one per character. With 300ms debounce, it fires once when the user stops typing. This is the standard pattern for search inputs.

---

### 5. No fetch error handling — loading hangs forever on failure
**Issue:** If a fetch call failed, `loading` was never set to `false` and no error was shown — both the product listing page and the product detail page would spin indefinitely.

**Fix:** Added an `error` state to both pages. The `.catch()` handler sets `error = true` and `loading = false`. Each page renders an appropriate error message when in error state ("Failed to load products" / "Failed to load product").

**Why:** Users need feedback when something goes wrong instead of an infinite spinner.

---

### 6. Race condition — stale results could overwrite fresh ones
**Issue:** Rapidly changing filters or search could fire multiple in-flight requests. Whichever resolved last would win, potentially rendering stale results.

**Fix:** Added `AbortController` to the products fetch effect. The cleanup function calls `controller.abort()`, cancelling any in-flight request when filters change. `AbortError` is filtered out in the catch handler so it doesn't trigger the error state.

**Why:** `AbortController` was chosen over alternatives (e.g. a request ID counter) because it's the native browser API — no extra state needed and it cancels the actual network request rather than just ignoring the result. Ensures only the latest request's result is ever rendered.

---

### 7. "Back to Products" always reset to page 1 and cleared filters
**Issue:** The back button on the product detail page used `<Link href="/">`, which always navigated to the root — resetting pagination, search, and filters. A user on page 5 with a category filter would lose their place.

**Fix:** Two changes working together:
1. The product list page now syncs its state (search, category, subcategory, page) to URL params via `router.replace` whenever filters change (e.g. `/?category=Tablets&page=3`). State is also initialized from URL params on mount via `useSearchParams`.
2. The detail page back button was changed from `<Link href="/">` to `router.back()`, which restores the previous URL including all params.

**Why:** `router.back()` alone isn't enough if state lives only in React memory — it needs to be in the URL to survive navigation. Syncing state to the URL also makes filters bookmarkable and shareable.

---

### 8. Crash on products with missing imageUrls or featureBullets
**Issue:** Some products in the dataset have no `imageUrls` or `featureBullets` fields. These products were never visible in default order, but sorting (e.g. Name A→Z) moved them to page 1, causing `TypeError` crashes on both the listing page (`Cannot read properties of undefined (reading '0')`) and the detail page (`Cannot read properties of undefined (reading 'length')`).

**Fix:** Made `imageUrls` and `featureBullets` optional (`?`) across all three `Product` interfaces: `lib/products.ts`, `app/page.tsx`, and `app/product/[sku]/page.tsx`. In the detail page, `const images = product.imageUrls ?? []` and `const bullets = product.featureBullets ?? []` provide safe fallbacks before the JSX renders.

**Why:** The crashes were latent data quality bugs that sorting exposed. Making the types reflect reality and adding `?? []` fallbacks prevents crashes regardless of product data completeness.

---

## Enhancements

### 9. "View Details" button removed — card is already fully clickable
**Issue:** Each product card had a "View Details" button at the bottom, but the entire card was already wrapped in a `<Link>`. The button added visual clutter and wasted card space.

**Fix:** Removed the button entirely. The card navigates to the product detail page on click.

**Why:** The button was pure redundancy — removing it gives more space to product content and simplifies the card layout.

---

### 10. Retail price added to UI
**Issue:** `retailPrice` existed in `sample-products.json` and was correctly returned by the API, but was absent from the `Product` TypeScript interface in `lib/products.ts` and the page components. Because the type didn't include it, the field was invisible to the components — the data was always there, just never used.

**Fix:** Added `retailPrice?: number` to the `Product` interface in `lib/products.ts`, `app/page.tsx`, and `app/product/[sku]/page.tsx`. Price now renders in green on both the product listing cards and the product detail page.

**Why:** Price is one of the most important pieces of information for a shopper — it should always be visible.

---

### 11. Image navigation arrows on product detail page
**Issue:** The detail page showed a thumbnail grid to switch images but had no prev/next arrow controls on the main image, making image browsing less intuitive.

**Fix:** Added `ChevronLeft` / `ChevronRight` arrow buttons overlaid on the main image. They wrap around (last → first, first → last) and stay in sync with the thumbnail grid via shared `selectedImage` state.

**Why:** Arrow navigation on the main image is the expected interaction pattern for product image galleries.

---

### 12. Sort by price and name added to product listing
**Issue:** Products always appeared in JSON insertion order with no way to sort by price or name.

**Fix:** Added a "Sort by" dropdown with four options: Price Low→High, Price High→Low, Name A→Z, Name Z→A. Sorting is implemented in `lib/products.ts` (`getAll`), parsed and validated in the API route, and synced to the URL (`?sortBy=price-asc`) so sort order persists across navigation.

**Why:** Sorting by price and name are standard e-commerce expectations that significantly improve browsability.

---
