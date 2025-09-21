# Quickstart – Local Business Directory MVP

## Prerequisites
- Node 18+
- Convex account configured
- Clerk account configured
- Mapbox public token (restrict by domain)

## Setup
1. Install deps: `npm install`
2. Env: copy `.env.example` → `.env.local` and set:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `CONVEX_DEPLOYMENT`
   - `NEXT_PUBLIC_CONVEX_URL`
   - `NEXT_PUBLIC_CLERK_FRONTEND_API_URL`
   - `NEXT_PUBLIC_MAPBOX_TOKEN`
3. Start Convex dev (separate terminal): `npx convex dev`
4. Start app: `npm run dev`

## Verify
1. Home loads with map (Mapbox GL JS). If token missing → helpful error.
2. Search for a category (e.g., "barber"). Results list + map clusters update.
3. Open a listing detail. Verify contact actions and directions link.
4. Create an owner account and submit a listing. Status should be "pending".
5. As admin, approve the listing. It becomes visible publicly.

## Notes
- Geolocation: allow prompt; otherwise enter location manually.
- Tokens: follow design system; no hard-coded colors.
- Real-time: Convex queries update UI automatically where used.


