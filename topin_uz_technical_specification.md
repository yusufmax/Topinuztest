# TECHNICAL SPECIFICATION
## topin.uz Platform Enhancement
### Multi-Store Online Catalogue with AR Product Viewing

---

| Field | Value |
|---|---|
| Document Type | Technical Specification (ТЗ) |
| Project | topin.uz — Enhanced Multi-Store Catalogue |
| Version | 1.0 |
| Status | Draft for Review |
| Prepared for | topin.uz Development Team |

---

## Table of Contents

1. [Project Overview and Objectives](#1-project-overview-and-objectives)
2. [User Roles and Access Levels](#2-user-roles-and-access-levels)
3. [Information Architecture and URL Structure](#3-information-architecture-and-url-structure)
4. [Store Storefront Page](#4-store-storefront-page)
5. [Product Detail Page](#5-product-detail-page)
6. [Augmented Reality (AR) Product Viewing](#6-augmented-reality-ar-product-viewing)
7. [Store Admin Panel (Vendor Dashboard)](#7-store-admin-panel-vendor-dashboard)
8. [Platform Homepage and Directory](#8-platform-homepage-and-directory)
9. [Super-Administrator Panel](#9-super-administrator-panel)
10. [Authentication and Security](#10-authentication-and-security)
11. [Performance Requirements](#11-performance-requirements)
12. [SEO Requirements](#12-seo-requirements)
13. [Localisation and Multi-language Support](#13-localisation-and-multi-language-support)
14. [Technology Recommendations (Non-Binding)](#14-technology-recommendations-non-binding)
15. [Acceptance Criteria and Testing Requirements](#15-acceptance-criteria-and-testing-requirements)
16. [Project Deliverables](#16-project-deliverables)
17. [Glossary](#17-glossary)
18. [Document Approval](#18-document-approval)

---

## 1. Project Overview and Objectives

The current topin.uz website operates as a general directory or listing platform. This Technical Specification defines the requirements for transforming topin.uz into a full-featured, multi-tenant online product catalogue. The enhanced platform will allow each registered store or vendor to maintain their own dedicated storefront with a unique page, product listings, pricing management, and an independent administrative panel.

A key distinguishing feature of the enhanced platform is native Augmented Reality (AR) product preview capability using standard device APIs — Apple Quick Look for iOS/macOS and Google Scene Viewer for Android — enabling customers to view 3D product models in their physical environment directly from the product page, without installing any third-party application.

### 1.1 Primary Objectives

- Transform topin.uz from a directory into a multi-tenant product catalogue platform.
- Give each store a dedicated, publicly accessible storefront page.
- Enable per-store product management including images, descriptions, prices, and 3D models.
- Implement AR product preview using `.glb` (Android) and `.usdz` (iOS) model formats.
- Provide each store owner with a self-service admin panel to manage their content independently.
- Implement platform-wide and per-store product filtering, search, and sorting.
- Maintain a scalable, performant architecture suitable for hundreds of concurrent stores.

### 1.2 Out of Scope (for this specification)

- Payment gateway integration and online checkout (may be addressed in a future phase).
- Native mobile application development (iOS / Android).
- Customer loyalty programs or discount coupon systems.
- Third-party ERP or warehouse management integration.

---

## 2. User Roles and Access Levels

The platform must support the following distinct user roles, each with clearly defined permissions.

### 2.1 Platform Super-Administrator

The Super-Administrator has full unrestricted access to all platform functions.

- Create, suspend, or permanently delete any store account.
- Approve or reject new store registration requests.
- Set platform-wide settings: default currency, supported languages, feature flags.
- Access aggregate analytics across all stores (total visits, products, active stores).
- Manage platform-level product categories and taxonomy.
- Override any store settings or content when required.
- Manage system users and assign roles.

### 2.2 Store Administrator (Vendor)

Each registered store has one or more Store Administrators who manage only their own store.

- Edit store profile: name, logo, banner image, description, contact details, working hours, location/map pin.
- Create, edit, and delete products within their store.
- Set and update product prices, sale prices, and stock availability.
- Upload product images (up to 10 per product) and 3D model files (`.glb` and `.usdz`).
- Manage store-specific product categories and subcategories.
- View store-level analytics: page views, product views, AR model loads, enquiry clicks.
- Invite and manage sub-users (store staff) with limited permissions.

### 2.3 Store Staff (Sub-user)

Optional role created by a Store Administrator to delegate specific tasks.

- Add or edit products (no deletion rights unless explicitly granted).
- Update stock status and prices.
- View analytics (read-only).
- Cannot change store profile settings or billing information.

### 2.4 End Customer (Public Visitor)

Unauthenticated or optionally registered visitors browsing the platform.

- Browse the platform catalogue and individual store pages.
- Use filters and search to find products.
- View product details and launch AR preview on supported devices.
- Contact a store via phone, messenger link, or enquiry form.
- Optionally register an account to save favourite stores or products (Phase 2 feature).

---

## 3. Information Architecture and URL Structure

The platform must implement a clean, SEO-friendly URL structure. All public routes must be indexable by search engines.

### 3.1 Public-Facing URL Structure

| Route | Description |
|---|---|
| `topin.uz/` | Platform homepage — featured stores, categories, search bar |
| `topin.uz/stores` | Full store directory with filters (category, location, rating) |
| `topin.uz/stores/{store-slug}` | Individual store storefront page |
| `topin.uz/stores/{store-slug}/products` | All products for a specific store with filters |
| `topin.uz/stores/{store-slug}/products/{product-slug}` | Individual product detail page with AR viewer |
| `topin.uz/categories` | Platform-wide category index |
| `topin.uz/categories/{category-slug}` | Products across all stores filtered by category |
| `topin.uz/search` | Platform-wide search results page |

### 3.2 Admin Panel URL Structure

| Route | Description |
|---|---|
| `topin.uz/admin` | Super-Admin dashboard |
| `topin.uz/admin/stores` | Store management list |
| `topin.uz/admin/stores/{id}` | Individual store settings (super-admin view) |
| `topin.uz/dashboard` | Store Admin dashboard (vendor login) |
| `topin.uz/dashboard/profile` | Store profile editor |
| `topin.uz/dashboard/products` | Product list management |
| `topin.uz/dashboard/products/new` | Create new product |
| `topin.uz/dashboard/products/{id}/edit` | Edit existing product |
| `topin.uz/dashboard/analytics` | Store analytics overview |
| `topin.uz/dashboard/users` | Sub-user management |

---

## 4. Store Storefront Page

Each store has a dedicated public page at `topin.uz/stores/{store-slug}`. This page serves as the store's primary public identity on the platform.

### 4.1 Store Header Section

- Store banner image (recommended dimensions: 1200×300px minimum, displayed responsively).
- Store logo (square, displayed overlapping the banner at left or center).
- Store name (H1 heading for SEO).
- Short description (up to 250 characters, displayed below the name).
- Store category tags (e.g., Electronics, Furniture, Clothing).
- Contact information block: phone number(s), Telegram link, Instagram link, website link (each optional, shown only if provided by the vendor).
- Working hours display (e.g., Mon–Fri 09:00–18:00, Sat 10:00–16:00, closed Sunday).
- Map pin or address text (optional; if coordinates provided, link to Google Maps / 2GIS).
- Follow / Save store button (for registered visitors; Phase 2 feature).

### 4.2 Store Navigation Tabs

The store page must include tab-based navigation for the following sections:

- **Products** (default active tab) — lists all products of that store.
- **About** — longer store description, photos of the physical location if uploaded.
- **Reviews** — customer reviews and ratings (Phase 2 feature, placeholder displayed in Phase 1).

### 4.3 Product Listing on the Store Page

- Products displayed in a responsive grid layout: 4 columns on desktop, 2 on tablet, 1 on mobile.
- Each product card displays: primary image, product name, price (or "Price on request"), category tag, and AR badge icon if a 3D model is available.
- Product cards are clickable, linking to the individual product detail page.
- Lazy loading of product images must be implemented to optimise initial page load.
- Infinite scroll or pagination (configurable); default is pagination with 24 products per page.

### 4.4 Store-Level Filters and Sorting

The following filters must be available within the Products tab of a store page:

- **Category / Subcategory** — multi-select dropdown populated with the store's own categories.
- **Price Range** — dual-handle slider with min/max input fields; uses the store's currency.
- **Availability** — toggle to show only in-stock items.
- **AR Available** — toggle to show only products that have a 3D model uploaded.
- **Sort by:** Newest First, Price Low to High, Price High to Low, Most Viewed.

Filter state must be reflected in the URL query parameters to allow shareable filtered URLs.

---

## 5. Product Detail Page

### 5.1 Product Information Fields

Each product must support the following data fields:

| Field | Type / Constraints |
|---|---|
| Product Name | Text, required, max 200 characters |
| Slug (URL key) | Auto-generated from name, editable, unique per store, URL-safe |
| Short Description | Text, max 300 characters, displayed in product cards |
| Full Description | Rich text (bold, italic, lists, headings), max 5000 characters |
| Category | Single select from store categories; required |
| Subcategory | Single select, optional, dependent on category selection |
| Price | Decimal number, optional; if empty, display "Price on request" |
| Sale Price | Decimal number, optional; displayed with original price struck through |
| Currency | Inherited from store settings; display only, not editable per product |
| Stock Status | Enum: In Stock / Out of Stock / Pre-order / Made to Order |
| Product Images | Up to 10 images; first image is the primary (card thumbnail) |
| 3D Model — GLB | File upload, `.glb` format, max 50 MB, used for Android AR (Scene Viewer) |
| 3D Model — USDZ | File upload, `.usdz` format, max 50 MB, used for iOS AR (Quick Look) |
| Tags | Free-form text tags, max 10 tags per product, used for internal search |
| SEO Title | Text, max 60 characters, optional override for page title tag |
| SEO Description | Text, max 160 characters, optional override for meta description |
| Published | Boolean toggle; unpublished products are invisible to the public |
| Created At / Updated At | System-managed timestamps; displayed in admin panel |

### 5.2 Product Page Layout — Public View

#### 5.2.1 Image Gallery

- Primary image displayed large (left column on desktop, full-width on mobile).
- Thumbnails row below or beside the primary image for additional images.
- Click or tap on thumbnail replaces the primary image.
- Lightbox / full-screen image view on click of the primary image.
- If a 3D model exists, one thumbnail slot is replaced with a 3D cube icon labelled "View in 3D / AR".

#### 5.2.2 Product Information Block

- Product name displayed as H1.
- Category breadcrumb above the name: Platform Home > Category > Store Name > Product Name.
- Price displayed prominently. If sale price exists, original price is shown with strikethrough.
- Stock status badge (In Stock — green, Out of Stock — red, Pre-order / Made to Order — amber).
- Short description displayed directly below price.
- AR/3D button displayed prominently if a 3D model file exists (see Section 6 for behaviour).
- Contact / Enquire button that triggers a call or links to the store's primary contact method.
- Full description rendered below in a collapsible section or below the fold.

#### 5.2.3 Store Attribution Block

- Store logo, name, and short description displayed on the product page.
- Link to the full store page.
- Store contact shortcut (phone / Telegram).

#### 5.2.4 Related Products

- A horizontal scrollable row of up to 8 related products from the same store and category.
- If fewer than 4 products exist in the same category, pad with other store products.

---

## 6. Augmented Reality (AR) Product Viewing

AR viewing is a core feature of the enhanced platform. The implementation must use native device AR APIs to avoid any additional app installation requirement for the end user. No third-party AR SDK or paid AR service is required beyond standard device capabilities.

### 6.1 Platform Overview

| Device / Platform | AR Technology Used | Required File Format |
|---|---|---|
| iOS 12+ (Safari, Chrome iOS) | Apple Quick Look | `.usdz` |
| iPadOS 13+ | Apple Quick Look | `.usdz` |
| macOS Monterey+ (Safari) | Apple Quick Look | `.usdz` |
| Android (Chrome 67+) | Google Scene Viewer (ARCore) | `.glb` |

### 6.2 Device Detection and Button Behaviour

The AR / 3D View button on the product page must adapt its behaviour based on the detected platform:

- **On iOS / iPadOS / compatible macOS** (detected via user agent): The AR button renders as an HTML anchor tag with the attribute `rel="ar"` pointing to the `.usdz` file URL. Clicking this link triggers the Apple Quick Look viewer natively in Safari without a page redirect. The anchor must wrap an `<img>` tag as required by the Quick Look specification.
- **On Android with ARCore support** (detected via user agent or the Scene Viewer intent scheme): The AR button generates a Google Scene Viewer intent URL in the format: `intent://arvr.google.com/scene-viewer/1.0?file={URL_to_GLB}&mode=ar_only#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url={fallback_URL};end`. This intent link is opened programmatically when the user taps the button.
- **On Android without ARCore, or on desktop browsers:** The button opens a fallback in-browser 3D viewer using the `<model-viewer>` web component (see Section 6.4). The model-viewer component renders the `.glb` file in an interactive 3D viewport that supports rotate, pan, and zoom with mouse or touch.
- If neither `.glb` nor `.usdz` files are uploaded for a product, the AR button is not shown at all.
- If only one format is uploaded (e.g., only `.glb`), the AR feature is available only on platforms that support `.glb`; the button is hidden on platforms that require `.usdz`.

### 6.3 File Handling and Storage Requirements

- 3D model files (`.glb` and `.usdz`) must be stored on a CDN-accessible URL with CORS headers that allow cross-origin loading (required by both Quick Look and Scene Viewer).
- Files must be served over HTTPS (mandatory for both AR APIs).
- The CDN URL for the 3D model must be publicly accessible without authentication headers.
- Maximum file size per model: 50 MB. Files exceeding this limit must be rejected at upload with a clear error message.
- Accepted MIME types: `model/gltf-binary` for `.glb` files, `model/vnd.usdz+zip` for `.usdz` files.
- The platform admin panel must display a file size indicator and warn when a model exceeds 15 MB (which may cause slow load times on mobile networks).

### 6.4 In-Browser 3D Fallback (`<model-viewer>`)

The platform must include the `<model-viewer>` web component (https://modelviewer.dev/) for in-browser 3D viewing on unsupported or desktop platforms.

- The `model-viewer` component must be loaded only on product pages where a `.glb` file exists, to avoid unnecessary script loading.
- The viewer must be displayed in an embedded frame or modal overlay of minimum size 400×400px on desktop, full-screen on mobile.
- Required `model-viewer` attributes: `src` (pointing to `.glb` URL), `alt` (product name), `ar` (enable AR button within the component on supported devices), `camera-controls` (enable user rotation/zoom), `auto-rotate` (optional, disabled by default).
- A loading indicator must be shown while the model is downloading.
- If the model fails to load (network error or corrupt file), a clear error message must be displayed with a link to contact the store.

### 6.5 3D Model Upload Workflow (Admin Panel)

1. Store admin navigates to Dashboard > Products > [Product Name] > Edit.
2. In the "3D Model" section, two upload fields are presented: one for `.glb` (labelled "Android AR Model") and one for `.usdz` (labelled "iOS AR Model").
3. Each field accepts drag-and-drop or click-to-browse file selection.
4. Upon selection, file type and size are validated client-side before upload begins.
5. A progress bar is displayed during upload. On completion, a preview thumbnail or model-viewer embed is shown so the admin can verify the model loaded correctly.
6. The admin can delete an uploaded model independently from the other model format.
7. Models are uploaded directly to the CDN/storage bucket; a signed upload URL is generated server-side to avoid passing files through the application server.

---

## 7. Store Admin Panel (Vendor Dashboard)

Each store's Admin Panel is a fully independent management interface accessible at `topin.uz/dashboard` after authentication. A store admin can only see and manage their own store's data.

### 7.1 Dashboard Homepage

- Summary statistics cards: Total Products, Published Products, Total Page Views (last 30 days), Total Product Views (last 30 days), AR Model Loads (last 30 days).
- Quick action buttons: Add New Product, Edit Store Profile, View Public Store Page.
- Recent activity log: last 10 product edits or additions with timestamps.

### 7.2 Store Profile Management

The store profile editor must allow the vendor to update all public-facing store information:

- Store name (required).
- Store slug / URL key (editable; system warns if slug is taken; changes may affect SEO).
- Logo upload (JPG/PNG/WebP, max 2 MB, recommended size 400×400px).
- Banner image upload (JPG/PNG/WebP, max 5 MB, recommended size 1200×300px).
- Short description (max 250 characters).
- Long description (rich text, max 2000 characters).
- Contact phone numbers (up to 3 numbers, each with optional WhatsApp / Telegram flag).
- Social media / messenger links: Telegram username, Instagram handle, website URL.
- Physical address (free text) and optional map coordinates (latitude / longitude).
- Working hours: per-day on/off toggle plus open time and close time fields.
- Store category (assigned by Super-Admin; store admin can view but not edit).
- Currency selection (from platform-supported list; default is UZS).
- Language of store content (used for filtering by language in platform search).

### 7.3 Product Management

#### 7.3.1 Product List View

- Paginated table listing all products (published and unpublished) with columns: Thumbnail, Name, Category, Price, Stock Status, Published, Last Updated, Actions.
- Bulk actions: Publish, Unpublish, Delete (with confirmation dialog).
- Search bar to filter by product name within the admin list.
- Filter by: Category, Stock Status, Published status, Has 3D Model.
- Sort by: Name A–Z, Name Z–A, Price Ascending, Price Descending, Last Updated.

#### 7.3.2 Add / Edit Product Form

The product creation and editing form must include all fields defined in Section 5.1, organised into the following logical sections:

- **Section 1 — Basic Info:** Name, Slug, Category, Subcategory, Tags, Published toggle.
- **Section 2 — Pricing and Stock:** Price, Sale Price, Currency (read-only, from store settings), Stock Status.
- **Section 3 — Descriptions:** Short Description (character counter), Full Description (rich text editor).
- **Section 4 — Images:** Multi-image uploader with drag-to-reorder. First image is primary.
- **Section 5 — 3D Models:** GLB upload, USDZ upload, preview viewer, model size indicators.
- **Section 6 — SEO:** SEO Title, SEO Description, preview of how the product will appear in search results.

The form must auto-save as a draft every 60 seconds. Unsaved changes must trigger a browser "Are you sure you want to leave?" confirmation if the user navigates away.

### 7.4 Category Management

- Store admins can create, rename, and delete their own custom categories and subcategories.
- Categories are independent per store (they do not affect platform-wide taxonomy).
- Deleting a category prompts the admin to reassign products to another category before deletion.
- A default "Uncategorised" category is created automatically for each new store.

### 7.5 User Management (Sub-users)

- Store admin can invite up to 5 sub-users by email address.
- Invited sub-users receive an email with a registration link tied to the store.
- Store admin can set per-sub-user permissions: Can Add Products, Can Edit Products, Can Delete Products, Can View Analytics.
- Store admin can revoke a sub-user's access at any time.

### 7.6 Analytics

- Date range selector: Last 7 days, Last 30 days, Last 90 days, Custom range.
- Store page views — daily chart (line graph).
- Top 10 most viewed products — table with view count.
- Top 10 products by AR model loads — table with load count.
- Traffic source breakdown: Direct, Search, Social (if referrer data is available).
- Device type breakdown: Desktop, Mobile, Tablet — pie chart.

All analytics data is retained for 12 months. Data is approximate; analytics are for operational guidance and not guaranteed to be legally precise audience measurement.

---

## 8. Platform Homepage and Directory

### 8.1 Homepage Sections

- Hero section with a search bar (searches across all stores and products simultaneously).
- Featured Stores row — a curated horizontal scroll of stores selected by Super-Admin.
- Product Categories grid — links to platform-wide category pages.
- Recently Added Products — latest products across all stores (last 24 hours).
- AR-Ready Products banner section — highlights products with 3D models to promote the feature.
- Platform statistics bar: number of stores, number of products, number of product categories.

### 8.2 Platform-Wide Search

- Search field in the header is persistent across all public pages.
- Search results page (`/search`) shows two result tabs: Stores and Products.
- Product results display product card, store attribution, price, and AR badge.
- Search must support Uzbek, Russian, and English queries (all languages indexed simultaneously).
- Search is full-text across product name, short description, and tags.
- Results must appear within 500ms for queries with fewer than 100,000 indexed products.

### 8.3 Platform-Wide Filters (Store Directory Page)

- Filter by Category (platform-level categories, multi-select).
- Filter by Location / City (if store address / city is set).
- Filter: Has AR Products — show only stores that have at least one product with a 3D model.
- Sort by: Newest Stores, Most Products, Alphabetical A–Z.

---

## 9. Super-Administrator Panel

### 9.1 Store Management

- List all registered stores with columns: Name, Status (Active / Suspended / Pending), Product Count, Created Date, Last Login of Store Admin.
- Create a store account manually (for direct onboarding).
- Approve pending store registrations submitted via the public sign-up form.
- Suspend a store (hides it from the public; store admin can still log in and see a suspension notice).
- Permanently delete a store and all its data (requires typed confirmation: "DELETE {store-name}").
- Impersonate a store admin (view their dashboard as them) for support purposes — all impersonation sessions are logged.

### 9.2 Category Management (Platform Level)

- Create, rename, and delete platform-wide categories.
- Assign icon or image to each category (displayed on the homepage category grid).
- Define parent-child relationships for a two-level category hierarchy.
- Reorder categories (drag-and-drop sort order).

### 9.3 Homepage Content Management

- Select and reorder Featured Stores.
- Set and update the hero section banner image and headline text.
- Toggle individual homepage sections on or off without a code deployment.

### 9.4 Platform Settings

- Supported currencies (name, ISO code, symbol).
- Supported languages for store content.
- Maximum image size per upload (default 5 MB).
- Maximum 3D model file size per upload (default 50 MB).
- Platform-wide feature flags: enable/disable AR feature, enable/disable sub-user accounts, enable/disable public store registration.
- SMTP settings for transactional email (invitations, password reset, store approval notifications).

### 9.5 Platform Analytics

- Total platform visits by day — line chart.
- Total product views by day — line chart.
- Total AR model loads by day — line chart.
- New stores registered by month — bar chart.
- Top 20 most viewed products platform-wide — table.
- Top 20 most viewed stores platform-wide — table.

---

## 10. Authentication and Security

### 10.1 Authentication Requirements

- Admin panel login via email and password.
- Passwords must be minimum 8 characters and must include at least one uppercase letter, one lowercase letter, and one digit.
- Passwords are stored as bcrypt hashes (minimum cost factor 12). Plaintext passwords are never stored or logged.
- Login page must implement rate limiting: maximum 10 failed attempts per IP per 15 minutes, after which the IP is temporarily blocked from the login endpoint.
- Optional Two-Factor Authentication (2FA) via TOTP app (Google Authenticator / Authy) for store admins.
- Mandatory 2FA for Super-Administrator accounts.
- Session tokens must expire after 8 hours of inactivity. "Remember me" option extends token lifetime to 30 days.
- Password reset via email with a single-use time-limited token (valid for 1 hour).

### 10.2 File Upload Security

- All uploaded files must be scanned for malicious content before being made publicly accessible.
- File type validation must be performed server-side by inspecting file magic bytes (MIME sniffing), not by relying solely on the file extension or client-supplied MIME type.
- Uploaded images are re-encoded (transcoded) server-side to strip any embedded metadata or scripts before storage.
- 3D model files (`.glb`, `.usdz`) are validated for basic structural integrity before the upload is accepted.
- Uploaded files are stored in a dedicated bucket isolated from the application server filesystem. Direct execution of uploaded files is impossible by architecture.

### 10.3 API Security

- All admin panel API endpoints require a valid authenticated session token (Bearer token in the Authorization header).
- All API endpoints return appropriate HTTP status codes (401 for unauthenticated, 403 for unauthorized, 422 for validation errors).
- API responses must not include internal server paths, stack traces, or database schema details in error messages.
- All state-mutating API requests (POST, PUT, PATCH, DELETE) must include CSRF protection.
- All traffic (public and admin) must be served exclusively over HTTPS. HTTP must redirect to HTTPS permanently (301).

---

## 11. Performance Requirements

### 11.1 Page Load Times

| Page Type | Target — Time to First Contentful Paint |
|---|---|
| Platform Homepage | Under 2.0 seconds on 4G mobile connection |
| Store Storefront Page | Under 2.5 seconds on 4G mobile connection |
| Product Detail Page (without 3D model load) | Under 2.5 seconds on 4G mobile connection |
| Admin Dashboard | Under 3.0 seconds on desktop broadband |

### 11.2 Image Optimisation

- All product images uploaded in any format must be automatically converted to WebP format on the server side for web delivery, with fallback to JPEG for unsupported browsers.
- Images must be served in multiple size variants: thumbnail (200×200), card (400×400), medium (800×800), large (1200×1200). The correct size is served using `srcset`.
- Images are served from a CDN with a minimum cache lifetime of 7 days.

### 11.3 Scalability Targets

- The platform must be designed to support up to 1,000 active stores without performance degradation.
- Each store may have up to 5,000 products.
- The total product index across the platform may reach up to 1,000,000 products.
- Product search must return results in under 500ms at this scale.

---

## 12. SEO Requirements

- Every public page (homepage, store page, product page, category page) must render full HTML content server-side (SSR) or via static generation. Client-side-only rendering (SPA without SSR) is not acceptable for public pages.
- Each page must include: unique `<title>` tag, unique `<meta name="description">`, canonical URL tag, Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`).
- Product pages must include structured data (JSON-LD) for the Product schema, including name, image, description, offers (price, availability, currency), and seller.
- Store pages must include JSON-LD for the LocalBusiness or Store schema where appropriate.
- Sitemap XML must be automatically generated and kept up to date at `topin.uz/sitemap.xml`, including all public store and product pages.
- `robots.txt` must allow crawling of all public pages and disallow all `/dashboard` and `/admin` paths.
- URL slugs must be human-readable and SEO-friendly. Special characters, spaces, and non-ASCII characters must be transliterated or replaced with hyphens.
- Images must have descriptive alt text: product images default to the product name; store images default to the store name. Store admins can override alt text in the product editor.

---

## 13. Localisation and Multi-language Support

- The platform interface (UI labels, buttons, error messages) must be available in three languages: Uzbek (Latin script), Russian, and English.
- The language is selected by the user via a language switcher in the header; the selection is stored in a cookie.
- Store content (name, description, product descriptions) is entered and stored by the vendor in whichever language(s) they choose. The platform does not perform automatic translation.
- Prices on the platform are displayed in the currency set for each store. No automatic currency conversion is performed. The currency symbol is displayed alongside the price.
- Date and time formats must adapt to the selected language: DD.MM.YYYY for Russian and Uzbek, DD/MM/YYYY or ISO for English.

---

## 14. Technology Recommendations (Non-Binding)

The following recommendations are provided for guidance. The development team may propose alternatives with justification, subject to approval.

| Component | Recommended Technology / Approach |
|---|---|
| Frontend — Public | Next.js (React) with SSR for SEO-critical public pages |
| Frontend — Admin Panel | React SPA with role-based route protection |
| Backend API | Node.js (NestJS or Express) or Python (Django / FastAPI) REST or GraphQL API |
| Database | PostgreSQL for relational data; Redis for session and caching |
| File / CDN Storage | AWS S3 or compatible (e.g., Cloudflare R2) with CloudFront / Cloudflare CDN |
| Search | Meilisearch or Elasticsearch for full-text product search |
| AR — iOS | Apple Quick Look via native `rel="ar"` anchor link (no SDK required) |
| AR — Android | Google Scene Viewer via intent URL (no SDK required) |
| AR — Fallback (Web) | `<model-viewer>` web component from Google (open source) |
| Analytics | Custom event tracking stored in PostgreSQL, or integration with PostHog (self-hosted) |
| Email | SMTP relay (e.g., SendGrid, Amazon SES, or existing provider) |
| Authentication | JWT tokens with refresh token rotation; optional TOTP 2FA |
| Hosting | VPS or cloud (e.g., AWS, Hetzner, or local Uzbek cloud provider) |

---

## 15. Acceptance Criteria and Testing Requirements

### 15.1 Functional Testing

- All user roles (Super-Admin, Store Admin, Sub-user, Public Visitor) must be tested end-to-end.
- AR feature must be tested on: iPhone running iOS 16+ (Safari), iPad running iPadOS 16+ (Safari), Android device with ARCore support running Chrome, Android device without ARCore, macOS desktop (Safari), Windows desktop (Chrome, Firefox, Edge).
- Upload workflows (images, `.glb`, `.usdz`) must be tested with valid files, oversized files, and files with incorrect extensions.
- All filter combinations on store and product pages must produce correct results.
- URL sharing for filtered pages must restore the correct filter state when the URL is opened.

### 15.2 Performance Testing

- Lighthouse score on public pages: minimum 85 for Performance, minimum 90 for SEO, minimum 90 for Accessibility.
- Load testing: platform must sustain 200 concurrent users without error rate exceeding 1%.

### 15.3 Security Testing

- OWASP Top 10 vulnerabilities must be assessed before launch.
- File upload endpoint must be tested for upload of PHP scripts, HTML files, and double-extension files (`.php.jpg`).
- All admin endpoints must be tested for unauthenticated access and horizontal privilege escalation (store A admin accessing store B data).

---

## 16. Project Deliverables

- Fully functional platform deployed to a staging environment for client review before production launch.
- Source code repository (private) with README and setup instructions.
- Database migration scripts and seed data for demo stores and products.
- Admin panel user guide (PDF, Uzbek and/or Russian language) covering store profile setup, product management, and 3D model upload.
- Deployment documentation covering server requirements, environment variables, and CI/CD pipeline setup.
- Test report covering all functional, performance, and security testing outcomes.

---

## 17. Glossary

| Term | Definition |
|---|---|
| AR (Augmented Reality) | Technology that overlays digital 3D content onto the user's real-world environment as viewed through a device camera. |
| GLB | A binary container format for 3D models based on the glTF 2.0 standard. Used for Android AR via Google Scene Viewer. File extension: `.glb`. |
| USDZ | A compressed archive format for 3D models based on Pixar's Universal Scene Description standard. Used for iOS / macOS AR via Apple Quick Look. File extension: `.usdz`. |
| Quick Look | Apple's built-in AR and 3D file preview feature available on iOS 12+, iPadOS 13+, and macOS Monterey+. Activated by a `rel="ar"` HTML link in Safari. |
| Scene Viewer | Google's built-in Android AR viewer, part of the Google app (ARCore). Activated via an Android intent URL from Chrome. |
| model-viewer | An open-source web component developed by Google for rendering 3D models (GLB format) in a browser without AR capability, as a fallback for unsupported devices. |
| CDN (Content Delivery Network) | A geographically distributed network of servers that cache and deliver static files (images, 3D models) to users from a location close to them. |
| Slug | A URL-safe version of a name or title, using lowercase letters, numbers, and hyphens (e.g., "leather-sofa-brown"). |
| SSR (Server-Side Rendering) | Generating the full HTML of a page on the server before sending it to the browser, which enables search engine crawlers to index the content. |
| Tenant / Vendor | An individual store or business that operates their storefront on the topin.uz platform. |
| TOTP | Time-based One-Time Password — a 2FA method that generates a rotating 6-digit code via an authenticator app. |
| CORS | Cross-Origin Resource Sharing — a browser security mechanism that controls which domains are allowed to request resources from a server. Required to be configured correctly for 3D model delivery. |
| JSON-LD | A method of encoding structured data in a `<script>` tag within HTML, used to communicate product and business information to search engines (Google rich results). |

---

## 18. Document Approval

This Technical Specification is subject to review and written approval by the client before development commences. Changes to requirements after approval must follow a formal change request process.

| Field | Value |
|---|---|
| Prepared by | |
| Reviewed by | |
| Approved by (Client) | |
| Approval Date | |
| Version Approved | 1.0 |

---

*End of Technical Specification — topin.uz v1.0*
