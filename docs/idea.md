1) Project overview & goals

Goal: Build an easy-to-use local business directory where visitors can discover businesses via search + map, business owners can claim/manage listings, and admins can onboard/approve/manage listings.
Success signals: visitors find listings quickly (time-to-first-result), owner adoption (claimed listings), admin throughput (listings approved per day), conversion metrics (calls/website clicks).

2) Personas (short)

Visitor / Local Customer — searches by category, location, or map; wants quick contact / directions.

Business Owner — registers, submits or claims a listing, edits info, uploads images, responds to inquiries.

Admin / Moderator — imports/creates listings, approves submissions, manages categories and site content.

3) MVP features (prioritized)

Core (required):

Public searchable map (Mapbox) + list view with filters (category, distance, open now).

Listing detail page (description, hours, photos, contact, get directions).

Business owner registration & dashboard: create/edit listing, upload images, set hours, drop-pin on map.

Admin dashboard: view/approve/reject listings, bulk import CSV, manage categories.

Listing moderation workflow (Pending → Approved/Rejected).

Basic analytics: listing views, clicks to website/phone.

Responsive (mobile-first).
Nice-to-have (phase 2):

Claim listings & verification (email/phone/SMS).

Featured / paid listings and payments.

Reviews & ratings.

Saved lists / user accounts for visitors.

Advanced search (full-text + geospatial ranking via PostGIS / Algolia).

4) High-level user flows
Visitor → find a barber (example)

Arrive at homepage → search box + map centered on user's location or entered location.

Enter “barber” + location or allow location access.

Results show clustered pins + list (sorted by distance or relevance).

Click pin or card → Listing detail (call button, website, directions).

Option to get directions (link to Maps) or send message (if supported).

Business owner → add/update listing

Register / Login (email + password, or social).

“Add Listing” form: business info, address → show map & let owner drop pin or geocode address.

Upload images, set hours, add categories, submit. Status = Pending.

Admin reviews → Approve → listing published. Owner notified.

Admin → approve new listing

Log in to admin panel → view queue of Pending listings.

Click listing → inspect details, images, owner info.

Approve / Request changes / Reject (with optional message).

Bulk import: upload CSV → preview → map addresses via geocoding → create or flag duplicates.

5) Site map (tree)

Home (search + map + featured listings)

Search results (map + list + filters)

Listing detail (/listing/:slug)

Categories page (optional)

About / How it works / FAQ / Contact

Business Owner

Owner Login / Register

Owner Dashboard

My Listings (list)

Add / Edit Listing (form + map pin)

Billing / Subscriptions (future)

Admin (protected)

Pending Listings

All Listings

Categories & Tags

Users (owners)

Imports / Exports (CSV)

Site Settings & Analytics

Legal: Privacy, Terms, Cookie settings
(Also: sitemap.xml and robots.txt for SEO)

6) Design system skeleton

Color Tokens

Light mode (:root):

Background → #f7f9f3

Foreground → #000000

Card → #ffffff / Foreground: #000000

Popover → #ffffff / Foreground: #000000

Primary → #4f46e5 / Foreground: #ffffff

Secondary → #14b8a6 / Foreground: #ffffff

Muted → #f0f0f0 / Foreground: #333333

Accent → #f59e0b / Foreground: #000000

Destructive → #ef4444 / Foreground: #ffffff

Border → #000000

Input → #737373

Ring (focus state) → #a5b4fc

Data Visualization (charts):

Chart 1 → #4f46e5

Chart 2 → #14b8a6

Chart 3 → #f59e0b

Chart 4 → #ec4899

Chart 5 → #22c55e

Sidebar (UI Shell):

Background → #f7f9f3

Foreground → #000000

Primary → #4f46e5 / Foreground: #ffffff

Accent → #f59e0b / Foreground: #000000

Border → #000000

Ring → #a5b4fc

Dark mode (.dark):

Background → #000000

Foreground → #ffffff

Card → #1a212b / Foreground: #ffffff

Popover → #1a212b / Foreground: #ffffff

Primary → #818cf8 / Foreground: #000000

Secondary → #2dd4bf / Foreground: #000000

Muted → #333333 / Foreground: #cccccc

Accent → #fcd34d / Foreground: #000000

Destructive → #f87171 / Foreground: #000000

Border → #545454

Input → #ffffff

Ring → #818cf8

Dark Charts:

Chart 1 → #818cf8

Chart 2 → #2dd4bf

Chart 3 → #fcd34d

Chart 4 → #f472b6

Chart 5 → #4ade80

Dark Sidebar:

Background → #000000

Foreground → #ffffff

Primary → #818cf8 / Foreground: #000000

Accent → #fcd34d / Foreground: #000000

Border → #ffffff

Ring → #818cf8

✍️ Typography

Sans → Allerta Stencil, ui-sans-serif, system-ui

Serif → Amiri Quran, ui-serif

Mono → Anonymous Pro, ui-monospace

Scale:

H1: 32–36px

H2: 24–28px

H3: 18–20px

Body: 16px

Small: 14px

Weights:

Regular 400, Semibold 600, Bold 700

Tracking / Letter Spacing:

Normal → 0.025em

Variants: tighter, tight, wide, wider, widest

🟦 Spacing & Grid

Base unit: 4/8px modular scale (--spacing: 0.25rem)

Container max-width: 1280px

