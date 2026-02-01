# enQueue Customer

Customer-facing web app for enQueue. This project is a Next.js (App Router) frontend that:

- Accepts a QR identifier via the `qr_id` query param
- Requests queue access from a backend service
- Stores the returned `sessionId` cookie
- Redirects the customer to the appropriate UI route

## Tech Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- shadcn/ui-style components (Button/Card/Input, etc.)
- Radix UI primitives
- `axios` for HTTP
- `motion` for subtle background effects

## Getting Started

### Prerequisites

- Node.js 18+ (recommended)
- npm

### Install

```bash
npm install
```

### Environment Variables

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_FUNCTIONS_BASE_URL="https://your-backend.example.com"
```

`NEXT_PUBLIC_FUNCTIONS_BASE_URL` is used by the entry route to call:

`GET {BASE_URL}/queues/queue-access?initialQrId=<qr_id>`

### Run (Development)

```bash
npm run dev
```

Then open:

- `http://localhost:3000/?qr_id=YOUR_QR_ID`

Note: development origin allow-listing is configured in `next.config.ts` via `allowedDevOrigins` for LAN testing.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Routes

- `/` (Entry)
  - Reads `qr_id` from the URL
  - Requests queue access from the backend
  - Sets a `sessionId` cookie when provided
  - Redirects to `response.data.path`

- `/form`
  - Standalone customer information form UI

- `/queue`
  - Queue UI (currently uses mock stations for UI work)

- `/unauthorized`
  - Unauthorized access screen (destructive/red styling)

## Project Structure

Common folders:

- `app/`
  - `page.tsx`: entry logic (QR access + redirect)
  - `form/page.tsx`: customer form page
  - `queue/page.tsx`: queue page
  - `unauthorized/page.tsx`: unauthorized page
  - `_components/`: app-level UI components

- `components/ui/`
  - shared UI primitives (Button/Card/Input/etc.)

## Notes

- The customer form currently builds the email as `${localPart}@neu.edu.ph`.
- The access flow stores `sessionId` as a browser cookie with `SameSite=Lax`.

## Contributing

1. Create a feature branch
2. Make changes
3. Run `npm run lint`
4. Open a pull request
