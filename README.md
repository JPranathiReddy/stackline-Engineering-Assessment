# Stackline Full Stack Assignment

## Overview

This is a sample eCommerce website that includes:
- Product List Page
- Search Results Page
- Product Detail Page

The application contains various bugs including UX issues, design problems, functionality bugs, and potential security vulnerabilities


---

## Issues

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