Gutters: 16–24px

Grid: 12-column flexible

🟣 Shape & Shadows

Radius: 1rem

sm: radius - 4px

md: radius - 2px

lg: radius

xl: radius + 4px

Shadows:

--shadow-sm: subtle elevation (1px / 2px blur)

--shadow-md: medium (2px / 4px blur)

--shadow-lg: large (4px / 6px blur)

--shadow-xl: elevated (8px / 10px blur)

--shadow-2xl: deep elevation (stronger alpha)

🌑 Usage Rules

Light mode default, dark mode via .dark class toggle.

Primary (#4f46e5 / #818cf8) is brand-defining → use only for main actions.

Accent (#f59e0b / #fcd34d) reserved for highlights and alerts, not base UI.

Sidebar tokens keep shell navigation consistent across modes.

Core components

Header: search bar with location input + sign-in CTA.

Map component (full width on mobile; split on desktop).

Listing Card (image, name, category, distance, CTA).

Filters panel (category, distance slider, open now, rating).

Forms: text inputs, geocode/address lookup, image uploader, hours editor.

Admin tables: sortable rows, bulk actions, status badges.

Notifications: toasts & email templates.
Accessibility: 4.5:1 contrast for body text; keyboard focus states; aria labels for map markers.

7) Listing data model (example JSON)
{
  "id": "uuid",
  "owner_id": "uuid",
  "name": "Joe's Barber Shop",
  "slug": "joes-barber-shop",
  "description": "Friendly neighborhood barber...",
  "categories": ["barber","hair"],
  "address": {
    "line1": "123 Main St",
    "city": "Brooklyn",
    "region": "NY",
    "postal_code": "11201",
    "country": "US"
  },
  "location": { "lat": 40.7128, "lng": -74.0060 },
  "phone": "+1-555-555-5555",
  "website": "https://joesbarber.example",
  "hours": [
    {"day":"mon","open":"09:00","close":"18:00"},
    {"day":"tue","open":"09:00","close":"18:00"}
  ],
  "images": ["s3://bucket/.."],
  "status": "pending",   // pending | approved | rejected | archived
  "created_at": "ISO8601",
  "updated_at": "ISO8601",
  "views": 0,
  "clicks": { "phone": 0, "website": 0 }
}


Validation notes: require name + one contact method (phone or website), address or lat/lng. Enforce image size limits and sanitize text.

8) Suggested API endpoints (roles: public / owner / admin)

GET /api/listings — public search (query, category, bbox/latlng, radius, page, sort).

GET /api/listings/:slug — listing details.

POST /api/auth/register — owner registration.

POST /api/auth/login — login (JWT or session).

POST /api/listings — create listing (owner-auth) → status=pending.

PATCH /api/listings/:id — update listing (owner-auth)

DELETE /api/listings/:id — owner delete (soft-delete).

POST /api/listings/:id/claim — start claim flow.

GET /api/admin/listings?status=pending — admin list (admin-auth).

POST /api/admin/listings/:id/approve — admin action (admin-auth)

POST /api/imports/csv — admin CSV import.
Auth & Roles: bearer JWT with roles owner, admin. Protect admin endpoints with role checks.

9) Mapbox integration — practical notes & UX patterns

Use Mapbox GL JS on client for interactive vector maps. Show clustered pins when many results.

Use Mapbox Geocoding API for address → lat/lng when owner enters address (offer “drop pin” fallback).

Keep the Mapbox public token on client but restrict it with token scopes / allowed domains. For sensitive geocoding or heavy usage, proxy requests through your server to hide sensitive keys and to cache responses.

UX: default to user geolocation (after permission); show “use my location” CTA; allow search by typing an address or neighbourhood.

Performance: load map only when needed (e.g., lazy-load on search), cluster markers, and limit initial viewport queries.

Mobile behavior: map full-screen toggle, responsive marker sizes and callout behavior.

10) Owner & Admin workflows (detailed)

Owner add flow

Register & verify email.

Click “Add Listing” → fill basic info + address.

Map shows guessed pin; allow drag to fine-tune.

Upload images (client-side resize + progress) → store in S3/Cloud storage.

Submit → status pending → show owner “Under review” UI with estimated response message.

Admin approve flow

Admin queue shows pending items + quick preview.

Inspect listing, open images, view owner contact.

Approve with one click (optionally add publish date or feature flag). Rejection requires reason (email to owner).
Bulk import

CSV import with mapping fields, automatic geocoding for addresses, duplicate detection (by name + address proximity).

11) SEO, analytics, accessibility

Add schema.org/LocalBusiness JSON-LD on every listing detail page.

Generate sitemap.xml and dynamic listing entry pages for crawl.

Meta tags: OG tags for social sharing.

Analytics: track listing_view, search_query, contact_click, directions_click. Use event tracking (GA4, Plausible, or similar).

Accessibility: keyboard nav for map popups, ARIA labels for markers, focus trap on modals.

12) Security & compliance highlights

Auth: email verification; password hashing (bcrypt/Argon2); optional 2FA for owners.

Roles & RBAC: enforce server-side checks (owner can only edit own listings).

File upload: virus scan, size limits, signed S3 uploads.

Rate limiting for public search endpoints and map geocoding to avoid abuse.

Privacy: store only what's needed; cookie consent & privacy policy (GDPR basics).