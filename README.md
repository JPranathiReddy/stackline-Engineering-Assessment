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

